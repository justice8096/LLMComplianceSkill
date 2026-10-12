// @ai-generated - Claude Opus 5.5 (Anthropic)
/**
 * Regression tests for the 2026-10-12 supply-chain audit
 * (audits/supply-chain-audit.md, findings SC-01, SC-03, SC-04, SC-06,
 * SC-07, SC-08, SC-09, SC-10, SC-11) and the README AI disclosure.
 */

'use strict';

var test = require('node:test');
var assert = require('node:assert/strict');
var fs = require('fs');
var os = require('os');
var path = require('path');
var cp = require('child_process');

var ROOT = path.join(__dirname, '..');
function read(p) { return fs.readFileSync(path.join(ROOT, p), 'utf8'); }
function json(p) { return JSON.parse(read(p)); }
function tmpDir(prefix) { return fs.mkdtempSync(path.join(os.tmpdir(), prefix)); }
function runNode(args, opts) {
  return cp.spawnSync(process.execPath, args, Object.assign({ cwd: ROOT, encoding: 'utf8' }, opts || {}));
}

var GEN = path.join(ROOT, 'tools', 'generate-sbom.js');
var SYNC = path.join(ROOT, 'tools', 'sync-kb.js');

// ---- SC-01: generated SBOM ----------------------------------------------

test('SC-01: generate-sbom.js produces CycloneDX 1.5 from tooling/package.json', function() {
  var r = runNode([GEN, '--stdout']);
  assert.equal(r.status, 0, r.stderr);
  var bom = JSON.parse(r.stdout);
  var pkg = json('tooling/package.json');
  assert.equal(bom.bomFormat, 'CycloneDX');
  assert.equal(bom.specVersion, '1.5');
  assert.equal(bom.metadata.component.name, pkg.name);
  assert.equal(bom.metadata.component.version, pkg.version);
  assert.equal(bom.metadata.component.purl, 'pkg:npm/' + pkg.name + '@' + pkg.version);
  assert.equal(bom.metadata.component.licenses[0].license.id, 'CC0-1.0');
  assert.equal(bom.metadata.timestamp, undefined, 'no timestamp unless --timestamp');
});

