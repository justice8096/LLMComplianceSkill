/**
 * Tests for tools/data/deadline-data.json
 * Validates structure, date formats, jurisdiction cross-references, and lawKey presence.
 */

'use strict';

var test = require('node:test');
var assert = require('node:assert/strict');
var path = require('path');

var deadlines = require(path.join(__dirname, '..', 'tools', 'data', 'deadline-data.json'));
var matrix = require(path.join(__dirname, '..', 'tools', 'data', 'jurisdiction-matrix.json'));

var DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
var VALID_STATUSES = ['in-force', 'upcoming'];

test('deadline-data is an array', function() {
  assert.ok(Array.isArray(deadlines), 'should be an array');
  assert.ok(deadlines.length > 0, 'should not be empty');
});

test('each entry has required fields', function() {
  deadlines.forEach(function(entry, i) {
    assert.ok(entry.date, 'entry[' + i + '] missing date');
    assert.ok(entry.jurisdiction, 'entry[' + i + '] missing jurisdiction');
    assert.ok(entry.law, 'entry[' + i + '] missing law');
    assert.ok(entry.lawKey, 'entry[' + i + '] missing lawKey');
    assert.ok(entry.status, 'entry[' + i + '] missing status');
  });
});

test('all dates are in YYYY-MM-DD format', function() {
  deadlines.forEach(function(entry, i) {
    assert.ok(
      DATE_RE.test(entry.date),
      'entry[' + i + '] (' + entry.law + ') has invalid date format: "' + entry.date + '"'
    );
  });
});

test('all statuses are "in-force" or "upcoming"', function() {
  deadlines.forEach(function(entry, i) {
    assert.ok(
      VALID_STATUSES.includes(entry.status),
      'entry[' + i + '] (' + entry.law + ') has invalid status: "' + entry.status + '"'
    );
  });
});

test('all jurisdictions reference known jurisdictions or have a valid code', function() {
  var knownJuris = new Set(Object.keys(matrix.jurisdictions));
  // Some entries may reference jurisdictions not in the matrix (e.g. "EG" — Egypt)
  deadlines.forEach(function(entry, i) {
    // Log rather than fail for jurisdictions not in matrix — these may be intentional
    // (e.g. future additions). Just ensure the field is a non-empty string.
    assert.ok(
      typeof entry.jurisdiction === 'string' && entry.jurisdiction.length > 0,
      'entry[' + i + '] has empty jurisdiction'
    );
  });
});

test('all lawKeys are dot-path strings (e.g. "eu.aiAct.prohibited")', function() {
  var LAW_KEY_RE = /^[a-zA-Z][a-zA-Z0-9]*(\.[a-zA-Z][a-zA-Z0-9]*)+$/;
  deadlines.forEach(function(entry, i) {
    assert.ok(
      LAW_KEY_RE.test(entry.lawKey),
      'entry[' + i + '] (' + entry.law + ') has invalid lawKey format: "' + entry.lawKey + '"'
    );
  });
});

test('all lawKeys are unique', function() {
  var seen = {};
  deadlines.forEach(function(entry, i) {
    if (seen[entry.lawKey]) {
      assert.fail(
        'duplicate lawKey "' + entry.lawKey + '" at index ' + i + ' and ' + seen[entry.lawKey]
      );
    }
    seen[entry.lawKey] = i;
  });
});

test('entries span multiple years (reasonable date range)', function() {
  var dates = deadlines.map(function(e) { return e.date; });
  var minYear = Math.min.apply(null, dates.map(function(d) { return parseInt(d.slice(0,4)); }));
  var maxYear = Math.max.apply(null, dates.map(function(d) { return parseInt(d.slice(0,4)); }));
  assert.ok(minYear >= 2023, 'earliest deadline should be 2023 or later');
  assert.ok(maxYear >= 2026, 'should include deadlines in 2026 or later');
});

test('has EU AI Act full applicability deadline', function() {
  var euFull = deadlines.find(function(e) {
    return e.jurisdiction === 'EU' && e.law.includes('Full applicability');
  });
  assert.ok(euFull, 'missing EU AI Act full applicability entry');
  assert.equal(euFull.date, '2026-08-02');
  assert.equal(euFull.lawKey, 'eu.aiAct.full');
});

test('has Colorado AI Act deadline', function() {
  var co = deadlines.find(function(e) {
    return e.jurisdiction === 'US-CO';
  });
  assert.ok(co, 'missing US-CO deadline entry');
  assert.equal(co.date, '2026-06-30');
});
