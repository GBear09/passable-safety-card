# Changelog

All notable changes to **Passable Safety Card** will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.2] - 2026-10-02

### Changed
- **Local LitElement Extraction**: Replaced external unpkg CDN imports with local Home Assistant prototype extraction (`hui-entities-card`), removing all external network dependencies.
- **Design System Alignment**: Added `<ha-icon icon="mdi:shield-check">` to header title and wrapped in `.header-left`.
- **Divider & Layout**: Added standard header bottom divider line (`border-bottom: 1px solid var(--divider-color)`), elevated title size to 24px, and set border radius to 12px.
- **Light Theme Safety**: Replaced hardcoded dark background `#1e1e24` and text `#ffffff` with light/dark theme adaptive CSS variables (`var(--card-background-color, #fff)`).
- **Visual UI Editor**: Cleaned up and wired static `getConfigElement()`.
- **Registry Metadata**: Standardized `window.customCards` configuration with `documentationURL`.

## [1.0.1] - 2026-09-17

### Fixed
- Detector grouping and live test action service calls.

## [1.0.0] - 2026-09-16

### Added
- Initial release of Passable Safety Card.
