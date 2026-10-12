// @ai-generated - Claude Opus 5.5 (Anthropic)
/**
 * MEDIUM-02 (CWE-73): git must never read a scanned repository's own config.
 *
 * A text check of .git/config (git-config-guard.js, b439721) was bypassed
 * six ways in the round-2 re-audit: mixed-slash UNC paths, git quoting and
 * line continuation, configs over 1 MiB, headers on one line, bare repos and
 * subdirectories, and objects/info/alternates. The fix stops parsing: the
 * extractors run git against a private git directory whose config they
 * write themselves (tools/extractors/git-sandbox.js). These tests check the
 * behaviour, not a parser.
 */

'use strict';

var test = require('node:test');
var assert = require('node:assert/strict');
var path = require('path');
var fs = require('fs');
var os = require('os');
var { execFileSync, spawnSync } = require('child_process');

var EXTRACTORS_DIR = path.join(__dirname, '..', 'tools', 'extractors');
var SANDBOX = path.join(EXTRACTORS_DIR, 'git-sandbox.js');
var GIT_EVIDENCE = path.join(EXTRACTORS_DIR, 'git-evidence.js');
var PACKAGE_EVIDENCE = path.join(EXTRACTORS_DIR, 'package-evidence.js');

function haveGit() {
  return spawnSync('git', ['--version'], { stdio: 'ignore' }).status === 0;
}

function git(repo, args, env) {
  return execFileSync('git', ['-C', repo].concat(args), {
    encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'], env: env || process.env
  });
}

function tryGit(repo, args, env) {
  return spawnSync('git', ['-C', repo].concat(args), { encoding: 'utf8', env: env });
}

function makeRepo(prefix, initArgs) {
  var repo = fs.mkdtempSync(path.join(os.tmpdir(), prefix));
  git(repo, ['init', '-q'].concat(initArgs || []));
  git(repo, ['config', 'user.email', 'test@example.com']);
  git(repo, ['config', 'user.name', 'Test']);
  git(repo, ['config', 'commit.gpgsign', 'false']);
  fs.writeFileSync(path.join(repo, 'a.txt'), 'a\n');
  git(repo, ['add', 'a.txt']);
  git(repo, ['commit', '-q', '-m', 'feat: a\n\nCo-Authored-By: Claude <noreply@anthropic.com>']);
  return repo;
}

function rmrf(dir) {
  try { fs.rmSync(dir, { recursive: true, force: true }); } catch (_e) { /* ignore */ }
}

function sandboxEnv(sb) {
  return Object.assign({}, process.env, sb.env);
}

test('git-sandbox: git reads neither the repo config nor its includes', { skip: !haveGit() }, function () {
  var { prepareGitSandbox } = require(SANDBOX);
  var repo = makeRepo('sbx-config-');
  var incDir = fs.mkdtempSync(path.join(os.tmpdir(), 'sbx-inc-'));
  var sb;
  try {
    var inc = path.join(incDir, 'inc.gitconfig');
    fs.writeFileSync(inc, '[test]\n\tmarker = included\n');
    fs.appendFileSync(path.join(repo, '.git', 'config'),
      '[test]\n\tdirect = 1\n[include]\n\tpath = ' + inc.replace(/\\/g, '/') + '\n');
    assert.equal(git(repo, ['config', '--get', 'test.marker']).trim(), 'included', 'fixture: plain git follows the include');
    sb = prepareGitSandbox(repo);
    assert.equal(sb.ok, true, sb.reason);
    var env = sandboxEnv(sb);
    assert.notEqual(tryGit(repo, ['config', '--get', 'test.direct'], env).status, 0, 'repo config was read');
    assert.notEqual(tryGit(repo, ['config', '--get', 'test.marker'], env).status, 0, 'repo config include was followed');
    // History is still readable.
    assert.equal(git(repo, ['rev-parse', 'HEAD'], env).trim(), git(repo, ['rev-parse', 'HEAD']).trim());
    assert.equal(git(repo, ['ls-files', '--error-unmatch', '--', 'a.txt'], env).trim(), 'a.txt');
  } finally {
    if (sb && sb.cleanup) sb.cleanup();
    rmrf(repo); rmrf(incDir);
  }
});

