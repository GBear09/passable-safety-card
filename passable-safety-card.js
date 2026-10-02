/**
 * Passable Safety Card
 * Dynamic Smoke & CO Safety Command Center with Auto-Discovery, Diagnostics, and Controls.
 * Version 1.0.2
 * (c) 2026 GBear09
 */

const CARD_VERSION = "1.0.2";

const LitElement = Object.getPrototypeOf(
  customElements.get("hui-entities-card")
);
const html = LitElement.prototype.html;
const css = LitElement.prototype.css;

console.info(
  `%c PASSABLE-SAFETY-CARD %c v${CARD_VERSION} IS LOADED `,
  "color: white; background: #0284c7; font-weight: bold; padding: 2px 6px; border-radius: 4px 0 0 4px;",
  "color: #0284c7; background: #e0f2fe; font-weight: bold; padding: 2px 6px; border-radius: 0 4px 4px 0;"
);

// --- INLINE ICONS (Lucide & MDI matching Lock Manager Card) ---
const Icons = {
  ShieldCheck: html`<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 13c0 5-3.5 9.5-8 11-4.5-1.5-8-6-8-11V5l8-3 8 3v8Z"/><path d="m9 12 2 2 4-4"/></svg>`,
  ShieldAlert: html`<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 13c0 5-3.5 9.5-8 11-4.5-1.5-8-6-8-11V5l8-3 8 3v8Z"/><path d="M12 8v4"/><path d="M12 16h.01"/></svg>`,
  Flame: html`<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>`,
  Smoke: html`<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"/><path d="M8 19h8"/><path d="M10 22h4"/></svg>`,
  CO: html`<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v4"/><path d="M12 16h.01"/></svg>`,
  Battery: html`<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="16" height="10" x="2" y="7" rx="2" ry="2"/><line x1="22" x2="22" y1="11" y2="13"/></svg>`,
  BatteryLow: html`<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="16" height="10" x="2" y="7" rx="2" ry="2"/><line x1="22" x2="22" y1="11" y2="13"/><line x1="6" x2="6" y1="11" y2="13"/></svg>`,
  VolumeX: html`<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><line x1="22" x2="16" y1="9" y2="15"/><line x1="16" x2="22" y1="9" y2="15"/></svg>`,
  Bell: html`<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>`,
  Siren: html`<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 18v-6a5 5 0 1 1 10 0v6"/><path d="M5 21a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-1a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2z"/><line x1="21" x2="23" y1="12" y2="12"/><line x1="1" x2="3" y1="12" y2="12"/><line x1="19.07" x2="20.49" y1="4.93" y2="3.51"/><line x1="4.93" x2="3.51" y1="4.93" y2="3.51"/></svg>`,
  ChevronDown: html`<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>`,
  ChevronUp: html`<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m18 15-6-6-6 6"/></svg>`,
  Check: html`<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`,
  AlertTriangle: html`<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" x2="12" y1="9" y2="13"/><line x1="12" x2="12.01" y1="17" y2="17"/></svg>`,
  Settings: html`<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>`
};

