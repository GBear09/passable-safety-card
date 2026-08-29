/**
 * Passable Safety Card
 * Dynamic Smoke & CO Safety Command Center with Auto-Discovery, Diagnostics, and Controls.
 * Version 1.0.0
 * (c) 2026 GBear09
 */

import {
  LitElement,
  html,
  css,
} from "https://unpkg.com/lit@3.0.0/index.js?module";

const CARD_VERSION = "1.0.0";

console.info(
  `%c PASSABLE-SAFETY-CARD %c v${CARD_VERSION} `,
  "color: white; background: #e74c3c; font-weight: bold; padding: 2px 6px; border-radius: 3px 0 0 3px;",
  "color: white; background: #2ecc71; font-weight: bold; padding: 2px 6px; border-radius: 0 3px 3px 0;"
);

// --- INLINE ICONS (Lucide & MDI) ---
const Icons = {
  ShieldCheck: html`<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 13c0 5-3.5 9.5-8 11-4.5-1.5-8-6-8-11V5l8-3 8 3v8Z"/><path d="m9 12 2 2 4-4"/></svg>`,
  ShieldAlert: html`<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 13c0 5-3.5 9.5-8 11-4.5-1.5-8-6-8-11V5l8-3 8 3v8Z"/><path d="M12 8v4"/><path d="M12 16h.01"/></svg>`,
  Flame: html`<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>`,
  Smoke: html`<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"/><path d="M8 19h8"/><path d="M10 22h4"/></svg>`,
  CO: html`<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v4"/><path d="M12 16h.01"/></svg>`,
  Battery: html`<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="16" height="10" x="2" y="7" rx="2" ry="2"/><line x1="22" x2="22" y1="11" y2="13"/></svg>`,
  BatteryLow: html`<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="16" height="10" x="2" y="7" rx="2" ry="2"/><line x1="22" x2="22" y1="11" y2="13"/><line x1="6" x2="6" y1="11" y2="13"/></svg>`,
  VolumeX: html`<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><line x1="22" x2="16" y1="9" y2="15"/><line x1="16" x2="22" y1="9" y2="15"/></svg>`,
  Bell: html`<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>`,
  Siren: html`<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 18v-6a5 5 0 1 1 10 0v6"/><path d="M5 21a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-1a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2z"/><line x1="21" x2="23" y1="12" y2="12"/><line x1="1" x2="3" y1="12" y2="12"/><line x1="19.07" x2="20.49" y1="4.93" y2="3.51"/><line x1="4.93" x2="3.51" y1="4.93" y2="3.51"/></svg>`,
  ChevronDown: html`<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>`,
  ChevronUp: html`<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m18 15-6-6-6 6"/></svg>`,
  CheckCircle: html`<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>`,
  AlertTriangle: html`<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" x2="12" y1="9" y2="13"/><line x1="12" x2="12.01" y1="17" y2="17"/></svg>`,
  Sparkles: html`<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>`
};

// --- HELPER: Auto-format device names ---
function formatFriendlyName(rawKey) {
  let name = rawKey
    .replace(/_s_/g, "'s ")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (l) => l.toUpperCase());
  return name;
}

// --- MAIN PASSABLE SAFETY CARD COMPONENT ---
export class PassableSafetyCard extends LitElement {
  static get properties() {
    return {
      hass: { type: Object },
      config: { type: Object },
      _expandedDevices: { type: Object },
      _confirmDialog: { type: Object },
      _actionLoading: { type: Object }
    };
  }

  constructor() {
    super();
    this._expandedDevices = {};
    this._confirmDialog = null;
    this._actionLoading = {};
  }

  setConfig(config) {
    if (!config) {
      throw new Error("Invalid configuration");
    }
    this.config = {
      title: "Smoke & CO Safety Center",
      icon: "mdi:fire-alert",
      auto_discover: true,
      show_summary_banner: true,
      show_battery_gauges: true,
      confirm_drills: true,
      exclude_entities: [],
      devices: [],
      ...config
    };
  }

  static getStubConfig() {
    return {
      title: "Smoke & CO Safety Center",
      icon: "mdi:fire-alert",
      auto_discover: true,
      show_summary_banner: true,
      show_battery_gauges: true,
      confirm_drills: true
    };
  }

