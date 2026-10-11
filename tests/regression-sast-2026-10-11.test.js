// @ai-generated - Claude Opus 5.5 (Anthropic)
/**
 * Regression tests for the post-commit SAST audit of 2026-10-11
 * (audits/sast-dast-scan.md at 304715e):
 *   HIGH-01   pip-audit -r installed the scanned repo's requirements (CWE-829)
 *   MEDIUM-01 git-evidence ran a bare 'git', so a git.exe in cwd could run (CWE-427)
 *   INFO-06   topAiModifiedFiles was always empty (hash read as a path after --)
 *   INFO-07   signedCommits was always 0 (gpg.program blanked)
 *   INFO-08   npm audit was silently skipped on Windows (extensionless npm chosen)
 *
 * The INFO tests check that each hardening step still produces correct
 * evidence, not only that the attack is blocked.
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
  var r = spawnSync(name, args || ['--version'], { stdio: 'ignore' });
  return r.status === 0;
}

function haveSshKeygen() {
  return !spawnSync('ssh-keygen', ['-?'], { stdio: 'ignore' }).error;
}

function haveNpm() {
  // Test-only probe; on Windows npm is npm.cmd, which needs a shell to start.
  return spawnSync('npm', ['--version'], { stdio: 'ignore', shell: true }).status === 0;
}

function git(repo, args) {
  return execFileSync('git', ['-C', repo].concat(args), {
    encoding: 'utf8',
    stdio: ['pipe', 'pipe', 'pipe'],
  });
}

function makeRepo(prefix) {
  var repo = fs.mkdtempSync(path.join(os.tmpdir(), prefix || 'sast-regress-'));
  git(repo, ['init', '-q']);
  git(repo, ['config', 'user.email', 'test@example.com']);
  git(repo, ['config', 'user.name', 'Test']);
  git(repo, ['config', 'commit.gpgsign', 'false']);
  return repo;
}

function commitFile(repo, name, message) {
  fs.writeFileSync(path.join(repo, name), name + '\n');
  git(repo, ['add', name]);
  var msgFile = path.join(os.tmpdir(), 'sast-regress-msg-' + process.pid + '.txt');
  fs.writeFileSync(msgFile, message);
  git(repo, ['commit', '-q', '-F', msgFile]);
  fs.unlinkSync(msgFile);
}

function runExtractor(script, repo, opts) {
  opts = opts || {};
  return spawnSync(process.execPath, [script, '--repo', repo], {
    encoding: 'utf8',
    timeout: 180000,
    cwd: opts.cwd,
    env: opts.env || process.env,
  });
}

function rmrf(dir) {
  try { fs.rmSync(dir, { recursive: true, force: true }); } catch (_e) { /* ignore */ }
}

var CLAUDE_TRAILER = '\n\nCo-Authored-By: Claude <noreply@anthropic.com>\n';

// ---------------------------------------------------------------------------
// HIGH-01
// ---------------------------------------------------------------------------

test('package-evidence: pip-audit never resolves or installs the scanned requirements', function () {
  var pe = require(PACKAGE_EVIDENCE);
  var args = pe.pipAuditArgs('/scanned/repo/requirements.txt');
  assert.ok(args.indexOf('--disable-pip') !== -1, 'pip-audit must run with --disable-pip');
  assert.ok(args.indexOf('--no-deps') !== -1, 'pip-audit must run with --no-deps');
  var r = args.indexOf('-r');
  assert.equal(args[r + 1], '/scanned/repo/requirements.txt');
});

test('package-evidence: a hostile setup.py in the scanned repo is not executed by pip-audit',
  { skip: !(haveTool('git') && haveTool('pip-audit')) }, function () {
    var repo = makeRepo('sast-pip-');
    var marker = path.join(os.tmpdir(), 'sast-pip-marker-' + process.pid + '.txt');
    rmrf(marker);
    try {
      fs.mkdirSync(path.join(repo, 'evil'));
      fs.writeFileSync(path.join(repo, 'evil', 'setup.py'),
        'open(' + JSON.stringify(marker) + ', "w").write("pwned")\n' +
        'from setuptools import setup\nsetup(name="evil", version="0.0.1")\n');
      fs.writeFileSync(path.join(repo, 'requirements.txt'), './evil\nrequests==2.31.0\n');
      commitFile(repo, 'README.md', 'init');
      var r = runExtractor(PACKAGE_EVIDENCE, repo);
      assert.equal(r.status, 0, 'extractor exited non-zero: ' + r.stderr);
      assert.ok(!fs.existsSync(marker), 'setup.py from the scanned repository was executed');
    } finally {
      rmrf(repo);
      rmrf(marker);
    }
  });

// ---------------------------------------------------------------------------
// MEDIUM-01
// ---------------------------------------------------------------------------

test('git-evidence: a git.exe planted in the working directory is never run',
  { skip: process.platform !== 'win32' || !haveTool('git') }, function () {
    var repo = makeRepo('sast-gitpath-');
    var plantDir = fs.mkdtempSync(path.join(os.tmpdir(), 'sast-plant-'));
    try {
      commitFile(repo, 'b.txt', 'feat: b' + CLAUDE_TRAILER);
      // The planted "git" is a copy of node. Given git's argv it exits with
      // "bad option", so every git call would fail and no commits would be seen.
      var planted = path.join(plantDir, 'git.exe');
      try { fs.linkSync(process.execPath, planted); } catch (_e) { fs.copyFileSync(process.execPath, planted); }
      var env = Object.assign({}, process.env);
      // Restore the default Windows search order, which tries cwd first.
      delete env.NoDefaultCurrentDirectoryInExePath;
      delete env.NODEFAULTCURRENTDIRECTORYINEXEPATH;
      var r = runExtractor(GIT_EVIDENCE, repo, { cwd: plantDir, env: env });
      assert.equal(r.status, 0, 'extractor exited non-zero: ' + r.stderr);
      var out = JSON.parse(r.stdout);
      assert.equal(out.aiCodeGeneration.aiAttributedCommits, 1,
        'git calls failed: the planted git.exe in the working directory was run');
    } finally {
      rmrf(repo);
      rmrf(plantDir);
    }
  });