// --- HELPER: Format Room & Device Names cleanly ---
function formatRoomName(rawKey) {
  return rawKey
    .replace(/_smoke_co$/, "")
    .replace(/^nest_protect_/, "")
    .replace(/_s_/g, "'s ")
    .replace(/_/g, " ")
    .split(" ")
    .map(word => {
      if (word.toLowerCase() === "'s") return "'s";
      if (word.includes("'s")) {
        const parts = word.split("'s");
        return parts[0].charAt(0).toUpperCase() + parts[0].slice(1).toLowerCase() + "'s";
      }
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(" ");
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

  static getConfigElement() {
    return document.createElement("passable-safety-card-editor");
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
      subtitle: "Safety & Life Protection Command Center",
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
      subtitle: "Safety & Life Protection Command Center",
      icon: "mdi:fire-alert",
      auto_discover: true,
      show_summary_banner: true,
      show_battery_gauges: true,
      confirm_drills: true
    };
  }

  // --- DISCOVERY ENGINE (De-duplicated & Precise) ---
  _discoverDevices() {
    if (!this.hass || !this.hass.states) return [];

    if (!this.config.auto_discover && this.config.devices && this.config.devices.length > 0) {
      return this.config.devices;
    }

    const excludeList = this.config.exclude_entities || [];
    const devicesMap = new Map();

    const getOrCreateDevice = (key, displayName, brand) => {
      if (!devicesMap.has(key)) {
        devicesMap.set(key, {
          id: key,
          name: displayName,
          room: formatRoomName(key),
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

    // PASS 1: ONLY evaluate binary_sensor.* for physical detector discovery
    for (const [entityId, stateObj] of Object.entries(states)) {
      if (excludeList.includes(entityId)) continue;
      if (!entityId.startsWith("binary_sensor.")) continue; // Ignore numeric telemetry sensor.*
      if (entityId.startsWith("binary_sensor.home_") || entityId.startsWith("binary_sensor.all_") || entityId === "binary_sensor.detector_low_battery") continue;

      const attrs = stateObj.attributes || {};
      const isSmoke =
        attrs.device_class === "smoke" ||
        entityId.endsWith("_smoke_status") ||
        entityId.endsWith("_smoke_co_alarm_status");
      const isCO =
        attrs.device_class === "carbon_monoxide" ||
        entityId.endsWith("_co_status");

      if (isSmoke || isCO) {
        let key = "";
        let brand = "standard";

        // Pattern 1: X-Sense detectors (*_smoke_co_alarm_status)
        const xsenseMatch = entityId.match(/binary_sensor.(.*)_smoke_co_alarm_status/);
        // Pattern 2: Nest Protect detectors (nest_protect_*_(smoke|co)_status)
        const nestMatch = entityId.match(/binary_sensor.nest_protect_([a-z0-9_]+)_(smoke|co)_status/);

        if (xsenseMatch) {
          key = xsenseMatch[1] + "_smoke_co";
          brand = "x-sense";
        } else if (nestMatch) {
          key = "nest_protect_" + nestMatch[1];
          brand = "nest";
        } else {
          key = entityId
            .replace("binary_sensor.", "")
            .replace(/_(smoke|co|alarm)_status/, "")
            .replace(/_(smoke|co)/, "");
        }

        const roomName = formatRoomName(key);
        const displayName = brand === "x-sense" 
          ? `${roomName} Detector` 
          : (brand === "nest" ? `${roomName} Nest Protect` : `${roomName} Safety Detector`);

        const dev = getOrCreateDevice(key, displayName, brand);
        if (isSmoke && !dev.smoke_entity) dev.smoke_entity = entityId;
        if (isCO && !dev.co_entity) dev.co_entity = entityId;
      }
    }

    // PASS 2: Sibling Entity Mapping (Buttons, Numeric Telemetry, Battery, Switches)
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
        title: "Trigger Alarm Drill?",
        message: `Are you sure you want to sound an alarm drill for ${dev.name}? All interconnected sirens will sound.`,
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
    if (!this.hass) return html`<div class="loading">Loading...</div>`;

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

    // Global Aggregate Entity sync
    if (this.hass.states["binary_sensor.home_smoke_status"]?.state === "on") activeSmokeCount = Math.max(activeSmokeCount, 1);
    if (this.hass.states["binary_sensor.home_co_status"]?.state === "on") activeCOCount = Math.max(activeCOCount, 1);
    if (this.hass.states["binary_sensor.detector_low_battery"]?.state === "on") lowBatteryCount = Math.max(lowBatteryCount, 1);

    const title = this.config.title || "Smoke & CO Safety Center";
    const subtitle = this.config.subtitle || `${devices.length} Monitored Detectors`;

    return html`
      <ha-card>
        <div class="view fade-in">
          <!-- Main Card Header matching Lock Manager -->
          <div class="header">
            <div class="header-left">
              <h1 class="title">
                <ha-icon icon="mdi:shield-check" style="margin-right: 8px; color: var(--primary-color);"></ha-icon>
                ${title}
              </h1>
              <p class="subtitle">${subtitle}</p>
            </div>

            <div class="header-right">
              ${activeSmokeCount > 0
                ? html`<span class="status-pill smoke">${Icons.Flame} Smoke Alert</span>`
                : (activeCOCount > 0
                  ? html`<span class="status-pill co">${Icons.CO} CO Alert</span>`
                  : (lowBatteryCount > 0
                    ? html`<span class="status-pill battery">${Icons.BatteryLow} Low Battery</span>`
                    : html`<span class="status-pill safe">${Icons.ShieldCheck} All Clear</span>`
                  )
                )
              }
            </div>
          </div>

          <!-- Hero Summary Metrics Row -->
          ${this.config.show_summary_banner !== false ? html`
            <div class="summary-grid">
              <div class="summary-stat-box ${activeSmokeCount > 0 ? 'alert' : 'normal'}">
                <div class="stat-icon-box ${activeSmokeCount > 0 ? 'alert' : 'normal'}">
                  ${activeSmokeCount > 0 ? Icons.Flame : Icons.Smoke}
                </div>
                <div class="stat-text-area">
                  <span class="stat-label">Smoke Status</span>
                  <span class="stat-value">${activeSmokeCount > 0 ? `${activeSmokeCount} Alerting` : 'All Clear'}</span>
                </div>
              </div>

              <div class="summary-stat-box ${activeCOCount > 0 ? 'alert' : 'normal'}">
                <div class="stat-icon-box ${activeCOCount > 0 ? 'alert' : 'normal'}">
                  ${Icons.CO}
                </div>
                <div class="stat-text-area">
                  <span class="stat-label">Carbon Monoxide</span>
                  <span class="stat-value">${activeCOCount > 0 ? `${activeCOCount} Detected` : '0 ppm Clear'}</span>
                </div>
              </div>

              <div class="summary-stat-box ${lowBatteryCount > 0 ? 'warning' : 'normal'}">
                <div class="stat-icon-box ${lowBatteryCount > 0 ? 'warning' : 'normal'}">
                  ${lowBatteryCount > 0 ? Icons.BatteryLow : Icons.Battery}
                </div>
                <div class="stat-text-area">
                  <span class="stat-label">Battery Health</span>
                  <span class="stat-value">${lowBatteryCount > 0 ? `${lowBatteryCount} Low` : 'All Healthy'}</span>
                </div>
              </div>
            </div>
          ` : ''}

          <!-- Discovered Detectors Section Header -->
          <div class="section-label-row">
            <span class="section-label-text">Discovered Detectors</span>
            <span class="slots-badge-counter">${devices.length} Devices</span>
          </div>

          <!-- Discovered Detectors Grid -->
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

    // Status Calculations
    const isSmokeAlert = smokeStateObj && (smokeStateObj.state === "on" || smokeStateObj.state === "smoke");
    const coPpm = coReadingObj ? parseFloat(coReadingObj.state) : null;
    const isCoAlert = (coStateObj && (coStateObj.state === "on" || coStateObj.state === "carbon_monoxide")) || (coPpm !== null && coPpm >= 30);
    const isSilenced = silencedObj && silencedObj.state === "on";

    let batteryPercent = batteryObj && !isNaN(parseFloat(batteryObj.state)) ? Math.round(parseFloat(batteryObj.state)) : null;
    const isBatteryLow = (batteryPercent !== null && batteryPercent <= 20) || (batteryHealthObj && ["on", "problem", "low"].includes(batteryHealthObj.state));

    let cardStatus = "normal";
    if (isSmokeAlert) cardStatus = "alarm-smoke";
    else if (isCoAlert) cardStatus = "alarm-co";
    else if (isBatteryLow) cardStatus = "warning-battery";

    return html`
      <div class="door-card ${cardStatus}">
        <!-- Device Card Header matching Lock Manager -->
        <div class="door-card-header" @click=${(ev) => this._handleMoreInfo(dev.smoke_entity || dev.co_entity, ev)}>
          <div class="door-icon-wrapper ${cardStatus === 'normal' ? 'locked' : (cardStatus.startsWith('alarm') ? 'jammed' : 'unlocked')}">
            ${isSmokeAlert ? Icons.Flame : (isCoAlert ? Icons.CO : Icons.ShieldCheck)}
          </div>
          <div class="door-title-wrapper">
            <h3 class="door-name">${dev.name}</h3>
            <span class="door-time">
              ${dev.brand === 'x-sense' ? 'X-Sense Wireless Multi-Sensor' : (dev.brand === 'nest' ? 'Nest Protect Smart Sensor' : 'Smoke & CO Sensor')}
            </span>
          </div>

          <div class="header-pills-area">
            ${isSilenced ? html`
              <div class="battery-pill warning" title="Detector Silenced / Hush Active">
                ${Icons.VolumeX} <span>Muted</span>
              </div>
            ` : ''}

            ${batteryPercent !== null ? html`
              <div class="battery-pill ${batteryPercent <= 20 ? 'critical' : (batteryPercent <= 50 ? 'warning' : 'good')}" title="Battery: ${batteryPercent}%">
                ${Icons.Battery}
                <span>${batteryPercent}%</span>
              </div>
            ` : (batteryHealthObj ? html`
              <div class="battery-pill ${isBatteryLow ? 'critical' : 'good'}">
                ${isBatteryLow ? Icons.BatteryLow : Icons.Battery}
                <span>${isBatteryLow ? 'Low' : 'Healthy'}</span>
              </div>
            ` : '')}
          </div>
        </div>

        <!-- Badges Status Row matching Lock Manager -->
        <div class="badge-container">
          <!-- Smoke Status Badge -->
          <div class="badge ${isSmokeAlert ? 'danger' : 'success'}" @click=${(ev) => this._handleMoreInfo(dev.smoke_entity, ev)}>
            ${isSmokeAlert ? Icons.Flame : Icons.Smoke}
            <span>${isSmokeAlert ? 'Smoke Alarm' : 'Smoke Clear'}</span>
          </div>

          <!-- CO Status Badge -->
          <div class="badge ${isCoAlert ? 'danger' : 'success'}" @click=${(ev) => this._handleMoreInfo(dev.co_reading_entity || dev.co_entity, ev)}>
            ${Icons.CO}
            <span>${isCoAlert ? `CO Alarm (${coPpm || 'High'} ppm)` : (coPpm !== null ? `CO: ${coPpm} ppm` : 'CO Clear')}</span>
          </div>

          ${dev.heat_entity && this.hass.states[dev.heat_entity] ? html`
            <div class="badge ${this.hass.states[dev.heat_entity].state === 'on' ? 'danger' : 'info'}" @click=${(ev) => this._handleMoreInfo(dev.heat_entity, ev)}>
              ${Icons.Flame}
              <span>${this.hass.states[dev.heat_entity].state === 'on' ? 'Heat Warning' : 'Heat Normal'}</span>
            </div>
          ` : ''}
        </div>

        <!-- Interactive Control Buttons (Mute, Test, Drill) -->
        ${dev.mute_button || dev.test_button || dev.drill_button ? html`
          <div class="door-action-row">
            ${dev.mute_button ? html`
              <button
                class="control-btn btn-mute ${this._actionLoading[dev.mute_button] ? 'loading' : ''}"
                @click=${(ev) => this._handleMute(ev, dev)}
                title="Silence / Mute Alarm">
                <div class="btn-icon">${Icons.VolumeX}</div>
                <div class="btn-text">
                  <span class="btn-action-label">Mute</span>
                  <span class="btn-sub-label">Silence siren</span>
                </div>
              </button>
            ` : ''}

            ${dev.test_button ? html`
              <button
                class="control-btn btn-test ${this._actionLoading[dev.test_button] ? 'loading' : ''}"
                @click=${(ev) => this._handleTest(ev, dev)}
                title="Run Self-Test">
                <div class="btn-icon">${Icons.Bell}</div>
                <div class="btn-text">
                  <span class="btn-action-label">Test</span>
                  <span class="btn-sub-label">Run self-test</span>
                </div>
              </button>
            ` : ''}

            ${dev.drill_button ? html`
              <button
                class="control-btn btn-drill ${this._actionLoading[dev.drill_button] ? 'loading' : ''}"
                @click=${(ev) => this._handleDrillClick(ev, dev)}
                title="Trigger Alarm Drill">
                <div class="btn-icon">${Icons.Siren}</div>
                <div class="btn-text">
                  <span class="btn-action-label">Drill</span>
                  <span class="btn-sub-label">Sound sirens</span>
                </div>
              </button>
            ` : ''}
          </div>
        ` : ''}

        <!-- Collapsible Diagnostics Bar matching Lock Manager expand-bar -->
        ${dev.test_time_sensor || dev.replace_by_sensor || dev.test_result_sensor || dev.switches.length > 0 ? html`
          <div class="activity-expand-bar ${isExpanded ? 'open' : ''}" @click=${(ev) => this._toggleExpand(dev.id, ev)}>
            <div class="expand-bar-left">
              ${Icons.Settings}
              <span>Diagnostics & Settings</span>
            </div>
            <div class="expand-chevron">
              ${isExpanded ? Icons.ChevronUp : Icons.ChevronDown}
            </div>
          </div>

          ${isExpanded ? html`
            <div class="event-feed-container">
              <div class="drawer-grid">
                ${dev.test_time_sensor && this.hass.states[dev.test_time_sensor] ? html`
                  <div class="event-row">
                    <div class="event-details">
                      <div class="event-top-line">
                        <span class="event-door-badge">Self Test</span>
                        <span class="event-action">${this.hass.states[dev.test_time_sensor].state}</span>
                      </div>
                    </div>
                  </div>
                ` : ''}

                ${dev.test_result_sensor && this.hass.states[dev.test_result_sensor] ? html`
                  <div class="event-row">
                    <div class="event-details">
                      <div class="event-top-line">
                        <span class="event-door-badge">Test Result</span>
                        <span class="event-action">${this.hass.states[dev.test_result_sensor].state}</span>
                      </div>
                    </div>
                  </div>
                ` : ''}

                ${dev.replace_by_sensor && this.hass.states[dev.replace_by_sensor] ? html`
                  <div class="event-row">
                    <div class="event-details">
                      <div class="event-top-line">
                        <span class="event-door-badge">Replace By</span>
                        <span class="event-action">${this.hass.states[dev.replace_by_sensor].state}</span>
                      </div>
                    </div>
                  </div>
                ` : ''}

                ${dev.switches.map((switchEntityId) => {
                  const switchObj = this.hass.states[switchEntityId];
                  if (!switchObj) return '';
                  const isOn = switchObj.state === 'on';
                  const label = switchObj.attributes.friendly_name || switchEntityId;
                  return html`
                    <div class="event-row switch-row">
                      <div class="event-details">
                        <span class="drawer-label">${label}</span>
                      </div>
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
            </div>
          ` : ''}
        ` : ''}
      </div>
    `;
  }

  // --- CSS STYLES (Matching Passable Lock Manager Card) ---
  static get styles() {
    return css`
      :host {
        display: block;
      }
      ha-card {
        padding: 16px;
        background: var(--ha-card-background, var(--card-background-color, #fff));
        border-radius: var(--ha-card-border-radius, 12px);
        border: 1px solid var(--divider-color, rgba(255, 255, 255, 0.08));
        box-shadow: var(--ha-card-box-shadow, 0 4px 20px rgba(0, 0, 0, 0.25));
        color: var(--primary-text-color, #212121);
        position: relative;
        overflow: hidden;
        font-family: var(--paper-font-body1_-_font-family, system-ui, -apple-system, sans-serif);
      }

      .view {
        display: flex;
        flex-direction: column;
        gap: 14px;
      }
      .fade-in {
        animation: fadeIn 0.25s ease-in-out forwards;
      }

      /* Header matching Lock Manager */
      .header {
        display: flex;
        justify-content: space-between;
        align-items: flex-end;
        border-bottom: 1px solid var(--divider-color, #e0e0e0);
        padding-bottom: 16px;
        margin-bottom: 16px;
      }
      .header-left {
        display: flex;
        flex-direction: column;
      }
      .title {
        font-size: 24px;
        font-weight: 500;
        letter-spacing: -0.01em;
        margin: 0;
        color: var(--primary-text-color);
        display: flex;
        align-items: center;
      }
      .subtitle {
        font-size: 14px;
        color: var(--secondary-text-color, #757575);
        margin: 0;
        margin-top: 4px;
      }
      .header-right {
        display: flex;
        align-items: center;
        gap: 8px;
      }

      /* Global Status Pills */
      .status-pill {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        font-size: 12px;
        font-weight: 600;
        padding: 4px 10px;
        border-radius: 20px;
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }
      .status-pill.safe {
        background-color: rgba(var(--rgb-success-color, 76, 175, 80), 0.15);
        color: var(--success-color, #4caf50);
        border: 1px solid rgba(var(--rgb-success-color, 76, 175, 80), 0.3);
      }
      .status-pill.smoke, .status-pill.co {
        background-color: rgba(var(--rgb-error-color, 244, 67, 54), 0.2);
        color: var(--error-color, #f44336);
        border: 1px solid var(--error-color, #f44336);
        animation: pulseAlert 1.5s infinite;
      }
      .status-pill.battery {
        background-color: rgba(var(--rgb-warning-color, 255, 152, 0), 0.15);
        color: var(--warning-color, #ff9800);
        border: 1px solid rgba(var(--rgb-warning-color, 255, 152, 0), 0.3);
      }

      /* Hero Summary Grid */
      .summary-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
        gap: 8px;
      }
      .summary-stat-box {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 10px 12px;
        border-radius: 8px;
        background-color: rgba(255, 255, 255, 0.02);
        border: 1px solid var(--divider-color, rgba(255, 255, 255, 0.06));
        transition: all 0.2s;
      }
      .summary-stat-box.alert {
        background-color: rgba(var(--rgb-error-color, 244, 67, 54), 0.12);
        border-color: rgba(var(--rgb-error-color, 244, 67, 54), 0.4);
      }
      .summary-stat-box.warning {
        background-color: rgba(var(--rgb-warning-color, 255, 152, 0), 0.12);
        border-color: rgba(var(--rgb-warning-color, 255, 152, 0), 0.3);
      }
      .stat-icon-box {
        width: 30px;
        height: 30px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        background-color: rgba(255, 255, 255, 0.05);
        color: var(--primary-text-color);
        flex-shrink: 0;
      }
      .stat-icon-box.alert {
        background-color: rgba(var(--rgb-error-color, 244, 67, 54), 0.2);
        color: var(--error-color, #f44336);
      }
      .stat-icon-box.warning {
        background-color: rgba(var(--rgb-warning-color, 255, 152, 0), 0.2);
        color: var(--warning-color, #ff9800);
      }
      .stat-text-area {
        display: flex;
        flex-direction: column;
      }
      .stat-label {
        font-size: 11px;
        color: var(--secondary-text-color, #757575);
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }
      .stat-value {
        font-size: 13px;
        font-weight: 600;
        color: var(--primary-text-color);
      }

      /* Section Labels matching Lock Manager */
      .section-label-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-top: 4px;
      }
      .section-label-text {
        font-size: 11px;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        color: var(--secondary-text-color, #757575);
      }
      .slots-badge-counter {
        font-size: 12px;
        font-weight: 500;
        color: var(--secondary-text-color, #757575);
      }

      /* Discovered Detectors Grid */
      .devices-grid {
        display: flex;
        flex-direction: column;
        gap: 10px;
      }

      /* Door/Detector Card matching Lock Manager */
      .door-card {
        padding: 14px;
        border-radius: var(--ha-card-border-radius, 12px);
        background-color: var(--secondary-background-color, rgba(255, 255, 255, 0.02));
        border: 1px solid var(--divider-color, rgba(255, 255, 255, 0.08));
        transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        display: flex;
        flex-direction: column;
        gap: 10px;
      }
      .door-card:hover {
        border-color: var(--primary-color, #2196f3);
        background-color: rgba(var(--rgb-primary-color, 33, 150, 243), 0.03);
      }
      .door-card.alarm-smoke, .door-card.alarm-co {
        background-color: rgba(var(--rgb-error-color, 244, 67, 54), 0.08);
        border-color: var(--error-color, #f44336);
        box-shadow: 0 0 12px rgba(var(--rgb-error-color, 244, 67, 54), 0.25);
      }
      .door-card.warning-battery {
        border-color: rgba(var(--rgb-warning-color, 255, 152, 0), 0.4);
      }

      /* Door Card Header matching Lock Manager */
      .door-card-header {
        display: flex;
        align-items: center;
        gap: 12px;
        cursor: pointer;
      }
      .door-icon-wrapper {
        width: 36px;
        height: 36px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
      }
      .door-icon-wrapper.locked {
        background-color: rgba(var(--rgb-success-color, 76, 175, 80), 0.15);
        color: var(--success-color, #4caf50);
      }
      .door-icon-wrapper.unlocked {
        background-color: rgba(var(--rgb-warning-color, 255, 152, 0), 0.15);
        color: var(--warning-color, #ff9800);
      }
      .door-icon-wrapper.jammed {
        background-color: rgba(var(--rgb-error-color, 244, 67, 54), 0.2);
        color: var(--error-color, #f44336);
        animation: pulseAlert 1.5s infinite;
      }
      .door-title-wrapper {
        flex: 1;
        min-width: 0;
      }
      .door-name {
        font-size: 15px;
        font-weight: 600;
        margin: 0;
        color: var(--primary-text-color);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .door-time {
        font-size: 11px;
        color: var(--secondary-text-color, #757575);
        display: block;
        margin-top: 1px;
      }
      .header-pills-area {
        display: flex;
        align-items: center;
        gap: 6px;
        flex-shrink: 0;
      }

      /* Battery Pill matching Lock Manager */
      .battery-pill {
        font-size: 11px;
        padding: 3px 8px;
        border-radius: 12px;
        font-weight: 600;
        display: inline-flex;
        align-items: center;
        gap: 4px;
      }
      .battery-pill.good {
        background-color: rgba(var(--rgb-success-color, 76, 175, 80), 0.15);
        color: var(--success-color, #4caf50);
      }
      .battery-pill.warning {
        background-color: rgba(var(--rgb-warning-color, 255, 152, 0), 0.15);
        color: var(--warning-color, #ff9800);
      }
      .battery-pill.critical {
        background-color: rgba(var(--rgb-error-color, 244, 67, 54), 0.2);
        color: var(--error-color, #f44336);
      }

      /* Badges Container matching Lock Manager */
      .badge-container {
        display: flex;
        gap: 6px;
        flex-wrap: wrap;
      }
      .badge {
        font-size: 11px;
        padding: 3px 8px;
        border-radius: 12px;
        font-weight: 600;
        display: inline-flex;
        align-items: center;
        gap: 5px;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        cursor: pointer;
        transition: opacity 0.2s;
      }
      .badge:hover {
        opacity: 0.85;
      }
      .badge.success {
        background-color: rgba(var(--rgb-success-color, 76, 175, 80), 0.15);
        color: var(--success-color, #4caf50);
      }
      .badge.warning {
        background-color: rgba(var(--rgb-warning-color, 255, 152, 0), 0.15);
        color: var(--warning-color, #ff9800);
      }
      .badge.danger {
        background-color: rgba(var(--rgb-error-color, 244, 67, 54), 0.2);
        color: var(--error-color, #f44336);
      }
      .badge.info {
        background-color: rgba(var(--rgb-info-color, 33, 150, 243), 0.15);
        color: var(--info-color, #2196f3);
      }

      /* Interactive Control Action Row */
      .door-action-row {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(90px, 1fr));
        gap: 8px;
        margin-top: 2px;
      }
      .control-btn {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 8px 12px;
        border-radius: 8px;
        border: 1px solid var(--divider-color, rgba(255, 255, 255, 0.1));
        background-color: rgba(255, 255, 255, 0.03);
        color: var(--primary-text-color);
        cursor: pointer;
        transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        text-align: left;
      }
      .control-btn:hover {
        transform: translateY(-1px);
      }
      .control-btn.btn-mute:hover {
        background-color: rgba(var(--rgb-warning-color, 255, 152, 0), 0.1);
        border-color: var(--warning-color, #ff9800);
      }
      .control-btn.btn-test:hover {
        background-color: rgba(var(--rgb-primary-color, 33, 150, 243), 0.1);
        border-color: var(--primary-color, #2196f3);
      }
      .control-btn.btn-drill:hover {
        background-color: rgba(var(--rgb-error-color, 244, 67, 54), 0.15);
        border-color: var(--error-color, #f44336);
      }
      .control-btn .btn-icon {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 26px;
        height: 26px;
        border-radius: 50%;
        background-color: rgba(255, 255, 255, 0.06);
        flex-shrink: 0;
      }
      .control-btn.btn-mute .btn-icon { color: var(--warning-color, #ff9800); }
      .control-btn.btn-test .btn-icon { color: var(--info-color, #2196f3); }
      .control-btn.btn-drill .btn-icon { color: var(--error-color, #f44336); }
      .control-btn .btn-text {
        display: flex;
        flex-direction: column;
      }
      .btn-action-label {
        font-size: 12px;
        font-weight: 600;
      }
      .btn-sub-label {
        font-size: 9px;
        color: var(--secondary-text-color, #757575);
      }
      .control-btn.loading {
        opacity: 0.5;
        pointer-events: none;
      }

      /* Collapsible Diagnostics Expander Bar matching Lock Manager */
      .activity-expand-bar {
        margin-top: 4px;
        padding: 7px 10px;
        border-radius: 8px;
        border: 1px solid var(--divider-color, rgba(255, 255, 255, 0.08));
        background-color: rgba(255, 255, 255, 0.02);
        color: var(--primary-text-color);
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: space-between;
        font-size: 11px;
        font-weight: 500;
        transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        user-select: none;
      }
      .activity-expand-bar:hover {
        background-color: rgba(var(--rgb-primary-color, 33, 150, 243), 0.08);
        border-color: var(--primary-color, #2196f3);
      }
      .activity-expand-bar.open {
        border-color: var(--primary-color, #2196f3);
        background-color: rgba(var(--rgb-primary-color, 33, 150, 243), 0.05);
      }
      .expand-bar-left {
        display: flex;
        align-items: center;
        gap: 6px;
      }
      .expand-chevron {
        color: var(--primary-color, #2196f3);
        display: flex;
        align-items: center;
      }

      /* Event Feed Container matching Lock Manager */
      .event-feed-container {
        border-top: 1px solid var(--divider-color, rgba(255, 255, 255, 0.06));
        padding-top: 8px;
      }
      .drawer-grid {
        display: flex;
        flex-direction: column;
        gap: 6px;
      }
      .event-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 6px 10px;
        border-radius: 6px;
        background-color: rgba(255, 255, 255, 0.02);
        border: 1px solid var(--divider-color, rgba(255, 255, 255, 0.05));
      }
      .event-details {
        flex: 1;
      }
      .event-top-line {
        display: flex;
        align-items: center;
        gap: 8px;
      }
      .event-door-badge {
        font-size: 10px;
        font-weight: 600;
        padding: 2px 6px;
        border-radius: 4px;
        background-color: var(--secondary-background-color, rgba(255, 255, 255, 0.06));
        color: var(--secondary-text-color, #9e9e9e);
        text-transform: uppercase;
      }
      .event-action {
        font-size: 12px;
        font-weight: 500;
      }
      .drawer-label {
        font-size: 12px;
        color: var(--primary-text-color);
      }
      .switch-pill {
        border: none;
        padding: 3px 10px;
        border-radius: 12px;
        font-size: 11px;
        font-weight: 700;
        cursor: pointer;
        background: rgba(255, 255, 255, 0.08);
        color: var(--secondary-text-color, #9e9e9e);
        transition: all 0.2s;
      }
      .switch-pill.active {
        background: var(--primary-color, #2196f3);
        color: white;
      }

      /* Modal Confirmation matching Lock Manager */
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
        border-radius: 12px;
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
        color: var(--error-color, #f44336);
      }
      .modal-title {
        font-size: 16px;
        font-weight: 600;
      }
      .modal-body {
        font-size: 13px;
        color: var(--secondary-text-color, #9e9e9e);
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
        border-radius: 6px;
        font-size: 13px;
        font-weight: 600;
        border: none;
        cursor: pointer;
      }
      .btn-secondary {
        background: rgba(255, 255, 255, 0.1);
        color: white;
      }
      .btn-danger {
        background: var(--error-color, #f44336);
        color: white;
      }

      /* Animations */
      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(4px); }
        to { opacity: 1; transform: translateY(0); }
      }
      @keyframes pulseAlert {
        0% { box-shadow: 0 0 0 0 rgba(244, 67, 54, 0.5); }
        70% { box-shadow: 0 0 0 8px rgba(244, 67, 54, 0); }
        100% { box-shadow: 0 0 0 0 rgba(244, 67, 54, 0); }
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
      discovery_settings: false
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
                .selector=${{ text: {} }}
                .value=${this.config.subtitle || 'Safety & Life Protection Command Center'}
                .label=${'Subtitle'}
                .configValue=${'subtitle'}
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
                .label=${'Show Hero Status Summary Grid'}
                .configValue=${'show_summary_banner'}
                @value-changed=${this._valueChanged}
              ></ha-selector>

              <ha-selector
                .hass=${this.hass}
                .selector=${{ boolean: {} }}
                .value=${this.config.confirm_drills !== false}
                .label=${'Confirm Before Triggering Alarm Drills'}
                .configValue=${'confirm_drills'}
                @value-changed=${this._valueChanged}
              ></ha-selector>
            </div>
          ` : ''}
        </div>

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
