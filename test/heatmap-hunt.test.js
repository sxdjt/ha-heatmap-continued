'use strict';

/*
    Bugs found by the 2026-11 card review sweep (docs/card-review-plan.md in the
    monorepo). Each starts as a `todo` test describing the intended behavior and
    becomes a regular test when its fix lands.
*/

const test = require('node:test');
const assert = require('node:assert/strict');
const { loadCard } = require('./helpers/load-card.js');

const { HeatmapCard, HeatmapScales } = loadCard();

function hassWith(attributes) {
    return {
        config: { unit_system: { temperature: '°C' } },
        language: 'en',
        states: { 'sensor.a': { state: '1', attributes } }
    };
}

// A card that went through setConfig, as HA builds it, then populate_meta.
function metaFor(config, attributes) {
    const card = Object.create(HeatmapCard.prototype);
    card.scales = new HeatmapScales();
    card.setConfig({ entity: 'sensor.a', ...config });
    return card.populate_meta(hassWith(attributes));
}

test('H1: config device_class picks the scale for an entity without one', { todo: true }, () => {
    const meta = metaFor({ device_class: 'temperature' }, { unit_of_measurement: '°C', state_class: 'measurement' });
    assert.equal(meta.device_class, 'temperature');
    assert.equal(meta.scale.key, 'outdoor temperature');
});

test('H1: the entity\'s own device_class still wins over the config', () => {
    const meta = metaFor({ device_class: 'temperature' }, { device_class: 'humidity', state_class: 'measurement' });
    assert.equal(meta.device_class, 'humidity');
    assert.equal(meta.scale.key, 'stoplight');
});

test('H2: carbon_dioxide and pm25 sensors select their scales again', { todo: true }, () => {
    assert.equal(metaFor({}, { device_class: 'carbon_dioxide' }).scale.key, 'carbon dioxide');
    assert.equal(metaFor({}, { device_class: 'pm25' }).scale.key, 'pm25');
});

test('H3: every built-in scale has a name matching its key', { todo: true }, () => {
    const scales = new HeatmapScales();
    assert.equal(scales.scale_by_key['colorbrewer 5cl rdpu'].name, 'ColorBrewer 5-class RdPu');
});
