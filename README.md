# Heatmap Card for Home Assistant - Continued

![GitHub Release](https://img.shields.io/github/v/release/sxdjt/ha-heatmap-continued?style=for-the-badge)
![GitHub License](https://img.shields.io/github/license/sxdjt/ha-heatmap-continued?style=for-the-badge)
[![AI Assisted](https://img.shields.io/badge/AI-Claude%20Code-AAAAAA.svg?style=for-the-badge)](https://claude.ai/code)

<img width="600" alt="Heatmap card showing solar energy generation" src="images/banner.png">

A Home Assistant Lovelace card that displays sensor history as a [heat map](https://en.wikipedia.org/wiki/Heat_map), making it easy to spot patterns and trends across days at a glance.

## Continuation Notice: March 2026

In discussions on my other heatmaps cards, many people have commented that @kandsten 's heatmap card was a good reference point.  I have checked with @kandsten and he has given his OK for me to release this as a continuation of his work.  The card will be maintained to ensure continued functionality and updated as needed.

All credit and kudos go to @kandsten and the other contributors.

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
- **Min/max override** - lock the color range to fixed values for consistent comparisons

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

---

## Configuration

### Card Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `entity` | string | **required** | Entity ID to display |
| `title` | string | Entity friendly name | Card title |
| `data` | object | - | Data range configuration (see below) |
| `days` | number | `21` | Number of days of history to show |
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
| `display.decimals` | number | Auto | Fixed decimal places for legend tick labels |

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
| `outdoor temperature oceanic f` | °F | temperature |
| `outdoor temperature oceanic` | °C | temperature |
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
| `black hot` | Black to white via orange/red |
| `colorbrewer 5cl bugn` | ColorBrewer blue-green |
| `colorbrewer 5cl bupu` | ColorBrewer blue-purple |
| `colorbrewer 5cl rdpu` | ColorBrewer red-purple |
| `colorbrewer 5cl ylorbr` | ColorBrewer yellow-orange-brown |
| `iron red` | Black to yellow via red |
| `stoplight` | Green to red |
| `white hot` | White to black |
| `wikipedia climate cool2 f` | Wikipedia climate chart (Fahrenheit) |
| `wikipedia climate cool2` | Wikipedia climate chart (Celsius) |

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

Apache License 2.0 - see [LICENSE](LICENSE) file for details