test('git-sandbox: cleanup removes the private git directory', { skip: !haveGit() }, function () {
  var { prepareGitSandbox } = require(SANDBOX);
  var repo = makeRepo('sbx-cleanup-');
  try {
    var sb = prepareGitSandbox(repo);
    assert.equal(sb.ok, true, sb.reason);
    assert.ok(fs.existsSync(sb.env.GIT_DIR));
    sb.cleanup();
    assert.ok(!fs.existsSync(sb.env.GIT_DIR));
  } finally { rmrf(repo); }
});

test('git-sandbox: SHA-256 repositories keep their object format', { skip: !haveGit() }, function () {
  var { prepareGitSandbox } = require(SANDBOX);
  var repo;
  try { repo = makeRepo('sbx-sha256-', ['--object-format=sha256']); }
  catch (_e) { return; } // git without SHA-256 support
  var sb;
  try {
    sb = prepareGitSandbox(repo);
    assert.equal(sb.ok, true, sb.reason);
    var head = git(repo, ['rev-parse', 'HEAD'], sandboxEnv(sb)).trim();
    assert.equal(head.length, 64);
  } finally {
    if (sb && sb.cleanup) sb.cleanup();
    rmrf(repo);
  }
});

test('git-sandbox: a linked worktree works', { skip: !haveGit() }, function () {
  var { prepareGitSandbox } = require(SANDBOX);
  var repo = makeRepo('sbx-wt-');
  var wt = path.join(os.tmpdir(), 'sbx-wt-linked-' + process.pid);
  var sb;
  try {
    git(repo, ['worktree', 'add', '-q', wt, '-b', 'side']);
    sb = prepareGitSandbox(wt);
    assert.equal(sb.ok, true, sb.reason);
    assert.equal(git(wt, ['rev-parse', 'HEAD'], sandboxEnv(sb)).trim(), git(repo, ['rev-parse', 'HEAD']).trim());
  } finally {
    if (sb && sb.cleanup) sb.cleanup();
    rmrf(wt); rmrf(repo);
  }
});

test('git-sandbox: a subdirectory of a repository is refused (git would walk up)', { skip: !haveGit() }, function () {
  var { prepareGitSandbox } = require(SANDBOX);
  var repo = makeRepo('sbx-subdir-');
  try {
    fs.mkdirSync(path.join(repo, 'sub'));
    var sb = prepareGitSandbox(path.join(repo, 'sub'));
    assert.equal(sb.ok, false);
    assert.match(sb.reason, /\.git/);
  } finally { rmrf(repo); }
});

test('git-sandbox: a .git file naming a network gitdir is refused, in any slash spelling',
  { skip: process.platform !== 'win32' }, function () {
    var { prepareGitSandbox } = require(SANDBOX);
    var spellings = ['//attacker/share/r.git', '\\\\attacker\\share\\r.git', '/\\attacker/share/r.git', '\\/attacker\\share', '\\\\?\\UNC\\attacker\\share'];
    spellings.forEach(function (s) {
      var dir = fs.mkdtempSync(path.join(os.tmpdir(), 'sbx-unc-'));
      try {
        fs.writeFileSync(path.join(dir, '.git'), 'gitdir: ' + s + '\n');
        var sb = prepareGitSandbox(dir);
        assert.equal(sb.ok, false, 'accepted ' + s);
        assert.match(sb.reason, /network/i, s);
      } finally { rmrf(dir); }
    });
  });

test('git-sandbox: objects/info/alternates is refused', { skip: !haveGit() }, function () {
  var { prepareGitSandbox } = require(SANDBOX);
  var repo = makeRepo('sbx-alt-');
  try {
    fs.writeFileSync(path.join(repo, '.git', 'objects', 'info', 'alternates'), '//attacker/share/objects\n');
    var sb = prepareGitSandbox(repo);
    assert.equal(sb.ok, false);
    assert.match(sb.reason, /alternates/);
  } finally { rmrf(repo); }
});

test('git-sandbox: a symlink inside refs is refused', { skip: !haveGit() }, function (t) {
  var { prepareGitSandbox } = require(SANDBOX);
  var repo = makeRepo('sbx-reflink-');
  try {
    try { fs.symlinkSync(path.join(os.tmpdir(), 'nowhere'), path.join(repo, '.git', 'refs', 'heads', 'evil')); }
    catch (_e) { t.skip('cannot create symlinks here'); return; }
    var sb = prepareGitSandbox(repo);
    assert.equal(sb.ok, false);
    assert.match(sb.reason, /symlink/i);
  } finally { rmrf(repo); }
});

