/**
 * Passable Safety Card
 * Version: 2.0.1
 * GitHub: https://github.com/GBear09/passable-safety-card
 *
 * Passable design-system Smoke & CO Safety Command Center with dynamic auto-discovery
 * for Google Nest Protect (2nd Gen Wired), X-Sense XP0A-MR detectors, and X-Sense SBS50
 * Base Station. Supports both compact "summary" tiles with a responsive 3-tab Command Center
 * popup and inline "full" Command Center mode (ideal for dashboards or browser_mod popups).
 */

const CARD_VERSION = "2.0.1";

const SAFETY_TABS = [
  { id: "overview", label: "Overview", icon: "mdi:shield-home" },
  { id: "controls", label: "Controls & Audio", icon: "mdi:tune-variant" },
  { id: "diagnostics", label: "Diagnostics", icon: "mdi:heart-pulse" },
];

const LitElement = Object.getPrototypeOf(
  customElements.get("ha-panel-lovelace") ||
    customElements.get("hui-entities-card") ||
    customElements.get("hui-masonry-view") ||
    customElements.get("hc-main")
);
const html = LitElement.prototype.html;
const css = LitElement.prototype.css;
const svg =
  LitElement.prototype.svg ||
  ((strings, ...values) => {
    const result = html(strings, ...values);
    if (result && typeof result === "object") {
      return Object.assign({}, result, { _$litType$: 2, type: "svg" });
    }
    return result;
  });

console.info(
  `%c PASSABLE-SAFETY-CARD %c v${CARD_VERSION} IS LOADED `,
  "color: white; background: #0284c7; font-weight: bold; padding: 2px 6px; border-radius: 4px 0 0 4px;",
  "color: #0284c7; background: #e0f2fe; font-weight: bold; padding: 2px 6px; border-radius: 0 4px 4px 0;"
);