  // --- DISCOVERY ENGINE ---
  _discoverDevices() {
    if (!this.hass || !this.hass.states) return [];

    // If manual devices provided and auto_discover is false, use manual list
    if (!this.config.auto_discover && this.config.devices && this.config.devices.length > 0) {
      return this.config.devices;
    }

    const excludeList = this.config.exclude_entities || [];
    const devicesMap = new Map();

    const getOrCreateDevice = (key, initialName, brand) => {
      if (!devicesMap.has(key)) {
        devicesMap.set(key, {
          id: key,
          name: initialName,
          room: initialName,
          brand: brand || "standard",
          smoke_entity: null,
          co_entity: null,
          co_reading_entity: null,
          battery_entity: null,
          battery_health_entity: null,
          silenced_entity: null,
          end_of_life_entity: null,
          heat_entity: null,
          mute_button: null,
          test_button: null,
          drill_button: null,
          test_result_sensor: null,
          test_time_sensor: null,
          replace_by_sensor: null,
          switches: []
        });
      }
      return devicesMap.get(key);
    };

    const states = this.hass.states;

    // 1. Primary Smoke / CO Detector Scan
    for (const [entityId, stateObj] of Object.entries(states)) {
      if (excludeList.includes(entityId)) continue;
      // Skip global aggregate helper sensors
      if (entityId.startsWith("binary_sensor.home_")) continue;

      const attrs = stateObj.attributes || {};
      const isSmoke =
        attrs.device_class === "smoke" ||
        entityId.includes("smoke_status") ||
        entityId.includes("smoke_co_alarm_status");
      const isCO =
        attrs.device_class === "carbon_monoxide" ||
        entityId.includes("co_status");

      if (isSmoke || isCO) {
        let key = "";
        let brand = "standard";
        let rawName = attrs.friendly_name || entityId;

        // Pattern 1: X-Sense detectors (*_smoke_co_alarm_status)
        const xsenseMatch = entityId.match(/binary_sensor.(.*)_smoke_co_alarm_status/);
        // Pattern 2: Nest Protect detectors (nest_protect_*_(smoke|co)_status)
        const nestMatch = entityId.match(/binary_sensor.nest_protect_([a-z0-9_]+)_(smoke|co)_status/);

        if (xsenseMatch) {
          key = xsenseMatch[1] + "_smoke_co";
          brand = "x-sense";
          rawName = formatFriendlyName(xsenseMatch[1]) + " Smoke/CO Detector";
        } else if (nestMatch) {
          key = "nest_protect_" + nestMatch[1];
          brand = "nest";
          rawName = formatFriendlyName(nestMatch[1]) + " Nest Protect";
        } else {
          key = entityId
            .replace("binary_sensor.", "")
            .replace(/_(smoke|co|alarm)_status/, "")
            .replace(/_(smoke|co)/, "");
          rawName = rawName.replace(/ Smoke Status| CO Status| Alarm Status/gi, "");
        }

        const dev = getOrCreateDevice(key, rawName, brand);
        if (isSmoke && !dev.smoke_entity) dev.smoke_entity = entityId;
        if (isCO && !dev.co_entity) dev.co_entity = entityId;
      }
    }

    // 2. Secondary Sibling Entity Mapping (Buttons, Sensors, Switches)
    for (const [entityId, stateObj] of Object.entries(states)) {
      if (excludeList.includes(entityId)) continue;

      for (const [key, dev] of devicesMap.entries()) {
        if (!entityId.includes(key)) continue;

        if (entityId.startsWith("button.")) {
          if (entityId.endsWith("_mute") || entityId.endsWith("_silence")) {
            dev.mute_button = entityId;
          } else if (entityId.endsWith("_device_test") || entityId.endsWith("_test")) {
            dev.test_button = entityId;
          } else if (entityId.endsWith("_alarm_drill") || entityId.endsWith("_drill")) {
            dev.drill_button = entityId;
          }
        } else if (entityId.startsWith("sensor.")) {
          if (entityId.endsWith("_battery") || entityId.endsWith("_battery_level")) {
            dev.battery_entity = entityId;
          } else if (entityId.endsWith("_co_reading")) {
            dev.co_reading_entity = entityId;
          } else if (entityId.endsWith("_co_level") && !dev.co_reading_entity) {
            dev.co_reading_entity = entityId;
          } else if (entityId.endsWith("_device_test_result")) {
            dev.test_result_sensor = entityId;
          } else if (entityId.endsWith("_device_test_time") || entityId.endsWith("_last_manual_test")) {
            dev.test_time_sensor = entityId;
          } else if (entityId.endsWith("_replace_by")) {
            dev.replace_by_sensor = entityId;
          }
        } else if (entityId.startsWith("binary_sensor.")) {
          if (entityId.endsWith("_battery_health") || entityId.endsWith("_battery_low")) {
            dev.battery_health_entity = entityId;
          } else if (entityId.endsWith("_device_silenced")) {
            dev.silenced_entity = entityId;
          } else if (entityId.endsWith("_end_of_life")) {
            dev.end_of_life_entity = entityId;
          } else if (entityId.endsWith("_heat_status")) {
            dev.heat_entity = entityId;
          }
        } else if (entityId.startsWith("switch.")) {
          if (!dev.switches.includes(entityId)) dev.switches.push(entityId);
        }
      }
    }

    return Array.from(devicesMap.values());
  }

  // --- ACTIONS ---
  async _callButton(entityId, actionName) {
    if (!this.hass || !entityId) return;
    this._actionLoading = { ...this._actionLoading, [entityId]: true };
    this.requestUpdate();

    try {
      await this.hass.callService("button", "press", { entity_id: entityId });
    } catch (e) {
      console.error(`Failed to trigger ${actionName} on ${entityId}`, e);
    } finally {
      setTimeout(() => {
        this._actionLoading = { ...this._actionLoading, [entityId]: false };
        this.requestUpdate();
      }, 800);
    }
  }

  _handleMute(ev, dev) {
    ev.stopPropagation();
    if (!dev.mute_button) return;
    this._callButton(dev.mute_button, "Mute");
  }

  _handleTest(ev, dev) {
    ev.stopPropagation();
    if (!dev.test_button) return;
    this._callButton(dev.test_button, "Device Test");
  }

  _handleDrillClick(ev, dev) {
    ev.stopPropagation();
    if (!dev.drill_button) return;

    if (this.config.confirm_drills !== false) {
      this._confirmDialog = {
        title: "Sound Alarm Drill?",
        message: `Are you sure you want to trigger a loud alarm drill for ${dev.name}? All connected sirens will sound.`,
        action: () => this._callButton(dev.drill_button, "Alarm Drill")
      };
      this.requestUpdate();
    } else {
      this._callButton(dev.drill_button, "Alarm Drill");
    }
  }

