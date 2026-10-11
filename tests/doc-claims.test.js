// @ai-generated - Claude Opus 5.5 (Anthropic)
/**
 * Numbers and facts typed into the docs drift from the data they describe.
 * These tests read the data and fail when SKILL.md or README.md disagree.
 */

'use strict';

var test = require('node:test');
var assert = require('node:assert/strict');
var fs = require('fs');
var path = require('path');

var ROOT = path.join(__dirname, '..');
function read(p) { return fs.readFileSync(path.join(ROOT, p), 'utf8'); }
function json(p) { return JSON.parse(read(p)); }

var skill = read('skills/ai-compliance/SKILL.md');
var evidence = read('skills/evidence-collection/SKILL.md');
var readme = read('README.md');

test('deadline count in the docs matches deadline-data.json', function() {
  var n = json('tools/data/deadline-data.json').length;
  assert.match(skill, new RegExp('\\b' + n + ' compliance deadlines'));
  assert.match(readme, new RegExp('\\b' + n + ' dated deadlines'));
});

test('LLM registry model count matches the registry chunks', function() {
  var n = 0;
  fs.readdirSync(path.join(ROOT, 'tools', 'data')).filter(function(f) { return /^llm-registry-.+\.json$/.test(f); }).forEach(function(f) {
    var d = json('tools/data/' + f);
    n += Array.isArray(d) ? d.length : (d.models || []).length;
  });
  assert.match(skill, new RegExp('\\b' + n + '-model LLM registry'));
});

test('extractor count matches tools/extractors', function() {
  var n = fs.readdirSync(path.join(ROOT, 'tools', 'extractors')).filter(function(f) { return /-evidence\.js$/.test(f); }).length;
  var words = { 3: 'three', 4: 'four', 5: 'five' };
  assert.match(skill, new RegExp('runs ' + words[n] + ' extractors'));
  assert.match(readme, new RegExp('\\*\\*' + n + ' automated evidence extractors'));
  fs.readdirSync(path.join(ROOT, 'tools', 'extractors')).forEach(function(f) {
    if (/-evidence\.js$/.test(f)) assert.ok(evidence.indexOf(f) !== -1, 'evidence-collection skill does not list ' + f);
  });
});

test('every template appears in the SKILL.md and README template tables', function() {
  var nums = fs.readdirSync(path.join(ROOT, 'templates')).map(function(f) { var m = f.match(/^(\d\d)-/); return m && m[1]; })
    .filter(function(n) { return n && n !== '00'; });
  nums.forEach(function(n) {
    assert.match(skill, new RegExp('^\\| ' + n + ' \\|', 'm'), 'SKILL.md template table is missing ' + n);
    assert.match(readme, new RegExp('^\\| ' + n + ' \\|', 'm'), 'README template table is missing ' + n);
  });
});

test('license is the same everywhere', function() {
  var license = read('LICENSE');
  assert.match(license, /CC0 1\.0 Universal/);
  assert.equal(json('.claude-plugin/plugin.json').license, 'CC0-1.0');
  assert.equal(json('source/manifest.json').metadata.license, 'CC0-1.0');
  assert.match(readme, /## License\s+CC0 1\.0/);
});

test('plugin.json and source/manifest.json carry the same version', function() {
  assert.equal(json('.claude-plugin/plugin.json').version, json('source/manifest.json').metadata.version);
});

test('README jurisdiction tiers match SKILL.md', function() {
  function tiers(md) {
    var out = {};
    md.split(/\r?\n/).forEach(function(l) {
      var m = l.match(/^\| \*\*(Enacted|Active Sector|Proposed|Voluntary)\*\* \| (.+) \|\s*$/);
      if (m) out[m[1]] = m[2].trim();
    });
    return out;
  }
  assert.deepEqual(tiers(readme), tiers(skill));
});

test('skill and command frontmatter values are valid plain YAML scalars', function() {
  var files = ['skills/ai-compliance/SKILL.md', 'skills/evidence-collection/SKILL.md']
    .concat(fs.readdirSync(path.join(ROOT, 'commands')).map(function(f) { return 'commands/' + f; }));
  files.forEach(function(f) {
    var m = read(f).match(/^---\r?\n([\s\S]*?)\r?\n---/);
    assert.ok(m, f + ' has no frontmatter');
    m[1].split(/\r?\n/).forEach(function(line) {
      var kv = line.match(/^([\w-]+):\s(.*)$/);
      if (!kv) return;
      var v = kv[2];
      if (/^["']/.test(v)) return; // quoted values may contain anything
      // A ": " or " #" inside an unquoted value breaks YAML parsing.
      assert.ok(v.indexOf(': ') === -1 && v.indexOf(' #') === -1, f + ' ' + kv[1] + ' needs quoting: ' + v);
    });
  });
});
