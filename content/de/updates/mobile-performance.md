---
title: Von 5 Sekunden auf unter 0,5
date: 2026-06-12
tag: Performance
description: Ein Deep Dive, warum CSS-Blur einer der teuersten Effekte im Browser ist und wie ein einziger Filter die Landingpage am Handy ausgebremst hat.
---

Am Desktop hat die Landingpage sofort geladen. Am Handy war sie furchtbar langsam, über fünf Sekunden bis sie da war. Schuld war am Ende ein einziger CSS-Effekt: `blur()`. Hier der ganze Weg von der Diagnose bis zu dem, was unter der Haube wirklich passiert.

## Das Problem

Am Handy war die Seite einfach langsam. Das Laden dauerte spürbar lang, am Desktop war es blitzschnell. Die üblichen Verdächtigen, zu große Bilder, zu viel JavaScript, langsamer Server, waren es nicht.

Am Ende war es der Hintergrund. Dort liegen ein paar große, weiche Lichtflecken (Glows), umgesetzt mit `filter: blur()`. Ein Element war über 1000px breit, mit einem Blur-Radius von 100px.

::callout{icon="i-lucide-zap-off" color="primary"}
  Über fünf Sekunden bis zum ersten Frame ist für eine Landingpage tödlich. Genau dort entscheidet sich, ob jemand bleibt.
::

## Warum Blur so teuer ist

