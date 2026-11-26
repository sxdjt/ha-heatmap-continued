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

For a per-line list of gaps, add `--test-reporter=lcov --test-reporter-destination=<file>` and look for `FNDA:0` and `BRDA:...,0` lines. Pair `FN` and `FNDA` lines by position, not by name: names repeat.

## Known issues

Record a known bug as a test with the `todo` option, describing the intended behavior. It runs and reports as `todo` without failing the suite. When a fix lands, remove the `todo` option. A `todo` test reports the same whether it passes or fails; check with `--test-reporter=tap` that each one is `not ok`.

Sweep findings live in `heatmap-hunt.test.js`.