function formatRoomName(rawKey) {
  return String(rawKey || "")
    .replace(/_smoke_co$/, "")
    .replace(/^nest_protect_/, "")
    .replace(/_s_/g, "'s ")
    .replace(/_/g, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => {
      if (word.toLowerCase() === "'s") return "'s";
      if (word.includes("'s")) {
        const parts = word.split("'s");
        return (
          parts[0].charAt(0).toUpperCase() +
          parts[0].slice(1).toLowerCase() +
          "'s"
        );
      }
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(" ");
}

function formatDateShort(rawDate) {
  if (!rawDate || rawDate === "unavailable" || rawDate === "unknown") return "--";
  const d = new Date(rawDate);
  if (isNaN(d.getTime())) return String(rawDate);
  return d.toLocaleDateString([], {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatRelativeTime(timestamp) {
  if (!timestamp || timestamp === "unavailable" || timestamp === "unknown") {
    return "--";
  }
  const then = new Date(timestamp);
  if (isNaN(then.getTime())) return String(timestamp);
  const diffSec = Math.max(0, Math.floor((Date.now() - then.getTime()) / 1000));
  if (diffSec < 60) return "Just now";
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  return `${Math.floor(diffHr / 24)}d ago`;
}

function daysUntilDate(rawDate) {
  if (!rawDate || rawDate === "unavailable" || rawDate === "unknown") return null;
  const target = new Date(rawDate);
  if (isNaN(target.getTime())) return null;
  const now = new Date();
  const diffMs = target.getTime() - now.getTime();
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}

export class PassableSafetyCard extends LitElement {
  static get properties() {
    return {
      hass: { type: Object },
      config: { type: Object },
      _activeTab: { state: true },
      _animDirection: { state: true },
      _modalOpen: { state: true },
      _expandedDevices: { state: true },
      _expandedTrays: { state: true },
      _confirmDialog: { state: true },
      _actionLoading: { state: true },
      _toastMsg: { state: true },
    };
  }

  static getConfigElement() {
    return document.createElement("passable-safety-card-editor");
  }

  static getStubConfig() {
    return {
      title: "Smoke & CO Safety Center",
      subtitle: "Safety & Life Protection Command Center",
      icon: "mdi:fire-alert",
      display_mode: "summary",
      layout: "hero",
      summary_grouping: "grouped",
      show_header: false,
      show_summary_strip: true,
      show_footer_strip: true,
      show_summary_banner: true,
      show_battery_gauges: true,
      auto_discover: true,
      confirm_drills: true,
    };
  }

  constructor() {
    super();
    this._activeTab = "overview";
    this._animDirection = "none";
    this._modalOpen = false;
    this._expandedDevices = {};
    this._expandedTrays = {};
    this._confirmDialog = null;
    this._actionLoading = {};
    this._toastMsg = null;
    this._toastTimer = null;
    this._closeModalTimer = null;
    this._swipeResetTimer = null;
    this._popupTouchStartY = undefined;
    this._popupTouchStartX = undefined;
    this._popupTouchCurrentY = undefined;
    this._popupTouchTarget = null;
    this._popupTouchDragging = false;
    this._popupTouchLockedHorizontal = false;
    this._scrollLockedElements = null;
    this._scrollGuardOverlay = null;
    this._guardTouchY = 0;
    this._guardTouchX = 0;
    this._onOverlayWheel = this._onOverlayWheel.bind(this);
    this._onOverlayTouchStart = this._onOverlayTouchStart.bind(this);
    this._onOverlayTouchMove = this._onOverlayTouchMove.bind(this);
    this._onKeyDown = (ev) => {
      if (ev.key === "Escape") {
        if (this._confirmDialog) {
          this._confirmDialog = null;
        } else if (this._modalOpen) {
          this._closeModal();
        }
      }
    };
  }

  setConfig(config) {
    if (!config) {
      throw new Error("Invalid configuration");
    }
    const displayMode = config.display_mode === "summary" ? "summary" : "full";
    const defaultShowHeader = displayMode === "full";
    this.config = {
      title: "Smoke & CO Safety Center",
      subtitle: "Safety & Life Protection Command Center",
      icon: "mdi:fire-alert",
      display_mode: displayMode,
      layout: config.layout === "rings" ? "rings" : "hero",
      summary_grouping: config.summary_grouping === "devices" ? "devices" : "grouped",
      show_header:
        config.show_header !== undefined
          ? config.show_header !== false
          : defaultShowHeader,
      show_summary_strip: config.show_summary_strip !== false,
      show_footer_strip: config.show_footer_strip !== false,
      auto_discover: config.auto_discover !== false,
      show_summary_banner: config.show_summary_banner !== false,
      show_battery_gauges: config.show_battery_gauges !== false,
      confirm_drills: config.confirm_drills !== false,
      exclude_entities: [],
      devices: [],
      ...config,
    };
    this._cachedSafetyData = null;
  }

  getCardSize() {
    if (this.config?.display_mode === "summary") {
      return this.config.summary_grouping === "devices" ? 6 : 4;
    }
    return 8;
  }

  connectedCallback() {
    super.connectedCallback();
    window.addEventListener("keydown", this._onKeyDown);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    window.removeEventListener("keydown", this._onKeyDown);
    this._detachOverlayScrollGuard();
    this._unlockBackgroundScroll();
    clearTimeout(this._toastTimer);
    clearTimeout(this._closeModalTimer);
    clearTimeout(this._swipeResetTimer);
  }

  updated(changedProps) {
    super.updated && super.updated(changedProps);
    if (this._modalOpen && this.config?.display_mode === "summary") {
      this._attachOverlayScrollGuard();
    } else {
      this._detachOverlayScrollGuard();
    }
  }

  shouldUpdate(changedProps) {
    if (!changedProps.has("hass")) return true;
    for (const key of changedProps.keys()) {
      if (key !== "hass") return true;
    }
    const oldHass = changedProps.get("hass");
    const newHass = this.hass;
    if (!oldHass || !newHass || !oldHass.states || !newHass.states || !this.config) {
      return true;
    }
    const oldKeys = Object.keys(oldHass.states);
    const newKeys = Object.keys(newHass.states);
    if (oldKeys.length !== newKeys.length) {
      this._cachedSafetyData = null;
      return true;
    }
    const watched = this._getWatchedEntityIds();
    for (const id of watched) {
      if (oldHass.states[id] !== newHass.states[id]) {
        return true;
      }
    }
    return false;
  }

  _getWatchedEntityIds() {
    const data = this._discoverSafetyTopology();
    const ids = new Set();
    const agg = this.config?.aggregate_entities || {};
    [
      agg.alert_status || "binary_sensor.home_alert_status",
      agg.smoke_status || "binary_sensor.home_smoke_status",
      agg.co_status || "binary_sensor.home_co_status",
      agg.battery_status || "binary_sensor.detector_low_battery",
      this.config?.hvac_shutoff_automation || "automation.smoke_or_co_detected_turn_off_hvac",
    ].forEach((id) => id && ids.add(id));

    if (data.baseStation) {
      Object.values(data.baseStation).forEach((v) => {
        if (typeof v === "string" && v.includes(".")) ids.add(v);
      });
    }
    data.devices.forEach((dev) => {
      Object.entries(dev).forEach(([k, val]) => {
        if (typeof val === "string" && val.includes(".") && k !== "id") {
          ids.add(val);
        } else if (Array.isArray(val)) {
          val.forEach((v) => typeof v === "string" && v.includes(".") && ids.add(v));
        } else if (val && typeof val === "object") {
          Object.values(val).forEach((v) => typeof v === "string" && v.includes(".") && ids.add(v));
        }
      });
    });
    return ids;
  }

  // =========================================================================
  // FEEDBACK & MODAL GESTURES
  // =========================================================================

  _fireHaptic(type = "light") {
    const event = new Event("haptic", { bubbles: true, composed: true });
    event.detail = type;
    this.dispatchEvent(event);
  }

  _showToast(msg) {
    this._toastMsg = msg;
    clearTimeout(this._toastTimer);
    this._toastTimer = setTimeout(() => {
      this._toastMsg = null;
    }, 2400);
  }

  _openModal(tab = "overview", ev = null) {
    if (ev) ev.stopPropagation();
    this._fireHaptic("light");
    clearTimeout(this._closeModalTimer);
    clearTimeout(this._swipeResetTimer);
    this._activeTab = tab || "overview";
    this._animDirection = "none";
    if (this.config?.display_mode !== "summary") {
      this.requestUpdate();
      return;
    }
    this._modalOpen = true;
    this._lockBackgroundScroll();
  }

  _closeModal() {
    this._fireHaptic("light");
    clearTimeout(this._swipeResetTimer);
    const overlay = this.shadowRoot?.querySelector(".popup-overlay");
    const content = this.shadowRoot?.querySelector(".popup-content");
    if (overlay) overlay.classList.add("closing");
    if (content) content.classList.add("closing");
    clearTimeout(this._closeModalTimer);
    this._closeModalTimer = setTimeout(() => {
      this._modalOpen = false;
      this._detachOverlayScrollGuard();
      this._unlockBackgroundScroll();
      this.requestUpdate();
    }, 180);
  }

  _switchTab(tabId) {
    if (this._activeTab === tabId) return;
    const order = SAFETY_TABS.map((t) => t.id);
    const curIdx = order.indexOf(this._activeTab);
    const nextIdx = order.indexOf(tabId);
    this._animDirection = nextIdx > curIdx ? "slide-left" : "slide-right";
    this._activeTab = tabId;
    this._fireHaptic("light");
  }

  _lockBackgroundScroll() {
    if (this._scrollLockedElements) return;
    const lockMap = (window.__passableScrollLocks =
      window.__passableScrollLocks || new Map());
    const targets = new Set();
    if (document.documentElement) targets.add(document.documentElement);
    if (document.body) targets.add(document.body);
    if (document.scrollingElement) targets.add(document.scrollingElement);

    let node = this.parentNode;
    while (node) {
      if (node.nodeType === 1) {
        const oy = window.getComputedStyle(node).overflowY;
        if (oy === "auto" || oy === "scroll" || oy === "overlay" || node.id === "view") {
          targets.add(node);
        }
      }
      node = node.parentNode || node.host || null;
    }

    const locked = [];
    targets.forEach((el) => {
      let entry = lockMap.get(el);
      if (!entry) {
        entry = {
          count: 0,
          overflow: el.style.overflow,
          overflowY: el.style.overflowY,
          overscrollBehavior: el.style.overscrollBehavior,
        };
        lockMap.set(el, entry);
      }
      if (entry.count === 0) {
        el.style.overflowY = "hidden";
        el.style.overscrollBehavior = "none";
      }
      entry.count += 1;
      locked.push(el);
    });
    this._scrollLockedElements = locked;
  }

  _unlockBackgroundScroll() {
    if (!this._scrollLockedElements) return;
    const lockMap = window.__passableScrollLocks;
    this._scrollLockedElements.forEach((el) => {
      const entry = lockMap && lockMap.get(el);
      if (!entry) return;
      entry.count -= 1;
      if (entry.count <= 0) {
        el.style.overflow = entry.overflow;
        el.style.overflowY = entry.overflowY;
        el.style.overscrollBehavior = entry.overscrollBehavior;
        lockMap.delete(el);
      }
    });
    this._scrollLockedElements = null;
  }

  _attachOverlayScrollGuard() {
    const overlay = this.shadowRoot?.querySelector(".popup-overlay");
    if (overlay === this._scrollGuardOverlay) return;
    this._detachOverlayScrollGuard();
    if (!overlay) return;
    overlay.addEventListener("wheel", this._onOverlayWheel, { passive: false });
    overlay.addEventListener("touchstart", this._onOverlayTouchStart, { passive: true });
    overlay.addEventListener("touchmove", this._onOverlayTouchMove, { passive: false });
    this._scrollGuardOverlay = overlay;
  }

  _detachOverlayScrollGuard() {
    if (!this._scrollGuardOverlay) return;
    this._scrollGuardOverlay.removeEventListener("wheel", this._onOverlayWheel);
    this._scrollGuardOverlay.removeEventListener("touchstart", this._onOverlayTouchStart);
    this._scrollGuardOverlay.removeEventListener("touchmove", this._onOverlayTouchMove);
    this._scrollGuardOverlay = null;
  }

  _findModalScrollContainer(ev, overlay) {
    const path = typeof ev.composedPath === "function" ? ev.composedPath() : [];
    const contentEl = overlay ? overlay.querySelector(".popup-content") : null;
    if (!contentEl || !path.includes(contentEl)) return null;
    for (const el of path) {
      if (el === overlay) break;
      if (!el || el.nodeType !== 1 || !contentEl.contains(el)) continue;
      const oy = window.getComputedStyle(el).overflowY;
      if ((oy === "auto" || oy === "scroll" || oy === "overlay") && el.scrollHeight > el.clientHeight + 1) {
        return el;
      }
    }
    return null;
  }

  _onOverlayWheel(ev) {
    const scroller = this._findModalScrollContainer(ev, this._scrollGuardOverlay);
    if (!scroller) {
      if (ev.cancelable) ev.preventDefault();
      return;
    }
    const atTop = scroller.scrollTop <= 0;
    const atBottom = scroller.scrollTop + scroller.clientHeight >= scroller.scrollHeight - 1;
    if ((ev.deltaY < 0 && atTop) || (ev.deltaY > 0 && atBottom)) {
      if (ev.cancelable) ev.preventDefault();
    }
  }

  _onOverlayTouchStart(ev) {
    if (ev.touches && ev.touches.length === 1) {
      this._guardTouchY = ev.touches[0].clientY;
      this._guardTouchX = ev.touches[0].clientX;
    }
  }

  _onOverlayTouchMove(ev) {
    if (!ev.touches || ev.touches.length !== 1) return;
    const path = typeof ev.composedPath === "function" ? ev.composedPath() : [];
    if (path.some((el) => el?.tagName === "INPUT" && el.type === "range")) return;
    const curY = ev.touches[0].clientY;
    const curX = ev.touches[0].clientX;
    const dy = curY - this._guardTouchY;
    const dx = curX - this._guardTouchX;
    this._guardTouchY = curY;
    this._guardTouchX = curX;
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 4) return;
    const scroller = this._findModalScrollContainer(ev, this._scrollGuardOverlay);
    if (!scroller) {
      if (ev.cancelable) ev.preventDefault();
      return;
    }
    const atTop = scroller.scrollTop <= 0;
    const atBottom = scroller.scrollTop + scroller.clientHeight >= scroller.scrollHeight - 1;
    if ((dy > 0 && atTop) || (dy < 0 && atBottom)) {
      if (ev.cancelable) ev.preventDefault();
    }
  }

  _handlePopupTouchStart(e) {
    if (!e.touches || e.touches.length !== 1) return;
    const path = typeof e.composedPath === "function" ? e.composedPath() : [];
    if (path.some((el) => el?.tagName === "INPUT" || el?.tagName === "SELECT")) return;
    const popupContent = e.currentTarget;
    const scrollArea = popupContent.querySelector(".modal-scroll-area");
    if (scrollArea && e.target && scrollArea.contains(e.target) && scrollArea.scrollTop > 0) return;
    clearTimeout(this._swipeResetTimer);
    this._popupTouchStartY = e.touches[0].clientY;
    this._popupTouchStartX = e.touches[0].clientX;
    this._popupTouchCurrentY = this._popupTouchStartY;
    this._popupTouchTarget = popupContent;
    this._popupTouchDragging = false;
    this._popupTouchLockedHorizontal = false;
  }

  _handlePopupTouchMove(e) {
    if (this._popupTouchStartY === undefined || !this._popupTouchTarget || this._popupTouchLockedHorizontal) return;
    if (!e.touches || e.touches.length !== 1) return;
    const popupContent = this._popupTouchTarget;
    const curY = e.touches[0].clientY;
    const curX = e.touches[0].clientX;
    const dy = curY - this._popupTouchStartY;
    const dx = curX - (this._popupTouchStartX ?? curX);
    if (!this._popupTouchDragging) {
      if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 8) {
        this._popupTouchLockedHorizontal = true;
        return;
      }
      if (dy > 6) {
        this._popupTouchDragging = true;
        popupContent.style.animation = "none";
        popupContent.style.transition = "none";
      } else {
        return;
      }
    }
    if (dy > 0) {
      if (e.cancelable) e.preventDefault();
      this._popupTouchCurrentY = curY;
      popupContent.style.transform = `translateY(${dy}px)`;
      const overlay = this.shadowRoot?.querySelector(".popup-overlay");
      if (overlay) {
        overlay.style.animation = "none";
        overlay.style.opacity = String(Math.max(0.2, 1 - dy / 360));
      }
    }
  }

  _handlePopupTouchEnd() {
    if (this._popupTouchStartY === undefined || !this._popupTouchTarget) return;
    const popupContent = this._popupTouchTarget;
    const overlay = this.shadowRoot?.querySelector(".popup-overlay");
    const deltaY = this._popupTouchDragging && this._popupTouchCurrentY !== undefined
      ? this._popupTouchCurrentY - this._popupTouchStartY
      : 0;
    const wasDragging = this._popupTouchDragging;
    this._popupTouchStartY = undefined;
    this._popupTouchStartX = undefined;
    this._popupTouchCurrentY = undefined;
    this._popupTouchTarget = null;
    this._popupTouchDragging = false;
    this._popupTouchLockedHorizontal = false;

    if (deltaY > 80) {
      this._fireHaptic("light");
      popupContent.style.transition = "transform 180ms ease-in, opacity 180ms ease-in";
      popupContent.style.transform = "translateY(100%)";
      popupContent.style.opacity = "0";
      if (overlay) {
        overlay.style.transition = "opacity 180ms ease-in";
        overlay.style.opacity = "0";
      }
      clearTimeout(this._closeModalTimer);
      this._closeModalTimer = setTimeout(() => {
        this._modalOpen = false;
        this._detachOverlayScrollGuard();
        this._unlockBackgroundScroll();
        this.requestUpdate();
      }, 180);
    } else if (wasDragging) {
      popupContent.style.transition = "transform 250ms cubic-bezier(0.2, 0, 0, 1)";
      popupContent.style.transform = "translateY(0px)";
      if (overlay) {
        overlay.style.transition = "opacity 250ms cubic-bezier(0.2, 0, 0, 1)";
        overlay.style.opacity = "1";
      }
      this._swipeResetTimer = setTimeout(() => {
        popupContent.style.transition = "";
        popupContent.style.transform = "";
        popupContent.style.animation = "";
        if (overlay) {
          overlay.style.transition = "";
          overlay.style.opacity = "";
          overlay.style.animation = "";
        }
      }, 250);
    }
  }

  // =========================================================================
  // DISCOVERY ENGINE (Nest Protect + X-Sense Detectors + X-Sense Base Station)
  // =========================================================================

  _discoverSafetyTopology() {
    if (!this.hass || !this.hass.states) {
      return { devices: [], baseStation: null };
    }

    const states = this.hass.states;
    const stateCount = Object.keys(states).length;
    if (
      this._cachedSafetyData &&
      this._cachedConfig === this.config &&
      this._cachedStateCount === stateCount
    ) {
      return this._cachedSafetyData;
    }

    if (!this.config?.auto_discover && Array.isArray(this.config?.devices) && this.config.devices.length > 0) {
      const manual = { devices: this.config.devices, baseStation: null };
      this._cachedSafetyData = manual;
      this._cachedConfig = this.config;
      this._cachedStateCount = stateCount;
      return manual;
    }

    const excludeList = this.config?.exclude_entities || [];
    const devicesMap = new Map();

    const getOrCreateDevice = (key, displayName, brand, slug) => {
      if (!devicesMap.has(key)) {
        devicesMap.set(key, {
          id: key,
          slug: slug || key,
          name: displayName,
          room: formatRoomName(slug || key),
          brand: brand || "standard",
          smoke_entity: null,
          co_entity: null,
          smoke_alarm_state_entity: null,
          co_alarm_state_entity: null,
          co_reading_entity: null,
          co_previous_peak_entity: null,
          battery_entity: null,
          battery_health_entity: null,
          line_power_entity: null,
          removed_from_base_entity: null,
          online_entity: null,
          silenced_entity: null,
          end_of_life_entity: null,
          heat_entity: null,
          mute_button: null,
          test_button: null,
          drill_button: null,
          test_result_sensor: null,
          test_time_sensor: null,
          last_audio_test_sensor: null,
          replace_by_sensor: null,
          device_status_sensor: null,
          signal_strength_sensor: null,
          report_time_sensor: null,
          alarm_volume_number: null,
          alarm_tone_select: null,
          brightness_select: null,
          component_tests: {},
          switches: [],
        });
      }
      return devicesMap.get(key);
    };

    // Pass 1: Physical Smoke / CO detector discovery
    for (const [entityId, stateObj] of Object.entries(states)) {
      if (excludeList.includes(entityId)) continue;
      if (!entityId.startsWith("binary_sensor.")) continue;
      if (
        entityId.startsWith("binary_sensor.home_") ||
        entityId.startsWith("binary_sensor.all_") ||
        entityId === "binary_sensor.detector_low_battery" ||
        entityId.includes("base_station")
      ) {
        continue;
      }

      const attrs = stateObj.attributes || {};
      const isSmoke =
        attrs.device_class === "smoke" ||
        entityId.endsWith("_smoke_status") ||
        entityId.endsWith("_smoke_co_alarm_status");
      const isCO =
        attrs.device_class === "carbon_monoxide" ||
        entityId.endsWith("_co_status");

      if (!isSmoke && !isCO) continue;

      let key = "";
      let brand = "standard";
      let slug = "";

      const xsenseMatch = entityId.match(/^binary_sensor\.(.+)_smoke_co_alarm_status$/);
      const nestMatch = entityId.match(/^binary_sensor\.nest_protect_([a-z0-9_]+)_(smoke|co)_status$/);

      if (xsenseMatch) {
        slug = xsenseMatch[1];
        key = `${slug}_smoke_co`;
        brand = "x-sense";
      } else if (nestMatch) {
        slug = nestMatch[1];
        key = `nest_protect_${slug}`;
        brand = "nest";
      } else {
        key = entityId
          .replace("binary_sensor.", "")
          .replace(/_(smoke|co|alarm)_status/, "")
          .replace(/_(smoke|co)/, "");
        slug = key;
      }

      const roomName = formatRoomName(slug);
      const displayName =
        brand === "x-sense"
          ? `${roomName} X-Sense`
          : brand === "nest"
          ? `${roomName} Nest Protect`
          : `${roomName} Detector`;

      const dev = getOrCreateDevice(key, displayName, brand, slug);
      if (isSmoke && !dev.smoke_entity) dev.smoke_entity = entityId;
      if (isCO && !dev.co_entity) dev.co_entity = entityId;
    }

    // Pass 2: Sibling Entity Mapping (Supports dual-prefix Nest entities too!)
    for (const [entityId] of Object.entries(states)) {
      if (excludeList.includes(entityId)) continue;
      const objId = entityId.split(".")[1] || "";

      for (const [key, dev] of devicesMap.entries()) {
        const matchesDualNest =
          dev.brand === "nest" &&
          (entityId.includes(key) || objId.includes(`${dev.slug}_nest_protect_${dev.slug}`));
        if (!entityId.includes(key) && !matchesDualNest) continue;

        if (entityId.startsWith("button.")) {
          if (objId.endsWith("_mute") || objId.endsWith("_silence")) dev.mute_button = entityId;
          else if (objId.endsWith("_device_test") || objId.endsWith("_test")) dev.test_button = entityId;
          else if (objId.endsWith("_alarm_drill") || objId.endsWith("_drill")) dev.drill_button = entityId;
        } else if (entityId.startsWith("number.")) {
          if (objId.endsWith("_alarm_volume")) dev.alarm_volume_number = entityId;
        } else if (entityId.startsWith("select.")) {
          if (objId.endsWith("_alarm_tone")) dev.alarm_tone_select = entityId;
          else if (objId.endsWith("_brightness")) dev.brightness_select = entityId;
        } else if (entityId.startsWith("sensor.")) {
          if (objId.endsWith("_battery") || objId.endsWith("_battery_level")) dev.battery_entity = entityId;
          else if (objId.endsWith("_co_reading")) dev.co_reading_entity = entityId;
          else if (objId.endsWith("_co_level") && !dev.co_reading_entity) dev.co_reading_entity = entityId;
          else if (objId.endsWith("_co_previous_peak")) dev.co_previous_peak_entity = entityId;
          else if (objId.endsWith("_smoke_alarm_state")) dev.smoke_alarm_state_entity = entityId;
          else if (objId.endsWith("_co_alarm_state")) dev.co_alarm_state_entity = entityId;
          else if (objId.endsWith("_device_test_result")) dev.test_result_sensor = entityId;
          else if (objId.endsWith("_device_test_time") || objId.endsWith("_last_manual_test")) dev.test_time_sensor = entityId;
          else if (objId.endsWith("_last_audio_self_test")) dev.last_audio_test_sensor = entityId;
          else if (objId.endsWith("_replace_by")) dev.replace_by_sensor = entityId;
          else if (objId.endsWith("_device_status")) dev.device_status_sensor = entityId;
          else if (objId.endsWith("_signal_strength")) dev.signal_strength_sensor = entityId;
          else if (objId.endsWith("_report_time")) dev.report_time_sensor = entityId;
        } else if (entityId.startsWith("binary_sensor.")) {
          if (objId.endsWith("_battery_health") || objId.endsWith("_battery_low")) dev.battery_health_entity = entityId;
          else if (objId.endsWith("_line_power")) dev.line_power_entity = entityId;
          else if (objId.endsWith("_removed_from_base")) dev.removed_from_base_entity = entityId;
          else if (objId.endsWith("_online")) dev.online_entity = entityId;
          else if (objId.endsWith("_device_silenced") || objId.endsWith("_alarm_hushed")) dev.silenced_entity = entityId;
          else if (objId.endsWith("_end_of_life")) dev.end_of_life_entity = entityId;
          else if (objId.endsWith("_heat_status")) dev.heat_entity = entityId;
          else {
            const testNames = [
              "smoke_test",
              "co_test",
              "buzzer_test",
              "speaker_test",
              "wifi_test",
              "led_test",
              "pir_test",
              "humidity_test",
            ];
            for (const t of testNames) {
              if (objId.endsWith(`_${t}`)) {
                dev.component_tests[t] = entityId;
              }
            }
          }
        } else if (entityId.startsWith("switch.")) {
          if (!dev.switches.includes(entityId)) dev.switches.push(entityId);
        }
      }
    }

    // Pass 3: Discover X-Sense SBS50 Base Station
    let baseStation = null;
    const hasBaseStationEntities = Object.keys(states).some((id) =>
      id.includes("base_station") && !excludeList.includes(id)
    );
    if (hasBaseStationEntities) {
      const findBase = (domain, suffix) =>
        Object.keys(states).find(
          (id) => id.startsWith(`${domain}.`) && id.includes("base_station") && id.endsWith(suffix)
        ) || null;
      baseStation = {
        name: "X-Sense Base Station",
        model: "SBS50",
        connected: findBase("binary_sensor", "_connected"),
        alarm_status: findBase("binary_sensor", "_alarm_status"),
        drill_active: findBase("binary_sensor", "_alarm_drill_active"),
        alarm_volume: findBase("number", "_alarm_volume"),
        voice_volume: findBase("number", "_voice_volume"),
        alarm_tone: findBase("select", "_alarm_tone"),
        led_brightness: findBase("select", "_led_brightness"),
        wifi_signal: findBase("sensor", "_wi_fi_signal_strength"),
        ssid: findBase("sensor", "_ssid"),
        ip_address: findBase("sensor", "_ip_address"),
        security_mode: findBase("sensor", "_security_mode"),
      };
    }

    const sortedDevices = Array.from(devicesMap.values()).sort((a, b) => {
      if (a.brand !== b.brand) return a.brand === "nest" ? -1 : 1;
      return a.name.localeCompare(b.name);
    });

    this._cachedSafetyData = { devices: sortedDevices, baseStation };
    this._cachedConfig = this.config;
    this._cachedStateCount = stateCount;
    return this._cachedSafetyData;
  }

  _getDeviceTelemetry(dev) {
    const states = this.hass?.states || {};
    const st = (id) => (id ? states[id] : null);

    const smokeObj = st(dev.smoke_entity);
    const coObj = st(dev.co_entity);
    const smokeStateObj = st(dev.smoke_alarm_state_entity);
    const coStateObj = st(dev.co_alarm_state_entity);
    const coReadObj = st(dev.co_reading_entity);
    const batObj = st(dev.battery_entity);
    const batHealthObj = st(dev.battery_health_entity);
    const linePowerObj = st(dev.line_power_entity);
    const removedObj = st(dev.removed_from_base_entity);
    const onlineObj = st(dev.online_entity);
    const silencedObj = st(dev.silenced_entity);
    const eolObj = st(dev.end_of_life_entity);
    const heatObj = st(dev.heat_entity);
    const replaceByObj = st(dev.replace_by_sensor);

    const smokeStateStr = String(smokeStateObj?.state || "").toLowerCase();
    const coStateStr = String(coStateObj?.state || "").toLowerCase();

    const isSmokeEmergency =
      smokeObj?.state === "on" || smokeObj?.state === "smoke" || smokeStateStr === "emergency";
    const isSmokeHeadsUp = !isSmokeEmergency && smokeStateStr === "heads_up";

    const coPpm = coReadObj && !isNaN(parseFloat(coReadObj.state)) ? parseFloat(coReadObj.state) : null;
    const isCoEmergency =
      coObj?.state === "on" ||
      coObj?.state === "carbon_monoxide" ||
      coStateStr === "emergency" ||
      (coPpm !== null && coPpm >= 30);
    const isCoHeadsUp = !isCoEmergency && coStateStr === "heads_up";

    const isHeatAlert = heatObj?.state === "on";
    const isSilenced = silencedObj?.state === "on";
    const isTampered = removedObj?.state === "on";
    const isOffline = onlineObj ? onlineObj.state === "off" : false;
    const isEol = eolObj?.state === "on";

    const isWired = linePowerObj ? true : false;
    const isLinePowerOn = linePowerObj ? linePowerObj.state === "on" : false;
    const isOnBatteryBackup = isWired && !isLinePowerOn;

    const batteryPct =
      batObj && !isNaN(parseFloat(batObj.state))
        ? Math.max(0, Math.min(100, Math.round(parseFloat(batObj.state))))
        : null;
    const isBatteryLow =
      (batteryPct !== null && batteryPct <= 20) ||
      (batHealthObj && ["on", "problem", "low"].includes(batHealthObj.state));

    const replaceDays = replaceByObj ? daysUntilDate(replaceByObj.state) : null;
    const isExpired = isEol || (replaceDays !== null && replaceDays <= 0);
    const isExpiringSoon = !isExpired && replaceDays !== null && replaceDays <= 180;

    const componentTestKeys = Object.keys(dev.component_tests || {});
    const failedTests = componentTestKeys.filter(
      (k) => st(dev.component_tests[k])?.state === "on"
    );

    const isPathlightOn = dev.switches.some(
      (id) => id.endsWith("_pathlight") && st(id)?.state === "on"
    );

    let tone = "safe";
    if (isSmokeEmergency || isCoEmergency || isHeatAlert || isTampered || isExpired) {
      tone = "danger";
    } else if (
      isSmokeHeadsUp ||
      isCoHeadsUp ||
      isBatteryLow ||
      isOnBatteryBackup ||
      isOffline ||
      isExpiringSoon ||
      failedTests.length > 0
    ) {
      tone = "warning";
    }

    return {
      isSmokeEmergency,
      isSmokeHeadsUp,
      isCoEmergency,
      isCoHeadsUp,
      isHeatAlert,
      coPpm,
      isSilenced,
      isTampered,
      isOffline,
      isEol,
      isWired,
      isLinePowerOn,
      isOnBatteryBackup,
      batteryPct,
      isBatteryLow,
      replaceDays,
      replaceByDate: replaceByObj?.state || null,
      isExpired,
      isExpiringSoon,
      componentTestKeys,
      failedTests,
      isPathlightOn,
      tone,
    };
  }

  _getGlobalSummary(topology) {
    const states = this.hass?.states || {};
    const agg = this.config?.aggregate_entities || {};
    const devTels = topology.devices.map((d) => ({ dev: d, tel: this._getDeviceTelemetry(d) }));

    let activeSmoke = devTels.filter((x) => x.tel.isSmokeEmergency).length;
    let activeCO = devTels.filter((x) => x.tel.isCoEmergency).length;
    let headsUpCount = devTels.filter((x) => x.tel.isSmokeHeadsUp || x.tel.isCoHeadsUp).length;
    let lowBattery = devTels.filter((x) => x.tel.isBatteryLow).length;
    let powerLostCount = devTels.filter((x) => x.tel.isOnBatteryBackup).length;
    let tamperCount = devTels.filter((x) => x.tel.isTampered).length;
    let offlineCount = devTels.filter((x) => x.tel.isOffline).length;
    let expiringSoonList = devTels.filter((x) => x.tel.isExpiringSoon || x.tel.isExpired);

    const smokeGlobal = states[agg.smoke_status || "binary_sensor.home_smoke_status"];
    const coGlobal = states[agg.co_status || "binary_sensor.home_co_status"];
    const batGlobal = states[agg.battery_status || "binary_sensor.detector_low_battery"];
    const alertGlobal = states[agg.alert_status || "binary_sensor.home_alert_status"];

    if (smokeGlobal?.state === "on") activeSmoke = Math.max(activeSmoke, 1);
    if (coGlobal?.state === "on") activeCO = Math.max(activeCO, 1);
    if (batGlobal?.state === "on") lowBattery = Math.max(lowBattery, 1);

    const base = topology.baseStation;
    const baseConnected = base?.connected ? states[base.connected]?.state === "on" : true;
    const baseAlarm = base?.alarm_status ? states[base.alarm_status]?.state === "on" : false;
    const baseDrill = base?.drill_active ? states[base.drill_active]?.state === "on" : false;

    const hvacAutoId =
      this.config?.hvac_shutoff_automation || "automation.smoke_or_co_detected_turn_off_hvac";
    const hvacAutoObj = states[hvacAutoId] || null;
    const hvacAutoArmed = hvacAutoObj ? hvacAutoObj.state === "on" : false;

    const minBattery = devTels.reduce((min, x) => {
      if (x.tel.batteryPct === null) return min;
      return min === null ? x.tel.batteryPct : Math.min(min, x.tel.batteryPct);
    }, null);

    let overallTone = "safe";
    let headline = `All Clear · ${topology.devices.length} Detectors`;
    if (activeSmoke > 0 || activeCO > 0 || alertGlobal?.state === "on" || baseAlarm || tamperCount > 0) {
      overallTone = "danger";
      headline =
        activeSmoke > 0
          ? "Smoke Alarm Triggered"
          : activeCO > 0
          ? "Carbon Monoxide Alert"
          : tamperCount > 0
          ? "Detector Tamper Alert"
          : "Safety Alert Active";
    } else if (
      headsUpCount > 0 ||
      powerLostCount > 0 ||
      lowBattery > 0 ||
      offlineCount > 0 ||
      !baseConnected ||
      expiringSoonList.length > 0
    ) {
      overallTone = "warning";
      if (headsUpCount > 0) headline = "Heads-Up Warning";
      else if (powerLostCount > 0) headline = `${powerLostCount} On Battery Backup`;
      else if (lowBattery > 0) headline = `${lowBattery} Low Battery`;
      else if (!baseConnected) headline = "Base Station Offline";
      else if (offlineCount > 0) headline = `${offlineCount} Detector Offline`;
      else headline = `${expiringSoonList.length} Replace Soon`;
    }

    return {
      devTels,
      activeSmoke,
      activeCO,
      headsUpCount,
      lowBattery,
      powerLostCount,
      tamperCount,
      offlineCount,
      expiringSoonList,
      baseConnected,
      baseAlarm,
      baseDrill,
      hvacAutoId,
      hvacAutoObj,
      hvacAutoArmed,
      minBattery,
      overallTone,
      headline,
    };
  }

  // =========================================================================
  // HARDWARE SVGs (Model-Accurate Nest Protect, X-Sense XP0A-MR, SBS50 Hub)
  // =========================================================================

  _renderNestProtectSvg(tel, size = 40) {
    let ringColor = "#10b981";
    let glow = "rgba(16, 185, 129, 0.45)";
    if (tel.isSmokeEmergency || tel.isCoEmergency || tel.isHeatAlert || tel.isTampered) {
      ringColor = "#ef4444";
      glow = "rgba(239, 68, 68, 0.7)";
    } else if (tel.tone === "warning") {
      ringColor = "#f59e0b";
      glow = "rgba(245, 158, 11, 0.6)";
    } else if (tel.isPathlightOn) {
      ringColor = "#34d399";
    }
    return svg`
      <svg width="${size}" height="${size}" viewBox="0 0 48 48" style="display:block;flex-shrink:0;">
        <rect x="4" y="4" width="40" height="40" rx="11" fill="var(--card-background-color, #f8fafc)" stroke="var(--divider-color, #cbd5e1)" stroke-width="2" />
        <g fill="currentColor" opacity="0.22">
          <circle cx="14" cy="14" r="1.1"/><circle cx="19" cy="14" r="1.1"/><circle cx="29" cy="14" r="1.1"/><circle cx="34" cy="14" r="1.1"/>
          <circle cx="14" cy="34" r="1.1"/><circle cx="19" cy="34" r="1.1"/><circle cx="29" cy="34" r="1.1"/><circle cx="34" cy="34" r="1.1"/>
          <circle cx="14" cy="19" r="1.1"/><circle cx="34" cy="19" r="1.1"/><circle cx="14" cy="29" r="1.1"/><circle cx="34" cy="29" r="1.1"/>
        </g>
        <circle cx="24" cy="24" r="10.5" fill="none" stroke="${glow}" stroke-width="4" />
        <circle cx="24" cy="24" r="8.5" fill="var(--ha-card-background, #ffffff)" stroke="${ringColor}" stroke-width="2.6" />
        <circle cx="24" cy="24" r="3" fill="${ringColor}" opacity="0.85" />
      </svg>
    `;
  }

  _renderXsenseDetectorSvg(tel, isLedOn = true, size = 40) {
    let ledColor = isLedOn ? "#22c55e" : "#94a3b8";
    if (tel.isSmokeEmergency || tel.isCoEmergency) ledColor = "#ef4444";
    else if (tel.tone === "warning") ledColor = "#f59e0b";
    return svg`
      <svg width="${size}" height="${size}" viewBox="0 0 48 48" style="display:block;flex-shrink:0;">
        <circle cx="24" cy="24" r="20" fill="var(--card-background-color, #f8fafc)" stroke="var(--divider-color, #cbd5e1)" stroke-width="2" />
        <circle cx="24" cy="24" r="15.5" fill="none" stroke="currentColor" stroke-opacity="0.16" stroke-width="1.3" stroke-dasharray="2.2 2.2" />
        <circle cx="24" cy="24" r="11.5" fill="none" stroke="currentColor" stroke-opacity="0.22" stroke-width="1.2" />
        <circle cx="24" cy="24" r="6.5" fill="var(--secondary-background-color, #e2e8f0)" stroke="${ledColor}" stroke-width="2" />
        <path d="M18.5 19.5 A7.5 7.5 0 0 1 29.5 19.5" fill="none" stroke="${ledColor}" stroke-width="2.2" stroke-linecap="round" />
      </svg>
    `;
  }

  _renderBaseStationSvg(isConnected, isAlarm, size = 40) {
    const ledColor = isAlarm ? "#ef4444" : isConnected ? "#3b82f6" : "#f59e0b";
    return svg`
      <svg width="${size}" height="${size}" viewBox="0 0 48 48" style="display:block;flex-shrink:0;">
        <line x1="35" y1="7" x2="35" y2="15" stroke="currentColor" stroke-opacity="0.55" stroke-width="2.5" stroke-linecap="round" />
        <rect x="8" y="13" width="32" height="27" rx="8" fill="var(--card-background-color, #f8fafc)" stroke="var(--divider-color, #cbd5e1)" stroke-width="2" />
        <g fill="currentColor" opacity="0.25">
          <circle cx="16" cy="21" r="1.2"/><circle cx="21" cy="21" r="1.2"/><circle cx="27" cy="21" r="1.2"/><circle cx="32" cy="21" r="1.2"/>
          <circle cx="16" cy="26" r="1.2"/><circle cx="21" cy="26" r="1.2"/><circle cx="27" cy="26" r="1.2"/><circle cx="32" cy="26" r="1.2"/>
        </g>
        <rect x="16" y="32" width="16" height="3.2" rx="1.6" fill="${ledColor}" />
      </svg>
    `;
  }

  _renderRingMiniGauge(pct, valueText, subText, color) {
    const r = 17;
    const c = 2 * Math.PI * r;
    const clamped = Math.max(0, Math.min(100, pct));
    const dash = (clamped / 100) * c;
    return html`
      <div class="summary-ring-item">
        <div class="summary-ring-wrap">
          ${svg`
            <svg class="summary-ring-svg" viewBox="0 0 42 42">
              <circle cx="21" cy="21" r="${r}" fill="none" stroke="rgba(148, 163, 184, 0.22)" stroke-width="3.4"></circle>
              <circle cx="21" cy="21" r="${r}" fill="none" stroke="${color}" stroke-width="3.4" stroke-linecap="round" stroke-opacity="${clamped > 0 ? 1 : 0}" stroke-dasharray="${dash.toFixed(1)} ${c.toFixed(1)}"></circle>
            </svg>
          `}
          <span class="summary-ring-val">${valueText}</span>
        </div>
        <span class="summary-ring-label">${subText}</span>
      </div>
    `;
  }

  // =========================================================================
  // SERVICE ACTIONS
  // =========================================================================

  async _callButton(entityId, actionName, ev = null) {
    if (ev) ev.stopPropagation();
    if (!this.hass || !entityId) return;
    this._fireHaptic("medium");
    this._actionLoading = { ...this._actionLoading, [entityId]: true };
    try {
      await this.hass.callService("button", "press", { entity_id: entityId });
      this._showToast(`${actionName} command sent`);
    } catch (e) {
      console.error(`Failed to trigger ${actionName} on ${entityId}`, e);
      this._showToast(`Failed: ${actionName}`);
    } finally {
      setTimeout(() => {
        this._actionLoading = { ...this._actionLoading, [entityId]: false };
      }, 800);
    }
  }

  _toggleEntity(entityId, ev = null) {
    if (ev) ev.stopPropagation();
    if (!this.hass || !entityId) return;
    this._fireHaptic("light");
    const domain = entityId.split(".")[0];
    this.hass.callService(domain === "automation" ? "automation" : "homeassistant", "toggle", {
      entity_id: entityId,
    });
  }

  _setNumber(entityId, value, ev = null) {
    if (ev) ev.stopPropagation();
    if (!this.hass || !entityId) return;
    this._fireHaptic("light");
    this.hass.callService(entityId.split(".")[0], "set_value", {
      entity_id: entityId,
      value: Number(value),
    });
    this._showToast(`Set to ${Math.round(Number(value))}%`);
  }

  _setSelect(entityId, option, ev = null) {
    if (ev) ev.stopPropagation();
    if (!this.hass || !entityId) return;
    this._fireHaptic("light");
    this.hass.callService(entityId.split(".")[0], "select_option", {
      entity_id: entityId,
      option,
    });
  }

  _handleDrillClick(ev, dev) {
    if (ev) ev.stopPropagation();
    if (!dev.drill_button) return;
    if (this.config.confirm_drills !== false) {
      this._confirmDialog = {
        title: "Sound Alarm Drill?",
        message: `Trigger interconnected alarm drill on ${dev.name}? All linked sirens will sound briefly.`,
        action: () => this._callButton(dev.drill_button, "Alarm Drill"),
      };
    } else {
      this._callButton(dev.drill_button, "Alarm Drill");
    }
  }

  _toggleExpand(devId, ev) {
    if (ev) ev.stopPropagation();
    this._fireHaptic("light");
    this._expandedDevices = {
      ...this._expandedDevices,
      [devId]: !this._expandedDevices[devId],
    };
  }

  _toggleTray(trayKey, ev) {
    if (ev) {
      ev.stopPropagation();
      ev.preventDefault();
    }
    this._fireHaptic("light");
    this._expandedTrays = {
      ...this._expandedTrays,
      [trayKey]: !this._expandedTrays[trayKey],
    };
  }

  _handleMoreInfo(entityId, ev = null) {
    if (ev) ev.stopPropagation();
    if (!entityId) return;
    this._fireHaptic("light");
    this.dispatchEvent(
      new CustomEvent("hass-more-info", {
        detail: { entityId },
        bubbles: true,
        composed: true,
      })
    );
  }

  // =========================================================================
  // RENDERING: SUMMARY CARD MODE
  // =========================================================================

  _renderSummaryMode(topology, summary) {
    const c = this.config;
    const dotTone = summary.overallTone;

    return html`
      <div class="card-content ${c.show_header === false ? "no-header" : ""}">
        ${c.show_summary_strip !== false
          ? html`
              <div
                class="safety-summary-strip ${dotTone}"
                @click=${() => this._openModal("overview")}
                title="Tap to open Safety Command Center"
              >
                <div class="summary-strip-left">
                  <span class="summary-status-dot ${dotTone}"></span>
                  <span class="summary-status-label">${summary.headline}</span>
                  ${summary.hvacAutoObj
                    ? html`
                        <span class="summary-sep">•</span>
                        <span class="summary-meta-pill ${summary.hvacAutoArmed ? "armed" : "off"}">
                          <ha-icon icon="mdi:hvac-off"></ha-icon>
                          <span>HVAC Cutoff ${summary.hvacAutoArmed ? "Armed" : "Off"}</span>
                        </span>
                      `
                    : ""}
                </div>
                <div class="summary-strip-right">
                  <button
                    type="button"
                    class="strip-circle-btn"
                    @click=${(e) => this._openModal("controls", e)}
                    title="Controls & Audio"
                  >
                    <ha-icon icon="mdi:volume-high" style="--mdc-icon-size:15px;"></ha-icon>
                  </button>
                  <button
                    type="button"
                    class="strip-circle-btn"
                    @click=${(e) => this._openModal("overview", e)}
                    title="Open Safety Command Center"
                  >
                    <ha-icon icon="mdi:tune-variant" style="--mdc-icon-size:15px;"></ha-icon>
                  </button>
                </div>
              </div>
            `
          : ""}

        <div class="units-stack">
          ${c.summary_grouping === "devices"
            ? summary.devTels.map(({ dev, tel }) => this._renderSingleDetectorSummaryTile(dev, tel))
            : this._renderGroupedSummaryTiles(topology, summary)}
        </div>

        ${c.show_footer_strip !== false
          ? html`
              <div class="safety-footer-strip">
                <div class="footer-chips">
                  ${summary.expiringSoonList.length > 0
                    ? html`
                        <button
                          type="button"
                          class="footer-chip warning"
                          @click=${(e) => this._openModal("diagnostics", e)}
                        >
                          <ha-icon icon="mdi:calendar-alert" style="--mdc-icon-size:13px;"></ha-icon>
                          <span>${summary.expiringSoonList.length} Replace Soon</span>
                        </button>
                      `
                    : ""}
                  <button
                    type="button"
                    class="footer-chip"
                    @click=${(e) => this._openModal("diagnostics", e)}
                  >
                    <ha-icon icon="mdi:heart-pulse" style="--mdc-icon-size:13px;"></ha-icon>
                    <span>Self-Tests</span>
                  </button>
                  ${summary.hvacAutoObj
                    ? html`
                        <button
                          type="button"
                          class="footer-chip ${summary.hvacAutoArmed ? "info" : ""}"
                          @click=${(e) => this._toggleEntity(summary.hvacAutoId, e)}
                        >
                          <ha-icon icon="mdi:fan-off" style="--mdc-icon-size:13px;"></ha-icon>
                          <span>HVAC Cutoff</span>
                        </button>
                      `
                    : ""}
                </div>
                <button
                  type="button"
                  class="footer-command-link"
                  @click=${(e) => this._openModal("overview", e)}
                >
                  Command Center →
                </button>
              </div>
            `
          : ""}
      </div>
    `;
  }

  _renderGroupedSummaryTiles(topology, summary) {
    const nestItems = summary.devTels.filter((x) => x.dev.brand === "nest");
    const xsenseItems = summary.devTels.filter((x) => x.dev.brand === "x-sense");
    const otherItems = summary.devTels.filter(
      (x) => x.dev.brand !== "nest" && x.dev.brand !== "x-sense"
    );
    const layout = this.config?.layout === "rings" ? "rings" : "hero";
    const states = this.hass?.states || {};

    const tiles = [];

    if (nestItems.length > 0) {
      const onlineCount = nestItems.filter((x) => !x.tel.isOffline).length;
      const wiredCount = nestItems.filter((x) => x.tel.isWired).length;
      const acOkCount = nestItems.filter((x) => x.tel.isLinePowerOn).length;
      const minBat = nestItems.reduce(
        (m, x) => (x.tel.batteryPct !== null ? Math.min(m, x.tel.batteryPct) : m),
        100
      );
      const expiring = nestItems.filter((x) => x.tel.isExpiringSoon || x.tel.isExpired);
      const hasDanger = nestItems.some((x) => x.tel.tone === "danger");
      const hasWarn = nestItems.some((x) => x.tel.tone === "warning");
      const tileTone = hasDanger ? "state-danger" : hasWarn ? "state-warning" : "state-safe";
      const trayOpen = Boolean(this._expandedTrays["nest"]);

      tiles.push(html`
        <div
          class="unit-tile-card ${tileTone}"
          @click=${() => this._openModal("overview")}
          title="Tap to inspect Nest Protect detectors"
        >
          <div class="unit-tile-header">
            <div class="unit-tile-identity">
              <div class="model-thumb-box">
                ${this._renderNestProtectSvg(nestItems[0].tel, 36)}
              </div>
              <div class="unit-title-stack">
                <div class="unit-title-row">
                  <h3 class="unit-title">Nest Protect (${nestItems.length})</h3>
                  ${wiredCount > 0
                    ? html`<span class="zone-inline-chip ${acOkCount === wiredCount ? "good" : "warning"}">
                        ${acOkCount === wiredCount ? "120V AC" : `${wiredCount - acOkCount} No AC`}
                      </span>`
                    : ""}
                  ${expiring.length > 0
                    ? html`<span class="zone-inline-chip warning">
                        Replace ${expiring[0].dev.room} (${formatDateShort(expiring[0].tel.replaceByDate)})
                      </span>`
                    : ""}
                </div>
                <div class="unit-subtitle-row">
                  <span class="sub-truncate">${onlineCount}/${nestItems.length} Online • Smoke & CO Clear</span>
                  <span class="summary-sep">•</span>
                  <button
                    type="button"
                    class="inline-tray-btn ${trayOpen ? "open" : ""}"
                    @click=${(e) => this._toggleTray("nest", e)}
                  >
                    <span>Rooms</span>
                    <ha-icon icon="${trayOpen ? "mdi:chevron-up" : "mdi:chevron-down"}"></ha-icon>
                  </button>
                </div>
              </div>
            </div>

            ${layout === "rings"
              ? html`
                  <div class="summary-rings-pair">
                    ${this._renderRingMiniGauge(
                      Math.round((onlineCount / nestItems.length) * 100),
                      `${onlineCount}/${nestItems.length}`,
                      "Online",
                      onlineCount === nestItems.length ? "#16a34a" : "#f59e0b"
                    )}
                    ${this._renderRingMiniGauge(
                      minBat,
                      `${minBat}%`,
                      "Min Batt",
                      minBat <= 20 ? "#ef4444" : minBat <= 50 ? "#f59e0b" : "#16a34a"
                    )}
                  </div>
                `
              : html`
                  <div class="unit-primary-right">
                    <div class="unit-primary-val ${hasDanger ? "tone-danger" : hasWarn ? "tone-warn" : "tone-good"}">
                      ${hasDanger ? "ALERT" : hasWarn ? "CHECK" : "CLEAR"}
                    </div>
                    <div class="unit-primary-sub">Backup ${minBat}%+</div>
                  </div>
                `}
          </div>

          ${trayOpen
            ? html`
                <div class="unit-telemetry-tray" @click=${(e) => e.stopPropagation()}>
                  ${nestItems.map(
                    ({ dev, tel }) => html`
                      <div
                        class="telemetry-mini-card"
                        @click=${(e) => this._handleMoreInfo(dev.smoke_entity || dev.co_entity, e)}
                      >
                        <span class="t-mini-label">${dev.room}</span>
                        <span class="t-mini-val ${tel.tone === "danger" ? "tone-danger" : tel.tone === "warning" ? "tone-warn" : "tone-good"}">
                          ${tel.batteryPct !== null ? `${tel.batteryPct}%` : "OK"}${tel.isWired ? (tel.isLinePowerOn ? " · AC" : " · NO AC") : ""}
                        </span>
                        ${tel.replaceDays !== null && tel.replaceDays <= 180
                          ? html`<span class="t-mini-sub tone-warn">Exp ${tel.replaceDays}d</span>`
                          : ""}
                      </div>
                    `
                  )}
                </div>
              `
            : ""}
        </div>
      `);
    }

    if (xsenseItems.length > 0 || topology.baseStation) {
      const base = topology.baseStation;
      const baseConnected = base?.connected ? states[base.connected]?.state === "on" : true;
      const alarmVol = base?.alarm_volume ? states[base.alarm_volume]?.state : null;
      const wifiDbm = base?.wifi_signal ? states[base.wifi_signal]?.state : null;
      const maxCo = xsenseItems.reduce((mx, x) => (x.tel.coPpm !== null ? Math.max(mx, x.tel.coPpm) : mx), 0);
      const minBat = xsenseItems.reduce(
        (m, x) => (x.tel.batteryPct !== null ? Math.min(m, x.tel.batteryPct) : m),
        100
      );
      const hasDanger = xsenseItems.some((x) => x.tel.tone === "danger") || summary.baseAlarm;
      const hasWarn = xsenseItems.some((x) => x.tel.tone === "warning") || !baseConnected;
      const tileTone = hasDanger ? "state-danger" : hasWarn ? "state-warning" : "state-safe";
      const trayOpen = Boolean(this._expandedTrays["xsense"]);

      tiles.push(html`
        <div
          class="unit-tile-card ${tileTone}"
          @click=${() => this._openModal("overview")}
          title="Tap to inspect X-Sense detectors & base station"
        >
          <div class="unit-tile-header">
            <div class="unit-tile-identity">
              <div class="model-thumb-box">
                ${xsenseItems.length > 0
                  ? this._renderXsenseDetectorSvg(xsenseItems[0].tel, true, 36)
                  : this._renderBaseStationSvg(baseConnected, summary.baseAlarm, 36)}
              </div>
              <div class="unit-title-stack">
                <div class="unit-title-row">
                  <h3 class="unit-title">X-Sense System (${xsenseItems.length}${base ? " + Hub" : ""})</h3>
                  ${base
                    ? html`<span class="zone-inline-chip ${baseConnected ? "good" : "warning"}">
                        ${baseConnected ? "Hub Online" : "Hub Offline"}
                      </span>`
                    : ""}
                  ${wifiDbm !== null
                    ? html`<span class="zone-inline-chip neutral">${wifiDbm} dBm</span>`
                    : ""}
                </div>
                <div class="unit-subtitle-row">
                  <span class="sub-truncate">
                    ${xsenseItems.map((x) => x.dev.room).join(", ")}${alarmVol ? ` • Vol ${Math.round(parseFloat(alarmVol))}%` : ""}
                  </span>
                  <span class="summary-sep">•</span>
                  <button
                    type="button"
                    class="inline-tray-btn ${trayOpen ? "open" : ""}"
                    @click=${(e) => this._toggleTray("xsense", e)}
                  >
                    <span>Details</span>
                    <ha-icon icon="${trayOpen ? "mdi:chevron-up" : "mdi:chevron-down"}"></ha-icon>
                  </button>
                </div>
              </div>
            </div>

            ${layout === "rings"
              ? html`
                  <div class="summary-rings-pair">
                    ${this._renderRingMiniGauge(
                      minBat,
                      `${minBat}%`,
                      "Battery",
                      minBat <= 20 ? "#ef4444" : "#16a34a"
                    )}
                    ${this._renderRingMiniGauge(
                      Math.min(100, (maxCo / 50) * 100),
                      `${maxCo}`,
                      "CO ppm",
                      maxCo >= 30 ? "#ef4444" : "#0284c7"
                    )}
                  </div>
                `
              : html`
                  <div class="unit-primary-right">
                    <div class="unit-primary-val ${maxCo >= 30 ? "tone-danger" : "tone-good"}">
                      ${maxCo} ppm
                    </div>
                    <div class="unit-primary-sub">Batt ${minBat}%</div>
                  </div>
                `}
          </div>

          ${trayOpen
            ? html`
                <div class="unit-telemetry-tray" @click=${(e) => e.stopPropagation()}>
                  ${xsenseItems.map(
                    ({ dev, tel }) => html`
                      <div class="telemetry-mini-card" @click=${(e) => this._handleMoreInfo(dev.smoke_entity, e)}>
                        <span class="t-mini-label">${dev.room}</span>
                        <span class="t-mini-val ${tel.tone === "safe" ? "tone-good" : "tone-warn"}">
                          ${tel.coPpm ?? 0} ppm · ${tel.batteryPct ?? "--"}%
                        </span>
                      </div>
                    `
                  )}
                  ${base
                    ? html`
                        <div class="telemetry-mini-card" @click=${(e) => this._openModal("controls", e)}>
                          <span class="t-mini-label">SBS50 Hub</span>
                          <span class="t-mini-val">${baseConnected ? "Ready" : "Offline"}</span>
                        </div>
                      `
                    : ""}
                </div>
              `
            : ""}
        </div>
      `);
    }

    otherItems.forEach(({ dev, tel }) => tiles.push(this._renderSingleDetectorSummaryTile(dev, tel)));
    return tiles;
  }

  _renderSingleDetectorSummaryTile(dev, tel) {
    const layout = this.config?.layout === "rings" ? "rings" : "hero";
    const tileTone =
      tel.tone === "danger" ? "state-danger" : tel.tone === "warning" ? "state-warning" : "state-safe";
    const trayOpen = Boolean(this._expandedTrays[dev.id]);

    return html`
      <div class="unit-tile-card ${tileTone}" @click=${() => this._openModal("overview")}>
        <div class="unit-tile-header">
          <div class="unit-tile-identity">
            <div class="model-thumb-box">
              ${dev.brand === "nest"
                ? this._renderNestProtectSvg(tel, 36)
                : this._renderXsenseDetectorSvg(tel, true, 36)}
            </div>
            <div class="unit-title-stack">
              <div class="unit-title-row">
                <h3 class="unit-title">${dev.name}</h3>
                ${tel.isWired
                  ? html`<span class="zone-inline-chip ${tel.isLinePowerOn ? "good" : "warning"}">
                      ${tel.isLinePowerOn ? "AC" : "Battery"}
                    </span>`
                  : ""}
                ${tel.isSilenced ? html`<span class="zone-inline-chip warning">Muted</span>` : ""}
                ${tel.isExpiringSoon || tel.isExpired
                  ? html`<span class="zone-inline-chip ${tel.isExpired ? "danger" : "warning"}">
                      ${tel.isExpired ? "Expired" : `Exp ${tel.replaceDays}d`}
                    </span>`
                  : ""}
              </div>
              <div class="unit-subtitle-row">
                <span class="sub-truncate">
                  ${tel.isSmokeEmergency ? "SMOKE" : tel.isCoEmergency ? "CO ALARM" : "Smoke & CO Clear"}
                  ${tel.coPpm !== null ? ` • ${tel.coPpm} ppm` : ""}
                </span>
                <span class="summary-sep">•</span>
                <button
                  type="button"
                  class="inline-tray-btn ${trayOpen ? "open" : ""}"
                  @click=${(e) => this._toggleTray(dev.id, e)}
                >
                  <span>Actions</span>
                  <ha-icon icon="${trayOpen ? "mdi:chevron-up" : "mdi:chevron-down"}"></ha-icon>
                </button>
              </div>
            </div>
          </div>

          ${layout === "rings" && tel.batteryPct !== null
            ? this._renderRingMiniGauge(
                tel.batteryPct,
                `${tel.batteryPct}%`,
                "Batt",
                tel.batteryPct <= 20 ? "#ef4444" : "#16a34a"
              )
            : html`
                <div class="unit-primary-right">
                  <div class="unit-primary-val ${tel.tone === "danger" ? "tone-danger" : tel.tone === "warning" ? "tone-warn" : "tone-good"}">
                    ${tel.batteryPct !== null ? `${tel.batteryPct}%` : "CLEAR"}
                  </div>
                  <div class="unit-primary-sub">${tel.isWired ? "Wired" : "Battery"}</div>
                </div>
              `}
        </div>

        ${trayOpen
          ? html`
              <div class="unit-telemetry-tray" @click=${(e) => e.stopPropagation()}>
                ${dev.mute_button
                  ? html`<button class="tray-action-btn" @click=${(e) => this._callButton(dev.mute_button, "Mute", e)}>Mute</button>`
                  : ""}
                ${dev.test_button
                  ? html`<button class="tray-action-btn" @click=${(e) => this._callButton(dev.test_button, "Test", e)}>Self-Test</button>`
                  : ""}
                <button class="tray-action-btn" @click=${(e) => this._handleMoreInfo(dev.smoke_entity || dev.co_entity, e)}>Details</button>
              </div>
            `
          : ""}
      </div>
    `;
  }

  // =========================================================================
  // RENDERING: 3-TAB COMMAND CENTER (Used in Full Mode & Summary Modal Popup)
  // =========================================================================

  _renderCommandCenterTabs(topology, summary) {
    return html`
      <div class="popup-tabs">
        ${SAFETY_TABS.map(
          (t) => html`
            <button
              type="button"
              class="popup-tab ${this._activeTab === t.id ? "active-tab" : ""}"
              @click=${() => this._switchTab(t.id)}
            >
              <ha-icon icon="${t.icon}"></ha-icon>
              <span>${t.label}</span>
            </button>
          `
        )}
      </div>
    `;
  }

  _renderCommandCenterBody(topology, summary) {
    return html`
      <div class="view-container ${this._animDirection}">
        ${this._activeTab === "overview"
          ? this._renderOverviewTab(topology, summary)
          : this._activeTab === "controls"
          ? this._renderControlsTab(topology, summary)
          : this._renderDiagnosticsTab(topology, summary)}
      </div>
    `;
  }

  _renderOverviewTab(topology, summary) {
    const states = this.hass?.states || {};
    const base = topology.baseStation;

    return html`
      ${this.config.show_summary_banner !== false
        ? html`
            <div class="summary-grid">
              <div class="summary-stat-box ${summary.activeSmoke > 0 ? "alert" : summary.headsUpCount > 0 ? "warning" : "normal"}">
                <div class="stat-icon-box ${summary.activeSmoke > 0 ? "alert" : "good"}">
                  <ha-icon icon="${summary.activeSmoke > 0 ? "mdi:fire" : "mdi:smoke-detector"}"></ha-icon>
                </div>
                <div class="stat-text-area">
                  <span class="stat-label">Smoke</span>
                  <span class="stat-value">
                    ${summary.activeSmoke > 0
                      ? `${summary.activeSmoke} Alert`
                      : summary.headsUpCount > 0
                      ? "Heads-Up"
                      : "All Clear"}
                  </span>
                </div>
              </div>

              <div class="summary-stat-box ${summary.activeCO > 0 ? "alert" : "normal"}">
                <div class="stat-icon-box ${summary.activeCO > 0 ? "alert" : "good"}">
                  <ha-icon icon="mdi:molecule-co"></ha-icon>
                </div>
                <div class="stat-text-area">
                  <span class="stat-label">Carbon Monoxide</span>
                  <span class="stat-value">${summary.activeCO > 0 ? `${summary.activeCO} Detected` : "0 ppm Clear"}</span>
                </div>
              </div>

              <div class="summary-stat-box ${summary.lowBattery > 0 || summary.powerLostCount > 0 || summary.expiringSoonList.length > 0 ? "warning" : "normal"}">
                <div class="stat-icon-box ${summary.lowBattery > 0 || summary.powerLostCount > 0 || summary.expiringSoonList.length > 0 ? "warning" : "good"}">
                  <ha-icon icon="${summary.lowBattery > 0 ? "mdi:battery-alert" : "mdi:shield-check"}"></ha-icon>
                </div>
                <div class="stat-text-area">
                  <span class="stat-label">System Health</span>
                  <span class="stat-value">
                    ${summary.powerLostCount > 0
                      ? `${summary.powerLostCount} On Batt`
                      : summary.expiringSoonList.length > 0
                      ? `${summary.expiringSoonList.length} Expire Soon`
                      : summary.minBattery !== null
                      ? `Min Batt ${summary.minBattery}%`
                      : "Healthy"}
                  </span>
                </div>
              </div>
            </div>
          `
        : ""}

      ${base
        ? html`
            <div class="detector-card ${!summary.baseConnected ? "warning-card" : ""}">
              <div class="detector-header" @click=${(e) => this._handleMoreInfo(base.connected, e)}>
                ${this._renderBaseStationSvg(summary.baseConnected, summary.baseAlarm, 40)}
                <div class="detector-title-wrap">
                  <h3 class="detector-name">${base.name} (${base.model})</h3>
                  <span class="detector-sub">
                    ${base.ssid && states[base.ssid] ? `Wi-Fi: ${states[base.ssid].state}` : "Wireless Bridge"}
                    ${base.wifi_signal && states[base.wifi_signal] ? ` • ${states[base.wifi_signal].state} dBm` : ""}
                    ${base.ip_address && states[base.ip_address] ? ` • ${states[base.ip_address].state}` : ""}
                  </span>
                </div>
                <div class="header-pills-area">
                  <span class="chip-pill ${summary.baseConnected ? "good" : "critical"}">
                    ${summary.baseConnected ? "Connected" : "Offline"}
                  </span>
                  ${summary.baseDrill ? html`<span class="chip-pill warning">Drill Active</span>` : ""}
                </div>
              </div>
            </div>
          `
        : ""}

      <div class="section-label-row">
        <span class="section-label-text">Monitored Detectors</span>
        <span class="slots-badge-counter">${topology.devices.length} Devices</span>
      </div>

      <div class="devices-grid">
        ${summary.devTels.map(({ dev, tel }) => this._renderDetectorFullCard(dev, tel))}
      </div>
    `;
  }

  _renderDetectorFullCard(dev, tel) {
    const states = this.hass?.states || {};
    const isExpanded = !!this._expandedDevices[dev.id];
    const cardCls =
      tel.tone === "danger" ? "danger-card" : tel.tone === "warning" ? "warning-card" : "";

    return html`
      <div class="detector-card ${cardCls}">
        <div class="detector-header" @click=${(e) => this._handleMoreInfo(dev.smoke_entity || dev.co_entity, e)}>
          ${dev.brand === "nest"
            ? this._renderNestProtectSvg(tel, 42)
            : this._renderXsenseDetectorSvg(
                tel,
                dev.switches.some((s) => s.includes("led_indicator") && states[s]?.state === "on"),
                42
              )}
          <div class="detector-title-wrap">
            <h3 class="detector-name">${dev.name}</h3>
            <span class="detector-sub">
              ${dev.brand === "x-sense"
                ? "X-Sense XP0A-MR Talking Smoke & CO"
                : dev.brand === "nest"
                ? `Nest Protect 2nd Gen${tel.isWired ? " (Wired AC)" : ""}`
                : "Smoke & CO Sensor"}
            </span>
          </div>

          <div class="header-pills-area">
            ${tel.isOffline ? html`<span class="chip-pill critical">Offline</span>` : ""}
            ${tel.isSilenced ? html`<span class="chip-pill warning">Hushed</span>` : ""}
            ${tel.isWired
              ? html`<span class="chip-pill ${tel.isLinePowerOn ? "info" : "warning"}">
                  <ha-icon icon="${tel.isLinePowerOn ? "mdi:power-plug" : "mdi:power-plug-off"}" style="--mdc-icon-size:12px;"></ha-icon>
                  ${tel.isLinePowerOn ? "AC" : "No AC"}
                </span>`
              : ""}
            ${tel.batteryPct !== null
              ? html`<span class="chip-pill ${tel.batteryPct <= 20 ? "critical" : tel.batteryPct <= 50 ? "warning" : "good"}">
                  <ha-icon icon="mdi:battery" style="--mdc-icon-size:12px;"></ha-icon>
                  ${tel.batteryPct}%
                </span>`
              : ""}
          </div>
        </div>

        <div class="badge-container">
          <span
            class="status-badge ${tel.isSmokeEmergency ? "danger" : tel.isSmokeHeadsUp ? "warning" : "success"}"
            @click=${(e) => this._handleMoreInfo(dev.smoke_alarm_state_entity || dev.smoke_entity, e)}
          >
            <ha-icon icon="${tel.isSmokeEmergency ? "mdi:fire" : "mdi:smoke-detector"}" style="--mdc-icon-size:13px;"></ha-icon>
            ${tel.isSmokeEmergency ? "Smoke Emergency" : tel.isSmokeHeadsUp ? "Smoke Heads-Up" : "Smoke Clear"}
          </span>

          <span
            class="status-badge ${tel.isCoEmergency ? "danger" : tel.isCoHeadsUp ? "warning" : "success"}"
            @click=${(e) => this._handleMoreInfo(dev.co_reading_entity || dev.co_entity, e)}
          >
            <ha-icon icon="mdi:molecule-co" style="--mdc-icon-size:13px;"></ha-icon>
            ${tel.isCoEmergency
              ? `CO Alarm${tel.coPpm !== null ? ` (${tel.coPpm} ppm)` : ""}`
              : tel.coPpm !== null
              ? `CO: ${tel.coPpm} ppm`
              : "CO Clear"}
          </span>

          ${tel.isTampered
            ? html`<span class="status-badge danger">Removed from Base!</span>`
            : ""}

          ${tel.replaceByDate
            ? html`<span
                class="status-badge ${tel.isExpired ? "danger" : tel.isExpiringSoon ? "warning" : "info"}"
                @click=${(e) => this._handleMoreInfo(dev.replace_by_sensor, e)}
              >
                <ha-icon icon="mdi:calendar-clock" style="--mdc-icon-size:13px;"></ha-icon>
                ${tel.isExpired
                  ? `Expired (${formatDateShort(tel.replaceByDate)})`
                  : tel.isExpiringSoon
                  ? `Replace in ${tel.replaceDays}d (${formatDateShort(tel.replaceByDate)})`
                  : `Exp ${formatDateShort(tel.replaceByDate)}`}
              </span>`
            : ""}
        </div>

        ${dev.mute_button || dev.test_button || dev.drill_button
          ? html`
              <div class="action-btn-row">
                ${dev.mute_button
                  ? html`
                      <button
                        class="control-btn mute ${this._actionLoading[dev.mute_button] ? "loading" : ""}"
                        @click=${(e) => this._callButton(dev.mute_button, "Mute", e)}
                      >
                        <ha-icon icon="mdi:volume-off"></ha-icon>
                        <span>Mute</span>
                      </button>
                    `
                  : ""}
                ${dev.test_button
                  ? html`
                      <button
                        class="control-btn test ${this._actionLoading[dev.test_button] ? "loading" : ""}"
                        @click=${(e) => this._callButton(dev.test_button, "Device Test", e)}
                      >
                        <ha-icon icon="mdi:bell-ring-outline"></ha-icon>
                        <span>Test</span>
                      </button>
                    `
                  : ""}
                ${dev.drill_button
                  ? html`
                      <button
                        class="control-btn drill ${this._actionLoading[dev.drill_button] ? "loading" : ""}"
                        @click=${(e) => this._handleDrillClick(e, dev)}
                      >
                        <ha-icon icon="mdi:alarm-light-outline"></ha-icon>
                        <span>Drill</span>
                      </button>
                    `
                  : ""}
              </div>
            `
          : ""}

        <div
          class="activity-expand-bar ${isExpanded ? "open" : ""}"
          @click=${(e) => this._toggleExpand(dev.id, e)}
        >
          <span>Quick Diagnostics & Toggles</span>
          <ha-icon icon="${isExpanded ? "mdi:chevron-up" : "mdi:chevron-down"}" style="--mdc-icon-size:16px;"></ha-icon>
        </div>

        ${isExpanded
          ? html`
              <div class="drawer-list">
                ${dev.last_audio_test_sensor && states[dev.last_audio_test_sensor]
                  ? html`<div class="drawer-row"><span>Last Sound Check</span><strong>${formatDateShort(states[dev.last_audio_test_sensor].state)}</strong></div>`
                  : ""}
                ${dev.test_time_sensor && states[dev.test_time_sensor] && states[dev.test_time_sensor].state !== "unknown"
                  ? html`<div class="drawer-row"><span>Last Manual Test</span><strong>${formatDateShort(states[dev.test_time_sensor].state)}</strong></div>`
                  : ""}
                ${dev.signal_strength_sensor && states[dev.signal_strength_sensor]
                  ? html`<div class="drawer-row"><span>RF Signal</span><strong>${states[dev.signal_strength_sensor].state}</strong></div>`
                  : ""}
                ${dev.switches.map((swId) => {
                  const swObj = states[swId];
                  if (!swObj) return "";
                  const isOn = swObj.state === "on";
                  const label = (swObj.attributes?.friendly_name || swId).replace(dev.name, "").trim();
                  return html`
                    <div class="drawer-row">
                      <span>${label}</span>
                      <button
                        type="button"
                        class="switch-pill ${isOn ? "active" : ""}"
                        @click=${(e) => this._toggleEntity(swId, e)}
                      >
                        ${isOn ? "ON" : "OFF"}
                      </button>
                    </div>
                  `;
                })}
              </div>
            `
          : ""}
      </div>
    `;
  }

  _renderControlsTab(topology, summary) {
    const states = this.hass?.states || {};
    const base = topology.baseStation;

    return html`
      ${summary.hvacAutoObj
        ? html`
            <div class="passable-section-card">
              <div class="passable-section-header">
                <span class="passable-section-title">Emergency Automations</span>
                <span class="chip-pill ${summary.hvacAutoArmed ? "good" : "warning"}">
                  ${summary.hvacAutoArmed ? "Armed" : "Disabled"}
                </span>
              </div>
              <div class="drawer-row">
                <div class="row-text-stack">
                  <strong>Turn Off HVAC on Smoke/CO</strong>
                  <span>Pauses climate zones immediately if any detector alerts</span>
                </div>
                <button
                  type="button"
                  class="switch-pill ${summary.hvacAutoArmed ? "active" : ""}"
                  @click=${(e) => this._toggleEntity(summary.hvacAutoId, e)}
                >
                  ${summary.hvacAutoArmed ? "ARMED" : "OFF"}
                </button>
              </div>
            </div>
          `
        : ""}

      ${base
        ? html`
            <div class="passable-section-card">
              <div class="passable-section-header">
                <span class="passable-section-title">${base.name} Audio & LED</span>
                <span class="chip-pill ${summary.baseConnected ? "good" : "critical"}">SBS50</span>
              </div>

              ${base.alarm_volume && states[base.alarm_volume]
                ? this._renderSliderControl("Alarm Volume", base.alarm_volume, states[base.alarm_volume])
                : ""}
              ${base.voice_volume && states[base.voice_volume]
                ? this._renderSliderControl("Voice Volume", base.voice_volume, states[base.voice_volume])
                : ""}
              ${base.alarm_tone && states[base.alarm_tone]
                ? this._renderSelectChips("Alarm Tone", base.alarm_tone, states[base.alarm_tone], "Tone ")
                : ""}
              ${base.led_brightness && states[base.led_brightness]
                ? this._renderSelectChips("Hub LED Brightness", base.led_brightness, states[base.led_brightness], "Level ")
                : ""}
            </div>
          `
        : ""}

      ${summary.devTels.map(({ dev }) => {
        const hasAudioOrLight =
          dev.alarm_volume_number || dev.alarm_tone_select || dev.brightness_select || dev.switches.length > 0;
        if (!hasAudioOrLight) return "";

        return html`
          <div class="passable-section-card">
            <div class="passable-section-header">
              <span class="passable-section-title">${dev.name}</span>
            </div>

            ${dev.alarm_volume_number && states[dev.alarm_volume_number]
              ? this._renderSliderControl("Siren Volume", dev.alarm_volume_number, states[dev.alarm_volume_number])
              : ""}
            ${dev.alarm_tone_select && states[dev.alarm_tone_select]
              ? this._renderSelectChips("Siren Tone", dev.alarm_tone_select, states[dev.alarm_tone_select], "Tone ")
              : ""}
            ${dev.brightness_select && states[dev.brightness_select]
              ? this._renderSelectChips("Night Light Brightness", dev.brightness_select, states[dev.brightness_select])
              : ""}

            ${dev.switches.map((swId) => {
              const swObj = states[swId];
              if (!swObj) return "";
              const isOn = swObj.state === "on";
              const label = (swObj.attributes?.friendly_name || swId)
                .replace(/^Nest Protect \([^)]+\)\s*/i, "")
                .replace(/^.*?Smoke\/CO\s*/i, "")
                .trim();
              return html`
                <div class="drawer-row">
                  <span>${label}</span>
                  <button
                    type="button"
                    class="switch-pill ${isOn ? "active" : ""}"
                    @click=${(e) => this._toggleEntity(swId, e)}
                  >
                    ${isOn ? "ON" : "OFF"}
                  </button>
                </div>
              `;
            })}
          </div>
        `;
      })}
    `;
  }

  _renderSliderControl(label, entityId, stateObj) {
    const val = Math.round(parseFloat(stateObj.state) || 0);
    const min = stateObj.attributes?.min ?? 0;
    const max = stateObj.attributes?.max ?? 100;
    const step = stateObj.attributes?.step ?? 5;
    return html`
      <div class="slider-control">
        <div class="slider-header">
          <span>${label}</span>
          <span class="slider-val">${val}%</span>
        </div>
        <input
          type="range"
          class="p-range-input"
          min="${min}"
          max="${max}"
          step="${step}"
          .value=${String(val)}
          @change=${(e) => this._setNumber(entityId, e.target.value, e)}
        />
      </div>
    `;
  }

  _renderSelectChips(label, entityId, stateObj, prefix = "") {
    const rawOpts = stateObj.attributes?.options || [];
    const opts = rawOpts.filter((o) => !["unknown", "unavailable"].includes(String(o).toLowerCase()));
    if (opts.length === 0) return "";
    const curValid = opts.includes(stateObj.state) ? stateObj.state : opts[0];
    const icon = label.toLowerCase().includes("tone")
      ? "mdi:bell-ring-outline"
      : label.toLowerCase().includes("led") || label.toLowerCase().includes("brightness")
      ? "mdi:brightness-6"
      : "mdi:tune";
    return html`
      <div class="passable-select-row">
        <div class="select-row-label">
          <ha-icon icon="${icon}" style="--mdc-icon-size:17px; color:var(--primary-color);"></ha-icon>
          <span>${label}</span>
        </div>
        <div class="select-wrap">
          <select
            class="passable-select"
            aria-label="${label}"
            .value=${String(curValid)}
            @change=${(e) => this._setSelect(entityId, e.target.value, e)}
          >
            ${opts.map(
              (opt) => html`<option value="${opt}" ?selected=${opt === curValid}>${prefix}${String(opt).replace(/\b\w/g, (l) => l.toUpperCase())}</option>`
            )}
          </select>
          <ha-icon icon="mdi:chevron-down" class="select-chevron"></ha-icon>
        </div>
      </div>
    `;
  }

  _renderDiagnosticsTab(topology, summary) {
    const states = this.hass?.states || {};
    const testLabels = {
      smoke_test: "Smoke Sensor",
      co_test: "CO Sensor",
      buzzer_test: "Siren Buzzer",
      speaker_test: "Voice Speaker",
      wifi_test: "Wi-Fi Radio",
      led_test: "Status Ring",
      pir_test: "Motion PIR",
      humidity_test: "Humidity Sensor",
    };

    return html`
      ${summary.devTels.map(({ dev, tel }) => html`
        <div class="passable-section-card">
          <div class="passable-section-header">
            <span class="passable-section-title">${dev.name}</span>
            ${tel.replaceByDate
              ? html`<span class="chip-pill ${tel.isExpired ? "critical" : tel.isExpiringSoon ? "warning" : "good"}">
                  ${tel.isExpired
                    ? "Expired"
                    : tel.isExpiringSoon
                    ? `Replace in ${tel.replaceDays}d`
                    : `Replace ${formatDateShort(tel.replaceByDate)}`}
                </span>`
              : dev.end_of_life_entity && states[dev.end_of_life_entity]
              ? html`<span class="chip-pill ${tel.isEol ? "critical" : "good"}">
                  ${tel.isEol ? "End of Life" : "Sensor Healthy"}
                </span>`
              : ""}
          </div>

          <div class="diag-list">
            ${dev.line_power_entity && states[dev.line_power_entity]
              ? html`<div class="diag-row" @click=${(e) => this._handleMoreInfo(dev.line_power_entity, e)}>
                  <span>AC Mains Power</span>
                  <strong class="${tel.isLinePowerOn ? "tone-good" : "tone-warn"}">
                    ${tel.isLinePowerOn ? "120V AC Connected" : "Power Lost (Backup Batt)"}
                  </strong>
                </div>`
              : ""}
            ${dev.co_previous_peak_entity && states[dev.co_previous_peak_entity]
              ? html`<div class="diag-row">
                  <span>CO Previous Peak</span>
                  <strong>${states[dev.co_previous_peak_entity].state} ppm</strong>
                </div>`
              : ""}
            ${dev.last_audio_test_sensor && states[dev.last_audio_test_sensor]
              ? html`<div class="diag-row">
                  <span>Sound Check (Audio Test)</span>
                  <strong>${formatDateShort(states[dev.last_audio_test_sensor].state)}</strong>
                </div>`
              : ""}
            ${dev.test_time_sensor && states[dev.test_time_sensor] && states[dev.test_time_sensor].state !== "unknown"
              ? html`<div class="diag-row">
                  <span>Last Manual Test</span>
                  <strong>${formatDateShort(states[dev.test_time_sensor].state)}</strong>
                </div>`
              : ""}
            ${dev.test_result_sensor && states[dev.test_result_sensor]
              ? html`<div class="diag-row">
                  <span>Test Result</span>
                  <strong>${states[dev.test_result_sensor].state}</strong>
                </div>`
              : ""}
            ${dev.signal_strength_sensor && states[dev.signal_strength_sensor]
              ? html`<div class="diag-row">
                  <span>RF Signal Strength</span>
                  <strong class="tone-good">${states[dev.signal_strength_sensor].state}</strong>
                </div>`
              : ""}
            ${dev.report_time_sensor && states[dev.report_time_sensor]
              ? html`<div class="diag-row">
                  <span>Last Check-In</span>
                  <strong>${formatRelativeTime(states[dev.report_time_sensor].state)}</strong>
                </div>`
              : ""}
          </div>

          ${tel.componentTestKeys.length > 0
            ? html`
                <div class="component-test-grid">
                  ${tel.componentTestKeys.map((k) => {
                    const tEnt = states[dev.component_tests[k]];
                    const failed = tEnt?.state === "on";
                    return html`
                      <div
                        class="component-test-pill ${failed ? "fail" : "pass"}"
                        @click=${(e) => this._handleMoreInfo(dev.component_tests[k], e)}
                      >
                        <ha-icon icon="${failed ? "mdi:close-circle" : "mdi:check-circle"}" style="--mdc-icon-size:13px;"></ha-icon>
                        <span>${testLabels[k] || k}</span>
                      </div>
                    `;
                  })}
                </div>
              `
            : ""}
        </div>
      `)}
    `;
  }

  _renderModal(topology, summary) {
    if (!this._modalOpen || this.config?.display_mode !== "summary") return "";
    return html`
      <div
        class="popup-overlay"
        @click=${(ev) => {
          if (ev.target === ev.currentTarget) this._closeModal();
        }}
      >
        <div
          class="popup-content"
          @click=${(ev) => ev.stopPropagation()}
          @touchstart=${this._handlePopupTouchStart}
          @touchmove=${this._handlePopupTouchMove}
          @touchend=${this._handlePopupTouchEnd}
        >
          <div class="drag-handle"></div>
          <div class="toast ${this._toastMsg ? "show" : ""}">
            <ha-icon icon="mdi:check-circle" style="--mdc-icon-size:16px;"></ha-icon>
            <span>${this._toastMsg}</span>
          </div>
          <div class="popup-header">
            <div class="popup-header-left">
              <div class="popup-badge-icon ${summary.overallTone}">
                <ha-icon icon="${this.config.icon || "mdi:fire-alert"}" style="--mdc-icon-size:19px;"></ha-icon>
              </div>
              <div class="popup-title-stack">
                <h3>${this.config.title || "Safety Command Center"}</h3>
                <div class="popup-header-sub">${summary.headline}</div>
              </div>
            </div>
            <button
              type="button"
              class="close-button"
              @click=${() => this._closeModal()}
              aria-label="Close"
            >
              <ha-icon icon="mdi:close"></ha-icon>
            </button>
          </div>

          ${this._renderCommandCenterTabs(topology, summary)}

          <div class="modal-scroll-area thin-scroll">
            ${this._renderCommandCenterBody(topology, summary)}
          </div>
        </div>
      </div>
    `;
  }

  // =========================================================================
  // MAIN RENDER
  // =========================================================================

  render() {
    if (!this.hass || !this.config) return html``;

    const topology = this._discoverSafetyTopology();
    const summary = this._getGlobalSummary(topology);
    const isSummaryMode = this.config.display_mode === "summary";
    const title = this.config.title || "Smoke & CO Safety Center";
    const subtitle =
      this.config.subtitle ||
      `${topology.devices.length} Monitored Detectors${topology.baseStation ? " • Base Hub Online" : ""}`;

    return html`
      <ha-card>
        <div class="toast ${this._toastMsg && !this._modalOpen ? "show" : ""}">
          <ha-icon icon="mdi:check-circle" style="--mdc-icon-size:16px;"></ha-icon>
          <span>${this._toastMsg}</span>
        </div>

        ${this.config.show_header !== false
          ? html`
              <div class="header">
                <div class="header-left">
                  <h1 class="title">
                    <ha-icon
                      icon="${this.config.icon || "mdi:shield-check"}"
                      style="margin-right: 8px; color: var(--primary-color);"
                    ></ha-icon>
                    ${title}
                  </h1>
                  <p class="subtitle">${subtitle}</p>
                </div>
                <div class="header-right">
                  <span class="header-state-chip ${summary.overallTone}">
                    ${summary.overallTone === "danger"
                      ? "ALERT"
                      : summary.overallTone === "warning"
                      ? "ATTENTION"
                      : "ALL CLEAR"}
                  </span>
                </div>
              </div>
            `
          : ""}

        ${isSummaryMode
          ? this._renderSummaryMode(topology, summary)
          : html`
              <div class="card-content ${this.config.show_header === false ? "no-header" : ""}">
                ${this._renderCommandCenterTabs(topology, summary)}
                ${this._renderCommandCenterBody(topology, summary)}
              </div>
            `}

        ${this._renderModal(topology, summary)}

        ${this._confirmDialog
          ? html`
              <div class="confirm-overlay" @click=${() => (this._confirmDialog = null)}>
                <div class="confirm-card" @click=${(e) => e.stopPropagation()}>
                  <div class="confirm-header">
                    <ha-icon icon="mdi:alert-outline" style="color: var(--error-color, #ef4444);"></ha-icon>
                    <span>${this._confirmDialog.title}</span>
                  </div>
                  <div class="confirm-body">${this._confirmDialog.message}</div>
                  <div class="confirm-actions">
                    <button type="button" class="btn-cancel" @click=${() => (this._confirmDialog = null)}>
                      Cancel
                    </button>
                    <button
                      type="button"
                      class="btn-danger"
                      @click=${() => {
                        this._confirmDialog.action?.();
                        this._confirmDialog = null;
                      }}
                    >
                      Sound Drill
                    </button>
                  </div>
                </div>
              </div>
            `
          : ""}
      </ha-card>
    `;
  }

  // =========================================================================
  // THEME-SAFE PASSABLE DESIGN SYSTEM STYLES
  // =========================================================================

  static get styles() {
    return css`
      :host {
        display: block;
        width: 100%;
        box-sizing: border-box;
      }

      ha-card {
        border-radius: var(--ha-card-border-radius, 12px);
        background: var(--ha-card-background, var(--card-background-color, #fff));
        box-shadow: var(--ha-card-box-shadow, 0 2px 4px rgba(0, 0, 0, 0.1));
        color: var(--primary-text-color);
        position: relative;
        overflow: hidden;
        box-sizing: border-box;
      }

      .toast {
        position: fixed;
        top: 18px;
        left: 50%;
        transform: translateX(-50%) translateY(-14px);
        background: var(--primary-text-color);
        color: var(--card-background-color, #fff);
        padding: 8px 16px;
        border-radius: 999px;
        font-size: 12.5px;
        font-weight: 700;
        pointer-events: none;
        opacity: 0;
        transition: all 0.25s ease;
        z-index: 10005;
        display: flex;
        align-items: center;
        gap: 6px;
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.28);
      }
      .toast.show {
        opacity: 1;
        transform: translateX(-50%) translateY(0);
      }

      .header {
        padding: 16px 16px 14px;
        display: flex;
        justify-content: space-between;
        align-items: flex-end;
        gap: 10px;
        border-bottom: 1px solid var(--divider-color, #e0e0e0);
        margin-bottom: 12px;
      }
      .header-left {
        display: flex;
        flex-direction: column;
        min-width: 0;
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
        margin: 4px 0 0;
      }
      .header-right {
        flex-shrink: 0;
      }
      .header-state-chip {
        font-size: 11px;
        font-weight: 700;
        padding: 3px 9px;
        border-radius: 999px;
        text-transform: uppercase;
      }
      .header-state-chip.safe {
        background: rgba(34, 197, 94, 0.16);
        color: #16a34a;
      }
      .header-state-chip.warning {
        background: rgba(245, 158, 11, 0.18);
        color: #d97706;
      }
      .header-state-chip.danger {
        background: rgba(239, 68, 68, 0.2);
        color: #ef4444;
      }

      .card-content {
        padding: 12px;
        display: flex;
        flex-direction: column;
        gap: 10px;
      }
      .card-content.no-header {
        padding: 10px;
      }
      .header + .card-content {
        padding-top: 0;
      }

      /* SUMMARY STRIP */
      .safety-summary-strip {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
        padding: 7px 12px;
        min-height: 36px;
        border-radius: 12px;
        background: var(--secondary-background-color, rgba(128, 128, 128, 0.1));
        border: 1px solid var(--divider-color, rgba(128, 128, 128, 0.16));
        cursor: pointer;
        box-sizing: border-box;
      }
      .safety-summary-strip.safe {
        background: rgba(34, 197, 94, 0.08);
        border-color: rgba(34, 197, 94, 0.3);
      }
      .safety-summary-strip.warning {
        background: rgba(245, 158, 11, 0.1);
        border-color: rgba(245, 158, 11, 0.36);
      }
      .safety-summary-strip.danger {
        background: rgba(239, 68, 68, 0.12);
        border-color: rgba(239, 68, 68, 0.45);
      }
      .summary-strip-left {
        display: flex;
        align-items: center;
        gap: 6px;
        min-width: 0;
        overflow: hidden;
        white-space: nowrap;
      }
      .summary-strip-right {
        display: flex;
        align-items: center;
        gap: 6px;
        flex-shrink: 0;
      }
      .summary-status-dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        flex-shrink: 0;
      }
      .summary-status-dot.safe {
        background: #22c55e;
        box-shadow: 0 0 6px rgba(34, 197, 94, 0.6);
      }
      .summary-status-dot.warning {
        background: #f59e0b;
        box-shadow: 0 0 7px rgba(245, 158, 11, 0.7);
      }
      .summary-status-dot.danger {
        background: #ef4444;
        box-shadow: 0 0 8px rgba(239, 68, 68, 0.85);
        animation: gentle-pulse 1.3s ease-in-out infinite;
      }
      @keyframes gentle-pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.45; }
      }
      .summary-status-label {
        font-size: 13.5px;
        font-weight: 700;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .summary-sep {
        opacity: 0.4;
        font-size: 12px;
      }
      .summary-meta-pill {
        display: inline-flex;
        align-items: center;
        gap: 3px;
        font-size: 12px;
        font-weight: 600;
        color: var(--secondary-text-color);
      }
      .summary-meta-pill.armed {
        color: #16a34a;
      }
      .summary-meta-pill ha-icon {
        --mdc-icon-size: 14px;
      }
      .strip-circle-btn {
        width: 28px;
        height: 28px;
        border-radius: 50%;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        background: var(--card-background-color, rgba(128, 128, 128, 0.1));
        border: 1px solid var(--divider-color, rgba(128, 128, 128, 0.2));
        color: var(--primary-text-color);
        cursor: pointer;
        padding: 0;
      }
      .strip-circle-btn:hover {
        border-color: var(--primary-color, #03a9f4);
      }

      /* SUMMARY TILES */
      .units-stack {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
      .unit-tile-card {
        background: var(--secondary-background-color, rgba(128, 128, 128, 0.08));
        border: 1px solid var(--divider-color, rgba(128, 128, 128, 0.16));
        border-radius: 14px;
        padding: 11px 13px;
        display: flex;
        flex-direction: column;
        gap: 8px;
        cursor: pointer;
        transition: border-color 0.2s ease, box-shadow 0.2s ease;
      }
      .unit-tile-card:hover {
        border-color: rgba(var(--rgb-primary-color, 3, 169, 244), 0.4);
      }
      .unit-tile-card.state-warning {
        background: rgba(245, 158, 11, 0.08);
        border-color: rgba(245, 158, 11, 0.42);
      }
      .unit-tile-card.state-danger {
        background: rgba(239, 68, 68, 0.1);
        border-color: rgba(239, 68, 68, 0.55);
      }
      .unit-tile-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
      }
      .unit-tile-identity {
        display: flex;
        align-items: center;
        gap: 10px;
        min-width: 0;
        flex: 1;
      }
      .model-thumb-box {
        width: 42px;
        height: 42px;
        border-radius: 11px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: var(--card-background-color, #fff);
        border: 1px solid var(--divider-color, rgba(128, 128, 128, 0.18));
        flex-shrink: 0;
      }
      .unit-title-stack {
        display: flex;
        flex-direction: column;
        gap: 3px;
        min-width: 0;
        flex: 1;
      }
      .unit-title-row {
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        gap: 5px;
      }
      .unit-title {
        font-size: 15.5px;
        font-weight: 700;
        margin: 0;
        line-height: 1.2;
      }
      .unit-subtitle-row {
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 12.5px;
        font-weight: 600;
        color: var(--secondary-text-color);
        min-width: 0;
      }
      .sub-truncate {
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .inline-tray-btn {
        display: inline-flex;
        align-items: center;
        gap: 2px;
        padding: 2px 7px;
        border-radius: 999px;
        background: var(--card-background-color, rgba(128, 128, 128, 0.12));
        border: 1px solid var(--divider-color, rgba(128, 128, 128, 0.22));
        color: var(--primary-text-color);
        font-family: inherit;
        font-size: 11.5px;
        font-weight: 700;
        cursor: pointer;
        flex-shrink: 0;
      }
      .inline-tray-btn ha-icon {
        --mdc-icon-size: 14px;
      }
      .unit-primary-right {
        text-align: right;
        flex-shrink: 0;
      }
      .unit-primary-val {
        font-size: 20px;
        font-weight: 800;
        font-variant-numeric: tabular-nums;
        line-height: 1.1;
      }
      .unit-primary-sub {
        font-size: 12px;
        font-weight: 600;
        color: var(--secondary-text-color);
      }

      .summary-rings-pair {
        display: flex;
        align-items: center;
        gap: 10px;
        flex-shrink: 0;
      }
      .summary-ring-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 2px;
      }
      .summary-ring-wrap {
        position: relative;
        width: 42px;
        height: 42px;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .summary-ring-svg {
        width: 42px;
        height: 42px;
        transform: rotate(-90deg);
      }
      .summary-ring-val {
        position: absolute;
        font-size: 10.5px;
        font-weight: 800;
        font-variant-numeric: tabular-nums;
      }
      .summary-ring-label {
        font-size: 10px;
        font-weight: 700;
        color: var(--secondary-text-color);
      }

      .unit-telemetry-tray {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(95px, 1fr));
        gap: 6px;
        padding-top: 8px;
        border-top: 1px dashed var(--divider-color, rgba(128, 128, 128, 0.25));
      }
      .telemetry-mini-card {
        display: flex;
        flex-direction: column;
        gap: 1px;
        padding: 6px 8px;
        border-radius: 10px;
        background: var(--card-background-color, rgba(128, 128, 128, 0.08));
        border: 1px solid var(--divider-color, rgba(128, 128, 128, 0.16));
      }
      .t-mini-label {
        font-size: 10.5px;
        font-weight: 700;
        color: var(--secondary-text-color);
        text-transform: uppercase;
      }
      .t-mini-val {
        font-size: 12.5px;
        font-weight: 700;
      }
      .t-mini-sub {
        font-size: 10.5px;
        font-weight: 700;
      }
      .tray-action-btn {
        padding: 7px 10px;
        border-radius: 10px;
        border: 1px solid var(--divider-color);
        background: var(--card-background-color, #fff);
        color: var(--primary-text-color);
        font-family: inherit;
        font-size: 12px;
        font-weight: 700;
        cursor: pointer;
      }

      /* FOOTER STRIP */
      .safety-footer-strip {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
        flex-wrap: wrap;
        padding-top: 2px;
      }
      .footer-chips {
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        gap: 6px;
      }
      .footer-chip {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        padding: 4px 10px;
        border-radius: 999px;
        border: 1px solid var(--divider-color, rgba(128, 128, 128, 0.22));
        background: var(--secondary-background-color, rgba(128, 128, 128, 0.08));
        color: var(--primary-text-color);
        font-family: inherit;
        font-size: 12px;
        font-weight: 600;
        cursor: pointer;
      }
      .footer-chip.warning {
        background: rgba(245, 158, 11, 0.14);
        border-color: rgba(245, 158, 11, 0.36);
        color: #d97706;
      }
      .footer-chip.info {
        background: rgba(14, 165, 233, 0.14);
        border-color: rgba(14, 165, 233, 0.34);
        color: #0284c7;
      }
      .footer-command-link {
        background: none;
        border: none;
        color: var(--primary-color, #03a9f4);
        font-family: inherit;
        font-size: 12.5px;
        font-weight: 700;
        cursor: pointer;
        padding: 4px 2px;
      }

      /* INLINE & MODAL COMMAND CENTER TABS */
      .popup-tabs {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        background: var(--secondary-background-color, rgba(128, 128, 128, 0.12));
        padding: 4px;
        border-radius: 14px;
        gap: 4px;
        box-sizing: border-box;
      }
      .popup-tab {
        min-width: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
        padding: 8px 6px;
        border-radius: 10px;
        background: transparent;
        border: none;
        font-family: inherit;
        color: var(--secondary-text-color);
        font-size: 12px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s ease;
      }
      .popup-tab ha-icon {
        --mdc-icon-size: 16px;
      }
      .popup-tab.active-tab {
        background: var(--primary-color, #3b82f6);
        color: var(--text-primary-color, #ffffff);
        font-weight: 700;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.18);
      }

      .view-container {
        display: flex;
        flex-direction: column;
        gap: 10px;
        animation-duration: 0.22s;
        animation-fill-mode: both;
      }
      .slide-left { animation-name: slideLeft; }
      .slide-right { animation-name: slideRight; }
      @keyframes slideLeft {
        from { opacity: 0; transform: translateX(14px); }
        to { opacity: 1; transform: translateX(0); }
      }
      @keyframes slideRight {
        from { opacity: 0; transform: translateX(-14px); }
        to { opacity: 1; transform: translateX(0); }
      }

      /* COMMAND CENTER CONTENT */
      .summary-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
        gap: 8px;
      }
      .summary-stat-box {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 10px 12px;
        border-radius: 12px;
        background: var(--secondary-background-color, rgba(128, 128, 128, 0.08));
        border: 1px solid var(--divider-color, rgba(128, 128, 128, 0.16));
      }
      .summary-stat-box.alert {
        background: rgba(239, 68, 68, 0.12);
        border-color: rgba(239, 68, 68, 0.4);
      }
      .summary-stat-box.warning {
        background: rgba(245, 158, 11, 0.12);
        border-color: rgba(245, 158, 11, 0.36);
      }
      .stat-icon-box {
        width: 32px;
        height: 32px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        background: var(--card-background-color, #fff);
      }
      .stat-icon-box.good { color: #16a34a; }
      .stat-icon-box.warning { color: #d97706; }
      .stat-icon-box.alert { color: #ef4444; }
      .stat-icon-box ha-icon { --mdc-icon-size: 18px; }
      .stat-text-area {
        display: flex;
        flex-direction: column;
      }
      .stat-label {
        font-size: 10.5px;
        font-weight: 700;
        text-transform: uppercase;
        color: var(--secondary-text-color);
      }
      .stat-value {
        font-size: 13px;
        font-weight: 700;
      }

      .section-label-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-top: 2px;
      }
      .section-label-text {
        font-size: 11px;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.06em;
        color: var(--secondary-text-color);
      }
      .slots-badge-counter {
        font-size: 12px;
        font-weight: 600;
        color: var(--secondary-text-color);
      }

      .devices-grid {
        display: flex;
        flex-direction: column;
        gap: 10px;
      }
      .detector-card,
      .passable-section-card {
        background: var(--secondary-background-color, rgba(128, 128, 128, 0.08));
        border: 1px solid var(--divider-color, rgba(128, 128, 128, 0.16));
        border-radius: 16px;
        padding: 12px 13px;
        display: flex;
        flex-direction: column;
        gap: 9px;
      }
      .detector-card.warning-card {
        border-color: rgba(245, 158, 11, 0.45);
        background: rgba(245, 158, 11, 0.08);
      }
      .detector-card.danger-card {
        border-color: rgba(239, 68, 68, 0.55);
        background: rgba(239, 68, 68, 0.1);
      }
      .detector-header {
        display: flex;
        align-items: center;
        gap: 10px;
        cursor: pointer;
      }
      .detector-title-wrap {
        flex: 1;
        min-width: 0;
      }
      .detector-name {
        font-size: 15px;
        font-weight: 700;
        margin: 0;
      }
      .detector-sub {
        font-size: 11.5px;
        color: var(--secondary-text-color);
      }
      .header-pills-area {
        display: flex;
        align-items: center;
        gap: 5px;
        flex-wrap: wrap;
        justify-content: flex-end;
      }
      .chip-pill,
      .zone-inline-chip,
      .status-badge {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        padding: 2px 8px;
        border-radius: 999px;
        font-size: 11px;
        font-weight: 700;
      }
      .chip-pill.good, .zone-inline-chip.good, .status-badge.success {
        background: rgba(34, 197, 94, 0.16);
        color: #16a34a;
      }
      .chip-pill.warning, .zone-inline-chip.warning, .status-badge.warning {
        background: rgba(245, 158, 11, 0.16);
        color: #d97706;
      }
      .chip-pill.critical, .zone-inline-chip.danger, .status-badge.danger {
        background: rgba(239, 68, 68, 0.18);
        color: #ef4444;
      }
      .chip-pill.info, .status-badge.info {
        background: rgba(14, 165, 233, 0.16);
        color: #0284c7;
      }
      .zone-inline-chip.neutral {
        background: rgba(128, 128, 128, 0.15);
        color: var(--secondary-text-color);
      }
      .badge-container {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
      }
      .status-badge {
        cursor: pointer;
      }

      .action-btn-row {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(85px, 1fr));
        gap: 8px;
      }
      .control-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
        padding: 8px 10px;
        border-radius: 10px;
        border: 1px solid var(--divider-color, rgba(128, 128, 128, 0.22));
        background: var(--card-background-color, #fff);
        color: var(--primary-text-color);
        font-family: inherit;
        font-size: 12.5px;
        font-weight: 700;
        cursor: pointer;
      }
      .control-btn ha-icon { --mdc-icon-size: 16px; }
      .control-btn.mute ha-icon { color: #d97706; }
      .control-btn.test ha-icon { color: #0284c7; }
      .control-btn.drill ha-icon { color: #ef4444; }
      .control-btn.loading { opacity: 0.5; pointer-events: none; }

      .activity-expand-bar {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 6px 10px;
        border-radius: 10px;
        background: var(--card-background-color, rgba(128, 128, 128, 0.06));
        border: 1px solid var(--divider-color, rgba(128, 128, 128, 0.16));
        font-size: 11.5px;
        font-weight: 600;
        color: var(--secondary-text-color);
        cursor: pointer;
      }
      .drawer-list, .diag-list {
        display: flex;
        flex-direction: column;
        gap: 6px;
      }
      .drawer-row, .diag-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
        padding: 6px 8px;
        border-radius: 8px;
        background: var(--card-background-color, rgba(128, 128, 128, 0.06));
        border: 1px solid var(--divider-color, rgba(128, 128, 128, 0.12));
        font-size: 12.5px;
      }
      .row-text-stack {
        display: flex;
        flex-direction: column;
        gap: 2px;
      }
      .row-text-stack span {
        font-size: 11px;
        color: var(--secondary-text-color);
      }
      .switch-pill {
        border: 1px solid var(--divider-color);
        padding: 4px 12px;
        border-radius: 999px;
        font-family: inherit;
        font-size: 11px;
        font-weight: 700;
        cursor: pointer;
        background: var(--secondary-background-color);
        color: var(--secondary-text-color);
      }
      .switch-pill.active {
        background: var(--primary-color, #3b82f6);
        border-color: var(--primary-color, #3b82f6);
        color: var(--text-primary-color, #ffffff);
      }

      .passable-section-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 8px;
      }
      .passable-section-title {
        font-size: 12px;
        font-weight: 800;
        text-transform: uppercase;
        letter-spacing: 0.04em;
      }

      .slider-control {
        display: flex;
        flex-direction: column;
        gap: 4px;
      }
      .slider-header {
        display: flex;
        justify-content: space-between;
        font-size: 12.5px;
        font-weight: 600;
      }
      .slider-val {
        color: var(--primary-color, #3b82f6);
        font-weight: 700;
      }
      .p-range-input {
        width: 100%;
        accent-color: var(--primary-color, #3b82f6);
        cursor: pointer;
      }

      .passable-select-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
        padding: 7px 9px;
        border-radius: 10px;
        background: var(--card-background-color, #fff);
        border: 1px solid var(--divider-color, rgba(128, 128, 128, 0.18));
        font-size: 12.5px;
      }
      .select-row-label {
        display: flex;
        align-items: center;
        gap: 7px;
        font-weight: 600;
        min-width: 0;
      }
      .select-wrap {
        position: relative;
        display: inline-flex;
        align-items: center;
        flex-shrink: 0;
      }
      .passable-select {
        appearance: none;
        -webkit-appearance: none;
        padding: 6px 28px 6px 10px;
        border-radius: 9px;
        border: 1px solid var(--divider-color, rgba(128, 128, 128, 0.22));
        background: var(--secondary-background-color, rgba(128, 128, 128, 0.1));
        color: var(--primary-text-color);
        font-family: inherit;
        font-size: 12.5px;
        font-weight: 700;
        cursor: pointer;
        max-width: 210px;
        text-overflow: ellipsis;
      }
      .select-chevron {
        position: absolute;
        right: 7px;
        pointer-events: none;
        color: var(--secondary-text-color);
        --mdc-icon-size: 16px;
      }

      .component-test-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(115px, 1fr));
        gap: 6px;
        margin-top: 2px;
      }
      .component-test-pill {
        display: flex;
        align-items: center;
        gap: 5px;
        padding: 5px 8px;
        border-radius: 8px;
        font-size: 11.5px;
        font-weight: 600;
        cursor: pointer;
      }
      .component-test-pill.pass {
        background: rgba(34, 197, 94, 0.12);
        color: #16a34a;
      }
      .component-test-pill.fail {
        background: rgba(239, 68, 68, 0.16);
        color: #ef4444;
      }

      .tone-good { color: #16a34a; }
      .tone-warn { color: #d97706; }
      .tone-danger { color: #ef4444; }

      /* POPUP MODAL OVERLAY & RESPONSIVE SHEET */
      .popup-overlay {
        position: fixed;
        inset: 0;
        background: var(--mdc-dialog-scrim-color, rgba(0, 0, 0, 0.45));
        backdrop-filter: blur(3px);
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 16px;
        z-index: 9999;
      }
      .popup-content {
        background: var(--ha-card-background, var(--card-background-color, #fff));
        color: var(--primary-text-color);
        border: 1px solid var(--divider-color, rgba(128, 128, 128, 0.2));
        border-radius: 24px;
        width: min(94vw, 540px);
        max-height: 88vh;
        padding: 14px 16px 16px;
        display: flex;
        flex-direction: column;
        gap: 10px;
        box-shadow: 0 20px 48px rgba(0, 0, 0, 0.35);
        box-sizing: border-box;
      }
      .drag-handle { display: none; }
      .popup-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
      }
      .popup-header-left {
        display: flex;
        align-items: center;
        gap: 10px;
        min-width: 0;
      }
      .popup-badge-icon {
        width: 36px;
        height: 36px;
        border-radius: 10px;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
      }
      .popup-badge-icon.safe { background: rgba(34, 197, 94, 0.16); color: #16a34a; }
      .popup-badge-icon.warning { background: rgba(245, 158, 11, 0.18); color: #d97706; }
      .popup-badge-icon.danger { background: rgba(239, 68, 68, 0.2); color: #ef4444; }
      .popup-title-stack h3 {
        margin: 0;
        font-size: 16px;
        font-weight: 700;
      }
      .popup-header-sub {
        font-size: 12px;
        color: var(--secondary-text-color);
      }
      .close-button {
        background: none;
        border: none;
        padding: 6px;
        border-radius: 50%;
        color: var(--primary-text-color);
        cursor: pointer;
        display: flex;
      }
      .close-button:hover {
        background: rgba(128, 128, 128, 0.16);
      }
      .modal-scroll-area {
        overflow-y: auto;
        max-height: 64vh;
        display: flex;
        flex-direction: column;
        gap: 10px;
        padding-right: 3px;
      }
      .thin-scroll::-webkit-scrollbar { width: 5px; }
      .thin-scroll::-webkit-scrollbar-thumb {
        background: rgba(148, 163, 184, 0.35);
        border-radius: 999px;
      }

      /* CONFIRMATION DIALOG */
      .confirm-overlay {
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.55);
        backdrop-filter: blur(3px);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10002;
        padding: 16px;
      }
      .confirm-card {
        background: var(--ha-card-background, var(--card-background-color, #fff));
        color: var(--primary-text-color);
        border: 1px solid var(--divider-color);
        border-radius: 16px;
        padding: 18px;
        max-width: 360px;
        width: 100%;
        box-shadow: 0 12px 32px rgba(0, 0, 0, 0.35);
      }
      .confirm-header {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 16px;
        font-weight: 700;
        margin-bottom: 10px;
      }
      .confirm-body {
        font-size: 13px;
        color: var(--secondary-text-color);
        margin-bottom: 16px;
        line-height: 1.45;
      }
      .confirm-actions {
        display: flex;
        justify-content: flex-end;
        gap: 8px;
      }
      .btn-cancel, .btn-danger {
        padding: 8px 14px;
        border-radius: 10px;
        font-family: inherit;
        font-size: 13px;
        font-weight: 700;
        cursor: pointer;
      }
      .btn-cancel {
        background: var(--secondary-background-color, rgba(128, 128, 128, 0.14));
        color: var(--primary-text-color);
        border: 1px solid var(--divider-color);
      }
      .btn-danger {
        background: var(--error-color, #ef4444);
        color: #fff;
        border: none;
      }

      @media (max-width: 768px) {
        .popup-overlay {
          align-items: flex-end;
          padding: 0;
        }
        .popup-content {
          width: 100%;
          max-width: 100%;
          border-radius: 24px 24px 0 0;
          padding-bottom: max(24px, env(safe-area-inset-bottom, 24px));
        }
        .drag-handle {
          display: block;
          width: 36px;
          height: 5px;
          background: var(--secondary-text-color, #888);
          border-radius: 3px;
          margin: -2px auto 4px;
          opacity: 0.6;
        }
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
    };
  }

  setConfig(config) {
    this.config = config || {};
  }

  _valueChanged(ev) {
    if (!this.config || !this.hass) return;
    const target = ev.target;
    const configValue = target.configValue || target.getAttribute("configValue");
    if (!configValue) return;
    let newValue;
    if (target.tagName === "HA-SWITCH" || target.type === "checkbox") {
      newValue = target.checked;
    } else if (ev.detail && ev.detail.value !== undefined) {
      newValue = ev.detail.value;
    } else {
      newValue = target.value;
    }
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
        composed: true,
      })
    );
  }

  render() {
    if (!this.hass || !this.config) return html``;
    const c = this.config;
    const displayMode = c.display_mode === "summary" ? "summary" : "full";
    const showHeaderChecked =
      c.show_header !== undefined ? c.show_header !== false : displayMode === "full";

    return html`
      <div class="editor-container">
        <details class="section-card" open>
          <summary class="section-header">Display & Layout</summary>
          <div class="section-content">
            <div class="grid-2">
              <div class="field-col">
                <label class="field-label">Display Mode</label>
                <select
                  class="input-select"
                  .value=${displayMode}
                  .configValue=${"display_mode"}
                  @change=${this._valueChanged}
                >
                  <option value="full">Full Inline Command Center (Default)</option>
                  <option value="summary">Compact Summary + Popup</option>
                </select>
              </div>
              <div class="field-col">
                <label class="field-label">Summary Tile Style</label>
                <select
                  class="input-select"
                  .value=${c.layout === "rings" ? "rings" : "hero"}
                  .configValue=${"layout"}
                  @change=${this._valueChanged}
                >
                  <option value="hero">Hero Status</option>
                  <option value="rings">Ring Gauges</option>
                </select>
              </div>
            </div>

            <div class="field-col">
              <label class="field-label">Summary Grouping</label>
              <select
                class="input-select"
                .value=${c.summary_grouping === "devices" ? "devices" : "grouped"}
                .configValue=${"summary_grouping"}
                @change=${this._valueChanged}
              >
                <option value="grouped">Grouped by System (Nest Protect & X-Sense)</option>
                <option value="devices">Individual Tile per Detector</option>
              </select>
            </div>

            <div class="toggle-row">
              <span>Show Card Header</span>
              <ha-switch
                .checked=${showHeaderChecked}
                .configValue=${"show_header"}
                @change=${this._valueChanged}
              ></ha-switch>
            </div>
            <div class="toggle-row">
              <span>Show Summary Strip (Summary Mode)</span>
              <ha-switch
                .checked=${c.show_summary_strip !== false}
                .configValue=${"show_summary_strip"}
                @change=${this._valueChanged}
              ></ha-switch>
            </div>
            <div class="toggle-row">
              <span>Show Footer Strip (Summary Mode)</span>
              <ha-switch
                .checked=${c.show_footer_strip !== false}
                .configValue=${"show_footer_strip"}
                @change=${this._valueChanged}
              ></ha-switch>
            </div>
          </div>
        </details>

        <details class="section-card">
          <summary class="section-header">Header & Safety Behavior</summary>
          <div class="section-content">
            <ha-selector
              .hass=${this.hass}
              .selector=${{ text: {} }}
              .value=${c.title || "Smoke & CO Safety Center"}
              .label=${"Card Title"}
              .configValue=${"title"}
              @value-changed=${this._valueChanged}
            ></ha-selector>
            <ha-selector
              .hass=${this.hass}
              .selector=${{ text: {} }}
              .value=${c.subtitle || "Safety & Life Protection Command Center"}
              .label=${"Subtitle"}
              .configValue=${"subtitle"}
              @value-changed=${this._valueChanged}
            ></ha-selector>
            <ha-selector
              .hass=${this.hass}
              .selector=${{ icon: {} }}
              .value=${c.icon || "mdi:fire-alert"}
              .label=${"Header Icon"}
              .configValue=${"icon"}
              @value-changed=${this._valueChanged}
            ></ha-selector>
            <div class="toggle-row">
              <span>Confirm Before Sounding Alarm Drills</span>
              <ha-switch
                .checked=${c.confirm_drills !== false}
                .configValue=${"confirm_drills"}
                @change=${this._valueChanged}
              ></ha-switch>
            </div>
          </div>
        </details>

        <details class="section-card">
          <summary class="section-header">Discovery & Entity Overrides</summary>
          <div class="section-content">
            <div class="toggle-row">
              <span>Auto-Discover Nest Protect & X-Sense Devices</span>
              <ha-switch
                .checked=${c.auto_discover !== false}
                .configValue=${"auto_discover"}
                @change=${this._valueChanged}
              ></ha-switch>
            </div>
            <ha-selector
              .hass=${this.hass}
              .selector=${{ entity: { domain: "automation" } }}
              .value=${c.hvac_shutoff_automation || "automation.smoke_or_co_detected_turn_off_hvac"}
              .label=${"HVAC Shutoff Automation"}
              .configValue=${"hvac_shutoff_automation"}
              @value-changed=${this._valueChanged}
            ></ha-selector>
          </div>
        </details>
      </div>
    `;
  }

  static get styles() {
    return css`
      .editor-container {
        display: flex;
        flex-direction: column;
        gap: 10px;
        padding: 8px 0;
      }
      .section-card {
        border: 1px solid var(--divider-color, rgba(128, 128, 128, 0.2));
        border-radius: 10px;
        background: var(--secondary-background-color, rgba(128, 128, 128, 0.06));
        overflow: hidden;
      }
      .section-header {
        padding: 11px 14px;
        font-weight: 700;
        font-size: 13px;
        cursor: pointer;
      }
      .section-content {
        padding: 12px 14px;
        display: flex;
        flex-direction: column;
        gap: 12px;
        border-top: 1px solid var(--divider-color, rgba(128, 128, 128, 0.14));
      }
      .grid-2 {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 8px;
      }
      .field-col {
        display: flex;
        flex-direction: column;
        gap: 4px;
      }
      .field-label {
        font-size: 12px;
        font-weight: 600;
        color: var(--secondary-text-color);
      }
      .input-select {
        padding: 8px 10px;
        border-radius: 8px;
        border: 1px solid var(--divider-color);
        background: var(--card-background-color, #fff);
        color: var(--primary-text-color);
        font-family: inherit;
      }
      .toggle-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        font-size: 13px;
        font-weight: 500;
      }
    `;
  }
}

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
    "Passable design-system Smoke & CO safety center for Nest Protect and X-Sense detectors & base stations, with compact summary and 3-tab Command Center modes.",
  documentationURL: "https://github.com/GBear09/passable-safety-card",
});
