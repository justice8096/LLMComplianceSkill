#!/usr/bin/env node
// @ai-generated - Claude Fable 5.1 (Anthropic)
/**
 * Sync the regulation knowledge base into this skill.
 *
 * The canonical regulation files live in the ai-regulatory-knowledge-base repo
 * (github.com/justice8096/ai-regulatory-knowledge-base). This skill keeps a copy
 * at the repo root so the SKILL.md references resolve without a second checkout.
 * Run this after refreshing the knowledge base so the two never drift apart.
 *
 * Usage:
 *   node tools/sync-kb.js                 # looks for ../ai-regulatory-knowledge-base
 *   node tools/sync-kb.js --from <path>   # explicit knowledge-base checkout
 *   node tools/sync-kb.js --check         # exit 1 if any file differs, copy nothing
 *   node tools/sync-kb.js --to <path>     # write into another checkout of this repo (tests)
 *
 * A sync also records which knowledge-base commit it copied from, in
 * skills/ai-compliance/references/KB-SOURCE ("<sha> <commit date>"), so a
 * release can be traced back to the exact regulation corpus. --check writes
 * nothing; it only reports when KB-SOURCE names a different commit.
 */

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

let ROOT = path.join(__dirname, '..');
const args = process.argv.slice(2);
let from = path.join(ROOT, '..', 'ai-regulatory-knowledge-base');
let checkOnly = false;
for (let i = 0; i < args.length; i++) {
  if (args[i] === '--from' && args[i + 1]) from = path.resolve(args[++i]);
  else if (args[i] === '--check') checkOnly = true;
  else if (args[i] === '--to' && args[i + 1]) ROOT = path.resolve(args[++i]);
}
if (!args.includes('--from')) from = path.join(ROOT, '..', 'ai-regulatory-knowledge-base');

// Destinations: repo root (historical location), docs/ (site), and the skill's own
// references/ folder. The last one matters for claude.ai and Cowork, which package only
// skills/<name>/ with SKILL.md, so repo-root files are not available there.
const SKILL_REFS = path.join(ROOT, 'skills', 'ai-compliance', 'references');
const KB_SOURCE = path.join(SKILL_REFS, 'KB-SOURCE');
const PAIRS = [
  ['regulations', ROOT, /^AI-Regulations-.*\.md$/],
  ['regulations', path.join(SKILL_REFS, 'regulations'), /^AI-Regulations-.*\.md$/],
  ['visualizations', ROOT, /^AI-Regulations-World-Map\.html$/],
  ['visualizations', path.join(SKILL_REFS, 'regulations'), /^AI-Regulations-World-Map\.html$/],
  ['visualizations', path.join(ROOT, 'docs'), /^AI-Regulations-World-Map\.html$/, 'world-map.html'],
];
// Local data files mirrored from tools/data into the skill references (not from the KB).
const LOCAL_PAIRS = [
  [path.join(ROOT, 'tools', 'data'), path.join(SKILL_REFS, 'data'), /^(deadline-data|jurisdiction-matrix)\.json$/],
];

if (!fs.existsSync(from)) {
  console.error('[sync-kb] knowledge base not found at ' + from + ' (use --from <path>)');
  process.exit(2);
}

// Text files are compared and written with LF line endings, so a Windows
// checkout (core.autocrlf=true gives CRLF) does not report every file as changed.
const TEXT_RE = /\.(md|html|json)$/i;
function normalize(name, buf) {
  return TEXT_RE.test(name) ? Buffer.from(buf.toString('utf8').replace(/\r\n/g, '\n'), 'utf8') : buf;
}

let changed = 0;
let same = 0;
for (const [srcSub, dstDir, pattern, rename] of PAIRS) {
  const srcDir = path.join(from, srcSub);
  if (!fs.existsSync(srcDir)) continue;
  for (const name of fs.readdirSync(srcDir)) {
    if (!pattern.test(name)) continue;
    const src = path.join(srcDir, name);
    const dst = path.join(dstDir, rename || name);
    const srcBuf = normalize(name, fs.readFileSync(src));
    const dstBuf = fs.existsSync(dst) ? normalize(name, fs.readFileSync(dst)) : null;
    if (dstBuf && srcBuf.equals(dstBuf)) { same++; continue; }
    changed++;
    if (checkOnly) {
      console.log('[sync-kb] differs: ' + path.relative(ROOT, dst));
    } else {
      fs.mkdirSync(path.dirname(dst), { recursive: true });
      fs.writeFileSync(dst, srcBuf);
      console.log('[sync-kb] updated: ' + path.relative(ROOT, dst));
    }
  }
}

