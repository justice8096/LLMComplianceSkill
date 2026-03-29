/**
 * Tests for tools/data/jurisdiction-matrix.json
 * Validates structure, required fields, and cross-references with templateNames.
 */

'use strict';

var test = require('node:test');
var assert = require('node:assert/strict');
var path = require('path');

var matrix = require(path.join(__dirname, '..', 'tools', 'data', 'jurisdiction-matrix.json'));

var EXPECTED_JURISDICTIONS = [
  'EU', 'CN', 'KR', 'UK', 'US-CO', 'US-CA', 'US-NYC', 'US-IL', 'US-TX', 'US-UT',
  'CA', 'BR', 'IN', 'JP', 'SG', 'AU', 'NZ', 'PE', 'NG', 'ZA', 'MX', 'VN'
];

var VALID_STATUSES = ['enacted', 'active-sector', 'proposed', 'voluntary'];

// ── Top-level structure ───────────────────────────────────────────────────────

test('matrix has required top-level keys', function() {
  assert.ok(matrix.jurisdictions, 'missing jurisdictions');
  assert.ok(matrix.templateRequirements, 'missing templateRequirements');
  assert.ok(matrix.templateNames, 'missing templateNames');
});

// ── Jurisdictions ─────────────────────────────────────────────────────────────

test('jurisdictions has all 22 expected entries', function() {
  EXPECTED_JURISDICTIONS.forEach(function(j) {
    assert.ok(matrix.jurisdictions[j], 'missing jurisdiction: ' + j);
  });
  assert.equal(Object.keys(matrix.jurisdictions).length, 22);
});

test('each jurisdiction has required fields', function() {
  Object.entries(matrix.jurisdictions).forEach(function([code, jur]) {
    assert.ok(jur.name, code + ': missing name');
    assert.ok(jur.nameKey, code + ': missing nameKey');
    assert.ok(jur.status, code + ': missing status');
    assert.ok(jur.keyDeadline, code + ': missing keyDeadline');
    assert.ok(
      VALID_STATUSES.includes(jur.status),
      code + ': invalid status "' + jur.status + '"'
    );
    assert.equal(jur.nameKey, code, code + ': nameKey should equal jurisdiction code');
  });
});

// ── Template requirements ─────────────────────────────────────────────────────

test('templateRequirements has entries 01–24', function() {
  for (var i = 1; i <= 24; i++) {
    var key = String(i).padStart(2, '0');
    assert.ok(
      matrix.templateRequirements[key] !== undefined,
      'missing templateRequirements.' + key
    );
  }
});

test('templateRequirements only references known jurisdictions', function() {
  var knownJuris = new Set(Object.keys(matrix.jurisdictions));
  Object.entries(matrix.templateRequirements).forEach(function([tpl, juris]) {
    Object.keys(juris).forEach(function(j) {
      assert.ok(knownJuris.has(j), 'templateRequirements.' + tpl + ' references unknown jurisdiction: ' + j);
    });
  });
});

test('templateRequirements values are all true (boolean)', function() {
  Object.entries(matrix.templateRequirements).forEach(function([tpl, juris]) {
    Object.entries(juris).forEach(function([j, v]) {
      assert.equal(v, true, 'templateRequirements.' + tpl + '.' + j + ' should be true');
    });
  });
});

// ── Template names ────────────────────────────────────────────────────────────

test('templateNames has entries 01–24', function() {
  for (var i = 1; i <= 24; i++) {
    var key = String(i).padStart(2, '0');
    assert.ok(matrix.templateNames[key], 'missing templateNames.' + key);
    assert.equal(typeof matrix.templateNames[key], 'string');
  }
  assert.equal(Object.keys(matrix.templateNames).length, 24);
});

test('templateRequirements and templateNames have matching key sets', function() {
  var reqKeys = new Set(Object.keys(matrix.templateRequirements));
  var nameKeys = new Set(Object.keys(matrix.templateNames));
  reqKeys.forEach(function(k) {
    assert.ok(nameKeys.has(k), 'templateRequirements has ' + k + ' but templateNames does not');
  });
  nameKeys.forEach(function(k) {
    assert.ok(reqKeys.has(k), 'templateNames has ' + k + ' but templateRequirements does not');
  });
});

// ── Cross-cutting templates (21, 22) cover all jurisdictions ─────────────────

test('template 21 (Jurisdiction Selector) covers all jurisdictions', function() {
  var covered = Object.keys(matrix.templateRequirements['21']);
  EXPECTED_JURISDICTIONS.forEach(function(j) {
    assert.ok(covered.includes(j), 'template 21 missing jurisdiction: ' + j);
  });
});

test('template 22 (Compliance Deadline Tracker) covers all jurisdictions', function() {
  var covered = Object.keys(matrix.templateRequirements['22']);
  EXPECTED_JURISDICTIONS.forEach(function(j) {
    assert.ok(covered.includes(j), 'template 22 missing jurisdiction: ' + j);
  });
});

// ── EU is most covered jurisdiction ──────────────────────────────────────────

test('EU appears in the most template requirements', function() {
  var counts = {};
  EXPECTED_JURISDICTIONS.forEach(function(j) { counts[j] = 0; });
  Object.values(matrix.templateRequirements).forEach(function(juris) {
    Object.keys(juris).forEach(function(j) {
      if (counts[j] !== undefined) counts[j]++;
    });
  });
  var euCount = counts['EU'];
  var maxCount = Math.max.apply(null, Object.values(counts));
  assert.equal(euCount, maxCount, 'EU should have the highest template count');
});
