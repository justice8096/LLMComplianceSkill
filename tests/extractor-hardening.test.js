// @ai-generated - Claude Fable 5.1 (Anthropic)
/**
 * Regression tests for the Claude Security findings of 2026-10-11 against
 * tools/extractors (F1 CWE-88, F2 CWE-427, F3 CWE-918, F4 CWE-426).
 *
 * Each test builds a small hostile git repository in a temp directory and
 * runs the extractor against it. Tests are skipped when git is not
 * installed.
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

function haveGit() {
  var r = spawnSync('git', ['--version'], { stdio: 'ignore' });
  return r.status === 0;
}

function git(repo, args) {
  return execFileSync('git', ['-C', repo].concat(args), {
    encoding: 'utf8',
    stdio: ['pipe', 'pipe', 'pipe'],
  });
}

function makeRepo() {
  var repo = fs.mkdtempSync(path.join(os.tmpdir(), 'hardening-'));
  git(repo, ['init', '-q']);
  git(repo, ['config', 'user.email', 'test@example.com']);
  git(repo, ['config', 'user.name', 'Test']);
  git(repo, ['config', 'commit.gpgsign', 'false']);
  fs.writeFileSync(path.join(repo, 'a.txt'), 'a\n');
  git(repo, ['add', 'a.txt']);
  git(repo, ['commit', '-q', '-m', 'init']);
  return repo;
}

function runExtractor(script, repo) {
  return spawnSync(process.execPath, [script, '--repo', repo], {
    encoding: 'utf8',
    timeout: 120000,
  });
}

function rmrf(dir) {
  try { fs.rmSync(dir, { recursive: true, force: true }); } catch (_e) { /* ignore */ }
}

// F1: a commit body containing a COMMIT_START line used to forge a record
// whose first line was passed straight into git argv.
test('git-evidence: forged COMMIT_START block cannot inject git arguments', { skip: !haveGit() }, function() {
  var repo = makeRepo();
  var target = path.join(repo, 'pwned.txt');
  try {
    var body = 'feat: stuff\n\n' +
      'Co-authored-by: Claude <noreply@anthropic.com>\n' +
      'COMMIT_START\n' +
      'HEAD --output=' + target + '\n' +
      'Co-authored-by: Claude <noreply@anthropic.com>\n';
    fs.writeFileSync(path.join(repo, 'b.txt'), 'b\n');
    var msgFile = path.join(os.tmpdir(), 'hardening-msg-' + process.pid + '.txt');
    fs.writeFileSync(msgFile, body);
    git(repo, ['add', 'b.txt']);
    git(repo, ['commit', '-q', '-F', msgFile]);
    fs.unlinkSync(msgFile);
    var r = runExtractor(GIT_EVIDENCE, repo);
    assert.equal(r.status, 0, 'extractor exited non-zero: ' + r.stderr);
    assert.ok(!fs.existsSync(target), 'git --output was honoured: forged argv reached git');
    var out = JSON.parse(r.stdout);
    assert.equal(out.aiCodeGeneration.aiAttributedCommits, 1,
      'the real AI-attributed commit should still be counted exactly once');
  } finally {
    rmrf(repo);
  }
});