  _confirmAction() {
    if (this._confirmDialog && this._confirmDialog.action) {
      this._confirmDialog.action();
    }
    this._confirmDialog = null;
    this.requestUpdate();
  }

  _cancelDialog() {
    this._confirmDialog = null;
    this.requestUpdate();
  }

  _toggleExpand(devId, ev) {
    if (ev) ev.stopPropagation();
    this._expandedDevices = {
      ...this._expandedDevices,
      [devId]: !this._expandedDevices[devId]
    };
    this.requestUpdate();
  }

  _handleMoreInfo(entityId, ev) {
    if (ev) ev.stopPropagation();
    if (!entityId) return;
    const event = new CustomEvent("hass-more-info", {
      detail: { entityId },
      bubbles: true,
      composed: true
    });
    this.dispatchEvent(event);
  }

  // --- RENDER ---
  render() {
    if (!this.hass) return html``;

    const devices = this._discoverDevices();

    // Aggregate Calculations
    let activeSmokeCount = 0;
    let activeCOCount = 0;
    let lowBatteryCount = 0;

    devices.forEach((dev) => {
      // Check Smoke
      if (dev.smoke_entity && this.hass.states[dev.smoke_entity]) {
        const state = this.hass.states[dev.smoke_entity].state;
        if (state === "on" || state === "smoke") activeSmokeCount++;
      }
      // Check CO
      if (dev.co_entity && this.hass.states[dev.co_entity]) {
        const state = this.hass.states[dev.co_entity].state;
        if (state === "on" || state === "carbon_monoxide") activeCOCount++;
      }
      if (dev.co_reading_entity && this.hass.states[dev.co_reading_entity]) {
        const val = parseFloat(this.hass.states[dev.co_reading_entity].state);
        if (!isNaN(val) && val >= 30) activeCOCount++;
      }
      // Check Battery
      if (dev.battery_entity && this.hass.states[dev.battery_entity]) {
        const val = parseFloat(this.hass.states[dev.battery_entity].state);
        if (!isNaN(val) && val <= 20) lowBatteryCount++;
      }
      if (dev.battery_health_entity && this.hass.states[dev.battery_health_entity]) {
        const state = this.hass.states[dev.battery_health_entity].state;
        if (state === "on" || state === "problem" || state === "low") lowBatteryCount++;
      }
    });

    // Check optional global aggregate entities if defined
    if (this.hass.states["binary_sensor.home_smoke_status"]?.state === "on") activeSmokeCount = Math.max(activeSmokeCount, 1);
    if (this.hass.states["binary_sensor.home_co_status"]?.state === "on") activeCOCount = Math.max(activeCOCount, 1);
    if (this.hass.states["binary_sensor.detector_low_battery"]?.state === "on") lowBatteryCount = Math.max(lowBatteryCount, 1);

    // Global Safety State
    let safetyLevel = "safe"; // 'safe' | 'smoke' | 'co' | 'battery'
    if (activeSmokeCount > 0) safetyLevel = "smoke";
    else if (activeCOCount > 0) safetyLevel = "co";
    else if (lowBatteryCount > 0) safetyLevel = "battery";

    return html`
      <ha-card>
        <!-- Header -->
        <div class="card-header">
          <div class="header-title-container">
            <ha-icon class="header-icon" icon="${this.config.icon || 'mdi:fire-alert'}"></ha-icon>
            <div class="header-text">
              <span class="main-title">${this.config.title || 'Smoke & CO Safety Center'}</span>
              <span class="sub-title">${devices.length} Monitored Detectors</span>
            </div>
          </div>
          <div class="header-badge ${safetyLevel}">
            ${safetyLevel === 'safe' ? html`${Icons.ShieldCheck} <span>ALL CLEAR</span>` : ''}
            ${safetyLevel === 'smoke' ? html`${Icons.Flame} <span class="pulse-text">SMOKE ALERT</span>` : ''}
            ${safetyLevel === 'co' ? html`${Icons.CO} <span class="pulse-text">CO ALERT</span>` : ''}
            ${safetyLevel === 'battery' ? html`${Icons.BatteryLow} <span>LOW BATTERY</span>` : ''}
          </div>
        </div>

        <!-- Summary Banner -->
        ${this.config.show_summary_banner !== false ? html`
          <div class="summary-banner ${safetyLevel}">
            <div class="summary-pill ${activeSmokeCount > 0 ? 'alert-smoke' : 'normal'}">
              <div class="pill-icon">${Icons.Smoke}</div>
              <div class="pill-data">
                <span class="pill-label">Smoke Status</span>
                <span class="pill-value">${activeSmokeCount > 0 ? `${activeSmokeCount} Alerting` : 'All Clear'}</span>
              </div>
            </div>

            <div class="summary-pill ${activeCOCount > 0 ? 'alert-co' : 'normal'}">
              <div class="pill-icon">${Icons.CO}</div>
              <div class="pill-data">
                <span class="pill-label">Carbon Monoxide</span>
                <span class="pill-value">${activeCOCount > 0 ? `${activeCOCount} Detected` : '0 ppm Clear'}</span>
              </div>
            </div>

            <div class="summary-pill ${lowBatteryCount > 0 ? 'alert-battery' : 'normal'}">
              <div class="pill-icon">${lowBatteryCount > 0 ? Icons.BatteryLow : Icons.Battery}</div>
              <div class="pill-data">
                <span class="pill-label">Battery Health</span>
                <span class="pill-value">${lowBatteryCount > 0 ? `${lowBatteryCount} Low` : 'All Healthy'}</span>
              </div>
            </div>
          </div>
        ` : ''}

        <!-- Detector Grid -->
        <div class="devices-section">
          <div class="section-title">
            <span>Discovered Detectors</span>
            <span class="device-count-chip">${devices.length}</span>
          </div>

          <div class="devices-grid">
            ${devices.map((dev) => this._renderDeviceCard(dev))}
          </div>
        </div>

        <!-- Confirmation Modal -->
        ${this._confirmDialog ? html`
          <div class="modal-overlay" @click=${this._cancelDialog}>
            <div class="modal-card" @click=${(e) => e.stopPropagation()}>
              <div class="modal-header">
                <div class="modal-icon-alert">${Icons.AlertTriangle}</div>
                <div class="modal-title">${this._confirmDialog.title}</div>
              </div>
              <div class="modal-body">${this._confirmDialog.message}</div>
              <div class="modal-actions">
                <button class="btn btn-secondary" @click=${this._cancelDialog}>Cancel</button>
                <button class="btn btn-danger" @click=${this._confirmAction}>Sound Drill</button>
              </div>
            </div>
          </div>
        ` : ''}
      </ha-card>
    `;
  }