// ---------------------------------------------------------------------------
// INFO-06
// ---------------------------------------------------------------------------

test('git-evidence: topAiModifiedFiles lists files touched by AI-attributed commits',
  { skip: !haveTool('git') }, function () {
    var repo = makeRepo('sast-aifiles-');
    try {
      commitFile(repo, 'first.txt', 'feat: root commit' + CLAUDE_TRAILER);
      commitFile(repo, 'second.txt', 'feat: second' + CLAUDE_TRAILER);
      commitFile(repo, 'human.txt', 'feat: human only\n');
      var r = runExtractor(GIT_EVIDENCE, repo);
      assert.equal(r.status, 0, 'extractor exited non-zero: ' + r.stderr);
      var files = JSON.parse(r.stdout).aiCodeGeneration.topAiModifiedFiles.map(function (f) { return f.file; }).sort();
      assert.deepEqual(files, ['first.txt', 'second.txt']);
    } finally {
      rmrf(repo);
    }
  });

// ---------------------------------------------------------------------------
// INFO-07
// ---------------------------------------------------------------------------

test('git-evidence: a commit with a valid SSH signature counts as signed',
  { skip: !(haveTool('git') && haveSshKeygen()) }, function () {
    var repo = makeRepo('sast-signed-');
    var keyDir = fs.mkdtempSync(path.join(os.tmpdir(), 'sast-key-'));
    try {
      var key = path.join(keyDir, 'id');
      execFileSync('ssh-keygen', ['-t', 'ed25519', '-N', '', '-q', '-C', 'test@example.com', '-f', key]);
      var pub = fs.readFileSync(key + '.pub', 'utf8').trim();
      var allowed = path.join(keyDir, 'allowed_signers');
      fs.writeFileSync(allowed, 'test@example.com ' + pub + '\n');
      git(repo, ['config', 'gpg.format', 'ssh']);
      git(repo, ['config', 'user.signingkey', key + '.pub']);
      git(repo, ['config', 'gpg.ssh.allowedSignersFile', allowed]);
      fs.writeFileSync(path.join(repo, 's.txt'), 's\n');
      git(repo, ['add', 's.txt']);
      git(repo, ['commit', '-q', '-S', '-m', 'signed']);
      assert.equal(git(repo, ['log', '-1', '--format=%G?']).trim(), 'G', 'fixture: plain git must verify the signature');
      var r = runExtractor(GIT_EVIDENCE, repo);
      assert.equal(r.status, 0, 'extractor exited non-zero: ' + r.stderr);
      assert.equal(JSON.parse(r.stdout).securityPractices.signedCommits, 1);
    } finally {
      rmrf(repo);
      rmrf(keyDir);
    }
  });

test('git-evidence: a repo-configured gpg.ssh.program is not run during signature checks',
  { skip: !haveTool('git') }, function () {
    var repo = makeRepo('sast-sigprog-');
    var marker = path.join(os.tmpdir(), 'sast-sigprog-marker-' + process.pid);
    rmrf(marker);
    try {
      // A "program" that would create the marker if git ever launched it.
      var evil = path.join(repo, process.platform === 'win32' ? 'evil.exe' : 'evil.sh');
      if (process.platform === 'win32') {
        try { fs.linkSync(process.execPath, evil); } catch (_e) { fs.copyFileSync(process.execPath, evil); }
      } else {
        fs.writeFileSync(evil, '#!/bin/sh\ntouch ' + JSON.stringify(marker) + '\n', { mode: 0o755 });
      }
      git(repo, ['config', 'gpg.format', 'ssh']);
      git(repo, ['config', 'gpg.ssh.program', evil]);
      git(repo, ['config', 'gpg.program', evil]);
      commitFile(repo, 'a.txt', 'init');
      var r = runExtractor(GIT_EVIDENCE, repo);
      assert.equal(r.status, 0, 'extractor exited non-zero: ' + r.stderr);
      assert.ok(!fs.existsSync(marker), 'a signing program named in the scanned repo config was run');
    } finally {
      rmrf(repo);
      rmrf(marker);
    }
  });

// ---------------------------------------------------------------------------
// INFO-08
// ---------------------------------------------------------------------------

test('package-evidence: reports which dependency audits actually ran, and npm audit runs when npm is installed',
  { skip: !(haveTool('git') && haveNpm()) }, function () {
    var repo = makeRepo('sast-npm-');
    try {
      fs.writeFileSync(path.join(repo, 'package.json'), JSON.stringify({
        name: 'fixture', version: '1.0.0', private: true, dependencies: {}
      }, null, 2));
      fs.writeFileSync(path.join(repo, 'package-lock.json'), JSON.stringify({
        name: 'fixture', version: '1.0.0', lockfileVersion: 3, requires: true,
        packages: { '': { name: 'fixture', version: '1.0.0' } }
      }, null, 2));
      commitFile(repo, 'README.md', 'init');
      var r = runExtractor(PACKAGE_EVIDENCE, repo);
      assert.equal(r.status, 0, 'extractor exited non-zero: ' + r.stderr);
      var out = JSON.parse(r.stdout);
      assert.deepEqual(out.vulnerabilities.auditsRun, ['npm'], 'stderr: ' + r.stderr);
    } finally {
      rmrf(repo);
    }
  });
