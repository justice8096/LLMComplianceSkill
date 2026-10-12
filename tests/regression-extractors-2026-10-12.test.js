// @ai-generated - Claude Opus 5.5 (Anthropic)
/**
 * Regression tests for the extractor findings left open by the post-fix
 * re-audit of 2026-10-11 (audits/sast-dast-scan.md):
 *   MEDIUM-02 repo config include / UNC paths (CWE-73)
 *   LOW-02    YAML comment regex ReDoS (CWE-1333)
 *   LOW-04    pip audit reported clean while auditing nothing (CWE-754)
 *   LOW-05    scanned package.json "volta" key chose the npm version (CWE-15)
 *   INFO-01   pyproject [project] regex ReDoS (CWE-1333)
 *   INFO-09   SHA-256 repositories got no AI attribution (CWE-754)
 *   INFO-10   resolveBinary rejected names that already have an extension
 *   INFO-11   requirements.txt symlink read outside the repo (CWE-59)
 */

'use strict';

var test = require('node:test');
var assert = require('node:assert/strict');
var path = require('path');
var fs = require('fs');
var os = require('os');
var { execFileSync, spawnSync } = require('child_process');

var EXTRACTORS_DIR = path.join(__dirname, '..', 'tools', 'extractors');
var GIT_EVIDENCE = path.join(EXTRACTORS_DIR, 'git-evidence.js');
var PACKAGE_EVIDENCE = path.join(EXTRACTORS_DIR, 'package-evidence.js');

function haveTool(name, args) {
  return spawnSync(name, args || ['--version'], { stdio: 'ignore' }).status === 0;
}

function git(repo, args) {
  return execFileSync('git', ['-C', repo].concat(args), { encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] });
}

function makeRepo(prefix, initArgs) {
  var repo = fs.mkdtempSync(path.join(os.tmpdir(), prefix || 'xtr-'));
  git(repo, ['init', '-q'].concat(initArgs || []));
  git(repo, ['config', 'user.email', 'test@example.com']);
  git(repo, ['config', 'user.name', 'Test']);
  git(repo, ['config', 'commit.gpgsign', 'false']);
  return repo;
}

function commitFile(repo, name, message) {
  fs.writeFileSync(path.join(repo, name), name + '\n');
  git(repo, ['add', name]);
  git(repo, ['commit', '-q', '-m', message]);
}

function runExtractor(script, repo) {
  return spawnSync(process.execPath, [script, '--repo', repo], { encoding: 'utf8', timeout: 180000 });
}

function rmrf(dir) {
  try { fs.rmSync(dir, { recursive: true, force: true }); } catch (_e) { /* ignore */ }
}

function appendRepoConfig(repo, text) {
  fs.appendFileSync(path.join(repo, '.git', 'config'), text);
}

var CLAUDE = '\n\nCo-Authored-By: Claude <noreply@anthropic.com>';

// ---------------------------------------------------------------------------
// MEDIUM-02: the repository's own git config is checked before any git call
// ---------------------------------------------------------------------------

test('git-config-guard: a repo config with an include section is refused', { skip: !haveTool('git') }, function () {
  var guard = require(path.join(EXTRACTORS_DIR, 'git-config-guard.js'));
  var repo = makeRepo('xtr-include-');
  try {
    appendRepoConfig(repo, '[include]\n\tpath = //127.0.0.1/share/evil.gitconfig\n');
    var res = guard.checkRepoGitConfig(repo);
    assert.equal(res.ok, false);
    assert.match(res.reason, /include/i);
  } finally { rmrf(repo); }
});

test('git-config-guard: includeIf (any case) is refused', { skip: !haveTool('git') }, function () {
  var guard = require(path.join(EXTRACTORS_DIR, 'git-config-guard.js'));
  var repo = makeRepo('xtr-includeif-');
  try {
    appendRepoConfig(repo, '[IncludeIf "gitdir:/x/"]\n\tpath = local.cfg\n');
    assert.equal(guard.checkRepoGitConfig(repo).ok, false);
  } finally { rmrf(repo); }
});