  _renderDeviceCard(dev) {
    const smokeStateObj = dev.smoke_entity ? this.hass.states[dev.smoke_entity] : null;
    const coStateObj = dev.co_entity ? this.hass.states[dev.co_entity] : null;
    const coReadingObj = dev.co_reading_entity ? this.hass.states[dev.co_reading_entity] : null;
    const batteryObj = dev.battery_entity ? this.hass.states[dev.battery_entity] : null;
    const batteryHealthObj = dev.battery_health_entity ? this.hass.states[dev.battery_health_entity] : null;
    const silencedObj = dev.silenced_entity ? this.hass.states[dev.silenced_entity] : null;
    const isExpanded = !!this._expandedDevices[dev.id];

    // Status flags
    const isSmokeAlert = smokeStateObj && (smokeStateObj.state === "on" || smokeStateObj.state === "smoke");
    const coPpm = coReadingObj ? parseFloat(coReadingObj.state) : null;
    const isCoAlert = (coStateObj && (coStateObj.state === "on" || coStateObj.state === "carbon_monoxide")) || (coPpm !== null && coPpm >= 30);
    const isSilenced = silencedObj && silencedObj.state === "on";

    let batteryPercent = batteryObj && !isNaN(parseFloat(batteryObj.state)) ? Math.round(parseFloat(batteryObj.state)) : null;
    const isBatteryLow = (batteryPercent !== null && batteryPercent <= 20) || (batteryHealthObj && ["on", "problem", "low"].includes(batteryHealthObj.state));

    let cardStatusClass = "normal";
    if (isSmokeAlert) cardStatusClass = "alarm-smoke";
    else if (isCoAlert) cardStatusClass = "alarm-co";
    else if (isBatteryLow) cardStatusClass = "alarm-battery";

    return html`
      <div class="device-card ${cardStatusClass}">
        <!-- Device Header -->
        <div class="device-header" @click=${(ev) => this._handleMoreInfo(dev.smoke_entity || dev.co_entity, ev)}>
          <div class="device-icon-container ${cardStatusClass}">
            ${isSmokeAlert ? Icons.Flame : (isCoAlert ? Icons.CO : Icons.ShieldCheck)}
          </div>
          <div class="device-title-area">
            <div class="device-name">${dev.name}</div>
            <div class="device-brand-badge">${dev.brand === 'x-sense' ? 'X-Sense' : (dev.brand === 'nest' ? 'Nest Protect' : 'Safety Detector')}</div>
          </div>
          ${isSilenced ? html`
            <div class="silenced-badge" title="Device Silenced / Hush Active">
              ${Icons.VolumeX} <span>Muted</span>
            </div>
          ` : ''}
        </div>

        <!-- Metrics / Status Row -->
        <div class="device-metrics-row">
          <!-- Smoke Status -->
          <div class="metric-badge ${isSmokeAlert ? 'badge-alert' : 'badge-ok'}" @click=${(ev) => this._handleMoreInfo(dev.smoke_entity, ev)}>
            <span class="metric-icon">${Icons.Smoke}</span>
            <span class="metric-text">${isSmokeAlert ? 'Smoke Alarm' : 'Smoke Clear'}</span>
          </div>

          <!-- CO Status -->
          <div class="metric-badge ${isCoAlert ? 'badge-alert' : 'badge-ok'}" @click=${(ev) => this._handleMoreInfo(dev.co_reading_entity || dev.co_entity, ev)}>
            <span class="metric-icon">${Icons.CO}</span>
            <span class="metric-text">${isCoAlert ? `CO Alert (${coPpm || 'High'} ppm)` : (coPpm !== null ? `CO 0 ppm` : 'CO Clear')}</span>
          </div>

          <!-- Battery Status -->
          ${(batteryPercent !== null || batteryHealthObj) && this.config.show_battery_gauges !== false ? html`
            <div class="metric-badge ${isBatteryLow ? 'badge-warning' : 'badge-ok'}" @click=${(ev) => this._handleMoreInfo(dev.battery_entity || dev.battery_health_entity, ev)}>
              <span class="metric-icon">${isBatteryLow ? Icons.BatteryLow : Icons.Battery}</span>
              <span class="metric-text">${batteryPercent !== null ? `${batteryPercent}%` : (isBatteryLow ? 'Low' : 'Healthy')}</span>
            </div>
          ` : ''}
        </div>

        <!-- Action Controls (Mute, Test, Drill) -->
        ${dev.mute_button || dev.test_button || dev.drill_button ? html`
          <div class="device-actions-row">
            ${dev.mute_button ? html`
              <button
                class="action-btn btn-mute ${this._actionLoading[dev.mute_button] ? 'loading' : ''}"
                @click=${(ev) => this._handleMute(ev, dev)}
                title="Silence / Mute Detector Alarm">
                ${Icons.VolumeX}
                <span>Mute</span>
              </button>
            ` : ''}

            ${dev.test_button ? html`
              <button
                class="action-btn btn-test ${this._actionLoading[dev.test_button] ? 'loading' : ''}"
                @click=${(ev) => this._handleTest(ev, dev)}
                title="Run Device Self-Test">
                ${Icons.Bell}
                <span>Test</span>
              </button>
            ` : ''}

            ${dev.drill_button ? html`
              <button
                class="action-btn btn-drill ${this._actionLoading[dev.drill_button] ? 'loading' : ''}"
                @click=${(ev) => this._handleDrillClick(ev, dev)}
                title="Sound Loud Alarm Drill">
                ${Icons.Siren}
                <span>Drill</span>
              </button>
            ` : ''}
          </div>
        ` : ''}

        <!-- Expandable Diagnostics Drawer Toggle -->
        ${dev.test_time_sensor || dev.replace_by_sensor || dev.test_result_sensor || dev.switches.length > 0 ? html`
          <div class="device-drawer-toggle" @click=${(ev) => this._toggleExpand(dev.id, ev)}>
            <span>${isExpanded ? 'Hide Details' : 'Diagnostics & Settings'}</span>
            ${isExpanded ? Icons.ChevronUp : Icons.ChevronDown}
          </div>

          ${isExpanded ? html`
            <div class="device-drawer-content">
              ${dev.test_time_sensor && this.hass.states[dev.test_time_sensor] ? html`
                <div class="drawer-row">
                  <span class="drawer-label">Last Self-Test:</span>
                  <span class="drawer-value">${this.hass.states[dev.test_time_sensor].state}</span>
                </div>
              ` : ''}

              ${dev.test_result_sensor && this.hass.states[dev.test_result_sensor] ? html`
                <div class="drawer-row">
                  <span class="drawer-label">Test Result:</span>
                  <span class="drawer-value">${this.hass.states[dev.test_result_sensor].state}</span>
                </div>
              ` : ''}

              ${dev.replace_by_sensor && this.hass.states[dev.replace_by_sensor] ? html`
                <div class="drawer-row">
                  <span class="drawer-label">Replace By:</span>
                  <span class="drawer-value">${this.hass.states[dev.replace_by_sensor].state}</span>
                </div>
              ` : ''}

              ${dev.switches.map((switchEntityId) => {
                const switchObj = this.hass.states[switchEntityId];
                if (!switchObj) return '';
                const isOn = switchObj.state === 'on';
                const label = switchObj.attributes.friendly_name || switchEntityId;
                return html`
                  <div class="drawer-row switch-row">
                    <span class="drawer-label">${label}:</span>
                    <button
                      class="switch-pill ${isOn ? 'active' : ''}"
                      @click=${(ev) => {
                        ev.stopPropagation();
                        this.hass.callService("homeassistant", "toggle", { entity_id: switchEntityId });
                      }}>
                      ${isOn ? 'ON' : 'OFF'}
                    </button>
                  </div>
                `;
              })}
            </div>
          ` : ''}
        ` : ''}
      </div>
    `;
  }

