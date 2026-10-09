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

function loadCard() {
    const src = fs.readFileSync(CARD_PATH, 'utf8');

    // Stub the browser globals the card touches on load. `ha-panel-lovelace`
    // resolves to a subclass of BaseLitElement so that
    // `Object.getPrototypeOf(customElements.get("ha-panel-lovelace"))` yields a
    // class whose prototype carries the `html`/`css` tagged-template helpers.
    const preamble = `
        globalThis.window = globalThis;
        window.customCards = [];
        function __tag(strings, ...values) { return { strings, values }; }
        class BaseLitElement {}
        BaseLitElement.prototype.html = __tag;
        BaseLitElement.prototype.css = __tag;
        const __registry = {};
        globalThis.customElements = {
            define(name, cls) { __registry[name] = cls; },
            get(name) {
                if (name === 'ha-panel-lovelace') { return class extends BaseLitElement {}; }
                return __registry[name];
            }
        };
        globalThis.document = { createElement() { return {}; } };
    `;

    const epilogue = `
        globalThis.__card_exports = {
            HeatmapScales,
            HeatmapCard,
            BUILTIN_SCALES,
            SCALE_ALIASES,
            label_stride,
            align_stride,
            local_hour_start,
            MINUTE_INTERVALS,
            bucket_values,
            format_month_day,
            shorten_month,
            month_shortening_is_safe,
            DEVICE_CLASSES,
            conversions,
            chroma
        };
    `;

    const context = { console };
    vm.createContext(context);
    vm.runInContext(preamble + '\n' + src + '\n' + epilogue, context, { filename: 'heatmap-card.js' });
    return context.__card_exports;
}

module.exports = { loadCard };
