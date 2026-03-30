// @ai-generated — Claude Sonnet 4.6 (Anthropic)
/**
 * Tests for locale file parity — all locales must mirror en.json structure exactly.
 * Catches: missing keys, extra keys, wrong key counts, missing metadata.
 */

'use strict';

var test = require('node:test');
var assert = require('node:assert/strict');
var fs = require('fs');
var path = require('path');

var LOCALES_DIR = path.join(__dirname, '..', 'tools', 'i18n', 'locales');
var NON_EN_LOCALES = ['zh-CN', 'ko', 'ja', 'pt-BR', 'es', 'fr'];

/** Recursively collect all leaf-node dot-paths from an object. */
function leafPaths(obj, prefix) {
  var result = [];
  Object.keys(obj).forEach(function(k) {
    var v = obj[k];
    var p = prefix ? prefix + '.' + k : k;
    if (typeof v === 'string') {
      result.push(p);
    } else if (v !== null && typeof v === 'object') {
      result = result.concat(leafPaths(v, p));
    }
  });
  return result;
}

function readLocale(code) {
  return JSON.parse(fs.readFileSync(path.join(LOCALES_DIR, code + '.json'), 'utf8'));
}

var en = readLocale('en');
var enPaths = leafPaths(en, '').filter(function(p) {
  return p !== '_note';
});

// ── Required metadata fields ──────────────────────────────────────────────────

NON_EN_LOCALES.forEach(function(lc) {
  test(lc + ': has required metadata fields (locale, name, _note)', function() {
    var d = readLocale(lc);
    assert.ok(d.locale, 'missing "locale" field');
    assert.ok(d.name, 'missing "name" field');
    assert.ok(d._note, 'missing "_note" field');
    assert.equal(d.locale, lc, '"locale" field should equal locale code');
  });
});

// ── _note must reference LLM/human review ────────────────────────────────────

NON_EN_LOCALES.forEach(function(lc) {
  test(lc + ': _note mentions review requirement', function() {
    var d = readLocale(lc);
    var note = d._note.toLowerCase();
    assert.ok(
      note.includes('review') || note.includes('human') || note.includes('llm'),
      '_note should mention review requirement, got: ' + d._note
    );
  });
});

// ── Key count parity ──────────────────────────────────────────────────────────

NON_EN_LOCALES.forEach(function(lc) {
  test(lc + ': has same number of keys as en.json', function() {
    var d = readLocale(lc);
    var lcPaths = leafPaths(d, '').filter(function(p) { return p !== '_note'; });
    assert.equal(
      lcPaths.length,
      enPaths.length,
      lc + ' has ' + lcPaths.length + ' keys, en has ' + enPaths.length
    );
  });
});

// ── No missing keys ───────────────────────────────────────────────────────────

NON_EN_LOCALES.forEach(function(lc) {
  test(lc + ': contains all keys present in en.json', function() {
    var d = readLocale(lc);
    var lcPaths = new Set(leafPaths(d, ''));
    var missing = enPaths.filter(function(p) {
      return p !== '_note' && !lcPaths.has(p);
    });
    assert.equal(
      missing.length,
      0,
      lc + ' is missing keys: ' + missing.slice(0, 10).join(', ') +
        (missing.length > 10 ? ' ... (' + missing.length + ' total)' : '')
    );
  });
});

// ── No extra keys ─────────────────────────────────────────────────────────────

NON_EN_LOCALES.forEach(function(lc) {
  test(lc + ': contains no keys absent from en.json', function() {
    var d = readLocale(lc);
    var enSet = new Set(enPaths);
    var extra = leafPaths(d, '').filter(function(p) {
      return p !== '_note' && !enSet.has(p);
    });
    assert.equal(
      extra.length,
      0,
      lc + ' has extra keys not in en.json: ' + extra.slice(0, 10).join(', ')
    );
  });
});

// ── Top-level sections ────────────────────────────────────────────────────────

var REQUIRED_SECTIONS = ['fields', 'checkboxes', 'ui', 'jurisdictions', 'templateNames', 'common', 'tools'];

NON_EN_LOCALES.forEach(function(lc) {
  test(lc + ': has all required top-level sections', function() {
    var d = readLocale(lc);
    REQUIRED_SECTIONS.forEach(function(section) {
      assert.ok(
        d[section] && typeof d[section] === 'object',
        lc + ' missing top-level section: ' + section
      );
    });
  });
});

// ── All 24 template names present ────────────────────────────────────────────

NON_EN_LOCALES.forEach(function(lc) {
  test(lc + ': templateNames has entries 01–24', function() {
    var d = readLocale(lc);
    for (var i = 1; i <= 24; i++) {
      var key = String(i).padStart(2, '0');
      assert.ok(
        d.templateNames && d.templateNames[key],
        lc + ' missing templateNames.' + key
      );
    }
  });
});

// ── All 22 jurisdictions present ─────────────────────────────────────────────

var EXPECTED_JURISDICTIONS = [
  'EU', 'CN', 'KR', 'UK', 'US-CO', 'US-CA', 'US-NYC', 'US-IL', 'US-TX', 'US-UT',
  'CA', 'BR', 'IN', 'JP', 'SG', 'AU', 'NZ', 'PE', 'NG', 'ZA', 'MX', 'VN'
];

NON_EN_LOCALES.forEach(function(lc) {
  test(lc + ': jurisdictions has all 22 entries', function() {
    var d = readLocale(lc);
    EXPECTED_JURISDICTIONS.forEach(function(j) {
      assert.ok(
        d.jurisdictions && d.jurisdictions[j],
        lc + ' missing jurisdiction: ' + j
      );
    });
  });
});

// ── All values are strings (no nulls or objects accidentally left in) ─────────

NON_EN_LOCALES.forEach(function(lc) {
  test(lc + ': all leaf values are strings', function() {
    var d = readLocale(lc);
    var paths = leafPaths(d, '');
    paths.forEach(function(p) {
      // leafPaths only collects string-valued leaves, so this is a structural check
      // Use raw object traversal to ensure no null/undefined sneaked in
    });
    // Walk raw object to find any non-string leaf
    function checkLeaves(obj, p) {
      Object.keys(obj).forEach(function(k) {
        var v = obj[k];
        var fp = p ? p + '.' + k : k;
        if (v === null || v === undefined) {
          assert.fail(lc + ' has null/undefined at key: ' + fp);
        } else if (typeof v === 'object') {
          checkLeaves(v, fp);
        } else if (typeof v !== 'string') {
          assert.fail(lc + ' has non-string value at key: ' + fp + ' (' + typeof v + ')');
        }
      });
    }
    checkLeaves(d, '');
  });
});