test('git-evidence: a repo whose config includes a network path is scanned without reading it',
  { skip: !haveGit() }, function () {
    var repo = makeRepo('sbx-e2e-');
    try {
      fs.appendFileSync(path.join(repo, '.git', 'config'), '[include]\n\tpath = //127.0.0.1/nonexistent/evil.gitconfig\n');
      var r = spawnSync(process.execPath, [GIT_EVIDENCE, '--repo', repo], { encoding: 'utf8', timeout: 120000 });
      assert.equal(r.status, 0, r.stderr);
      assert.equal(JSON.parse(r.stdout).aiCodeGeneration.aiAttributedCommits, 1);
    } finally { rmrf(repo); }
  });

test('git-evidence: a subdirectory of a repository is refused', { skip: !haveGit() }, function () {
  var repo = makeRepo('sbx-e2e-sub-');
  try {
    fs.mkdirSync(path.join(repo, 'sub'));
    var r = spawnSync(process.execPath, [GIT_EVIDENCE, '--repo', path.join(repo, 'sub')], { encoding: 'utf8', timeout: 120000 });
    assert.notEqual(r.status, 0);
    assert.match(r.stderr, /\.git/);
  } finally { rmrf(repo); }
});

test('package-evidence: lockfile tracking works through the sandbox', { skip: !haveGit() }, function () {
  var repo = makeRepo('sbx-pkg-');
  try {
    fs.writeFileSync(path.join(repo, 'package.json'), '{"name":"x","version":"1.0.0","dependencies":{}}');
    fs.writeFileSync(path.join(repo, 'package-lock.json'), '{"name":"x","version":"1.0.0","lockfileVersion":3,"packages":{"":{"name":"x","version":"1.0.0"}}}');
    git(repo, ['add', 'package.json', 'package-lock.json']);
    git(repo, ['commit', '-q', '-m', 'lock']);
    fs.appendFileSync(path.join(repo, '.git', 'config'), '[include]\n\tpath = //127.0.0.1/nonexistent/evil.gitconfig\n');
    var r = spawnSync(process.execPath, [PACKAGE_EVIDENCE, '--repo', repo], { encoding: 'utf8', timeout: 180000 });
    assert.equal(r.status, 0, r.stderr);
    assert.equal(JSON.parse(r.stdout).sbom.lockFileCommitted, true);
  } finally { rmrf(repo); }
});

// Automated review of 62c0791: links deeper in the git directory.
test('git-sandbox: a symlinked loose object is refused', { skip: !haveGit() }, function (t) {
  var { prepareGitSandbox } = require(SANDBOX);
  var repo = makeRepo('sbx-looselink-');
  try {
    var objects = path.join(repo, '.git', 'objects');
    var sub = fs.readdirSync(objects).filter(function (d) { return /^[0-9a-f]{2}$/.test(d); })[0];
    try { fs.symlinkSync(path.join(os.tmpdir(), 'nowhere'), path.join(objects, sub, 'f'.repeat(38))); }
    catch (_e) { t.skip('cannot create symlinks here'); return; }
    var sb = prepareGitSandbox(repo);
    assert.equal(sb.ok, false);
    assert.match(sb.reason, /symlink/i);
  } finally { rmrf(repo); }
});

test('git-sandbox: a gitdir reached through a link to a network share is refused',
  { skip: process.platform !== 'win32' }, function (t) {
    var { prepareGitSandbox } = require(SANDBOX);
    var dir = fs.mkdtempSync(path.join(os.tmpdir(), 'sbx-midlink-'));
    try {
      try { fs.symlinkSync('//127.0.0.1/nonexistent-share', path.join(dir, 'link'), 'dir'); }
      catch (_e) { t.skip('cannot create symlinks here'); return; }
      fs.writeFileSync(path.join(dir, '.git'), 'gitdir: link/repo.git\n');
      var sb = prepareGitSandbox(dir);
      assert.equal(sb.ok, false);
      assert.match(sb.reason, /network/i);
    } finally { rmrf(dir); }
  });