test('git-config-guard: a UNC path in any repo config value is refused', { skip: !haveTool('git') }, function () {
  var guard = require(path.join(EXTRACTORS_DIR, 'git-config-guard.js'));
  var repo = makeRepo('xtr-unc-');
  try {
    appendRepoConfig(repo, '[core]\n\tattributesFile = "\\\\\\\\attacker\\\\share\\\\attrs"\n');
    var res = guard.checkRepoGitConfig(repo);
    assert.equal(res.ok, false);
    assert.match(res.reason, /UNC|network/i);
  } finally { rmrf(repo); }
});

test('git-config-guard: a .git file pointing at a UNC gitdir is refused without reading it', function () {
  var guard = require(path.join(EXTRACTORS_DIR, 'git-config-guard.js'));
  var dir = fs.mkdtempSync(path.join(os.tmpdir(), 'xtr-gitfile-'));
  try {
    fs.writeFileSync(path.join(dir, '.git'), 'gitdir: //attacker/share/repo.git\n');
    var res = guard.checkRepoGitConfig(dir);
    assert.equal(res.ok, false);
    assert.match(res.reason, /UNC|network/i);
  } finally { rmrf(dir); }
});

test('git-config-guard: an ordinary repo config passes', { skip: !haveTool('git') }, function () {
  var guard = require(path.join(EXTRACTORS_DIR, 'git-config-guard.js'));
  var repo = makeRepo('xtr-plain-');
  try {
    assert.deepEqual(guard.checkRepoGitConfig(repo), { ok: true, reason: null });
  } finally { rmrf(repo); }
});

test('git-evidence: refuses a repo whose config has an include, before running git', { skip: !haveTool('git') }, function () {
  var repo = makeRepo('xtr-refuse-');
  try {
    commitFile(repo, 'a.txt', 'init');
    appendRepoConfig(repo, '[include]\n\tpath = //127.0.0.1/share/evil.gitconfig\n');
    var r = runExtractor(GIT_EVIDENCE, repo);
    assert.notEqual(r.status, 0, 'extractor should refuse the repository');
    assert.match(r.stderr, /include/i);
  } finally { rmrf(repo); }
});

test('package-evidence: skips git for a repo whose config has an include', { skip: !haveTool('git') }, function () {
  var repo = makeRepo('xtr-pkg-refuse-');
  try {
    fs.writeFileSync(path.join(repo, 'package.json'), '{"name":"x","version":"1.0.0","dependencies":{}}');
    fs.writeFileSync(path.join(repo, 'package-lock.json'), '{"name":"x","version":"1.0.0","lockfileVersion":3,"packages":{"":{"name":"x","version":"1.0.0"}}}');
    commitFile(repo, 'a.txt', 'init');
    git(repo, ['add', 'package-lock.json']);
    git(repo, ['commit', '-q', '-m', 'lock']);
    appendRepoConfig(repo, '[include]\n\tpath = //127.0.0.1/share/evil.gitconfig\n');
    var r = runExtractor(PACKAGE_EVIDENCE, repo);
    assert.equal(r.status, 0, r.stderr);
    var out = JSON.parse(r.stdout);
    assert.equal(out.sbom.lockFileCommitted, null, 'git must not run, so tracking status is unknown');
    assert.match(r.stderr, /include/i);
  } finally { rmrf(repo); }
});

// ---------------------------------------------------------------------------
// LOW-04 / INFO-11: requirements are read statically; gaps are recorded
// ---------------------------------------------------------------------------

