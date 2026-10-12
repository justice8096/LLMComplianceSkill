#!/usr/bin/env node
// @ai-generated - Claude Opus 5.5 (Anthropic)
/**
 * Generate sbom.json (CycloneDX 1.5) from the files that define what ships.
 *
 *   - tooling/package.json    the project itself (name, version, license)
 *   - tooling/package-lock.json   build-only packages (scope "excluded")
 *   - RUNTIME_CDN below       scripts and data the world map loads in the
 *                             viewer's browser (scope "required")
 *
 * Output is deterministic: components are sorted, and there is no timestamp
 * unless you pass --timestamp. That lets CI diff the committed file.
 *
 * Usage:
 *   node tools/generate-sbom.js                 # write sbom.json
 *   node tools/generate-sbom.js --stdout        # print, write nothing
 *   node tools/generate-sbom.js --check         # exit 1 if sbom.json is stale
 *   node tools/generate-sbom.js --out <file>    # another target file
 *   node tools/generate-sbom.js --timestamp <ISO-8601>
 *
 * Zero dependencies: Node built-ins only.
 */

'use strict';

var fs = require('fs');
var path = require('path');
var crypto = require('crypto');

var ROOT = path.join(__dirname, '..');

// Third-party code the world map (AI-Regulations-World-Map.html, docs/world-map.html
// and the copy in skills/ai-compliance/references/regulations/) loads at runtime.
// Keep in step with the <script> tags and the fetch() URL in those files.
var RUNTIME_CDN = [
  { name: 'd3', version: '7.9.0', license: 'ISC',
    url: 'https://cdnjs.cloudflare.com/ajax/libs/d3/7.9.0/d3.min.js' },
  { name: 'topojson', version: '3.0.2', license: 'BSD-3-Clause',
    url: 'https://cdnjs.cloudflare.com/ajax/libs/topojson/3.0.2/topojson.min.js' },
  { name: 'world-atlas', version: '2.0.2', license: 'ISC',
    url: 'https://cdn.jsdelivr.net/npm/world-atlas@2.0.2/countries-110m.json' },
];

function readJson(p) { return JSON.parse(fs.readFileSync(p, 'utf8')); }

function purl(name, version) {
  // Package URL spec: the npm scope's "@" is percent-encoded.
  return 'pkg:npm/' + name.replace(/^@/, '%40') + '@' + version;
}

function licenses(id) {
  if (!id || typeof id !== 'string') return undefined;
  if (/\s(OR|AND|WITH)\s|[()]/.test(id)) return [{ expression: id }];
  return [{ license: { id: id } }];
}

function hashesFromIntegrity(integrity) {
  if (!integrity) return undefined;
  var out = [];
  String(integrity).split(/\s+/).forEach(function(sri) {
    var m = sri.match(/^sha(256|384|512)-(.+)$/);
    if (m) out.push({ alg: 'SHA-' + m[1], content: Buffer.from(m[2], 'base64').toString('hex') });
  });
  return out.length ? out : undefined;
}

function compact(obj) {
  Object.keys(obj).forEach(function(k) { if (obj[k] === undefined) delete obj[k]; });
  return obj;
}

function toolingComponents(lockPath) {
  var lock = readJson(lockPath);
  var seen = {};
  Object.keys(lock.packages || {}).forEach(function(key) {
    if (key === '') return;
    var entry = lock.packages[key];
    if (entry.link || !entry.version) return;
    var name = entry.name || key.slice(key.lastIndexOf('node_modules/') + 'node_modules/'.length);
    var ref = purl(name, entry.version);
    if (seen[ref]) return;
    seen[ref] = compact({
      type: 'library',
      'bom-ref': ref,
      name: name,
      version: entry.version,
      scope: 'excluded',
      licenses: licenses(entry.license),
      hashes: hashesFromIntegrity(entry.integrity),
      purl: ref,
      externalReferences: entry.resolved ? [{ type: 'distribution', url: entry.resolved }] : undefined,
    });
  });
  return Object.keys(seen).map(function(k) { return seen[k]; });
}

var WORLD_MAP_COPIES = [
  'AI-Regulations-World-Map.html',
  'docs/world-map.html',
  'skills/ai-compliance/references/regulations/AI-Regulations-World-Map.html',
];

var SRI_ALG = { sha256: 'SHA-256', sha384: 'SHA-384', sha512: 'SHA-512' };

/**
 * The SRI hash every world-map copy pins for url, as a CycloneDX hash.
 * Throws when a copy does not load url, has no integrity value next to it,
 * or the copies disagree. That makes `npm run sbom:check` fail in CI when
 * the pinned assets and the SBOM drift apart.
 */
