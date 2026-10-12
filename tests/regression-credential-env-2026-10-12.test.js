// @ai-generated - Claude Opus 5.5 (Anthropic)
/**
 * Child processes (npm, git, pip-audit) get an allowlisted environment from
 * tools/extractors/child-env.js instead of the operator's whole environment
 * (Directory finding MCP_FORWARDS_CREDENTIAL_ENV, 2026-10-12).
 */

'use strict';

var test = require('node:test');
var assert = require('node:assert/strict');
var fs = require('fs');
var path = require('path');

var ROOT = path.join(__dirname, '..');
var mod = require(path.join(ROOT, 'tools', 'extractors', 'child-env.js'));

test('only allowlisted variables reach a child process', function() {
  var source = {
    PATH: 'p', Path: 'q', SystemRoot: 's', TEMP: 't', HOME: 'h', LANG: 'l',
    UNLISTED_ONE: 'x', UNLISTED_TWO: 'y', npm_config_anything: 'z', GIT_DIR: 'g',
  };
  var env = mod.childEnv({ ADDED_BY_CALLER: '1' }, source);
  assert.deepEqual(Object.keys(env).sort(),
    ['ADDED_BY_CALLER', 'HOME', 'LANG', 'PATH', 'Path', 'SystemRoot', 'TEMP']);
  Object.keys(env).forEach(function(k) {
    if (k !== 'ADDED_BY_CALLER') assert.ok(mod.ALLOW.indexOf(k.toUpperCase()) !== -1, k);
  });
});

test('caller settings override the copied variables', function() {
  var env = mod.childEnv({ PATH: 'fixed' }, { PATH: 'inherited' });
  assert.equal(env.PATH, 'fixed');
});

test('the allowlist holds no npm, registry or git-location setting', function() {
  mod.ALLOW.forEach(function(name) {
    assert.doesNotMatch(name, /^NPM_|^GIT_DIR$|^GIT_WORK_TREE$/, name);
  });
});

test('every tool that starts a child process uses child-env', function() {
  ['tools/extractors/package-evidence.js', 'tools/extractors/git-evidence.js', 'tools/sync-kb.js'].forEach(function(rel) {
    var src = fs.readFileSync(path.join(ROOT, rel), 'utf8');
    assert.match(src, /child-env'\)/, rel + ' does not load child-env');
    assert.match(src, /childEnv\(/, rel + ' does not call childEnv');
  });
});