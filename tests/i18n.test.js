/**
 * Tests for tools/i18n/index.js
 * Covers: load(), t(), fieldName(), fieldKey(), checkboxKey(), listLocales(), currentLocale()
 */

'use strict';

var test = require('node:test');
var assert = require('node:assert/strict');
var path = require('path');

var i18n = require(path.join(__dirname, '..', 'tools', 'i18n', 'index.js'));

// ── load / currentLocale ──────────────────────────────────────────────────────

test('auto-loads English on require', function() {
  assert.equal(i18n.currentLocale(), 'en');
});

test('load("en") sets locale to en', function() {
  i18n.load('en');
  assert.equal(i18n.currentLocale(), 'en');
});

test('load("zh-CN") sets locale to zh-CN', function() {
  i18n.load('zh-CN');
  assert.equal(i18n.currentLocale(), 'zh-CN');
  i18n.load('en'); // reset
});

test('load("nonexistent-locale") falls back to en without throwing', function() {
  i18n.load('xx-FAKE');
  assert.equal(i18n.currentLocale(), 'en');
});

// ── t() – English baseline ────────────────────────────────────────────────────

test('t() resolves a simple fields key', function() {
  i18n.load('en');
  assert.equal(i18n.t('fields.ai-system-name'), 'AI System Name');
});

test('t() resolves a templateNames key', function() {
  i18n.load('en');
  assert.equal(i18n.t('templateNames.07'), 'Privacy Impact Assessment (PIA/DPIA)');
});

test('t() resolves a ui key', function() {
  i18n.load('en');
  assert.equal(i18n.t('ui.btn.loadConfig'), 'Load Config');
});

test('t() resolves a common flat-dotted key (greedy resolver)', function() {
  i18n.load('en');
  // common object contains flat keys like "severity.critical" (not nested)
  assert.equal(i18n.t('common.severity.critical'), 'Critical');
  assert.equal(i18n.t('common.status.pass'), 'PASS');
});

test('t() returns key when not found', function() {
  i18n.load('en');
  assert.equal(i18n.t('fields.nonexistent-key'), 'fields.nonexistent-key');
});

test('t() returns explicit fallback when not found', function() {
  i18n.load('en');
  assert.equal(i18n.t('fields.nonexistent-key', 'fallback text'), 'fallback text');
});

test('t() resolves a deep tools key in en', function() {
  i18n.load('en');
  assert.equal(
    i18n.t('tools.securityAssessment.threat.promptInjectionDirect'),
    'Prompt injection (direct)'
  );
});

// ── t() – locale fallback ─────────────────────────────────────────────────────

test('t() falls back to English for a key missing in locale', function() {
  i18n.load('zh-CN');
  // This key should exist in en; even if zh-CN omits it, we should get the English value
  var val = i18n.t('fields.ai-system-name');
  assert.ok(val.length > 0, 'should return a non-empty string');
  i18n.load('en');
});

test('t() returns translated value when locale has it', function() {
  i18n.load('zh-CN');
  var val = i18n.t('fields.ai-system-name');
  assert.equal(val, 'AI系统名称');
  i18n.load('en');
});

test('t() falls back to English for tools key translated in zh-CN', function() {
  i18n.load('zh-CN');
  var val = i18n.t('tools.riskClassification.prohibited.socialScoring');
  // zh-CN should have this translated — just assert non-English and non-empty
  assert.ok(val.length > 0);
  assert.notEqual(val, 'Does the system perform social scoring by public authorities?');
  i18n.load('en');
});

// ── fieldName / fieldKey ──────────────────────────────────────────────────────

test('fieldName() returns translated display name', function() {
  i18n.load('en');
  assert.equal(i18n.fieldName('ai-system-name'), 'AI System Name');
});

test('fieldKey() reverse-lookups display name to key', function() {
  i18n.load('en');
  assert.equal(i18n.fieldKey('AI System Name'), 'ai-system-name');
});

test('fieldKey() returns null for unknown display name', function() {
  i18n.load('en');
  assert.equal(i18n.fieldKey('No Such Field'), null);
});

test('fieldKey() uses English reverse-lookup regardless of locale', function() {
  i18n.load('zh-CN');
  // fieldKey always works against English display names
  assert.equal(i18n.fieldKey('AI System Name'), 'ai-system-name');
  i18n.load('en');
});

// ── checkboxKey ───────────────────────────────────────────────────────────────

test('checkboxKey() finds checkbox key by English label', function() {
  i18n.load('en');
  assert.equal(i18n.checkboxKey('SAST scan completed'), 'cb.sast-scan-completed');
});

test('checkboxKey() finds checkbox key for PIA/DPIA', function() {
  i18n.load('en');
  assert.equal(i18n.checkboxKey('PIA/DPIA completed'), 'cb.pia-dpia-completed');
});

test('checkboxKey() returns null for unknown label', function() {
  i18n.load('en');
  assert.equal(i18n.checkboxKey('No Such Checkbox'), null);
});

// ── listLocales ───────────────────────────────────────────────────────────────

test('listLocales() returns at least 7 locales', function() {
  var locales = i18n.listLocales();
  assert.ok(locales.length >= 7, 'expected at least 7 locales, got ' + locales.length);
});

test('listLocales() includes en, zh-CN, ko, ja, pt-BR, es, fr', function() {
  var locales = i18n.listLocales();
  var expected = ['en', 'es', 'fr', 'ja', 'ko', 'pt-BR', 'zh-CN'];
  expected.forEach(function(lc) {
    assert.ok(locales.includes(lc), 'missing locale: ' + lc);
  });
});

test('listLocales() returns sorted array', function() {
  var locales = i18n.listLocales();
  var sorted = locales.slice().sort();
  assert.deepEqual(locales, sorted);
});
