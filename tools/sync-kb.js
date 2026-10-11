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

const PAIRS = [
  ['regulations', ROOT, /^AI-Regulations-.*\.md$/],
  ['visualizations', ROOT, /^AI-Regulations-World-Map\.html$/],
  ['visualizations', path.join(ROOT, 'docs'), /^AI-Regulations-World-Map\.html$/, 'world-map.html'],
];

if (!fs.existsSync(from)) {
  console.error('[sync-kb] knowledge base not found at ' + from + ' (use --from <path>)');
  process.exit(2);
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
    const srcBuf = fs.readFileSync(src);
    const dstBuf = fs.existsSync(dst) ? fs.readFileSync(dst) : null;
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