test('package-evidence: collectPinnedRequirements follows -r includes inside the repo and records gaps', function () {
  var pe = require(PACKAGE_EVIDENCE);
  var repo = fs.mkdtempSync(path.join(os.tmpdir(), 'xtr-req-'));
  var outside = fs.mkdtempSync(path.join(os.tmpdir(), 'xtr-req-out-'));
  try {
    fs.writeFileSync(path.join(outside, 'secret.txt'), 'leak==1.0\n');
    fs.writeFileSync(path.join(repo, 'prod.txt'), 'requests==2.25.0\n');
    fs.writeFileSync(path.join(repo, 'requirements.txt'), [
      '# comment',
      '-r prod.txt',
      '-r ' + path.join(outside, 'secret.txt'),
      'flask',
      'django>=4.0',
      'numpy==1.*',
      '-e ./local',
      'git+https://example.invalid/x.git#egg=x',
      'pkg @ file:///tmp/pkg',
      '--index-url https://example.invalid/simple',
      'urllib3[socks]==1.26.0 ; python_version >= "3.8"',
      'Click==8.1.7  # pinned',
      ''
    ].join('\n'));
    var res = pe.collectPinnedRequirements(repo);
    assert.deepEqual(res.pinned.sort(), ['Click==8.1.7', 'requests==2.25.0', 'urllib3[socks]==1.26.0']);
    var reasons = res.gaps.map(function (g) { return g.reason; });
    // outside include, flask, django>=, numpy==1.*, -e, git+, @ file:, --index-url
    assert.equal(res.gaps.length, 8, JSON.stringify(res.gaps));
    assert.ok(reasons.indexOf('not pinned') !== -1);
    assert.ok(reasons.indexOf('include outside repository') !== -1);
    assert.ok(reasons.indexOf('path or URL') !== -1);
    assert.ok(reasons.indexOf('option') !== -1);
    assert.ok(res.pinned.indexOf('leak==1.0') === -1, 'an include outside the repository was read');
  } finally { rmrf(repo); rmrf(outside); }
});

test('package-evidence: a requirements.txt symlink pointing outside the repo is not read', function (t) {
  var pe = require(PACKAGE_EVIDENCE);
  var repo = fs.mkdtempSync(path.join(os.tmpdir(), 'xtr-reqlink-'));
  var outside = fs.mkdtempSync(path.join(os.tmpdir(), 'xtr-reqlink-out-'));
  try {
    fs.writeFileSync(path.join(outside, 'r.txt'), 'leak==1.0\n');
    try { fs.symlinkSync(path.join(outside, 'r.txt'), path.join(repo, 'requirements.txt')); }
    catch (_e) { t.skip('cannot create symlinks here'); return; }
    var res = pe.collectPinnedRequirements(repo);
    assert.deepEqual(res.pinned, []);
    assert.equal(res.gaps[0].reason, 'include outside repository');
  } finally { rmrf(repo); rmrf(outside); }
});

test('package-evidence: a partial pip audit is labelled pip-partial and still counts pinned vulns',
  { skip: !(haveTool('git') && haveTool('pip-audit')) }, function () {
    var repo = makeRepo('xtr-pippartial-');
    try {
      fs.writeFileSync(path.join(repo, 'prod.txt'), 'requests==2.25.0\n');
      fs.writeFileSync(path.join(repo, 'requirements.txt'), '-r prod.txt\nflask\n');
      commitFile(repo, 'README.md', 'init');
      var r = runExtractor(PACKAGE_EVIDENCE, repo);
      assert.equal(r.status, 0, r.stderr);
      var v = JSON.parse(r.stdout).vulnerabilities;
      assert.deepEqual(v.auditsRun, ['pip-partial']);
      assert.ok(v.auditResults.moderate > 0, 'vulnerabilities in the included pinned file were not counted');
      assert.equal(v.auditGaps.length, 1);
      assert.equal(v.auditGaps[0].reason, 'not pinned');
    } finally { rmrf(repo); }
  });

// ---------------------------------------------------------------------------
// LOW-05: the copied manifest cannot choose the toolchain
// ---------------------------------------------------------------------------