  // --- STYLES ---
  static get styles() {
    return css`
      :host {
        display: block;
      }
      ha-card {
        padding: 18px;
        background: var(--ha-card-background, var(--card-background-color, #1e1e24));
        border-radius: var(--ha-card-border-radius, 16px);
        border: 1px solid var(--divider-color, rgba(255, 255, 255, 0.08));
        box-shadow: var(--ha-card-box-shadow, 0 4px 20px rgba(0, 0, 0, 0.25));
        color: var(--primary-text-color, #ffffff);
        position: relative;
        overflow: hidden;
        font-family: var(--paper-font-body1_-_font-family, system-ui, -apple-system, sans-serif);
      }

      /* Header */
      .card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 16px;
        gap: 12px;
      }
      .header-title-container {
        display: flex;
        align-items: center;
        gap: 12px;
      }
      .header-icon {
        color: var(--primary-color, #3498db);
        --mdc-icon-size: 28px;
      }
      .header-text {
        display: flex;
        flex-direction: column;
      }
      .main-title {
        font-size: 1.25rem;
        font-weight: 600;
        letter-spacing: -0.01em;
      }
      .sub-title {
        font-size: 0.8rem;
        color: var(--secondary-text-color, rgba(255, 255, 255, 0.6));
      }
      .header-badge {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 6px 12px;
        border-radius: 20px;
        font-size: 0.8rem;
        font-weight: 600;
        letter-spacing: 0.04em;
        text-transform: uppercase;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
      }
      .header-badge.safe {
        background: rgba(46, 204, 113, 0.15);
        color: #2ecc71;
        border: 1px solid rgba(46, 204, 113, 0.3);
      }
      .header-badge.smoke, .header-badge.co {
        background: rgba(231, 76, 60, 0.25);
        color: #e74c3c;
        border: 1px solid #e74c3c;
        animation: pulseAlert 1.5s infinite;
      }
      .header-badge.battery {
        background: rgba(241, 196, 15, 0.2);
        color: #f1c40f;
        border: 1px solid rgba(241, 196, 15, 0.4);
      }

      /* Summary Banner */
      .summary-banner {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
        gap: 10px;
        padding: 12px;
        background: var(--secondary-background-color, rgba(255, 255, 255, 0.03));
        border-radius: 12px;
        margin-bottom: 18px;
        border: 1px solid var(--divider-color, rgba(255, 255, 255, 0.05));
      }
      .summary-pill {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 8px 10px;
        border-radius: 8px;
        background: rgba(255, 255, 255, 0.02);
      }
      .summary-pill.alert-smoke, .summary-pill.alert-co {
        background: rgba(231, 76, 60, 0.18);
        border: 1px solid rgba(231, 76, 60, 0.4);
      }
      .summary-pill.alert-battery {
        background: rgba(241, 196, 15, 0.15);
        border: 1px solid rgba(241, 196, 15, 0.3);
      }
      .pill-icon {
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--primary-text-color, #ffffff);
      }
      .summary-pill.alert-smoke .pill-icon, .summary-pill.alert-co .pill-icon {
        color: #e74c3c;
      }
      .summary-pill.alert-battery .pill-icon {
        color: #f1c40f;
      }
      .pill-data {
        display: flex;
        flex-direction: column;
      }
      .pill-label {
        font-size: 0.72rem;
        color: var(--secondary-text-color, rgba(255, 255, 255, 0.6));
        text-transform: uppercase;
        letter-spacing: 0.03em;
      }
      .pill-value {
        font-size: 0.92rem;
        font-weight: 600;
      }

      /* Discovered Devices Section */
      .devices-section {
        display: flex;
        flex-direction: column;
        gap: 12px;
      }
      .section-title {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 0.95rem;
        font-weight: 600;
        color: var(--secondary-text-color, rgba(255, 255, 255, 0.7));
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }
      .device-count-chip {
        background: var(--primary-color, #3498db);
        color: white;
        font-size: 0.7rem;
        padding: 2px 7px;
        border-radius: 10px;
        font-weight: 700;
      }

      /* Device Grid & Cards */
      .devices-grid {
        display: flex;
        flex-direction: column;
        gap: 12px;
      }
      .device-card {
        padding: 14px;
        background: var(--secondary-background-color, rgba(255, 255, 255, 0.04));
        border-radius: 12px;
        border: 1px solid var(--divider-color, rgba(255, 255, 255, 0.06));
        transition: all 0.2s ease;
      }
      .device-card:hover {
        background: rgba(255, 255, 255, 0.06);
        border-color: rgba(255, 255, 255, 0.12);
      }
      .device-card.alarm-smoke, .device-card.alarm-co {
        border-color: #e74c3c;
        background: rgba(231, 76, 60, 0.1);
        box-shadow: 0 0 15px rgba(231, 76, 60, 0.2);
      }

      /* Device Header */
      .device-header {
        display: flex;
        align-items: center;
        gap: 10px;
        cursor: pointer;
        margin-bottom: 12px;
      }
      .device-icon-container {
        width: 38px;
        height: 38px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        background: rgba(255, 255, 255, 0.05);
        color: #2ecc71;
        flex-shrink: 0;
      }
      .device-icon-container.alarm-smoke, .device-icon-container.alarm-co {
        background: rgba(231, 76, 60, 0.2);
        color: #e74c3c;
        animation: pulseAlert 1.5s infinite;
      }
      .device-title-area {
        flex: 1;
        display: flex;
        flex-direction: column;
      }
      .device-name {
        font-size: 1rem;
        font-weight: 600;
      }
      .device-brand-badge {
        font-size: 0.72rem;
        color: var(--secondary-text-color, rgba(255, 255, 255, 0.5));
      }
      .silenced-badge {
        display: flex;
        align-items: center;
        gap: 4px;
        background: rgba(241, 196, 15, 0.2);
        color: #f1c40f;
        padding: 3px 8px;
        border-radius: 12px;
        font-size: 0.75rem;
        font-weight: 600;
      }

      /* Metrics Row */
      .device-metrics-row {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        margin-bottom: 12px;
      }
      .metric-badge {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 5px 10px;
        border-radius: 8px;
        font-size: 0.8rem;
        font-weight: 500;
        cursor: pointer;
        transition: opacity 0.2s;
      }
      .metric-badge:hover {
        opacity: 0.85;
      }
      .metric-badge.badge-ok {
        background: rgba(46, 204, 113, 0.12);
        color: #2ecc71;
        border: 1px solid rgba(46, 204, 113, 0.25);
      }
      .metric-badge.badge-alert {
        background: rgba(231, 76, 60, 0.2);
        color: #e74c3c;
        border: 1px solid #e74c3c;
        font-weight: 700;
      }
      .metric-badge.badge-warning {
        background: rgba(241, 196, 15, 0.18);
        color: #f1c40f;
        border: 1px solid rgba(241, 196, 15, 0.35);
      }
      .metric-icon {
        display: flex;
        align-items: center;
      }

      /* Actions Row */
      .device-actions-row {
        display: flex;
        gap: 8px;
        padding-top: 4px;
        border-top: 1px solid var(--divider-color, rgba(255, 255, 255, 0.05));
      }
      .action-btn {
        flex: 1;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
        padding: 7px 12px;
        border-radius: 8px;
        font-size: 0.82rem;
        font-weight: 600;
        border: none;
        cursor: pointer;
        transition: all 0.2s ease;
        color: var(--primary-text-color, #ffffff);
        background: rgba(255, 255, 255, 0.08);
      }
      .action-btn:hover {
        background: rgba(255, 255, 255, 0.15);
        transform: translateY(-1px);
      }
      .action-btn.btn-mute {
        color: #f1c40f;
        background: rgba(241, 196, 15, 0.12);
        border: 1px solid rgba(241, 196, 15, 0.25);
      }
      .action-btn.btn-mute:hover {
        background: rgba(241, 196, 15, 0.25);
      }
      .action-btn.btn-test {
        color: #3498db;
        background: rgba(52, 152, 219, 0.12);
        border: 1px solid rgba(52, 152, 219, 0.25);
      }
      .action-btn.btn-test:hover {
        background: rgba(52, 152, 219, 0.25);
      }
      .action-btn.btn-drill {
        color: #e74c3c;
        background: rgba(231, 76, 60, 0.12);
        border: 1px solid rgba(231, 76, 60, 0.25);
      }
      .action-btn.btn-drill:hover {
        background: rgba(231, 76, 60, 0.25);
      }
      .action-btn.loading {
        opacity: 0.5;
        pointer-events: none;
      }

      /* Drawer */
      .device-drawer-toggle {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-top: 10px;
        padding-top: 8px;
        border-top: 1px dashed var(--divider-color, rgba(255, 255, 255, 0.05));
        font-size: 0.75rem;
        color: var(--secondary-text-color, rgba(255, 255, 255, 0.5));
        cursor: pointer;
        transition: color 0.2s;
      }
      .device-drawer-toggle:hover {
        color: var(--primary-text-color, #ffffff);
      }
      .device-drawer-content {
        margin-top: 8px;
        padding: 8px 10px;
        border-radius: 6px;
        background: rgba(0, 0, 0, 0.2);
        display: flex;
        flex-direction: column;
        gap: 6px;
        font-size: 0.78rem;
      }
      .drawer-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      .drawer-label {
        color: var(--secondary-text-color, rgba(255, 255, 255, 0.6));
      }
      .drawer-value {
        font-weight: 500;
      }
      .switch-pill {
        border: none;
        padding: 3px 8px;
        border-radius: 12px;
        font-size: 0.72rem;
        font-weight: 700;
        cursor: pointer;
        background: rgba(255, 255, 255, 0.1);
        color: var(--secondary-text-color, rgba(255, 255, 255, 0.6));
      }
      .switch-pill.active {
        background: var(--primary-color, #3498db);
        color: white;
      }

      /* Confirmation Modal */
      .modal-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.7);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 999;
        backdrop-filter: blur(4px);
      }
      .modal-card {
        background: var(--ha-card-background, #1c1c1e);
        border: 1px solid rgba(255, 255, 255, 0.15);
        border-radius: 14px;
        padding: 20px;
        max-width: 360px;
        width: 90%;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
      }
      .modal-header {
        display: flex;
        align-items: center;
        gap: 10px;
        margin-bottom: 12px;
      }
      .modal-icon-alert {
        color: #e74c3c;
      }
      .modal-title {
        font-size: 1.1rem;
        font-weight: 600;
      }
      .modal-body {
        font-size: 0.9rem;
        color: var(--secondary-text-color, rgba(255, 255, 255, 0.8));
        margin-bottom: 18px;
        line-height: 1.4;
      }
      .modal-actions {
        display: flex;
        justify-content: flex-end;
        gap: 10px;
      }
      .btn {
        padding: 8px 16px;
        border-radius: 8px;
        font-size: 0.85rem;
        font-weight: 600;
        border: none;
        cursor: pointer;
      }
      .btn-secondary {
        background: rgba(255, 255, 255, 0.1);
        color: white;
      }
      .btn-danger {
        background: #e74c3c;
        color: white;
      }

      /* Keyframe Animations */
      @keyframes pulseAlert {
        0% { box-shadow: 0 0 0 0 rgba(231, 76, 60, 0.5); }
        70% { box-shadow: 0 0 0 10px rgba(231, 76, 60, 0); }
        100% { box-shadow: 0 0 0 0 rgba(231, 76, 60, 0); }
      }
    `;
  }
}

