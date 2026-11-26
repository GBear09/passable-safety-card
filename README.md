# Passable Safety Card

[![hacs_badge](https://img.shields.io/badge/HACS-Custom-orange.svg)](https://github.com/hacs/default)
[![version](https://img.shields.io/badge/version-v2.0.0-blue.svg)](https://github.com/GBear09/passable-safety-card/releases)
[![license](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

A unified Smoke & Carbon Monoxide Safety Command Center for Home Assistant aligned with the Passable card design system (`passable-hvac-card`, `passable-vehicle-card`, and `passable-lighting-card`). Supports both a compact `summary` dashboard card and a full 3-tab inline Command Center (`full`) for Google Nest Protect (Wired & Battery), X-Sense `XP0A-MR` detectors, and the X-Sense `SBS50` Base Station.

---

## Features

- **Summary & Full Command Center Modes**:
  - `display_mode: "summary"` renders a compact status strip, system/detector tiles (`hero` or `rings`), expandable room trays, quick footer chips, and a swipeable 3-tab Command Center popup.
  - `display_mode: "full"` (default) renders the 3-tab Command Center inline—ideal for dedicated views or `browser_mod.popup` dialogs.
- **Model-Accurate Hardware Graphics**: Custom dynamic SVGs for Google Nest Protect (with live green/amber/red status ring), X-Sense `XP0A-MR`, and the X-Sense `SBS50` Base Station.
- **X-Sense Base Station & Detector Audio Controls**: Adjust hub alarm/voice volume, detector siren volume, alarm tones, and LED brightness directly from the **Controls & Audio** tab.
- **Nest Protect Wired & Self-Test Diagnostics**: Monitors 120V AC `line_power` vs. battery backup, `removed_from_base` tamper, `heads_up` vs. `emergency` alarm states, Sound Check dates, 8-point hardware self-tests, and `replace_by` expiration countdown warnings (`<= 180` days).
- **Emergency HVAC Shutoff Link**: Surfaces and toggles `automation.smoke_or_co_detected_turn_off_hvac` alongside global Home Smoke/CO helpers.

---

## Configuration

### Full Command Center (Default / `browser_mod.popup`)

```yaml
type: custom:passable-safety-card
display_mode: full
show_header: false
confirm_drills: true
```

### Compact Overview Summary Card

```yaml
type: custom:passable-safety-card
display_mode: summary
layout: hero
summary_grouping: grouped
show_header: false
show_summary_strip: true
show_footer_strip: true
```

---

## Configuration Parameters

| Parameter | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `type` | string | **Required** | `custom:passable-safety-card` |
| `display_mode` | string | `"full"` | `"full"` (inline 3-tab view) or `"summary"` (compact tile + popup) |
| `layout` | string | `"hero"` | `"hero"` or `"rings"` (for `summary` mode) |
| `summary_grouping` | string | `"grouped"` | `"grouped"` (by Nest Protect / X-Sense) or `"devices"` (tile per detector) |
| `show_header` | boolean | `true` (`full`) / `false` (`summary`) | Toggle outer `.header` bar |
| `show_summary_strip` | boolean | `true` | Show top status strip in `summary` mode |
| `show_footer_strip` | boolean | `true` | Show quick-action footer strip in `summary` mode |
| `auto_discover` | boolean | `true` | Auto-discover Nest Protect, X-Sense detectors, and SBS50 Base Station |
| `confirm_drills` | boolean | `true` | Require confirmation before sounding an alarm drill |
| `hvac_shutoff_automation` | string | `automation.smoke_or_co_detected_turn_off_hvac` | Emergency HVAC cutoff automation entity |

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
