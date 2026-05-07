# Multi-stopwatch — source

Open `Multi-stopwatch (mobile).html` in a browser. No build step needed —
JSX is transpiled in-browser by Babel-standalone (loaded via <script> in the HTML).

## Files
- `Multi-stopwatch (mobile).html` — entry point. Mounts `<MobileApp/>` into `#root`.
- `stopwatch-core.jsx` — `useStopwatchStore` (state + localStorage), `useNow`,
  `elapsed()`, formatters, `ACCENT_COLORS`.
- `stopwatch-variations.jsx` — shared atoms: `Digits`, `LapModal`, `SetTimeSheet`,
  `ConfirmDialog`, `useController`, `ControllerOverlays`, `COLORS`, `FONT_*`.
  Also contains `VariationList` & `VariationCards` (used only by the design canvas; unused on mobile).
- `stopwatch-combined.jsx` — `VariationCombined`: list home + detail flow.
  This is what the mobile app renders.

## Editing tips
- Each `<script type="text/babel">` file gets its own scope. To share a value
  across files, attach it to `window` via the `Object.assign(window, {...})`
  block at the bottom of each `.jsx`.
- Edit any `.jsx` and refresh the browser — no rebuild step.
- localStorage key is `stopwatch-store-v1` (in core). Clear it from DevTools
  if you want a fresh state.

## Deploy
Drop all four files into a folder on any static host (GitHub Pages, Netlify,
etc). The HTML loads the JSX files via relative paths, so they need to be
siblings.