test('package-evidence: sanitizeManifest drops toolchain-selection keys and keeps dependencies', function () {
  var pe = require(PACKAGE_EVIDENCE);
  var out = pe.sanitizeManifest({
    name: 'x', version: '1.0.0',
    dependencies: { a: '1.0.0' }, devDependencies: { b: '2.0.0' },
    volta: { node: '12.0.0', npm: '6.0.0' },
    packageManager: 'npm@6.0.0',
    engines: { npm: '6' },
    devEngines: { runtime: { name: 'node' } },
    scripts: { preinstall: 'evil' }
  });
  assert.deepEqual(out, { name: 'x', version: '1.0.0', dependencies: { a: '1.0.0' }, devDependencies: { b: '2.0.0' } });
});

// ---------------------------------------------------------------------------
// LOW-02 / INFO-01: linear-time parsing
// ---------------------------------------------------------------------------

test('ci-evidence: stripYamlComments is linear on long whitespace runs', function () {
  var ci = require(path.join(EXTRACTORS_DIR, 'ci-evidence.js'));
  var line = 'run: echo hi' + ' '.repeat(200000) + 'x';
  var t0 = Date.now();
  var out = ci.stripYamlComments(line + '\nkey: value  # note\n# whole line\n');
  assert.ok(Date.now() - t0 < 1000, 'took ' + (Date.now() - t0) + ' ms');
  assert.equal(out, line + '\nkey: value\n\n');
});

test('package-evidence: pyproject dependency parsing is linear in [project] headers', function () {
  var pe = require(PACKAGE_EVIDENCE);
  // No "dependencies = [" anywhere: the old lazy regex rescanned to the end
  // from every [project] header (60k headers took ~3 s).
  var text = '[project]\nname = "x"\n'.repeat(60000);
  var t0 = Date.now();
  assert.deepEqual(pe.parsePyprojectDependencies(text), []);
  assert.ok(Date.now() - t0 < 500, 'took ' + (Date.now() - t0) + ' ms');
});

test('package-evidence: parsePyprojectDependencies reads [project] dependencies', function () {
  var pe = require(PACKAGE_EVIDENCE);
  var text = [
    '[build-system]',
    'requires = ["setuptools"]',
    '',
    '[project]',
    'name = "x"',
    'dependencies = [',
    '  "requests==2.31.0",',
    "  'click>=8',",
    ']',
    ''
  ].join('\n');
  assert.deepEqual(pe.parsePyprojectDependencies(text), ['requests==2.31.0', 'click>=8']);
});

// ---------------------------------------------------------------------------
// INFO-09: SHA-256 repositories
// ---------------------------------------------------------------------------

test('git-evidence: AI attribution works in a SHA-256 repository',
  { skip: !(haveTool('git') && spawnSync('git', ['init', '-q', '--object-format=sha256', path.join(os.tmpdir(), 'xtr-sha256-probe-' + process.pid)], { stdio: 'ignore' }).status === 0) },
  function () {
    rmrf(path.join(os.tmpdir(), 'xtr-sha256-probe-' + process.pid));
    var repo = makeRepo('xtr-sha256-', ['--object-format=sha256']);
    try {
      commitFile(repo, 'a.txt', 'feat: a' + CLAUDE);
      var r = runExtractor(GIT_EVIDENCE, repo);
      assert.equal(r.status, 0, r.stderr);
      var ai = JSON.parse(r.stdout).aiCodeGeneration;
      assert.equal(ai.aiAttributedCommits, 1);
      assert.deepEqual(ai.topAiModifiedFiles.map(function (f) { return f.file; }), ['a.txt']);
    } finally { rmrf(repo); }
  });

// ---------------------------------------------------------------------------
// INFO-10: names that already carry an extension
// ---------------------------------------------------------------------------

test('resolve-binary: a name that already has a PATHEXT extension resolves on Windows',
  { skip: process.platform !== 'win32' || !haveTool('git') }, function () {
    var { resolveBinary } = require(path.join(EXTRACTORS_DIR, 'resolve-binary.js'));
    var found = resolveBinary('git.exe');
    assert.ok(found && path.isAbsolute(found) && /git\.exe$/i.test(found), String(found));
  });
