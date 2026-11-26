# Tests

Run with `npm test`. It runs every `*.test.js` file here with Node's built-in test runner (the same runner as the other cards in this monorepo), with `TZ=UTC`. There are no dependencies. Files that need another timezone (DST, +05:30) set `process.env.TZ` themselves.

`npm test` runs under `test/run-capped.sh`, which kills the run past 1 GB of memory or 60 seconds (`MAX_RSS_MB`, `MAX_SECONDS` to override). Run single files the same way: `TZ=UTC test/run-capped.sh node --test test/<file>`.

## How it works

`helpers/load-card.js` runs `heatmap-card.js` (the file HA loads) in a `vm` context with minimal browser stand-ins, and returns its internal classes and helpers. Lit's `html`/`css` tags are stubbed to return `{ strings, values }`, so a template can be inspected without a DOM.

- Card and editor methods are tested on `Object.create(HeatmapCard.prototype)` (or the editor's), with `config`, `meta`, `myhass` and `scales` set by hand. Class fields such as `scales` are not set this way; set them yourself.
- Arrays and objects made inside the VM fail strict `deepEqual` against test-side ones; spread or map them into plain values first.
- The card runs as its own script under its real path, with the vendored chroma.js blanked out of it, so coverage reports `heatmap-card.js` only.

## Coverage

```bash
npm run coverage
```

Every line, function and branch of the card's own code is covered (258 functions, 1238 branches; the vendored chroma.js is not measured). Keep it at 100%: a change that adds a function or branch should add the test that covers it. For a per-line list of gaps, add `--test-reporter=lcov --test-reporter-destination=<file>` and look for `FNDA:0` and `BRDA:...,0` lines. Pair `FN` and `FNDA` lines by position, not by name: names repeat.

## Known issues

Record a known bug as a test with the `todo` option, describing the intended behavior. It runs and reports as `todo` without failing the suite. When a fix lands, remove the `todo` option. A `todo` test reports the same whether it passes or fails; check with `--test-reporter=tap` that each one is `not ok`.

Sweep findings live in `heatmap-hunt.test.js`. There are no open `todo` tests.

## Files

| File | Covers |
|------|--------|
| `heatmap-card.test.js` | Data builders, combining, bucketing, labels, sizing, units |
| `heatmap-scales.test.js`, `heatmap-custom-scale.test.js` | Built-in and retired scales, custom scale editor, range hints |
| `heatmap-history*.test.js` | Raw history fallback (no state_class), DST and +05:30 |
| `heatmap-minute*.test.js`, `heatmap-smoothing.test.js` | Minute mode (hour and day rows), smoothing |
| `heatmap-render.test.js` | Full render in HA's order, navigation, legend, tooltip, keyboard, ResizeObserver, headers |
| `heatmap-coverage.test.js` | Config and custom scale validation, fetch errors, builder edge cases, horizontal layout |
| `heatmap-editor.test.js` | Editor lifecycle, value-changed handler, switches, range boxes, custom steps, scale docs, card picker |
| `heatmap-hunt.test.js` | Sweep findings H1-H11 and the Show title switch (E1) |

`helpers/fixtures.js` has the fake hass (answers released by the test), statistics rows and `markup()` / `handlers()` for stub templates; `helpers/fake-dom.js` has a render root and cells for the tooltip and keyboard code.
