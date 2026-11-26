'use strict';

/*
    Loads heatmap-card.js into an isolated VM context so its internal classes and
    helpers can be unit tested in Node.

    heatmap-card.js is a browser-only Home Assistant Lovelace card: at module top
    level it reads `customElements.get("ha-panel-lovelace")` to derive its LitElement
    base class, and it registers custom elements and touches `window` on load. None of
    those globals exist in Node, so we run the file inside a `vm` context seeded with
    minimal stubs and then read back the (otherwise un-exported) internals via an
    appended epilogue.
*/

const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const CARD_PATH = path.join(__dirname, '..', '..', 'heatmap-card.js');
// First line after the vendored chroma.js; everything from here on is the card's own code.
const CARD_CODE_MARKER = '/* ------------------------------------------------------------------------- */\n/* LitElement via Home Assistant bundle';

/*
    options.customCards: false leaves window.customCards unset, as on a dashboard where
    this is the first custom card to load.
*/
function loadCard(options = {}) {
    const src = fs.readFileSync(CARD_PATH, 'utf8');

    // Stub the browser globals the card touches on load. `ha-panel-lovelace`
    // resolves to a subclass of BaseLitElement so that
    // `Object.getPrototypeOf(customElements.get("ha-panel-lovelace"))` yields a
    // class whose prototype carries the `html`/`css` tagged-template helpers.
    const preamble = `
        globalThis.window = globalThis;
        ${options.customCards === false ? '' : 'window.customCards = [];'}
        function __tag(strings, ...values) { return { strings, values }; }
        class BaseLitElement {}
        BaseLitElement.prototype.html = __tag;
        BaseLitElement.prototype.css = __tag;
        BaseLitElement.prototype.connectedCallback = function () {};
        BaseLitElement.prototype.disconnectedCallback = function () {};
        // Records listeners so editor tests can fire value-changed at the root.
        BaseLitElement.prototype.createRenderRoot = function () {
            const listeners = {};
            return {
                listeners,
                addEventListener(type, fn) { (listeners[type] = listeners[type] || []).push(fn); },
                querySelector() { return null; }
            };
        };
        BaseLitElement.prototype.dispatchEvent = function (event) {
            (this.dispatched_events = this.dispatched_events || []).push(event);
            return true;
        };
        globalThis.Event = class Event {
            constructor(type, init = {}) { this.type = type; Object.assign(this, init); }
        };
        const __registry = {};
        globalThis.customElements = {
            define(name, cls) { __registry[name] = cls; },
            get(name) {
                if (name === 'ha-panel-lovelace') { return class extends BaseLitElement {}; }
                return __registry[name];
            }
        };
        globalThis.document = {
            createElement() { return {}; },
            addEventListener() {},
            removeEventListener() {}
        };
    `;

    const epilogue = `
        globalThis.__card_exports = {
            HeatmapScales,
            HeatmapCard,
            HeatmapCardEditor,
            BUILTIN_SCALES,
            SCALE_ALIASES,
            label_stride,
            align_stride,
            local_hour_start,
            history_value,
            history_periods,
            history_to_statistics,
            fetch_history_statistics,
            steps_across_range,
            tidy_range,
            RANGE_FALLBACK,
            CUSTOM_SCALE_OPTION,
            DEFAULT_CUSTOM_STEPS,
            smooth_plateaus,
            MINUTE_INTERVALS,
            bucket_values,
            format_month_day,
            shorten_month,
            month_shortening_is_safe,
            DEVICE_CLASSES,
            entity_unit_system,
            conversions,
            chroma,
            // The VM's global object, for tests that stub a browser API (ResizeObserver).
            vm_global: globalThis
        };
    `;

    // URL as in the browser (scale docs links go through safe_http_url()).
    const context = { console, URL };
    vm.createContext(context);
    /*
        Separate scripts in one context: top-level declarations share the context's
        global scope, so later scripts see earlier ones' classes and constants. The
        card's own code runs under its absolute path at its real position (blanks stand
        in for the vendored chroma.js above it), so coverage reports
        `heatmap-card.js` and leaves the third-party minified library out.
    */
    const split = src.indexOf(CARD_CODE_MARKER);
    if (split < 0) { throw new Error('load-card: chroma.js end marker not found'); }
    const vendor = src.slice(0, split);
    // Same length and line breaks as the vendor text: coverage maps character offsets
    // back onto the file on disk, so the card's code must sit at its real offsets.
    const vendor_blank = vendor.replace(/[^\n]/g, ' ');
    vm.runInContext(preamble, context, { filename: 'load-card-preamble.js' });
    vm.runInContext(vendor, context, { filename: 'vendor-chroma.js' });
    vm.runInContext(vendor_blank + src.slice(split), context, { filename: CARD_PATH });
    vm.runInContext(epilogue, context, { filename: 'load-card-epilogue.js' });
    return context.__card_exports;
}

module.exports = { loadCard };