// --- VISUAL GUI EDITOR ---
export class PassableSafetyCardEditor extends LitElement {
  static get properties() {
    return {
      hass: { type: Object },
      config: { type: Object },
      _expandedSections: { type: Object }
    };
  }

  constructor() {
    super();
    this._expandedSections = {
      card_settings: true,
      discovery_settings: false,
      exclusions: false
    };
  }

  setConfig(config) {
    this.config = config || {};
  }

  _valueChanged(ev) {
    if (!this.config || !this.hass) return;
    const target = ev.target;
    const configValue = target.configValue;
    const newValue = ev.detail && ev.detail.value !== undefined ? ev.detail.value : target.value;

    if (!configValue) return;
    if (JSON.stringify(this.config[configValue]) === JSON.stringify(newValue)) return;

    const newConfig = { ...this.config, [configValue]: newValue };
    if (newValue === "" || newValue === undefined || newValue === null) {
      delete newConfig[configValue];
    }

    this.config = newConfig;
    this.dispatchEvent(
      new CustomEvent("config-changed", {
        detail: { config: this.config },
        bubbles: true,
        composed: true
      })
    );
  }

  _toggleSection(sectionKey) {
    this._expandedSections = {
      ...this._expandedSections,
      [sectionKey]: !this._expandedSections[sectionKey]
    };
    this.requestUpdate();
  }

