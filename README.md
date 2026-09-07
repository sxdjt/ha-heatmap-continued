# Heatmap Card for Home Assistant - Continued

![GitHub Release](https://img.shields.io/github/v/release/sxdjt/ha-heatmap-continued?style=for-the-badge)
![GitHub License](https://img.shields.io/github/license/sxdjt/ha-heatmap-continued?style=for-the-badge)
[![AI Assisted](https://img.shields.io/badge/AI-Claude%20Code-AAAAAA.svg?style=for-the-badge)](https://claude.ai/code)

<img width="600" alt="Heatmap card showing historical data" src="images/banner.png">

A Home Assistant Lovelace card that displays sensor history as a [heat map](https://en.wikipedia.org/wiki/Heat_map), making it easy to spot patterns and trends across days at a glance.

## Continuation Notice: March 2026

In discussions on my other heatmaps cards, many people have commented that [kandsten's heatmap card](https://github.com/kandsten/ha-heatmap-card) was a good reference point.  I have checked with @kandsten and he has given his OK for me to release this as a continuation of his work.  The card will be maintained to ensure continued functionality and updated as needed.

**All credit and kudos go to @kandsten and the other contributors.**

---

## Features

- **Automatic scale selection** - picks a sensible color scale based on the entity's device class
- **Built-in absolute scales** - purpose-built scales for temperature, CO2, PM2.5, air quality, and more
- **Built-in relative scales** - general-purpose palettes that stretch to fit your data range
- **Fahrenheit support** - dedicated Fahrenheit variants for all built-in temperature scales
- **Custom color scales** - define your own absolute or relative scale in YAML
- **Visual editor** - configure scales, thresholds, and display options without editing YAML
- **Custom threshold editor** - build a color scale visually with add/remove steps and a color picker
- **Configurable legend** - show or hide the legend; control decimal places on tick labels
- **Cell value labels** - optional numbers drawn in each cell, with text colour chosen for contrast against the background (opt-in)
- **Hide zero labels** - when labels are on, optionally omit the label if the value is 0
- **Min/max override** - lock the color range to fixed values for consistent comparisons
- **Cell detail popup** - click any cell for its time window and value; click elsewhere or press Escape to dismiss
- **Horizontal layout** - carpet-plot orientation with dates across the card, so a year of history fits a full-width section
- **Adjustable height** - pin the grid to a fixed height and let cells and date labels adapt
- **History browser** - page back through history a screen at a time with the arrow controls
- **Adjustable time axis** - group hours into larger buckets and control how often the axis is labelled

---

## Installation

[![Open your Home Assistant instance and open a repository inside the Home Assistant Community Store.](https://my.home-assistant.io/badges/hacs_repository.svg)](https://my.home-assistant.io/redirect/hacs_repository/?owner=sxdjt&repository=ha-heatmap-continued&category=Lovelace)

---

## Quick Start

### Minimal Configuration

```yaml
type: custom:heatmap-card
entity: sensor.living_room_temperature
```

The card picks a title from the entity's friendly name, shows 21 days of history, and selects a color scale based on the entity's device class.

<img width="300" alt="Temperature heatmap" src="images/temperature.png">

### Energy Sensor Example

```yaml
type: custom:heatmap-card
entity: sensor.grid_power_usage
title: Grid Energy Usage
days: 20
data:
  min: 0
  max: 14
```

Setting `data.max` to a fixed value (such as your main fuse capacity in kW) keeps the color scale consistent across time periods.

<img width="300" alt="Grid energy heatmap" src="images/grid_usage.png">

### Net Energy Example (two entities)

When grid import and export are measured by separate sensors, combine them into a single net heatmap. `operation: difference` renders `entity` minus `secondary_entity` for each hour, so import-dominant hours read positive and export-dominant hours read negative.

```yaml
type: custom:heatmap-card
entity: sensor.grid_import
secondary_entity: sensor.grid_export
operation: difference
title: Net Grid Energy
scale: net energy
```

The `net energy` scale is diverging (blue for export, white near zero, red for import) and, with auto range, centers zero by widening the range symmetrically. Use `operation: sum` instead to add two entities (for example two circuits' consumption). Multi-entity combination is only available in hourly mode.

Both entities must be recorded the same way: either both `state_class: measurement`, or both `total`/`total_increasing`. Mixing the two is not meaningful (one records hourly averages, the other hourly deltas), and the card shows an error instead of rendering. Energy sensors are converted to kWh automatically; for other device classes, make sure both entities use the same unit.

### Horizontal (Carpet Plot) Example

```yaml
type: custom:heatmap-card
entity: sensor.outdoor_temperature
orientation: horizontal
days: 365
title: A Year of Temperature
```

Horizontal layout transposes the grid: dates run left to right and time of day runs top to
bottom. Because the range is on the horizontal axis, the card's height stays the same
whether you plot 21 days or 365 - which is what makes long ranges practical. Date labels
thin out automatically as columns get narrower, and re-adjust when the card is resized.

Best used in a full-width dashboard section.

### Daily Mode Example

```yaml
type: custom:heatmap-card
entity: sensor.outdoor_temperature
mode: daily
weeks: 12
aggregate: mean
```

Daily mode shows one cell per calendar day. Rows are weeks (Monday-Sunday); columns are labeled Mon-Sun using your locale. The `aggregate` option controls which daily statistic is used - `mean` is suitable for most sensors; use `min` or `max` to highlight daily extremes. Use `last` to plot each day's final hour value instead of an average, for sensors where the end-of-day reading is more representative than the daily mean (for example a heat pump COP). `last` reads the mean of the day's last recorded hour from long-term statistics, so older weeks stay populated; it is not the literal last raw sample (which statistics do not retain for measurement sensors).

### Cell Labels Example

```yaml
type: custom:heatmap-card
entity: sensor.solar_power
title: Solar generation heatmap
days: 21
display:
  labels: true
  hide_zero: true
  decimals: 0
```

Cell labels are **opt-in** (`display.labels: true`). Text colour is chosen automatically for contrast against the cell background. With `hide_zero: true` (the default when labels are on), zero values stay blank so inactive hours stay uncluttered. Labels are also suppressed automatically when cells are too narrow to read (for example a horizontal carpet plot over many days).

---

## Time Axis

By default each cell covers one hour. `time_interval` groups hours into larger cells,
which reduces noise and makes long ranges easier to read:

```yaml
type: custom:heatmap-card
entity: sensor.outdoor_temperature
orientation: horizontal
days: 90
time_interval: 2      # each cell covers two hours; 12 rows instead of 24
```

Allowed values are whole divisors of 24 (`1`, `2`, `3`, `4`, `6`, `8`, `12`, `24`) so every
cell covers the same span. How values are combined depends on the entity: sensors recording
a `measurement` (temperature, humidity) are averaged over the bucket, while `total` and
`total_increasing` sensors (energy, rainfall) are summed, since their hourly values are
increments. Hours with no data are skipped rather than counted as zero; a cell is blank only
when nothing at all was recorded in its window. Hourly mode only - daily mode's axis is the
days of the week.

Axis labels are placed automatically: horizontal layout fits as many as the height allows,
vertical layout labels every four hours. Override with `display.time_labels`, which draws a
label every Nth slot:

```yaml
display:
  time_labels: 3      # label every 3rd slot on the time axis
```

---

## Browsing History

The controls above the grid page through history a screen at a time:

- **Left arrow** - move back one full window (`days` in hourly mode, `weeks` in daily mode)
- **Right arrow** - move forward again; disabled once you are back at the present
- **Now** - jump straight back to the present; only shown while you are viewing the past

The label between the arrows shows the range currently on screen. While you are browsing
history the card stops its periodic refresh, since a past window cannot change, and resumes
once you return to the present. Paging is reset whenever the card's configuration changes.

How far back you can go depends on how much history your recorder has kept. Past the end of
your retained data the card simply shows no data rather than erroring.

Hide the controls with `display.navigation: false`.

---

## Configuration

### Card Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `entity` | string | **required** | Entity ID to display |
| `secondary_entity` | string | - | Optional second entity to combine per hour (hourly mode only) |
| `operation` | string | `difference` | How to combine the two entities: `difference` (`entity` - `secondary_entity`) or `sum` |
| `title` | string | Entity friendly name | Card title |
| `mode` | string | `hourly` | Heatmap granularity: `hourly` or `daily` |
| `orientation` | string | `vertical` | Grid layout: `vertical` (dates down the side) or `horizontal` (dates across, carpet plot) |
| `time_interval` | number | `1` | Hours per cell on the time axis: `1`, `2`, `3`, `4`, `6`, `8`, `12` or `24` (hourly mode only) |
| `data` | object | - | Data range configuration (see below) |
| `days` | number | `21` | Days of history to show (hourly mode) |
| `weeks` | number | `12` | Weeks of history to show (daily mode) |
| `aggregate` | string | `mean` | Daily aggregate statistic: `mean`, `min`, `max`, or `last` (daily mode). `last` = final hour's value of each day |
| `device_class` | string | From entity | Override device class for scale auto-selection |
| `display` | object | - | Display options (see below) |
| `scale` | string or object | Auto (by device class) | Built-in scale name or custom scale definition |

### Data Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `data.min` | number | Auto | Minimum value for the color scale |
| `data.max` | number | Auto | Maximum value for the color scale |

### Display Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `display.legend` | boolean | `true` | Show or hide the color scale legend |
| `display.labels` | boolean | `false` | Show numeric values inside each cell (opt-in) |
| `display.hide_zero` | boolean | `false` | When labels are on, omit the label if the value is 0 |
| `display.decimals` | number | Auto | Fixed decimal places for cell labels and legend tick labels |
| `display.height` | number | Auto | Fixed height in pixels for the grid; cells and date labels adapt to fit |
| `display.navigation` | boolean | `true` | Show the history navigation controls above the grid |
| `display.time_labels` | number | Auto | Label every Nth slot on the time axis; omit to let the card choose |

---

## Built-in Scales

Scales are selected automatically based on `device_class`, but can be set explicitly with the `scale` option.

### Absolute Scales

Absolute scales map colors to specific values, regardless of the data range. Units are fixed.

| Scale Name | Units | Device Class |
|------------|-------|--------------|
| `carbon dioxide` | ppm | carbon_dioxide |
| `indoor temperature f` | °F | temperature |
| `indoor temperature` | °C | temperature |
| `nitrogen dioxide eaqi` | µg/m³ | nitrogen_dioxide |
| `outdoor temperature f` | °F | temperature |
| `outdoor temperature` | °C | temperature |
| `ozone eaqi` | µg/m³ | ozone |
| `pm10 eaqi` | µg/m³ | pm10 |
| `pm25 eaqi` | µg/m³ | pm25 |
| `pm25` | µg/m³ | pm25 |
| `sulphur dioxide eaqi` | µg/m³ | sulphur_dioxide |

### Relative Scales

Relative scales stretch from your minimum value to your maximum value. They work with any sensor.

| Scale Name | Description |
|------------|-------------|
| `black hot` | White to black |
| `blue hot` | Near-black to blue to pale blue |
| `colorbrewer 5cl bugn` | ColorBrewer blue-green |
| `colorbrewer 5cl bupu` | ColorBrewer blue-purple |
| `colorbrewer 5cl rdpu` | ColorBrewer red-purple |
| `colorbrewer 5cl ylorbr` | ColorBrewer yellow-orange-brown |
| `green hot` | Near-black to green to pale green |
| `iron red` | Black to yellow via red |
| `net energy` | Diverging blue-white-red for signed values (e.g. net grid energy) |
| `red hot` | Near-black to red to pale red |
| `stoplight` | Green to red (**default** when no device-class scale applies) |
| `white hot` | Black to white |

The `hot` scales are named for what the *highest* values look like, following the
thermal-imaging convention.

### Retired Scales

These scale names were removed but still work - they resolve to a replacement rather than
erroring, so existing dashboards keep rendering:

| Retired name | Now renders as |
|--------------|----------------|
| `outdoor temperature oceanic` | `outdoor temperature` |
| `outdoor temperature oceanic f` | `outdoor temperature f` |
| `wikipedia climate cool2` | `outdoor temperature` |
| `wikipedia climate cool2 f` | `outdoor temperature f` |

---

## Custom Color Scales

### Via the Visual Editor

The visual editor includes a threshold editor that lets you build custom scales without touching YAML:

- Toggle "Use custom thresholds" on the scale picker
- Choose **Fixed thresholds** (absolute) or **Auto-range** (relative)
- Add or remove color steps; set values for fixed scales
- Return to a built-in scale with "Back to preset scales"

### Via YAML

Custom scales are defined as an object with a `type` and a list of `steps`.

**Relative scale** (colors stretch across your data range):

```yaml
type: custom:heatmap-card
entity: sensor.solar_power
data:
  max: 4.8
scale:
  type: relative
  steps:
    - value: 0
      color: '#000000'
    - value: 0.5
      color: '#FFFF00'
    - value: 1
      color: '#FF00FF'
```

**Absolute scale** (colors map to specific values):

```yaml
type: custom:heatmap-card
entity: sensor.living_room_temperature
scale:
  type: absolute
  steps:
    - value: 10
      color: '#0000FF'
    - value: 20
      color: '#00FF00'
    - value: 30
      color: '#FF0000'
```

---

## Contributing

Issues and pull requests welcome on [GitHub](https://github.com/sxdjt/ha-heatmap-continued).

## License

This project is licensed under the **MIT License**. See the [LICENSE](LICENSE) file for full details.
