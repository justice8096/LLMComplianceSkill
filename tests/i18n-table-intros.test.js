// @ai-generated - Claude Opus 5.5 (Anthropic)
/**
 * The one-line sentences above template tables are translated through the
 * tableIntros section of each locale file. These tests catch drift: a
 * sentence edited in a template but not in en.json, a stale key, or a
 * generated template that still contains an English intro line.
 */

'use strict';

var test = require('node:test');
var assert = require('node:assert/strict');
var fs = require('fs');
var os = require('os');
var path = require('path');
var { spawnSync } = require('child_process');

var ROOT = path.join(__dirname, '..');
var TEMPLATES = path.join(ROOT, 'templates');
var LOCALES = path.join(ROOT, 'tools', 'i18n', 'locales');
var GENERATOR = path.join(ROOT, 'tools', 'i18n', 'generate-templates.js');
var NON_EN = ['zh-CN', 'ko', 'ja', 'pt-BR', 'es', 'fr'];

function readLocale(code) {
  return JSON.parse(fs.readFileSync(path.join(LOCALES, code + '.json'), 'utf8'));
}

function templateLines() {
  var lines = new Set();
  fs.readdirSync(TEMPLATES).filter(function(f) { return /^\d\d-.*\.md$/.test(f); }).forEach(function(f) {
    fs.readFileSync(path.join(TEMPLATES, f), 'utf8').split(/\r?\n/).forEach(function(l) { lines.add(l.trim()); });
  });
  return lines;
}

var en = readLocale('en');
var intros = Object.keys(en.tableIntros || {});

test('en.json has table intro sentences', function() {
  assert.ok(intros.length > 100, 'expected the tableIntros section to be populated');
});

test('every tableIntros key still appears in a template', function() {
  var lines = templateLines();
  var stale = intros.filter(function(k) { return !lines.has(k); });
  assert.deepEqual(stale, [], 'stale tableIntros keys (edit en.json and every locale): ' + stale.join(' | '));
});

test('en.json tableIntros values equal their keys', function() {
  intros.forEach(function(k) { assert.equal(en.tableIntros[k], k); });
});

NON_EN.forEach(function(code) {
  test(code + ': every table intro is translated and keeps placeholders and symbols', function() {
    var loc = readLocale(code);
    intros.forEach(function(k) {
      var v = loc.tableIntros[k];
      assert.ok(typeof v === 'string' && v.trim().length > 0, code + ' missing: ' + k);
      ['●', '—'].forEach(function(sym) {
        if (k.indexOf(sym) !== -1) assert.ok(v.indexOf(sym) !== -1, code + ' dropped ' + sym + ' in: ' + k);
      });
    });
    ['pct.aboutInTen', 'pct.countOf'].forEach(function(key) {
      var phs = (en.ui[key].match(/\{\w+\}/g) || []);
      phs.forEach(function(ph) { assert.ok(loc.ui[key].indexOf(ph) !== -1, code + ' ui.' + key + ' lost ' + ph); });
    });
  });
});

test('generated Spanish templates contain no English intro lines', function() {
  var out = fs.mkdtempSync(path.join(os.tmpdir(), 'i18n-intros-'));
  try {
    var r = spawnSync(process.execPath, [GENERATOR, '--locale', 'es', '--output', out], { encoding: 'utf8' });
    assert.equal(r.status, 0, r.stdout + r.stderr);
    var set = new Set(intros);
    var leftovers = [];
    fs.readdirSync(out).forEach(function(f) {
      fs.readFileSync(path.join(out, f), 'utf8').split(/\r?\n/).forEach(function(l) {
        if (set.has(l.trim())) leftovers.push(f + ': ' + l.trim());
      });
    });
    assert.deepEqual(leftovers, []);
  } finally {
    fs.rmSync(out, { recursive: true, force: true });
  }
});