  render() {
    if (!this.hass || !this.config) return html``;

    return html`
      <div class="editor-container">
        <!-- Card Settings Section -->
        <div class="section-card">
          <div class="section-header" @click=${() => this._toggleSection('card_settings')}>
            <span>Card Header Settings</span>
            <span>${this._expandedSections.card_settings ? '▲' : '▼'}</span>
          </div>
          ${this._expandedSections.card_settings ? html`
            <div class="section-content">
              <ha-selector
                .hass=${this.hass}
                .selector=${{ text: {} }}
                .value=${this.config.title || 'Smoke & CO Safety Center'}
                .label=${'Card Title'}
                .configValue=${'title'}
                @value-changed=${this._valueChanged}
              ></ha-selector>

              <ha-selector
                .hass=${this.hass}
                .selector=${{ icon: {} }}
                .value=${this.config.icon || 'mdi:fire-alert'}
                .label=${'Header Icon'}
                .configValue=${'icon'}
                @value-changed=${this._valueChanged}
              ></ha-selector>

              <ha-selector
                .hass=${this.hass}
                .selector=${{ boolean: {} }}
                .value=${this.config.show_summary_banner !== false}
                .label=${'Show Aggregate Status Summary Banner'}
                .configValue=${'show_summary_banner'}
                @value-changed=${this._valueChanged}
              ></ha-selector>

              <ha-selector
                .hass=${this.hass}
                .selector=${{ boolean: {} }}
                .value=${this.config.show_battery_gauges !== false}
                .label=${'Show Battery Health / Percentages'}
                .configValue=${'show_battery_gauges'}
                @value-changed=${this._valueChanged}
              ></ha-selector>

              <ha-selector
                .hass=${this.hass}
                .selector=${{ boolean: {} }}
                .value=${this.config.confirm_drills !== false}
                .label=${'Require Confirmation Before Triggering Alarm Drills'}
                .configValue=${'confirm_drills'}
                @value-changed=${this._valueChanged}
              ></ha-selector>
            </div>
          ` : ''}
        </div>

        <!-- Discovery Settings -->
        <div class="section-card">
          <div class="section-header" @click=${() => this._toggleSection('discovery_settings')}>
            <span>Auto-Discovery Options</span>
            <span>${this._expandedSections.discovery_settings ? '▲' : '▼'}</span>
          </div>
          ${this._expandedSections.discovery_settings ? html`
            <div class="section-content">
              <ha-selector
                .hass=${this.hass}
                .selector=${{ boolean: {} }}
                .value=${this.config.auto_discover !== false}
                .label=${'Enable 100% Dynamic Auto-Discovery'}
                .configValue=${'auto_discover'}
                @value-changed=${this._valueChanged}
              ></ha-selector>
              <p class="helper-text">When enabled, any smoke or carbon monoxide detector added to Home Assistant will automatically appear with all status indicators and action controls without manual editing.</p>
            </div>
          ` : ''}
        </div>
      </div>
    `;
  }

