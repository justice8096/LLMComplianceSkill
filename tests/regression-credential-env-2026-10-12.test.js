// @ai-generated - Claude Opus 5.5 (Anthropic)
/**
 * Directory finding MCP_FORWARDS_CREDENTIAL_ENV (2026-10-12): the extractors
 * handed npm, git and pip-audit the whole environment, so a token in it
 * (NPM_TOKEN, an npm_config_ auth setting, GITHUB_TOKEN) could ride along
 * with a request to the registry. Child processes now get an allowlist.
 */

'use strict';

var test = require('node:test');
var assert = require('node:assert/strict');
var fs = require('fs');
var path = require('path');

var ROOT = path.join(__dirname, '..');
var childEnv = require(path.join(ROOT, 'tools', 'extractors', 'child-env.js')).childEnv;

test('childEnv keeps what tools need to start and drops credentials', function() {
  var source = {
    PATH: '/usr/bin', Path: 'C:\\Windows', SystemRoot: 'C:\\Windows', TEMP: '/tmp',
    HOME: '/home/u', LANG: 'en_US.UTF-8', HTTPS_PROXY: 'http://proxy:3128',
    NPM_TOKEN: 'secret-1', NODE_AUTH_TOKEN: 'secret-2', GITHUB_TOKEN: 'secret-3',
    'npm_config_//registry.npmjs.org/:_authToken': 'secret-4',
    npm_config_registry: 'https://attacker.example/', AWS_SECRET_ACCESS_KEY: 'secret-5',
    ANTHROPIC_API_KEY: 'secret-6', GIT_DIR: '/elsewhere',
  };
  var env = childEnv({ GIT_CONFIG_NOSYSTEM: '1' }, source);
  assert.equal(env.PATH, '/usr/bin');
  assert.equal(env.Path, 'C:\\Windows');
  assert.equal(env.SystemRoot, 'C:\\Windows');
  assert.equal(env.HOME, '/home/u');
  assert.equal(env.HTTPS_PROXY, 'http://proxy:3128');
  assert.equal(env.GIT_CONFIG_NOSYSTEM, '1');
  Object.keys(env).forEach(function(k) {
    assert.doesNotMatch(String(env[k]), /secret-/, k + ' leaked a credential');
  });
  assert.equal(env.npm_config_registry, undefined);
  assert.equal(env.GIT_DIR, undefined);
});

test('caller settings override the copied environment', function() {
  var env = childEnv({ npm_config_registry: 'https://registry.npmjs.org/' }, { npm_config_registry: 'https://x.example/' });
  assert.equal(env.npm_config_registry, 'https://registry.npmjs.org/');
});

test('no tool hands a child process the whole environment', function() {
  var files = [];
  (function walk(dir) {
    fs.readdirSync(dir, { withFileTypes: true }).forEach(function(d) {
      var p = path.join(dir, d.name);
      if (d.isDirectory()) walk(p); else if (/\.js$/.test(d.name)) files.push(p);
    });
  })(path.join(ROOT, 'tools'));
  files.forEach(function(f) {
    var src = fs.readFileSync(f, 'utf8');
    assert.doesNotMatch(src, /Object\.assign\(\s*\{\}\s*,\s*process\.env/, path.relative(ROOT, f));
    assert.doesNotMatch(src, /env:\s*process\.env\b/, path.relative(ROOT, f));
  });
});