test('SC-01: every tooling lockfile package is an excluded component with a sha512 hash', function() {
  var bom = JSON.parse(runNode([GEN, '--stdout']).stdout);
  var lock = json('tooling/package-lock.json');
  var lockPkgs = Object.keys(lock.packages).filter(function(k) { return k !== ''; });
  assert.ok(lockPkgs.length > 0);
  lockPkgs.forEach(function(k) {
    var entry = lock.packages[k];
    var name = k.replace(/^.*node_modules\//, '');
    var purl = 'pkg:npm/' + name.replace(/^@/, '%40') + '@' + entry.version;
    var c = bom.components.find(function(x) { return x.purl === purl; });
    assert.ok(c, 'SBOM missing ' + purl);
    assert.equal(c.scope, 'excluded');
    assert.equal(c.version, entry.version);
    var m = entry.integrity.match(/^sha512-(.+)$/);
    var hex = Buffer.from(m[1], 'base64').toString('hex');
    assert.deepEqual(c.hashes, [{ alg: 'SHA-512', content: hex }]);
  });
});

test('SC-01: the world-map CDN runtime libraries are required components', function() {
  var bom = JSON.parse(runNode([GEN, '--stdout']).stdout);
  [['d3', '7.9.0'], ['topojson', '3.0.2'], ['world-atlas', '2.0.2']].forEach(function(p) {
    var c = bom.components.find(function(x) { return x.name === p[0]; });
    assert.ok(c, 'SBOM missing ' + p[0]);
    assert.equal(c.version, p[1]);
    assert.equal(c.scope, 'required');
    assert.ok(c.externalReferences && /^https:\/\//.test(c.externalReferences[0].url), p[0] + ' has no URL');
  });
});

test('SC-01: output is deterministic and sorted; --timestamp sets metadata.timestamp', function() {
  var a = runNode([GEN, '--stdout']).stdout;
  var b = runNode([GEN, '--stdout']).stdout;
  assert.equal(a, b);
  var refs = JSON.parse(a).components.map(function(c) { return c['bom-ref']; });
  assert.deepEqual(refs, refs.slice().sort());
  var t = JSON.parse(runNode([GEN, '--stdout', '--timestamp', '2026-10-12T00:00:00Z']).stdout);
  assert.equal(t.metadata.timestamp, '2026-10-12T00:00:00Z');
});

test('SC-01: committed sbom.json is current, and --check fails on a stale file', function() {
  var ok = runNode([GEN, '--check']);
  assert.equal(ok.status, 0, ok.stdout + ok.stderr);
  var dir = tmpDir('sbom-');
  var stale = path.join(dir, 'sbom.json');
  fs.writeFileSync(stale, read('sbom.json').replace('"' + json('tooling/package.json').version + '"', '"0.0.0"'));
  var bad = runNode([GEN, '--check', '--out', stale]);
  assert.equal(bad.status, 1);
  assert.equal(json('sbom.json').metadata.component.version, json('tooling/package.json').version);
});

// ---- SC-06: KB provenance -----------------------------------------------

function git(cwd, args) {
  return cp.execFileSync('git', args, { cwd: cwd, encoding: 'utf8' }).trim();
}
function fakeKb() {
  var kb = tmpDir('fake-kb-');
  fs.mkdirSync(path.join(kb, 'regulations'));
  fs.writeFileSync(path.join(kb, 'regulations', 'AI-Regulations-Test.md'), '# test\n');
  git(kb, ['init', '-q']);
  git(kb, ['-c', 'user.email=t@example.invalid', '-c', 'user.name=t', 'add', '.']);
  git(kb, ['-c', 'user.email=t@example.invalid', '-c', 'user.name=t', '-c', 'commit.gpgsign=false',
    'commit', '-q', '-m', 'init', '--date', '2026-10-01T12:00:00Z']);
  return kb;
}

test('SC-06: sync records the knowledge-base commit in references/KB-SOURCE', function() {
  var kb = fakeKb();
  var dest = tmpDir('sync-dest-');
  var r = runNode([SYNC, '--from', kb, '--to', dest]);
  assert.equal(r.status, 0, r.stdout + r.stderr);
  var sha = git(kb, ['rev-parse', 'HEAD']);
  var file = path.join(dest, 'skills', 'ai-compliance', 'references', 'KB-SOURCE');
  var line = fs.readFileSync(file, 'utf8');
  assert.match(line, new RegExp('^' + sha + ' \\d{4}-\\d{2}-\\d{2}\\n$'));
  assert.ok(fs.existsSync(path.join(dest, 'AI-Regulations-Test.md')), 'regulation file not copied to --to root');
});

test('SC-06: --check never writes KB-SOURCE', function() {
  var kb = fakeKb();
  var dest = tmpDir('sync-check-');
  var r = runNode([SYNC, '--check', '--from', kb, '--to', dest]);
  // Exit 1 (files differ) proves the script ran rather than crashing.
  assert.equal(r.status, 1, r.stdout + r.stderr);
  assert.equal(fs.existsSync(path.join(dest, 'skills', 'ai-compliance', 'references', 'KB-SOURCE')), false);
  assert.equal(fs.existsSync(path.join(dest, 'AI-Regulations-Test.md')), false);
});

test('SC-06: sync-kb starts git by absolute path with an argv array, no shell', function() {
  var src = read('tools/sync-kb.js');
  assert.match(src, /require\(['"]\.\/extractors\/resolve-binary(\.js)?['"]\)/);
  assert.match(src, /execFileSync\(/);
  assert.doesNotMatch(src, /\bexecSync\(|shell:\s*true/);
});

// ---- CI workflow (SC-04, SC-08, SC-09) ----------------------------------

var lint = read('.github/workflows/lint.yml');

// Directory UNREAD_ASSET_REFERENCED: a folder glob next to node --check also
// matched an image, which held the plugin for review. The syntax check lists
// tracked .js files only and walks no folder.
test('CI syntax check lists tracked .js files and walks no folder', function() {
  assert.match(lint, /git ls-files -- '\*\.js'/);
  assert.doesNotMatch(lint, /\bfind \./);
  assert.doesNotMatch(lint, /-not -path/);
});

test('SC-09: CI runs npm test and the SBOM check', function() {
  assert.match(lint, /run:\s*npm --prefix tooling test\b/);
  assert.match(lint, /run:\s*npm --prefix tooling run sbom:check\b/);
});

test('SC-04: npm audit gate is moderate', function() {
  assert.match(lint, /--audit-level=moderate/);
  assert.doesNotMatch(lint, /--audit-level=high/);
});

test('SC-08: provenance job attests v* tags with a SHA-pinned action and least privilege', function() {
  assert.match(lint, /tags:\s*\[\s*['"]?v\*['"]?\s*\]/);
  assert.match(lint, /uses: actions\/attest-build-provenance@[0-9a-f]{40}\b/);
  assert.match(lint, /startsWith\(github\.ref, 'refs\/tags\/v'\)/);
  assert.match(lint, /id-token: write/);
  assert.match(lint, /attestations: write/);
  // The workflow default stays read-only.
  assert.match(lint, /^permissions:\s*\n\s+contents: read\s*$/m);
  // Every action reference is pinned to a full commit SHA.
  (lint.match(/uses:\s*\S+/g) || []).forEach(function(u) {
    assert.match(u, /@[0-9a-f]{40}$/, u + ' is not SHA-pinned');
  });
});

// ---- SC-07, SC-03, SC-11 ------------------------------------------------

test('SC-07: dependabot watches tooling npm and github-actions weekly', function() {
  var d = read('.github/dependabot.yml');
  assert.match(d, /package-ecosystem:\s*["']?npm["']?\s*\n\s+directory:\s*["']?\/tooling["']?/);
  assert.match(d, /package-ecosystem:\s*["']?github-actions["']?\s*\n\s+directory:\s*["']?\/["']?/);
  assert.equal((d.match(/interval:\s*["']?weekly/g) || []).length, 2);
});

test('SC-03: tooling saves exact versions', function() {
  assert.match(read('tooling/.npmrc'), /^save-exact=true$/m);
});

test('SC-11: Node floor is 20 and no doc still claims Node 18', function() {
  assert.equal(json('tooling/package.json').engines.node, '>=20.0.0');
  assert.doesNotMatch(read('README.md'), /Node(\.js)?\s*18\b/i);
  assert.ok(json('tooling/package.json').scripts.sbom);
  assert.ok(json('tooling/package.json').scripts['sbom:check']);
});

// ---- SC-10 (partial) and README disclosure ------------------------------

test('SC-10: Llama 3.1 knowledge cutoff matches Meta model card (December 2023)', function() {
  var m = json('tools/data/llm-registry-meta.json').models.find(function(x) { return x.id === 'meta-llama-3.1'; });
  assert.equal(m.trainingDataCutoff, '2023-12');
});

test('README AI disclosure is current and points at the measurement', function() {
  var readme = read('README.md');
  var sec = readme.split('## AI Attribution')[1].split('\n## ')[0];
  assert.doesNotMatch(sec, /62%/);
  assert.doesNotMatch(sec, /built with \[?Claude Sonnet 4\.6/);
  assert.match(sec, /node tools\/extractors\/git-evidence\.js/);
  assert.match(sec, /Co-Authored-By/);
  assert.match(sec, /\b\d{1,3}% of commits\b/);
});

// SC-16: the SBOM's CDN components take their hashes from the world map
// itself, so the SBOM and the pinned assets cannot drift apart.
var MAP_COPIES = [
  'AI-Regulations-World-Map.html',
  'docs/world-map.html',
  'skills/ai-compliance/references/regulations/AI-Regulations-World-Map.html'
];

test('generate-sbom: CDN components carry the hashes the world map pins', function () {
  var gen = require(path.join(__dirname, '..', 'tools', 'generate-sbom.js'));
  var sbom = gen.generate();
  var d3 = sbom.components.find(function (c) { return c.name === 'd3'; });
  var expected = Buffer.from('vc58qvvBdrDR4etbxMdlTt4GBQk1qjvyORR2nrsPsFPyrs+/u5c3+1Ct6upOgdZoIl7eq6k3a1UPDSNAQi/32A==', 'base64').toString('hex');
  assert.deepEqual(d3.hashes, [{ alg: 'SHA-512', content: expected }]);
  var atlas = sbom.components.find(function (c) { return c.name === 'world-atlas'; });
  assert.equal(atlas.hashes[0].alg, 'SHA-384');
});

test('generate-sbom: fails when a world map copy does not pin a CDN asset', function () {
  var gen = require(path.join(__dirname, '..', 'tools', 'generate-sbom.js'));
  var repoRoot = path.join(__dirname, '..');
  var tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'sbom-sri-'));
  try {
    fs.mkdirSync(path.join(tmp, 'tooling'));
    fs.copyFileSync(path.join(repoRoot, 'tooling', 'package.json'), path.join(tmp, 'tooling', 'package.json'));
    fs.copyFileSync(path.join(repoRoot, 'tooling', 'package-lock.json'), path.join(tmp, 'tooling', 'package-lock.json'));
    MAP_COPIES.forEach(function (rel, i) {
      var html = fs.readFileSync(path.join(repoRoot, rel), 'utf8');
      if (i === 1) html = html.replace(/ integrity="sha512-[^"]+"/, '');
      fs.mkdirSync(path.dirname(path.join(tmp, rel)), { recursive: true });
      fs.writeFileSync(path.join(tmp, rel), html);
    });
    assert.throws(function () { gen.generate({ root: tmp }); }, /integrity/i);
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }
});