  static get styles() {
    return css`
      .editor-container {
        display: flex;
        flex-direction: column;
        gap: 12px;
        padding: 8px 0;
      }
      .section-card {
        border: 1px solid var(--divider-color, rgba(255, 255, 255, 0.1));
        border-radius: 8px;
        background: var(--secondary-background-color, rgba(255, 255, 255, 0.02));
        overflow: hidden;
      }
      .section-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 12px 16px;
        font-weight: 600;
        cursor: pointer;
        background: rgba(255, 255, 255, 0.03);
      }
      .section-content {
        padding: 16px;
        display: flex;
        flex-direction: column;
        gap: 14px;
      }
      .helper-text {
        font-size: 0.8rem;
        color: var(--secondary-text-color, rgba(255, 255, 255, 0.6));
        margin: 0;
        line-height: 1.4;
      }
    `;
  }
}

// --- ELEMENT REGISTRATION ---
if (!customElements.get("passable-safety-card-editor")) {
  customElements.define("passable-safety-card-editor", PassableSafetyCardEditor);
}

PassableSafetyCard.getConfigElement = () =>
  document.createElement("passable-safety-card-editor");

if (!customElements.get("passable-safety-card")) {
  customElements.define("passable-safety-card", PassableSafetyCard);
}

// Legacy alias definitions
if (!customElements.get("safety-card")) {
  class LegacySafetyCard extends PassableSafetyCard {}
  customElements.define("safety-card", LegacySafetyCard);
}

window.customCards = window.customCards || [];
window.customCards.push({
  type: "passable-safety-card",
  name: "Passable Safety Card",
  preview: true,
  description:
    "Dynamic Smoke & CO safety command center with auto-discovery, live diagnostics, battery health, and integrated detector controls (Mute, Test, Drill).",
  documentationURL: "https://github.com/GBear09/passable-safety-card"
});
