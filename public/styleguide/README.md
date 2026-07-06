# Knecht Styleguide

Shared styles, assets and JS for Knecht test fixtures. Defined once here, served
globally from `knecht.works`, imported by every fixture with two lines.

## Usage

In any fixture template (`<head>`):

```html
<link rel="stylesheet" href="https://knecht.works/styleguide/kit.css">
<script src="https://knecht.works/styleguide/kit.js" defer></script>
```

In local dev the same files are served from the running app:

```html
<link rel="stylesheet" href="http://lvh.me:3333/styleguide/kit.css">
```

## What's inside

- `kit.css` - design tokens (CSS variables), `kit-`prefixed component classes
  (`kit-body`, `kit-container`, `kit-stack`, `kit-card` (feature card with
  hover lift; set a per-card accent with `kit-accent-mint`/`-orange`/`-amber`
  and read it via `kit-text-a`), `kit-button` (`--solid`/`--ghost`),
  `kit-badge`, `kit-dl` (key/value list), `kit-code`, `kit-mascot`,
  `kit-toast`),
  plus a `kit-` utility layer so a fixture can compose any layout with classes
  alone, no inline `style`: display/flex/grid (`kit-flex`, `kit-flex-col`,
  `kit-items-center`, `kit-justify-between`, `kit-gap-4`, `kit-grid-cols-3`),
  spacing (`kit-mt-*`, `kit-mb-*`, `kit-p-*`, `kit-px-*`, scale 0-24), sizing
  (`kit-w-full`, `kit-max-w-measure`), type (`kit-text-lg`, `kit-text-center`,
  `kit-font-semibold`, `kit-font-mono`), color (`kit-text-muted`,
  `kit-text-mint`, `kit-bg-surface`) and border/radius (`kit-border`,
  `kit-rounded`). See `demo.html` for a page built entirely from utilities.
- Light mode - dark is the default. Add `kit-light` to the body (or any
  wrapper) to flip the whole token set: `<body class="kit-body kit-light">`.
  Swap `knecht-logo-dark.svg` for `knecht-logo-light.svg` on light backgrounds.
- `kit.js` - the global `KnechtKit` namespace: `ready(fn)`, `toast(msg)`,
  `copy(text)`, `toggleTheme(force?)` (flips `kit-light` on the body), plus
  auto-wiring for any `[data-kit-toast]` element.
- `assets/` - shared images (e.g. `knecht-head.svg`).
- `demo.html` - open `/styleguide/demo.html` to see everything render.

## Adding to the kit

Add a class to `kit.css` or a function to the `KnechtKit` object in `kit.js`,
drop assets into `assets/`. Every fixture picks up the change on next load, no
build and no per-fixture copy.