for (const [srcDir, dstDir, pattern] of LOCAL_PAIRS) {
  if (!fs.existsSync(srcDir)) continue;
  for (const name of fs.readdirSync(srcDir)) {
    if (!pattern.test(name)) continue;
    const src = path.join(srcDir, name);
    const dst = path.join(dstDir, name);
    const srcBuf = normalize(name, fs.readFileSync(src));
    const dstBuf = fs.existsSync(dst) ? normalize(name, fs.readFileSync(dst)) : null;
    if (dstBuf && srcBuf.equals(dstBuf)) { same++; continue; }
    changed++;
    if (checkOnly) {
      console.log('[sync-kb] differs: ' + path.relative(ROOT, dst));
    } else {
      fs.mkdirSync(path.dirname(dst), { recursive: true });
      fs.writeFileSync(dst, srcBuf);
      console.log('[sync-kb] updated: ' + path.relative(ROOT, dst));
    }
  }
}

// Provenance: which knowledge-base commit these files came from.
// git is started by absolute path with an argv array and no shell, and runs
// in the extractors' sandbox, so it never reads the checkout's own config.
function kbCommit(dir) {
  // Loaded here, not at the top, so the copy step still works when this
  // script runs on its own (tests copy it into a bare temp folder).
  let resolveBinary, prepareGitSandbox;
  try {
    resolveBinary = require('./extractors/resolve-binary').resolveBinary;
    prepareGitSandbox = require('./extractors/git-sandbox').prepareGitSandbox;
  } catch (_e) {
    return null;
  }
  const gitBin = resolveBinary('git');
  if (!gitBin) return null;
  const sandbox = prepareGitSandbox(dir);
  if (!sandbox.ok) {
    console.error('[sync-kb] warning: not running git on ' + dir + ': ' + sandbox.reason);
    return null;
  }
  const nullDevice = process.platform === 'win32' ? 'NUL' : '/dev/null';
  const base = ['-c', 'core.fsmonitor=false', '-c', 'core.hooksPath=' + nullDevice, '-C', dir];
  try {
    const out = execFileSync(gitBin, base.concat(['log', '-1', '--format=%H %cs']), {
      encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'], timeout: 15000,
      env: Object.assign({}, process.env, sandbox.env),
    }).trim();
    return /^[0-9a-f]{40}(?:[0-9a-f]{24})? \d{4}-\d{2}-\d{2}$/.test(out) ? out : null;
  } catch (_e) {
    return null;
  } finally {
    sandbox.cleanup();
  }
}

const commit = kbCommit(from);
const recorded = fs.existsSync(KB_SOURCE) ? fs.readFileSync(KB_SOURCE, 'utf8').trim() : null;
if (!commit) {
  console.error('[sync-kb] warning: ' + from + ' is not a git checkout (or git is not on PATH); source commit not recorded');
  if (!checkOnly && recorded !== null && changed > 0) {
    // The old record no longer describes these files.
    fs.rmSync(KB_SOURCE, { force: true });
    console.error('[sync-kb] removed stale ' + path.relative(ROOT, KB_SOURCE));
  }
} else if (checkOnly) {
  if (recorded && recorded.split(' ')[0] !== commit.split(' ')[0]) {
    console.log('[sync-kb] note: KB-SOURCE records ' + recorded.split(' ')[0] + ', knowledge base is at ' + commit.split(' ')[0]);
  }
} else if (recorded !== commit) {
  fs.mkdirSync(path.dirname(KB_SOURCE), { recursive: true });
  fs.writeFileSync(KB_SOURCE, commit + '\n');
  console.log('[sync-kb] recorded source commit ' + commit + ' in ' + path.relative(ROOT, KB_SOURCE));
}

console.log('[sync-kb] ' + changed + ' changed, ' + same + ' already current (source: ' + from + ')');
if (checkOnly && changed > 0) process.exit(1);