// F1 defence in depth: the git() helper refuses command strings entirely.
test('git-evidence: git() helper rejects command strings', function() {
  var src = fs.readFileSync(GIT_EVIDENCE, 'utf8');
  assert.ok(/if \(!Array\.isArray\(args\)\)/.test(src), 'git() must require an argv array');
  assert.ok(!/cmd\.split\(\/\\s\+\//.test(src), 'git() must not split command strings on whitespace');
  assert.ok(!/COMMIT_START/.test(src), 'record separator must not be a forgeable marker line');
});

// F4: every git invocation carries overrides for repo-local hooks/fsmonitor.
test('git-evidence: repo-local hooks and fsmonitor are disabled on every git call', { skip: !haveGit() }, function() {
  var repo = makeRepo();
  var marker = path.join(repo, 'hook-ran.txt');
  try {
    var hooksDir = path.join(repo, 'evil-hooks');
    fs.mkdirSync(hooksDir);
    var hook = process.platform === 'win32'
      ? 'echo ran > "' + marker + '"\r\n'
      : '#!/bin/sh\necho ran > "' + marker + '"\n';
    // pre-auto-gc / post-index-change style hooks are not triggered by log,
    // so use fsmonitor, which git consults on index-touching commands.
    var fsmon = path.join(repo, 'fsmon.sh');
    fs.writeFileSync(fsmon, hook, { mode: 448 });
    fs.writeFileSync(path.join(hooksDir, 'pre-commit'), hook, { mode: 448 });
    git(repo, ['config', 'core.hooksPath', hooksDir]);
    git(repo, ['config', 'core.fsmonitor', fsmon]);
    var r = runExtractor(GIT_EVIDENCE, repo);
    assert.equal(r.status, 0, 'extractor exited non-zero: ' + r.stderr);
    assert.ok(!fs.existsSync(marker), 'a repo-configured program was executed during extraction');
  } finally {
    rmrf(repo);
  }
});

// F2/F3: npm audit must not run inside the scanned repository and must not
// read its .npmrc; the extractor copies the manifest to a private directory.
test('package-evidence: npm audit runs isolated from the repository .npmrc', function() {
  var src = fs.readFileSync(PACKAGE_EVIDENCE, 'utf8');
  assert.ok(!/execSync\(/.test(src), 'execSync (shell) must not be used');
  assert.ok(/execFileSync\(/.test(src), 'execFileSync must be used');
  assert.ok(/shell:\s*false/.test(src), 'subprocesses must be started without a shell');
  assert.ok(/makeIsolatedDir\(repoPath,\s*\['package\.json'/.test(src),
    'npm audit must run from an isolated copy of the manifest');
  assert.ok(/--userconfig/.test(src) && /--globalconfig/.test(src),
    'npm user and global config must be overridden');
  assert.ok(/npm_config_strict_ssl:\s*'true'/.test(src), 'TLS verification must be forced on');
  assert.ok(/resolveBinary\('npm'\)/.test(src) && /resolveBinary\('pip-audit'\)/.test(src) && /resolveBinary\('git'\)/.test(src),
    'tools must be resolved to absolute paths from PATH, never from cwd');
});

test('resolve-binary: resolveBinary ignores relative PATH entries', function() {
  var src = fs.readFileSync(path.join(EXTRACTORS_DIR, 'resolve-binary.js'), 'utf8');
  assert.ok(/if \(!path\.isAbsolute\(dirs\[i\]\)\) continue;/.test(src),
    'relative PATH entries (including ".") must be skipped');
});

// F3 end to end: a repo .npmrc pointing at an unreachable registry must not
// affect the audit, because the audit never sees that file.
test('package-evidence: hostile .npmrc in the scanned repo does not reach npm audit', { skip: !haveGit() }, function() {
  var repo = makeRepo();
  try {
    fs.writeFileSync(path.join(repo, 'package.json'), JSON.stringify({
      name: 'hostile', version: '1.0.0', private: true, dependencies: {}
    }, null, 2));
    fs.writeFileSync(path.join(repo, 'package-lock.json'), JSON.stringify({
      name: 'hostile', version: '1.0.0', lockfileVersion: 3, requires: true,
      packages: { '': { name: 'hostile', version: '1.0.0' } }
    }, null, 2));
    // If this file were honoured, npm would try 127.0.0.1:9 and fail fast.
    fs.writeFileSync(path.join(repo, '.npmrc'),
      'registry=http://127.0.0.1:9/\nproxy=http://127.0.0.1:9/\nhttps-proxy=http://127.0.0.1:9/\nstrict-ssl=false\n');
    var r = runExtractor(PACKAGE_EVIDENCE, repo);
    assert.equal(r.status, 0, 'extractor exited non-zero: ' + r.stderr);
    // The extractor's own log never mentions the hostile host because npm
    // never loaded the repo .npmrc.
    assert.ok(r.stderr.indexOf('127.0.0.1:9') === -1, 'npm contacted the registry named in the repo .npmrc');
  } finally {
    rmrf(repo);
  }
});
