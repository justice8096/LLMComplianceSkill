// @ai-generated - Claude Opus 5.5 (Anthropic)
/**
 * Regression tests for the extractor findings left open by the post-fix
 * re-audit of 2026-10-11 (audits/sast-dast-scan.md):
 *   (MEDIUM-02 git config isolation: see regression-git-sandbox-2026-10-12.test.js)
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

// ---------------------------------------------------------------------------
// Round-2 re-audit: LOW-04 depth, LOW-06 pyproject/Pipfile, INFO-12 hashes,
// credentials in gap entries
// ---------------------------------------------------------------------------

test('package-evidence: includes nested past the depth limit are recorded as a gap', function () {
  var pe = require(PACKAGE_EVIDENCE);
  var repo = fs.mkdtempSync(path.join(os.tmpdir(), 'xtr-deep-'));
  try {
    fs.writeFileSync(path.join(repo, 'requirements.txt'), '-r r1.txt\n');
    for (var i = 1; i < 8; i++) fs.writeFileSync(path.join(repo, 'r' + i + '.txt'), '-r r' + (i + 1) + '.txt\n');
    fs.writeFileSync(path.join(repo, 'r8.txt'), 'requests==2.25.0\n');
    var res = pe.collectPinnedRequirements(repo);
    assert.deepEqual(res.pinned, []);
    assert.ok(res.gaps.some(function (g) { return g.reason === 'include nesting too deep'; }), JSON.stringify(res.gaps));
  } finally { rmrf(repo); }
});

test('package-evidence: pyproject.toml pins are audited and its ranges recorded even with requirements.txt', function () {
  var pe = require(PACKAGE_EVIDENCE);
  var repo = fs.mkdtempSync(path.join(os.tmpdir(), 'xtr-pyproj-req-'));
  try {
    fs.writeFileSync(path.join(repo, 'requirements.txt'), 'requests==2.25.0\n');
    fs.writeFileSync(path.join(repo, 'pyproject.toml'), '[project]\nname = "x"\ndependencies = ["urllib3==1.26.0", "click>=8"]\n');
    fs.writeFileSync(path.join(repo, 'Pipfile'), '[packages]\nflask = "*"\n');
    var res = pe.collectPinnedRequirements(repo);
    assert.deepEqual(res.pinned.sort(), ['requests==2.25.0', 'urllib3==1.26.0']);
    assert.ok(res.gaps.some(function (g) { return g.file === 'pyproject.toml' && g.reason === 'not pinned'; }), JSON.stringify(res.gaps));
    assert.ok(res.gaps.some(function (g) { return g.file === 'Pipfile' && g.reason === 'Pipfile is not audited'; }), JSON.stringify(res.gaps));
  } finally { rmrf(repo); }
});

test('package-evidence: hash-pinned requirements (pip-compile --generate-hashes) are audited', function () {
  var pe = require(PACKAGE_EVIDENCE);
  var repo = fs.mkdtempSync(path.join(os.tmpdir(), 'xtr-hashes-'));
  try {
    fs.writeFileSync(path.join(repo, 'requirements.txt'), [
      'requests==2.25.0 \\',
      '    --hash=sha256:aaaa \\',
      '    --hash=sha256:bbbb',
      'idna==2.10 --hash=sha256:cccc',
      ''
    ].join('\n'));
    var res = pe.collectPinnedRequirements(repo);
    assert.deepEqual(res.pinned.sort(), ['idna==2.10', 'requests==2.25.0']);
    assert.deepEqual(res.gaps, []);
  } finally { rmrf(repo); }
});

test('package-evidence: credentials in requirement URLs never reach the evidence', function () {
  var pe = require(PACKAGE_EVIDENCE);
  var repo = fs.mkdtempSync(path.join(os.tmpdir(), 'xtr-creds-'));
  try {
    fs.writeFileSync(path.join(repo, 'requirements.txt'),
      'git+https://alice:s3cr3t-token@git.example.invalid/x.git#egg=x\npkg @ https://tok3n@files.example.invalid/pkg.whl\n');
    var res = pe.collectPinnedRequirements(repo);
    var text = JSON.stringify(res.gaps);
    assert.equal(res.gaps.length, 2);
    assert.ok(text.indexOf('s3cr3t') === -1 && text.indexOf('tok3n') === -1 && text.indexOf('alice') === -1, text);
  } finally { rmrf(repo); }
});
