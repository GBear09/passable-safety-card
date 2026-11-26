# Changelog

All notable changes to **Passable Safety Card** will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.0.0] - 2026-11-26

### Added
- **Summary & Full Display Modes**: Added `display_mode: "summary"` (with `layout: "hero" | "rings"`, `summary_grouping: "grouped" | "devices"`, summary strip, expandable telemetry trays, footer strip, and responsive swipe-down Command Center popup) while preserving `display_mode: "full"` as default.
- **3-Tab Safety Command Center**: Reorganized the full interface into **Overview**, **Controls & Audio**, and **Diagnostics** tabs aligned with `passable-hvac-card` and `passable-vehicle-card`.
- **X-Sense SBS50 Base Station Discovery & Controls**: Automatically discovers `base_station` connectivity, Wi-Fi RSSI, IP/SSID, alarm/voice volume sliders, alarm tone selector, and LED brightness selector.
- **Model-Accurate SVGs**: Added custom SVG illustrations for **Google Nest Protect (2nd Gen Wired)** (dynamic green/amber/red/pathlight ring), **X-Sense XP0A-MR**, and **X-Sense SBS50 Base Station**.
- **Expanded Nest Protect & X-Sense Coverage**: Added wired `line_power` AC vs. battery backup status, `removed_from_base` tamper detection, `heads_up` vs. `emergency` alarm states, `alarm_hushed` sync, 8-point hardware self-test matrix (`smoke`, `co`, `buzzer`, `speaker`, `wifi`, `led`, `pir`, `humidity`), Night Light `brightness` selector, X-Sense alarm volume/tone controls, `replace_by` expiration warnings (`<= 180d`), and HVAC cutoff automation status (`automation.smoke_or_co_detected_turn_off_hvac`).

### Changed
- **Performance & Theme Safety**: Added `shouldUpdate` entity filtering, haptic/toast feedback, scroll-locked modal overlay, and theme-adaptive CSS variables for full Light and Dark theme compatibility.
- **Visual Editor**: Upgraded to collapsible Passable accordion sections.

## [1.0.2] - 2026-10-02

### Changed
- **Local LitElement Extraction**: Replaced external unpkg CDN imports with local Home Assistant prototype extraction (`hui-entities-card`), removing all external network dependencies.
- **Design System Alignment**: Added `<ha-icon icon="mdi:shield-check">` to header title and wrapped in `.header-left`.
- **Divider & Layout**: Added standard header bottom divider line (`border-bottom: 1px solid var(--divider-color)`), elevated title size to 24px, and set border radius to 12px.
- **Light Theme Safety**: Replaced hardcoded dark background and white text with light/dark theme adaptive CSS variables.
- **Visual UI Editor**: Cleaned up and wired static `getConfigElement()`.
- **Registry Metadata**: Standardized `window.customCards` configuration with `documentationURL`.

## [1.0.1] - 2026-09-17

### Fixed
- Detector grouping and live test action service calls.

## [1.0.0] - 2026-09-16

### Added
- Initial release of Passable Safety Card.
