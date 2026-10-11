// @ai-generated - Claude Opus 5.5 (Anthropic)
/**
 * Informal law nicknames ("China Deep Synthesis", "Brazil AI Bill") must be
 * translated the same way everywhere. tools/i18n/law-names.json holds the
 * canonical form per locale; this test checks every tool string whose
 * English contains a nickname.
 */

'use strict';

var test = require('node:test');
var assert = require('node:assert/strict');
var fs = require('fs');
var path = require('path');

var I18N = path.join(__dirname, '..', 'tools', 'i18n');
var terms = JSON.parse(fs.readFileSync(path.join(I18N, 'law-names.json'), 'utf8')).terms;
var NON_EN = ['zh-CN', 'ko', 'ja', 'pt-BR', 'es', 'fr'];

function readLocale(code) {
  return JSON.parse(fs.readFileSync(path.join(I18N, 'locales', code + '.json'), 'utf8'));
}

function canonical(name, code) {
  var t = terms[name];
  if (t && t.same_as) t = terms[t.same_as];
  return t && t[code];
}

// Longest nicknames first, so "China GenAI Measures" wins over "China GenAI".
var names = Object.keys(terms).sort(function(a, b) { return b.length - a.length; });

function nicknameIn(en) {
  for (var i = 0; i < names.length; i++) {
    if (en.indexOf(names[i]) !== -1) return names[i];
  }
  return null;
}

var en = readLocale('en');

function pairs(enObj, locObj, out) {
  Object.keys(enObj).forEach(function(k) {
    if (typeof enObj[k] === 'string') out.push([enObj[k], locObj && locObj[k]]);
    else if (enObj[k] && typeof enObj[k] === 'object') pairs(enObj[k], locObj && locObj[k], out);
  });
  return out;
}

NON_EN.forEach(function(code) {
  test(code + ': law nicknames use the canonical translation', function() {
    var loc = readLocale(code);
    var bad = [];
    pairs(en.tools, loc.tools, []).concat(pairs(en.toolText, loc.toolText, [])).forEach(function(p) {
      var name = nicknameIn(p[0]);
      if (!name) return;
      var want = canonical(name, code);
      if (want && (typeof p[1] !== 'string' || p[1].indexOf(want) === -1)) bad.push(p[0] + ' => ' + p[1]);
    });
    assert.deepEqual(bad, []);
  });
});
