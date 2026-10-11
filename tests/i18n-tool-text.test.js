// @ai-generated - Claude Opus 5.5 (Anthropic)
/**
 * toolText holds translations for on-screen text that the tools build from
 * English literals (see i18nTranslateDom in tools/interactive/shared.js).
 * These tests catch a renamed tool file, an English string that was edited
 * in a tool but not in en.json, and missing translations.
 */

'use strict';

var test = require('node:test');
var assert = require('node:assert/strict');
var fs = require('fs');
var path = require('path');

var ROOT = path.join(__dirname, '..');
var TOOLS = path.join(ROOT, 'tools', 'interactive');
var LOCALES = path.join(ROOT, 'tools', 'i18n', 'locales');
var NON_EN = ['zh-CN', 'ko', 'ja', 'pt-BR', 'es', 'fr'];

function readLocale(code) {
  return JSON.parse(fs.readFileSync(path.join(LOCALES, code + '.json'), 'utf8'));
}

// Source text with JS string escapes undone, so literals compare as shown.
function source(file) {
  return fs.readFileSync(path.join(TOOLS, file), 'utf8').replace(/\\(['"\\])/g, '$1');
}

var en = readLocale('en');
var tt = en.toolText || {};
var shared = source('shared.js');
// Some keys are fragments of strings the tools build from en.json values
// (subtitles, labels), so en.json itself also counts as a source.
var enText = JSON.stringify(en.tools) + JSON.stringify(en.ui);

test('toolText covers the tools', function() {
  var tools = Object.keys(tt).filter(function(k) { return k !== '_common'; });
  assert.ok(tools.length >= 20, 'expected entries for the interactive tools');
  tools.forEach(function(tool) {
    assert.ok(fs.existsSync(path.join(TOOLS, tool + '.html')), 'no tool file for toolText.' + tool);
  });
});

// A key is current when it appears in the tool source as written, or, for
// fragments of strings the page joins at run time ("Design checklist" from
// 'design' + ' checklist'), when every word of four or more letters still
// appears in the source.
function stillPresent(key, src, lowerSrc) {
  if (src.indexOf(key) !== -1) return true;
  var words = key.toLowerCase().match(/[a-z]{4,}/g) || [];
  return words.length > 0 && words.every(function(w) { return lowerSrc.indexOf(w) !== -1; });
}

test('every toolText key still appears in its tool source', function() {
  var stale = [];
  Object.keys(tt).forEach(function(tool) {
    if (tool === '_common') return;
    var src = source(tool + '.html') + shared + enText;
    var lower = src.toLowerCase();
    Object.keys(tt[tool]).forEach(function(k) { if (!stillPresent(k, src, lower)) stale.push(tool + ': ' + k); });
  });
  var all = fs.readdirSync(TOOLS).filter(function(f) { return f.endsWith('.html'); }).map(source).join('\n') + shared + enText;
  var allLower = all.toLowerCase();
  Object.keys(tt._common || {}).forEach(function(k) { if (!stillPresent(k, all, allLower)) stale.push('_common: ' + k); });
  assert.deepEqual(stale, [], 'edit en.json and every locale when tool text changes');
});

test('en toolText values equal their keys', function() {
  Object.keys(tt).forEach(function(tool) {
    Object.keys(tt[tool]).forEach(function(k) { assert.equal(tt[tool][k], k); });
  });
});

NON_EN.forEach(function(code) {
  test(code + ': every toolText string is translated', function() {
    var loc = readLocale(code).toolText || {};
    Object.keys(tt).forEach(function(tool) {
      Object.keys(tt[tool]).forEach(function(k) {
        var v = loc[tool] && loc[tool][k];
        assert.ok(typeof v === 'string' && v.trim().length > 0, code + ' missing ' + tool + ': ' + k);
      });
    });
  });
});
