// @ai-generated - Claude Opus 5.5 (Anthropic)
/**
 * Regression tests for the 2026-10-12 audit follow-ups:
 * - SC-02 / INFO-03 (CWE-353): world-map page pins its CDN dependencies with
 *   Subresource Integrity, and the topology fetch is version-pinned + hashed.
 * - INFO-03 (CWE-79): world-map tooltip is built with textContent, not innerHTML.
 * - INFO-04 (CWE-1321): content-labeling setState() refuses prototype keys.
 * - INFO-05 (CWE-22): autofill.js rejects a --locale that is not a shipped locale.
 */

'use strict';

var test = require('node:test');
var assert = require('node:assert/strict');
var path = require('path');
var fs = require('fs');
var os = require('os');
var vm = require('vm');
var { spawnSync } = require('child_process');

var ROOT = path.join(__dirname, '..');
var MAP_COPIES = [
  'AI-Regulations-World-Map.html',
  path.join('docs', 'world-map.html'),
  path.join('skills', 'ai-compliance', 'references', 'regulations', 'AI-Regulations-World-Map.html')
];
var CONTENT_LABELING = path.join(ROOT, 'tools', 'interactive', 'content-labeling.html');
var AUTOFILL = path.join(ROOT, 'tools', 'autofill.js');

// Hashes computed from the exact CDN URLs (cross-checked against the cdnjs
// SRI API and the jsDelivr package hash listing on 2026-10-12).
var D3_SRI = 'sha512-vc58qvvBdrDR4etbxMdlTt4GBQk1qjvyORR2nrsPsFPyrs+/u5c3+1Ct6upOgdZoIl7eq6k3a1UPDSNAQi/32A==';
var TOPOJSON_SRI = 'sha512-4UKI/XKm3xrvJ6pZS5oTRvIQGIzZFoXR71rRBb1y2N+PbwAsKa5tPl2J6WvbEvwN3TxQCm8hMzsl/pO+82iRlg==';
var ATLAS_SRI = 'sha384-yOCJ+8ShBm8UDqtAVtAvxTDDf4gXo5edxl/YG0FmVC5OTmqVLl7utuVGBDEeZWHf';

function read(rel) {
  return fs.readFileSync(path.join(ROOT, rel), 'utf8');
}

function scriptTag(html, srcFragment) {
  var re = new RegExp('<script[^>]*src="[^"]*' + srcFragment.replace(/[.*+?^${}()|[\]\\\/]/g, '\\$&') + '"[^>]*>');
  var m = html.match(re);
  return m ? m[0] : null;
}

// ── World map: SRI + pinning ─────────────────────────────────────────────────

test('world-map copies are byte-identical', function () {
  var first = read(MAP_COPIES[0]);
  for (var i = 1; i < MAP_COPIES.length; i++) {
    assert.equal(read(MAP_COPIES[i]), first, MAP_COPIES[i] + ' differs from ' + MAP_COPIES[0]);
  }
});