`blur()` ist eine [Convolution](https://developer.chrome.com/blog/animated-blur): Für jeden Output-Pixel werden die umliegenden Input-Pixel gewichtet zusammengerechnet. Die Kosten skalieren mit Fläche **und** Radius, ein `blur(100px)` ist also drastisch teurer als ein `blur(5px)`.

Im Detail läuft pro Frame ungefähr das ab:

::steps{level="3"}

### Render-to-Texture

Das Element wird zuerst in eine eigene Off-Screen-Textur gerendert. Allein das promotet es zu einer eigenen Compositing-Layer und kostet GPU-Speicher.

### Separable Gaussian

Ein 2D-Gaussian lässt sich in zwei 1D-Passes zerlegen (horizontal, dann vertikal). Das senkt die Kosten von O(n²) auf O(n) pro Pixel, ist also schon die optimierte Variante.

### Downsampling

Bei großen Radien rechnet die Engine nicht in voller Auflösung. Skia (Chrome) [skaliert ab einem Sigma > 4 herunter](https://api.skia.org/classSkImageFilters.html), blurrt auf der kleineren Buffer-Größe und skaliert wieder hoch.

::

Trotz all dieser Optimierungen bleibt eine riesige Fläche übrig, die vor dem ersten Paint fertig sein muss. Auf dem Desktop fällt das nicht auf. Eine Mobile-GPU stemmt das deutlich langsamer, und genau das hat den ersten Frame um Sekunden verzögert.

## Warum es Mobile-GPUs besonders trifft

Mobile-GPUs arbeiten fast alle [Tile-Based](https://developer.samsung.com/galaxy-gamedev/resources/articles/gpu-framebuffer.html): Der Framebuffer wird in kleine Tiles zerlegt, die im schnellen On-Chip-Speicher gerendert werden. Das spart enorm Memory-Bandwidth, funktioniert aber nur, solange ein Tile für sich allein berechenbar ist.

Ein Blur bricht genau diese Annahme. Die Convolution muss Pixel über die Tile-Grenze hinaus lesen. Die GPU kann den Effekt also nicht tile-lokal halten, sondern muss in den langsamen System-Memory schreiben und wieder lesen. Auf Hardware mit ohnehin knapper Fill-Rate und Bandwidth ist das der teuerste Fall.

## `filter` ist nicht `backdrop-filter`

Im Header steckte noch ein zweiter Blur, und der ist eine ganz andere Baustelle. Die beiden werden oft verwechselt:

- **`filter: blur()`** blurrt die **eigenen Pixel** des Elements. Inhalt dahinter ist egal.
- **[`backdrop-filter: blur()`](https://www.w3tweaks.com/css/css-filter-backdrop-filter/)** blurrt **alles, was dahinter liegt**, und liest diese Pixel bei jedem Frame neu.

Letzteres ist beim Scrollen brutal: Der Backdrop ändert sich ständig, also wird der Blur permanent neu berechnet. [Genau das ruckelt sichtbar](https://github.com/vuejs/vitepress/issues/1049), bei älteren Firefox-Builds unter Linux. Ein fixer, halbtransparenter Header mit `backdrop-filter` ist einer der häufigsten Jank-Verursacher überhaupt.

## Und Blur animieren?

Kurz: nicht den Radius animieren. Jeder Frame triggert die volle Convolution auf der GPU und sprengt das 16ms-Frame-Budget, das Ergebnis liegt weit unter 60fps.

Der [Trick von Chrome](https://developer.chrome.com/blog/animated-blur): ein paar vorberechnete Kopien mit exponentiell steigendem Blur stapeln und per `opacity` zwischen ihnen cross-faden. Opacity ist compositor-only und damit billig. Man animiert also nicht den Blur, sondern täuscht ihn vor.

## Die Lösung

Im konkreten Fall war sie fast enttäuschend simpel: den Blur ganz weglassen.

Statt einen scharfen Kreis teuer zu blurren, sind die Glows jetzt mehrstufige Radial-Gradients, die von Haus aus weich sind. Optisch praktisch identisch, aber ohne Filter, ohne extra Layer, ohne Convolution. Den `backdrop-filter` im Header habe ich gleich mit rausgeworfen.

Andere valide Wege, je nach Fall: ein vorgeblurtes Bild als Asset ausliefern, den Radius klein halten, oder bewusst auf einem kleineren Element blurren.

Das Ergebnis: Statt über fünf Sekunden ist die Seite jetzt in unter einer halben Sekunde da. Zehnmal schneller, ohne dass man dem Design den Unterschied ansieht.

## Wie man so etwas findet

In den Chrome DevTools führt der [Rendering-Tab](https://developer.chrome.com/docs/devtools/rendering/performance) schnell zur Ursache:

- **Paint Flashing** zeigt grün, was neu gezeichnet wird. Ein Header, der beim Scrollen dauergrün blinkt, ist ein eindeutiges Signal.
- **Layer Borders** und der **Layers-Tab** zeigen, welche Elemente eine eigene Compositing-Layer bekommen, dort taucht jeder Blur auf.
- Im **Performance-Panel** sieht man die langen Paint- und GPU-Tasks direkt im Flame-Chart.

## Was ältere Browser damit zu tun haben

Mein erster Reflex war: "Blur wird doch überall unterstützt." Stimmt laut Caniuse, sagt aber nichts über Performance.

**GPU-Beschleunigung kann ganz wegfallen.** Firefox rendert über WebRender, fällt aber auf vielen Linux-Setups (alte Intel-GPUs, proprietäre Nvidia-Treiber) auf [Software-Rendering](https://wiki.archlinux.org/title/Firefox/Tweaks) zurück. Dann läuft die Blur-Convolution auf der CPU, und aus "unmerklich" wird "ruckelt".

::callout{icon="i-lucide-lightbulb" color="primary"}
  Ein grüner Caniuse-Balken heißt "der Browser kennt das Feature", nicht "er macht es schnell, auch ohne GPU-Beschleunigung".
::

## Was ich mitnehme

Der schönste Effekt taugt nichts, wenn die Seite dadurch langsam wird. Blur ist teuer in der Berechnung, Layer-erzeugend, mit Nebenwirkungen auf Stacking und Positionierung, und besonders fragil auf Mobile und ohne GPU-Beschleunigung. Und immer auf echten, eher schwachen Geräten testen, nicht nur auf der dicken Entwickler-Maschine.
