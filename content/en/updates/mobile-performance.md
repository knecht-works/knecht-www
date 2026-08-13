---
title: From 5 seconds to under 0.5
date: 2026-06-12
tag: Performance
description: A deep dive into why CSS blur is one of the most expensive effects in the browser, and how a single filter made the landing page slow on mobile.
---

On desktop the landing page loaded immediately. On mobile it was very slow, more than five seconds until it appeared. The cause was a single CSS effect, `blur()`. This post shows the full path from the diagnosis to what really happens under the hood.

## The problem

On mobile the page was simply slow. The load took a long time, and on desktop it was fast. We checked the usual suspects, large images, too much JavaScript, and a slow server. None of them was the cause.

In the end the cause was the background. It contains some large, soft light spots (glows), made with `filter: blur()`. One element was more than 1000px wide, with a blur radius of 100px.

::callout{icon="i-lucide-zap-off" color="primary"}
  More than five seconds to the first frame kills a landing page. That moment decides if a visitor stays.
::

## Why blur is expensive

`blur()` is a [convolution](https://developer.chrome.com/blog/animated-blur). The browser computes each output pixel from the weighted input pixels around it. The cost scales with the area **and** the radius. A `blur(100px)` is therefore much more expensive than a `blur(5px)`.

This happens for each frame, in about these steps:

::steps{level="3"}

### Render-to-texture

First the browser renders the element into its own off-screen texture. This alone promotes the element to its own compositing layer and costs GPU memory.

### Separable Gaussian

The engine splits a 2D Gaussian into two 1D passes, first horizontal, then vertical. This lowers the cost from O(n²) to O(n) per pixel. This is already the optimized variant.

### Downsampling

For large radii, the engine does not compute at full resolution. Skia (Chrome) [scales down at a sigma above 4](https://api.skia.org/classSkImageFilters.html), blurs at the smaller buffer size, and scales up again.

::

Despite all these optimizations, a very large area remains, and it must be ready before the first paint. On desktop you do not notice this. A mobile GPU does this work much more slowly, and exactly this delayed the first frame by seconds.

## Why mobile GPUs suffer most

Almost all mobile GPUs work [tile-based](https://developer.samsung.com/galaxy-gamedev/resources/articles/gpu-framebuffer.html). The GPU splits the framebuffer into small tiles and renders them in fast on-chip memory. This saves much memory bandwidth, but it only works while the GPU can compute each tile on its own.

A blur breaks exactly this assumption. The convolution must read pixels beyond the tile border. The GPU cannot keep the effect local to a tile. It must write to the slow system memory and read from it again. On hardware with low fill rate and bandwidth, this is the most expensive case.

## `filter` is not `backdrop-filter`

The header contained a second blur, and that one is a different problem. People often confuse the two:

- **`filter: blur()`** blurs the **own pixels** of the element. The content behind it does not matter.
- **[`backdrop-filter: blur()`](https://www.w3tweaks.com/css/css-filter-backdrop-filter/)** blurs **everything behind the element**, and it reads those pixels again in each frame.

The second one is brutal when you scroll. The backdrop changes all the time, so the browser computes the blur again and again. [This causes visible stutter](https://github.com/vuejs/vitepress/issues/1049), for example in older Firefox builds on Linux. A fixed, semi-transparent header with `backdrop-filter` is one of the most frequent causes of jank.

## Blur and animation

In short, do not animate the radius. Each frame triggers the full convolution on the GPU and breaks the 16ms frame budget. The result is far below 60fps.

Chrome shows a [trick](https://developer.chrome.com/blog/animated-blur). You stack some precomputed copies with an exponentially higher blur, and you cross-fade between them with `opacity`. Opacity is compositor-only and therefore cheap. You do not animate the blur, you simulate it.

## The solution

In this case the solution was almost too simple. We removed the blur completely.

The old version blurred a sharp circle, and that was expensive. The glows are now radial gradients with multiple steps, and these gradients are soft by default. The result looks almost identical, but without a filter, without an extra layer, without a convolution. I also removed the `backdrop-filter` in the header.

Other valid options exist, dependent on the case. Deliver a pre-blurred image as an asset, keep the radius small, or apply the blur to a smaller element.

The result is clear. The page now appears in less than half a second instead of more than five seconds. It is ten times faster, and the design looks the same.

## How you find such a problem

In the Chrome DevTools, the [Rendering tab](https://developer.chrome.com/docs/devtools/rendering/performance) leads quickly to the cause:

- **Paint Flashing** shows in green what the browser paints again. A header that blinks green all the time during scroll is a clear signal.
- **Layer Borders** and the **Layers tab** show which elements get their own compositing layer. Each blur appears there.
- The **Performance panel** shows the long paint tasks and GPU tasks directly in the flame chart.

## The role of older browsers

My first thought was that all browsers support blur. Caniuse confirms this, but support says nothing about performance.

**GPU acceleration can be absent completely.** Firefox renders with WebRender, but on many Linux setups (old Intel GPUs, proprietary Nvidia drivers) it falls back to [software rendering](https://wiki.archlinux.org/title/Firefox/Tweaks). Then the blur convolution runs on the CPU, and a smooth effect becomes visible stutter.

::callout{icon="i-lucide-lightbulb" color="primary"}
  A green Caniuse bar means that the browser knows the feature. It does not mean that the browser is fast without GPU acceleration.
::

## What I learned

The most beautiful effect has no value when it makes the page slow. Blur is expensive to compute, it creates layers, it has side effects on stacks and positions, and it is fragile on mobile and without GPU acceleration. And always test on real, weak devices, not only on a fast developer machine.
