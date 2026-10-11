// @ai-generated - Claude Opus 5.5 (Anthropic)
/**
 * Regression tests for the soundcheck review follow-ups (PR #13):
 * - git-evidence counts each AI tool once per commit, even when several
 *   patterns name the same tool.
 * - sync-kb --check ignores CRLF vs LF differences in text files.
 */

'use strict';

var test = require('node:test');
var assert = require('node:assert/strict');
var path = require('path');
var fs = require('fs');
var os = require('os');
var { execFileSync, spawnSync } = require('child_process');

var ROOT = path.join(__dirname, '..');
var GIT_EVIDENCE = path.join(ROOT, 'tools', 'extractors', 'git-evidence.js');
var SYNC_KB = path.join(ROOT, 'tools', 'sync-kb.js');

function haveGit() {
  return spawnSync('git', ['--version'], { stdio: 'ignore' }).status === 0;
}

function git(repo, args) {
  return execFileSync('git', ['-C', repo].concat(args), { encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] });
}

test('git-evidence counts a Claude trailer once per commit', { skip: !haveGit() }, function () {
  var repo = fs.mkdtempSync(path.join(os.tmpdir(), 'ai-count-'));
  try {
    git(repo, ['init', '-q']);
    git(repo, ['config', 'user.email', 'test@example.com']);
    git(repo, ['config', 'user.name', 'Test']);
    git(repo, ['config', 'commit.gpgsign', 'false']);
    for (var i = 0; i < 2; i++) {
      fs.writeFileSync(path.join(repo, 'f' + i + '.txt'), String(i));
      git(repo, ['add', '.']);
      // This trailer matches the "claude", "anthrop" and noreply@anthropic.com patterns.
      git(repo, ['commit', '-q', '-m', 'change ' + i + '\n\nCo-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>']);
    }
    var out = execFileSync(process.execPath, [GIT_EVIDENCE, '--repo', repo], { encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] });
    var ai = JSON.parse(out).aiCodeGeneration;
    assert.equal(ai.aiAttributedCommits, 2);
    var claude = ai.aiToolsDetected.find(function (t) { return t.tool === 'Claude'; });
    assert.ok(claude, 'Claude should be detected');
    assert.equal(claude.commits, 2);
  } finally {
    fs.rmSync(repo, { recursive: true, force: true });
  }
});

test('sync-kb --check treats CRLF and LF copies as identical', function () {
  var tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'sync-kb-'));
  try {
    // Build a fake skill root with sync-kb.js and a fake knowledge base next to it.
    var skill = path.join(tmp, 'skill');
    var kb = path.join(tmp, 'kb');
    fs.mkdirSync(path.join(skill, 'tools'), { recursive: true });
    fs.copyFileSync(SYNC_KB, path.join(skill, 'tools', 'sync-kb.js'));
    fs.mkdirSync(path.join(kb, 'regulations'), { recursive: true });
    var lf = '# UK\n\nLine one\nLine two\n';
    fs.writeFileSync(path.join(kb, 'regulations', 'AI-Regulations-UK.md'), lf);
    fs.writeFileSync(path.join(skill, 'AI-Regulations-UK.md'), lf.replace(/\n/g, '\r\n'));
    var refs = path.join(skill, 'skills', 'ai-compliance', 'references', 'regulations');
    fs.mkdirSync(refs, { recursive: true });
    fs.writeFileSync(path.join(refs, 'AI-Regulations-UK.md'), lf);

    var r = spawnSync(process.execPath, [path.join(skill, 'tools', 'sync-kb.js'), '--check', '--from', kb], { encoding: 'utf8' });
    assert.equal(r.status, 0, r.stdout + r.stderr);

    // A real content change must still be reported.
    fs.writeFileSync(path.join(refs, 'AI-Regulations-UK.md'), lf + 'Extra\n');
    r = spawnSync(process.execPath, [path.join(skill, 'tools', 'sync-kb.js'), '--check', '--from', kb], { encoding: 'utf8' });
    assert.equal(r.status, 1, 'content drift should fail the check');
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }
});
