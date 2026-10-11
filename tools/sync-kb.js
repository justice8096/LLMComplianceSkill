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
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const args = process.argv.slice(2);
let from = path.join(ROOT, '..', 'ai-regulatory-knowledge-base');
let checkOnly = false;
for (let i = 0; i < args.length; i++) {
  if (args[i] === '--from' && args[i + 1]) from = path.resolve(args[++i]);
  else if (args[i] === '--check') checkOnly = true;
}

// Destinations: repo root (historical location), docs/ (site), and the skill's own
// references/ folder. The last one matters for claude.ai and Cowork, which package only
// skills/<name>/ with SKILL.md, so repo-root files are not available there.
const SKILL_REFS = path.join(ROOT, 'skills', 'ai-compliance', 'references');
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

console.log('[sync-kb] ' + changed + ' changed, ' + same + ' already current (source: ' + from + ')');
if (checkOnly && changed > 0) process.exit(1);