MAP_COPIES.forEach(function (rel) {
  test(rel + ': d3 and topojson script tags carry SRI + crossorigin', function () {
    var html = read(rel);
    var d3 = scriptTag(html, 'cdnjs.cloudflare.com/ajax/libs/d3/7.9.0/d3.min.js');
    var topo = scriptTag(html, 'cdnjs.cloudflare.com/ajax/libs/topojson/3.0.2/topojson.min.js');
    assert.ok(d3, 'd3 script tag present');
    assert.ok(topo, 'topojson script tag present');
    assert.ok(d3.indexOf('integrity="' + D3_SRI + '"') !== -1, 'd3 integrity: ' + d3);
    assert.ok(topo.indexOf('integrity="' + TOPOJSON_SRI + '"') !== -1, 'topojson integrity: ' + topo);
    assert.ok(/crossorigin="anonymous"/.test(d3), 'd3 crossorigin');
    assert.ok(/crossorigin="anonymous"/.test(topo), 'topojson crossorigin');
    // Every external script must be hashed.
    var scripts = html.match(/<script[^>]*\ssrc="https?:[^>]*>/g) || [];
    scripts.forEach(function (s) {
      assert.ok(/\sintegrity="sha(256|384|512)-/.test(s), 'external script without SRI: ' + s);
    });
  });

  test(rel + ': world-atlas topology is version-pinned and integrity-checked', function () {
    var html = read(rel);
    assert.ok(!/world-atlas@2\//.test(html), 'floating world-atlas@2 still referenced');
    var m = html.match(/d3\.json\(\s*'https:\/\/cdn\.jsdelivr\.net\/npm\/world-atlas@2\.0\.2\/countries-110m\.json'\s*,\s*\{([^}]*)\}\s*\)/);
    assert.ok(m, 'd3.json must fetch world-atlas@2.0.2 with an options object');
    assert.ok(m[1].indexOf("integrity: '" + ATLAS_SRI + "'") !== -1, 'topology integrity option: ' + m[1]);
  });

  test(rel + ': no innerHTML anywhere in the page', function () {
    assert.ok(!/innerHTML/.test(read(rel)), 'innerHTML found');
  });
});

// Minimal DOM stub: enough for createElement / className / textContent / appendChild / replaceChildren.
function fakeDocument() {
  function Node(tag) {
    this.tagName = tag;
    this.className = '';
    this.children = [];
    this._text = '';
  }
  Object.defineProperty(Node.prototype, 'textContent', {
    get: function () { return this._text + this.children.map(function (c) { return c.textContent; }).join(''); },
    set: function (v) { this._text = String(v); this.children = []; }
  });
  Object.defineProperty(Node.prototype, 'innerHTML', {
    get: function () { throw new Error('innerHTML read'); },
    set: function () { throw new Error('innerHTML write'); }
  });
  Node.prototype.appendChild = function (c) { this.children.push(c); return c; };
  Node.prototype.replaceChildren = function () { this.children = Array.prototype.slice.call(arguments); this._text = ''; };
  return { createElement: function (t) { return new Node(t); }, Node: Node };
}

test('world-map tooltip renders hostile text as text, preserving structure', function () {
  var html = read(MAP_COPIES[0]);
  var m = html.match(/function fillTooltip\([^)]*\)\s*\{[\s\S]*?\n\}/);
  assert.ok(m, 'fillTooltip() helper present');
  var doc = fakeDocument();
  var ctx = vm.createContext({ document: doc, catLabels: { enacted: 'Enacted comprehensive AI law' } });
  vm.runInContext(m[0], ctx);
  var tip = doc.createElement('div');
  var evil = '<img src=x onerror=alert(1)>';
  ctx.fillTooltip(tip, { cat: 'enacted', name: evil, detail: 'Cyber & Data', via: 'EU' });
  var kids = tip.children;
  assert.deepEqual(kids.map(function (k) { return k.className; }), ['tt-name', 'tt-status', 'tt-detail', 'tt-via']);
  assert.equal(kids[0].textContent, evil);
  assert.equal(kids[1].textContent, 'Enacted comprehensive AI law');
  assert.equal(kids[2].textContent, 'Cyber & Data');
  assert.equal(kids[3].textContent, 'Coverage via: EU');
  // Optional rows are omitted when empty.
  ctx.fillTooltip(tip, { cat: 'enacted', name: 'X', detail: '', via: '' });
  assert.equal(tip.children.length, 2);
});

// ── content-labeling: prototype pollution guard ──────────────────────────────

function loadSetState() {
  var html = fs.readFileSync(CONTENT_LABELING, 'utf8');
  var m = html.match(/setState: (function\(s\) \{[\s\S]*?\n      initState\(\);\n    \})/);
  assert.ok(m, 'setState() block located');
  var ctx = vm.createContext({});
  vm.runInContext(
    'var state = { contentTypes: {}, explicitLabels: {}, chinaMetadata: {}, californiaSB942: {}, euMetadata: {},' +
    ' checklist: { design: {}, coding: {}, testing: {} }, evidenceLog: [] };' +
    'function initState() {}' +
    'var setState = ' + m[1] + ';', ctx);
  return ctx;
}

test('content-labeling setState ignores __proto__ in checklist (two-level)', function () {
  var ctx = loadSetState();
  vm.runInContext('setState(JSON.parse(\'{"checklist":{"__proto__":{"polluted":true},"design":{"ok":true}}}\'))', ctx);
  assert.equal(vm.runInContext('({}).polluted', ctx), undefined, 'Object.prototype polluted');
  assert.equal(vm.runInContext('state.checklist.design.ok', ctx), true, 'legit keys still merged');
});

test('content-labeling setState ignores prototype keys in contentTypes / explicitLabels', function () {
  var ctx = loadSetState();
  vm.runInContext(
    'setState(JSON.parse(\'{"contentTypes":{"__proto__":{"polluted":1},"image":{"generated":true}},' +
    '"explicitLabels":{"constructor":{"x":1},"prototype":{"y":1},"text":{"labelText":"AI"}}}\'))', ctx);
  assert.equal(vm.runInContext('Object.getPrototypeOf(state.contentTypes) === Object.prototype', ctx), true);
  assert.equal(vm.runInContext('state.contentTypes.polluted', ctx), undefined);
  assert.equal(vm.runInContext('Object.prototype.hasOwnProperty.call(state.explicitLabels, "constructor")', ctx), false);
  assert.equal(vm.runInContext('Object.prototype.hasOwnProperty.call(state.explicitLabels, "prototype")', ctx), false);
  assert.equal(vm.runInContext('state.contentTypes.image.generated', ctx), true);
  assert.equal(vm.runInContext('state.explicitLabels.text.labelText', ctx), 'AI');
});

test('content-labeling setState ignores a checklist "constructor" phase', function () {
  var ctx = loadSetState();
  vm.runInContext('setState(JSON.parse(\'{"checklist":{"constructor":{"prototype":{"polluted":true}}}}\'))', ctx);
  assert.equal(vm.runInContext('({}).polluted', ctx), undefined);
  assert.equal(vm.runInContext('Object.prototype.hasOwnProperty.call(state.checklist, "constructor")', ctx), false);
});

// ── autofill: --locale path traversal ───────────────────────────────────────

function makeConfig(dir) {
  var cfg = JSON.parse(fs.readFileSync(path.join(ROOT, 'tools', 'compliance-config.example.json'), 'utf8'));
  var p = path.join(dir, 'config.json');
  fs.writeFileSync(p, JSON.stringify(cfg, null, 2), 'utf8');
  return p;
}

['../../x', '..', 'en/../../x', 'xx-YY', 'zz'].forEach(function (bad) {
  test('autofill rejects --locale ' + JSON.stringify(bad) + ' and writes nothing outside the output dir', function () {
    var dir = fs.mkdtempSync(path.join(os.tmpdir(), 'llmc-locale-'));
    try {
      var out = path.join(dir, 'a', 'b', 'out');
      var r = spawnSync(process.execPath,
        [AUTOFILL, '--config', makeConfig(dir), '--output', out, '--locale', bad, '--template', '01'],
        { encoding: 'utf8' });
      assert.notEqual(r.status, 0, 'expected non-zero exit; stdout=' + r.stdout);
      assert.ok(/locale/i.test(r.stderr), 'stderr names the locale problem: ' + r.stderr);
      // Nothing may appear anywhere under the temp root except the config we wrote.
      var entries = fs.readdirSync(dir).sort();
      assert.deepEqual(entries, ['config.json'], 'unexpected writes: ' + entries.join(','));
    } finally {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });
});

test('autofill still accepts a shipped locale (fr)', function () {
  var dir = fs.mkdtempSync(path.join(os.tmpdir(), 'llmc-locale-'));
  try {
    var out = path.join(dir, 'out');
    var r = spawnSync(process.execPath,
      [AUTOFILL, '--config', makeConfig(dir), '--output', out, '--locale', 'fr', '--template', '01'],
      { encoding: 'utf8' });
    assert.equal(r.status, 0, r.stderr);
    assert.ok(fs.readdirSync(path.join(out, 'fr')).some(function (f) { return /^01-.*\.md$/.test(f); }), 'fr/01 written');
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});
