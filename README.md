# Passable Safety Card

[![hacs_badge](https://img.shields.io/badge/HACS-Custom-orange.svg)](https://github.com/hacs/default)
[![version](https://img.shields.io/badge/version-v1.0.1-blue.svg)](https://github.com/GBear09/passable-safety-card/releases)
[![license](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

A flexible, high-performance universal safety command center card for Home Assistant Lovelace dashboards. Designed specifically for monitoring and controlling smart **Smoke and Carbon Monoxide Detectors** (such as X-Sense, Nest Protect, First Alert, and any Zigbee/Z-Wave/Matter safety sensors) with **100% dynamic auto-discovery**.

---

## ✨ Features

- **🔄 100% Dynamic Auto-Discovery**: Automatically discovers all Smoke, CO, and combined detectors across your home with zero manual YAML configuration or helper groups.
- **🚨 Unified Safety Center Banner**: Live high-level status indicator (**ALL CLEAR**, **SMOKE ALARM**, **CO ALARM**, or **BATTERY WARNING**) with glowing state animations and aggregate sensor counts.
- **🛡️ Grouped Detector Cards**: Organizes sensors by physical device and room, showing live smoke status, real-time CO PPM readings, and battery health gauges.
- **🎮 Integrated Detector Controls**: Built-in interactive buttons for **Mute (Silence)**, **Device Test**, and **Alarm Drill** with optional safety confirmation prompts to prevent accidental sirens.
- **🔋 Comprehensive Battery Diagnostics**: Monitors battery percentages and low-battery alerts across all detectors in one place.
- **🛠️ Full Visual GUI Editor**: Easily configure title, icon, auto-discovery parameters, exclusions, and display modes directly in Lovelace.
- **📱 Responsive & Passable Theme Design**: Pixel-perfect aesthetic matching the `passable-*` dashboard card collection.

---

## 📦 Installation

### Option 1: Via HACS (Recommended)

1. Open **HACS** in your Home Assistant instance.
2. Click the three dots `⋮` in the top-right corner and select **Custom repositories**.
3. Add the repository URL:
   ```text
   https://github.com/GBear09/passable-safety-card
   ```
4. Set the Category to **Dashboard** (or **Lovelace**) and click **Add**.
5. Find **Passable Safety Card** in HACS, click **Download**, and reload your browser dashboard.

---

### Option 2: Manual Installation

1. Download the [`passable-safety-card.js`](passable-safety-card.js) file from the latest release.
2. Upload `passable-safety-card.js` into your Home Assistant `/config/www/` directory.
3. In Home Assistant, navigate to **Settings** -> **Dashboards** -> **Three Dots (top right)** -> **Resources**.
4. Click **Add Resource** and set:
   - **Url**: `/local/passable-safety-card.js?v=1.0.1`
   - **Resource Type**: `JavaScript Module`
5. Refresh your browser page.

---

## 🚀 Usage Examples

### 1. Minimal Auto-Discovery Configuration
Just add the card to your dashboard or popup—it will automatically discover all detectors in your Home Assistant instance:

```yaml
type: custom:passable-safety-card
```

---

### 2. Custom Title & Header Options

```yaml
type: custom:passable-safety-card
title: Smoke & CO Safety Center
icon: mdi:fire-alert
show_summary_banner: true
show_battery_gauges: true
```

---

### 3. Advanced Configuration with Exclusions & Custom Entity Links

```yaml
type: custom:passable-safety-card
title: Home Safety & Alarm Center
icon: mdi:shield-home
auto_discover: true
exclude_entities:
  - binary_sensor.test_detector_smoke_status
aggregate_entities:
  alert_status: binary_sensor.home_alert_status
  smoke_status: binary_sensor.home_smoke_status
  co_status: binary_sensor.home_co_status
  battery_status: binary_sensor.detector_low_battery
confirm_drills: true
```

---

## ⚙️ Configuration Parameters

| Parameter | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `type` | string | **Required** | Must be `custom:passable-safety-card` |
| `title` | string | `"Smoke & CO Safety Center"` | Custom title displayed in the card header |
| `icon` | string | `"mdi:fire-alert"` | Header icon |
| `auto_discover` | boolean | `true` | Automatically discover all smoke & CO detectors |
| `show_summary_banner` | boolean | `true` | Displays the top aggregate safety status banner |
| `show_battery_gauges` | boolean | `true` | Displays battery percentages and diagnostic gauges |
| `confirm_drills` | boolean | `true` | Prompts for confirmation before triggering an alarm drill |
| `exclude_entities` | list | `[]` | List of entity IDs or glob patterns to exclude from discovery |
| `aggregate_entities` | object | `{}` | Optional explicit mapping for global safety helpers |
| `devices` | list | `[]` | Optional manual device definitions to override auto-discovery |

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
