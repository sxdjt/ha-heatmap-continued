# Changelog

All notable changes to this project will be documented in this file.

## [1.1.0] - 2026-04-21

### Added
- Daily heatmap mode: set `mode: daily` to view day-level aggregates instead of hourly data
  - `weeks` option controls how many weeks of history to show (default: 12)
  - `aggregate` option selects the daily statistic: `mean` (default), `min`, or `max`
  - Rows represent weeks (Monday-Sunday); columns are days of the week with locale-aware labels
  - Tooltip shows the exact calendar date for each cell
  - Visual editor exposes mode, weeks, and aggregate controls
- Thanks to @spikeygg for the feature suggestion

### Fixed
- First-date data loss in hourly mode: the oldest calendar date in the fetched history was always silently dropped. Both `calculate_measurement_values()` and `calculate_increasing_values()` had a `prevDate !== null` guard on the row-creation branch that prevented the first date's row from ever being pushed to the grid. The guard was removed; rows are now pushed immediately on any date transition including the first.
- Device class picker in the visual editor was broken in recent Home Assistant versions after HA migrated from MWC to MD3 components. Migrated from the deprecated `ha-select` + `mwc-list-item` pair to `ha-selector` with `select` type, matching the same fix applied to the scale picker in v1.0.1.
- Legend rendering: a stray double-quote in the tick element's inline style attribute (`style="left: X%;"">`) caused the closing `>` to be emitted as text content rather than ending the tag, producing a malformed DOM node.
- CSS typo in `.tick-container`: `position: relative:` (colon instead of semicolon) caused the rule to be silently dropped, breaking tick label positioning.
- `key.indexOf('.')` in the editor's root `value-changed` listener was replaced with `key.includes('.')`. The original always evaluated truthy (returning an index, not a boolean), causing all simple keys to be incorrectly treated as dot-notation paths.

### Changed
- Visual editor: card title field moved to the top of the editor (before Mode)
- Visual editor: Show legend toggle added to Card elements section
- Visual editor: min/max range controls refactored into a shared method (was duplicated)
- License simplified to MIT only (Apache 2.0 dual-license text removed)
- Full inline documentation added to all methods in `HeatmapCard` and `HeatmapCardEditor`

## [1.0.2] - 2026-03-31

### Fixed
- Console banner was displaying v1.0.0 instead of the correct version (omitted from v1.0.1 release)
- Updated release workflow action from `softprops/action-gh-release@v1` to `@v2` to resolve Node.js 20 deprecation warning in GitHub Actions

## [1.0.1] - 2026-03-30

### Fixed
- Color scale picker broken in recent Home Assistant versions after HA migrated from MWC to MD3 components; replaced `ha-select` with `ha-selector`

### Changed
- License changed to MIT
- README clarity improvements
- `hacs.json`: added `render_readme: true` so HACS displays the README

## [1.0.0] - 2026-03-03

### Added
- Custom threshold editor in the visual editor - build color scales without editing YAML
  - "Use custom thresholds" toggle on the preset scale picker
  - Scale type selector: Fixed thresholds (absolute) or Auto-range (relative)
  - Fixed mode: per-step color picker and value field, ordered by value
  - Auto-range mode: per-step color picker with optional min/max override
  - Add/remove steps with minimum of 2 enforced
  - "Back to preset scales" link to revert to a built-in scale
- Configurable legend decimal places via `display.decimals` config option
  - Accepts any integer >= 0; uses `toFixed()` for formatting
  - When unset, existing auto-formatting behavior is preserved
- Fahrenheit temperature color scales for all four built-in temperature scales:
  - `indoor temperature f [°F]`
  - `outdoor temperature f [°F]`
  - `outdoor temperature oceanic f [°F]`
  - `wikipedia climate cool2 f [°F]`

### Changed
- Removed esbuild build system; all source modules merged into a single deployable `heatmap-card.js` with no build step required
- Replaced broken `mwc-tab-bar` scale picker UI with a flat `ha-select` dropdown showing all built-in scales with gradient previews
- Replaced `ha-combo-box` elements with `ha-select` throughout the editor for reliable rendering in current HA versions
- Inlined chroma.js, scale data, and device class mappings directly into the card file

### Fixed
- Null values in `min_from`/`max_from` were coercing to 0 in `Math.min`/`Math.max`, skewing auto-scaled range for sensors with data gaps

## Prior Upstream Changes

The following changes were made in the upstream repository before this fork diverged.

### 2024-12-02
- Re-render the heatmap approximately every 10 minutes
- Fix custom scale compatibility with Home Assistant 2024.11
- Add outside temperature scale for oceanic climate
- Add scales for the European Air Quality Index (EAQI)

### 2023-05-21
- Support `state_class: total` entities
- Fix mistakenly included `console.log()` statement
- Check whether editor-selected entity supports long-term statistics

### 2023-05-15
- GUI card editor, additional scales, and numerous improvements

### 2023-03-31
- Improved tooltip display and other minor UI changes

### 2023-03-28
- Fix brittle data processing for `measurement` state class values
- DST (daylight saving time) handling fixes
- Localization fixes