function pinnedHash(root, url) {
  var found = null;
  WORLD_MAP_COPIES.forEach(function(rel) {
    var html = fs.readFileSync(path.join(root, rel), 'utf8');
    var at = html.indexOf(url);
    if (at === -1) throw new Error(rel + ' does not load ' + url);
    var near = html.slice(at, at + 400);
    var m = near.match(/integrity\s*[=:]\s*["'](sha256|sha384|sha512)-([A-Za-z0-9+/=]+)["']/);
    if (!m) throw new Error(rel + ' loads ' + url + ' without an integrity hash');
    var sri = m[1] + '-' + m[2];
    if (found && found !== sri) throw new Error('world map copies pin different integrity hashes for ' + url);
    found = sri;
  });
  var dash = found.indexOf('-');
  return {
    alg: SRI_ALG[found.slice(0, dash)],
    content: Buffer.from(found.slice(dash + 1), 'base64').toString('hex'),
  };
}

function runtimeComponents(root) {
  return RUNTIME_CDN.map(function(c) {
    var ref = purl(c.name, c.version);
    return {
      type: 'library',
      'bom-ref': ref,
      name: c.name,
      version: c.version,
      scope: 'required',
      hashes: [pinnedHash(root, c.url)],
      licenses: licenses(c.license),
      purl: ref,
      externalReferences: [{ type: 'distribution', url: c.url, comment: 'Loaded from CDN by the world map at runtime' }],
    };
  });
}

// A stable urn:uuid derived from the content, so identical input gives an identical file.
function serialFor(body) {
  var h = crypto.createHash('sha256').update(JSON.stringify(body)).digest('hex');
  return 'urn:uuid:' + h.slice(0, 8) + '-' + h.slice(8, 12) + '-5' + h.slice(13, 16) + '-' +
    ((parseInt(h[16], 16) & 3) | 8).toString(16) + h.slice(17, 20) + '-' + h.slice(20, 32);
}

function generate(opts) {
  opts = opts || {};
  var root = opts.root || ROOT;
  var pkg = readJson(path.join(root, 'tooling', 'package.json'));
  var rootRef = purl(pkg.name, pkg.version);
  var components = toolingComponents(path.join(root, 'tooling', 'package-lock.json'))
    .concat(runtimeComponents(root))
    .sort(function(a, b) { return a['bom-ref'] < b['bom-ref'] ? -1 : a['bom-ref'] > b['bom-ref'] ? 1 : 0; });

  var metadata = compact({
    timestamp: opts.timestamp,
    tools: { components: [{ type: 'application', name: 'generate-sbom.js', description: 'tools/generate-sbom.js in this repository' }] },
    component: compact({
      type: 'application',
      'bom-ref': rootRef,
      name: pkg.name,
      version: pkg.version,
      description: pkg.description,
      licenses: licenses(pkg.license),
      purl: rootRef,
      externalReferences: [
        { type: 'vcs', url: 'https://github.com/justice8096/LLMComplianceSkill' },
        { type: 'website', url: 'https://justice8096.github.io/LLMComplianceSkill/' },
      ],
    }),
  });

  var body = {
    metadata: metadata,
    components: components,
    dependencies: [{ ref: rootRef, dependsOn: components.filter(function(c) { return c.scope === 'required'; }).map(function(c) { return c['bom-ref']; }) }],
  };
  // The serial number ignores the timestamp so --check compares like with like.
  var serial = serialFor({ metadata: Object.assign({}, metadata, { timestamp: undefined }), components: components });
  return Object.assign({ bomFormat: 'CycloneDX', specVersion: '1.5', serialNumber: serial, version: 1 }, body);
}

function render(bom) { return JSON.stringify(bom, null, 2) + '\n'; }

function main(argv) {
  var out = path.join(ROOT, 'sbom.json');
  var mode = 'write';
  var timestamp;
  for (var i = 0; i < argv.length; i++) {
    if (argv[i] === '--stdout') mode = 'stdout';
    else if (argv[i] === '--check') mode = 'check';
    else if (argv[i] === '--out' && argv[i + 1]) out = path.resolve(argv[++i]);
    else if (argv[i] === '--timestamp' && argv[i + 1]) timestamp = argv[++i];
    else { console.error('[sbom] unknown argument: ' + argv[i]); return 2; }
  }
  if (timestamp !== undefined && isNaN(Date.parse(timestamp))) {
    console.error('[sbom] --timestamp is not an ISO-8601 date: ' + timestamp);
    return 2;
  }

  if (mode === 'check') {
    var current;
    try { current = readJson(out); } catch (e) { console.error('[sbom] cannot read ' + out + ': ' + e.message); return 1; }
    // Compare without the timestamp, which a release run may have added.
    var expected = render(generate({}));
    var have = Object.assign({}, current);
    if (have.metadata) { have.metadata = Object.assign({}, have.metadata); delete have.metadata.timestamp; }
    if (render(have) !== expected) {
      console.error('[sbom] ' + path.relative(ROOT, out) + ' is stale. Run: npm run sbom');
      return 1;
    }
    console.log('[sbom] ' + path.relative(ROOT, out) + ' is current');
    return 0;
  }

  var text = render(generate({ timestamp: timestamp }));
  if (mode === 'stdout') { process.stdout.write(text); return 0; }
  fs.writeFileSync(out, text);
  console.log('[sbom] wrote ' + path.relative(ROOT, out));
  return 0;
}

if (require.main === module) process.exitCode = main(process.argv.slice(2));

module.exports = { generate: generate, render: render, RUNTIME_CDN: RUNTIME_CDN };
