#!/usr/bin/env node
// @ai-generated — Claude Sonnet 4.6 (Anthropic)
/**
 * Package Evidence Extractor — SBOM & Dependency Supply Chain Evidence
 *
 * Extracts dependency inventory, SBOM evidence, vulnerability audit results,
 * license compliance data, dependency freshness, and AI tool dependency analysis
 * from any project repository.
 *
 * Supports: npm, pip, cargo, go, composer, maven, gradle
 *
 * Zero external dependencies — uses only Node.js built-ins and system CLIs.
 *
 * Usage:
 *   node package-evidence.js [--repo <path>] [--output <path>]
 *
 * Evidence templates served:
 *   T23 — Supply Chain Risk Management (sections 1, 3.3, 9)
 *   T15 — Security Assessment (vulnerability evidence)
 *
 * Security note: external tools (npm, pip-audit, git) are started with
 * execFileSync and an argv array, never through a shell, and always by the
 * absolute path resolved from the operator's PATH before any directory
 * change, so a scanned repository cannot plant an npm.cmd of its own
 * (CWE-427). npm audit runs in a private temporary directory holding only
 * copies of package.json and the lockfile, so the scanned repository's
 * npm config file cannot redirect, proxy or disable TLS on the audit request
 * (CWE-918). git runs with repository-local hooks, fsmonitor and external
 * diff drivers disabled (CWE-426). Point --repo only at repositories you
 * trust; the extractors read their contents but should never execute them.
 *
 * Metadata:
 *   Author: Claude (Anthropic)
 *   Version: 1.0.0
 */

const fs = require('fs');
const path = require('path');
const os = require('os');
const { execFileSync } = require('child_process');
const { childEnv } = require('./child-env');
const { resolveBinary } = require('./resolve-binary');
const { prepareGitSandbox, isNetworkPath, linksToNetwork } = require('./git-sandbox');

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const VERSION = '1.0.0';

const AI_PACKAGES = {
  // API clients — data leaves the device
  'openai':               { type: 'api-client', dataFlow: 'cloud' },
  '@anthropic-ai/sdk':    { type: 'api-client', dataFlow: 'cloud' },
  'anthropic':            { type: 'api-client', dataFlow: 'cloud' },
  'cohere':               { type: 'api-client', dataFlow: 'cloud' },
  'cohere-ai':            { type: 'api-client', dataFlow: 'cloud' },
  'google-generativeai':  { type: 'api-client', dataFlow: 'cloud' },
  '@google/generative-ai':{ type: 'api-client', dataFlow: 'cloud' },
  'replicate':            { type: 'api-client', dataFlow: 'cloud' },
  'together-ai':          { type: 'api-client', dataFlow: 'cloud' },
  'mistralai':            { type: 'api-client', dataFlow: 'cloud' },
  '@mistralai/mistralai': { type: 'api-client', dataFlow: 'cloud' },
  'groq-sdk':             { type: 'api-client', dataFlow: 'cloud' },
  'ai':                   { type: 'api-client', dataFlow: 'cloud' },  // Vercel AI SDK

  // Frameworks — may use APIs or local models
  'langchain':            { type: 'framework', dataFlow: 'configurable' },
  '@langchain/core':      { type: 'framework', dataFlow: 'configurable' },
  '@langchain/openai':    { type: 'framework', dataFlow: 'cloud' },
  '@langchain/anthropic': { type: 'framework', dataFlow: 'cloud' },
  'langchain-openai':     { type: 'framework', dataFlow: 'cloud' },
  'langchain-anthropic':  { type: 'framework', dataFlow: 'cloud' },
  'langchain-community':  { type: 'framework', dataFlow: 'configurable' },
  'llamaindex':           { type: 'framework', dataFlow: 'configurable' },
  'llama-index':          { type: 'framework', dataFlow: 'configurable' },
  'llama_index':          { type: 'framework', dataFlow: 'configurable' },
  'haystack-ai':          { type: 'framework', dataFlow: 'configurable' },
  'semantic-kernel':      { type: 'framework', dataFlow: 'configurable' },
  'autogen':              { type: 'framework', dataFlow: 'configurable' },
  'crewai':               { type: 'framework', dataFlow: 'configurable' },

  // Local inference — data stays on device
  'transformers':         { type: 'local-inference', dataFlow: 'local' },
  'torch':                { type: 'local-inference', dataFlow: 'local' },
  'pytorch':              { type: 'local-inference', dataFlow: 'local' },
  'tensorflow':           { type: 'local-inference', dataFlow: 'local' },
  'tf':                   { type: 'local-inference', dataFlow: 'local' },
  '@tensorflow/tfjs':     { type: 'local-inference', dataFlow: 'local' },
  '@tensorflow/tfjs-node':{ type: 'local-inference', dataFlow: 'local' },
  'onnxruntime':          { type: 'local-inference', dataFlow: 'local' },
  'onnxruntime-node':     { type: 'local-inference', dataFlow: 'local' },
  'onnxruntime-web':      { type: 'local-inference', dataFlow: 'local' },
  'huggingface_hub':      { type: 'local-inference', dataFlow: 'local' },
  '@huggingface/inference':{ type: 'api-client', dataFlow: 'cloud' },
  '@huggingface/transformers': { type: 'local-inference', dataFlow: 'local' },
  'ollama':               { type: 'local-inference', dataFlow: 'local' },
  'ollama-ai-provider':   { type: 'local-inference', dataFlow: 'local' },
  'llama-cpp':            { type: 'local-inference', dataFlow: 'local' },
  'llama.cpp':            { type: 'local-inference', dataFlow: 'local' },
  'node-llama-cpp':       { type: 'local-inference', dataFlow: 'local' },
  'mlx':                  { type: 'local-inference', dataFlow: 'local' },
  'jax':                  { type: 'local-inference', dataFlow: 'local' },
  'flax':                 { type: 'local-inference', dataFlow: 'local' },
  'diffusers':            { type: 'local-inference', dataFlow: 'local' },
  'safetensors':          { type: 'local-inference', dataFlow: 'local' },
  'accelerate':           { type: 'local-inference', dataFlow: 'local' },
  'bitsandbytes':         { type: 'local-inference', dataFlow: 'local' },
  'peft':                 { type: 'local-inference', dataFlow: 'local' },
  'trl':                  { type: 'local-inference', dataFlow: 'local' },
  'sentence-transformers':{ type: 'local-inference', dataFlow: 'local' },
  'spacy':                { type: 'local-inference', dataFlow: 'local' },
  'scikit-learn':         { type: 'local-inference', dataFlow: 'local' },
  'sklearn':              { type: 'local-inference', dataFlow: 'local' },
  'xgboost':              { type: 'local-inference', dataFlow: 'local' },
  'lightgbm':             { type: 'local-inference', dataFlow: 'local' },
  'catboost':             { type: 'local-inference', dataFlow: 'local' },
  'keras':                { type: 'local-inference', dataFlow: 'local' },
};

const COPYLEFT_LICENSES = [
  'GPL', 'GPL-2.0', 'GPL-3.0', 'GPL-2.0-only', 'GPL-2.0-or-later',
  'GPL-3.0-only', 'GPL-3.0-or-later',
  'AGPL', 'AGPL-3.0', 'AGPL-3.0-only', 'AGPL-3.0-or-later',
  'LGPL', 'LGPL-2.0', 'LGPL-2.1', 'LGPL-3.0',
  'LGPL-2.0-only', 'LGPL-2.0-or-later', 'LGPL-2.1-only', 'LGPL-2.1-or-later',
  'LGPL-3.0-only', 'LGPL-3.0-or-later',
  'MPL', 'MPL-2.0',
  'EUPL', 'EUPL-1.1', 'EUPL-1.2',
  'CPAL-1.0', 'OSL-3.0', 'SSPL-1.0',
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function log(msg) {
  process.stderr.write('[package-evidence] ' + msg + '\n');
}

function parseArgs() {
  const args = process.argv.slice(2);
  let repo = process.cwd();
  let output = null;
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--repo' && args[i + 1]) {
      repo = path.resolve(args[++i]);
    } else if (args[i] === '--output' && args[i + 1]) {
      output = path.resolve(args[++i]);
    }
  }
  return { repo, output };
}

function fileExists(filePath) {
  try {
    return fs.statSync(filePath).isFile();
  } catch (_e) { return false; }
}

function dirExists(dirPath) {
  try {
    return fs.statSync(dirPath).isDirectory();
  } catch (_e) { return false; }
}

function readJSON(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (_e) { return null; }
}

function readText(filePath) {
  try {
    return fs.readFileSync(filePath, 'utf8');
  } catch (_e) { return null; }
}

/**
 * Run an external tool by absolute path with an argv array and no shell.
 * `file` must come from resolveBinary() or be process.execPath; `args`
 * entries are passed to the OS as discrete arguments, so a space or quote
 * inside one of them can never become a second argument.
 */
function runTool(file, args, cwd, timeoutMs, extraEnv) {
  timeoutMs = timeoutMs || 60000;
  if (!file || !path.isAbsolute(file)) {
    return { ok: false, stdout: '', stderr: 'tool not found', code: null };
  }
  var env = childEnv(extraEnv);
  try {
    var result = execFileSync(file, args, {
      cwd: cwd,
      env: env,
      timeout: timeoutMs,
      stdio: ['pipe', 'pipe', 'pipe'],
      encoding: 'utf8',
      windowsHide: true,
      shell: false,
    });
    return { ok: true, stdout: result };
  } catch (e) {
    // execFileSync throws on non-zero exit code; stdout may still be useful
    return { ok: false, stdout: e.stdout || '', stderr: e.stderr || '', code: e.status };
  }
}

/**
 * Resolve how to start npm without a shell. On Windows the PATH entry is
 * npm.cmd, which cannot be spawned shell-free, so prefer the npm-cli.js that
 * ships beside it and run it with the current Node binary. Returns
 * { file, prefixArgs } or null when npm is not installed.
 */
function resolveNpm() {
  var npmPath = resolveBinary('npm');
  if (!npmPath) return null;
  var ext = path.extname(npmPath).toLowerCase();
  if (ext === '.cmd' || ext === '.bat' || ext === '.ps1') {
    var cli = path.join(path.dirname(npmPath), 'node_modules', 'npm', 'bin', 'npm-cli.js');
    if (fileExists(cli)) return { file: process.execPath, prefixArgs: [cli] };
    // Also try the npm bundled with the running Node binary.
    cli = path.join(path.dirname(process.execPath), 'node_modules', 'npm', 'bin', 'npm-cli.js');
    if (fileExists(cli)) return { file: process.execPath, prefixArgs: [cli] };
    return null;
  }
  return { file: npmPath, prefixArgs: [] };
}

/**
 * Hardened git runner: argv array, no shell, and the sandbox environment
 * from prepareGitSandbox(), so git never reads the repository's own config.
 * The -c overrides remain as a second layer.
 */
function runGit(args, repoPath, timeoutMs, sandboxEnv) {
  if (!sandboxEnv) throw new Error('runGit() requires the repository sandbox environment');
  var gitPath = resolveBinary('git');
  var hardening = [
    '-c', 'core.fsmonitor=false',
    '-c', 'core.hooksPath=' + os.devNull,
    '-c', 'diff.external=',
    '-c', 'protocol.allow=never',
  ];
  return runTool(gitPath, ['-C', repoPath].concat(hardening, args), repoPath, timeoutMs, sandboxEnv);
}

/**
 * Create a private temporary directory holding copies of only the named
 * files from the repository, so a package manager run there sees no
 * repository-supplied configuration (npm and yarn config files, scripts).
 */
function makeIsolatedDir(repoPath, fileNames) {
  var dir = fs.mkdtempSync(path.join(os.tmpdir(), 'package-evidence-'));
  for (var i = 0; i < fileNames.length; i++) {
    var src = path.join(repoPath, fileNames[i]);
    if (!fileExists(src)) continue;
    if (fileNames[i] === 'package.json') {
      // Copy only the dependency fields, so keys such as "volta" or
      // "packageManager" cannot choose which npm or Node runs (CWE-15).
      var manifest = readJSON(src);
      if (manifest) {
        fs.writeFileSync(path.join(dir, 'package.json'), JSON.stringify(sanitizeManifest(manifest), null, 2));
      }
      continue;
    }
    fs.copyFileSync(src, path.join(dir, fileNames[i]));
  }
  return dir;
}

var MANIFEST_KEEP = [
  'name', 'version', 'private', 'workspaces', 'overrides',
  'dependencies', 'devDependencies', 'optionalDependencies',
  'peerDependencies', 'peerDependenciesMeta', 'bundleDependencies', 'bundledDependencies'
];

/**
 * The fields of a package.json that npm audit needs. Everything else is
 * dropped: toolchain selectors (volta, packageManager, engines, devEngines),
 * scripts and config.
 */
function sanitizeManifest(manifest) {
  var out = {};
  for (var i = 0; i < MANIFEST_KEEP.length; i++) {
    var key = MANIFEST_KEEP[i];
    if (Object.prototype.hasOwnProperty.call(manifest, key)) out[key] = manifest[key];
  }
  return out;
}

function removeDir(dir) {
  try { fs.rmSync(dir, { recursive: true, force: true }); } catch (_e) { /* best effort */ }
}

function getFileAgeDays(filePath) {
  try {
    var stat = fs.statSync(filePath);
    var now = Date.now();
    return Math.floor((now - stat.mtimeMs) / 86400000);
  } catch (_e) { return null; }
}

function isGitTracked(filePath, repoPath, sandboxEnv) {
  var rel = path.relative(repoPath, filePath).replace(/\\/g, '/');
  // The path is one argv entry after "--", so a name containing spaces,
  // quotes or a leading dash is still a pathspec and never an option.
  var result = runGit(['ls-files', '--error-unmatch', '--', rel], repoPath, 5000, sandboxEnv);
  return result.ok;
}

function isCopyleft(license) {
  if (!license) return false;
  var upper = license.toUpperCase();
  return COPYLEFT_LICENSES.some(function (cl) { return upper.indexOf(cl.toUpperCase()) !== -1; });
}

function isVersionPinned(version) {
  if (!version) return false;
  // Pinned: exact version like "1.2.3" or "=1.2.3" or "==1.2.3"
  // Floating: ^, ~, >=, *, latest, x, etc.
  var v = version.trim();
  if (/^[=]*\d+\.\d+\.\d+/.test(v)) return true;
  if (/^[~^>=<*]/.test(v)) return false;
  if (v === 'latest' || v === '*') return false;
  // Bare version number (e.g. "1.2.3") is pinned
  if (/^\d+\.\d+(\.\d+)?$/.test(v)) return true;
  return false;
}

// ---------------------------------------------------------------------------
// Ecosystem Detectors
// ---------------------------------------------------------------------------

function detectEcosystems(repoPath) {
  var found = [];
  if (fileExists(path.join(repoPath, 'package.json'))) found.push('npm');
  if (fileExists(path.join(repoPath, 'requirements.txt')) ||
      fileExists(path.join(repoPath, 'Pipfile')) ||
      fileExists(path.join(repoPath, 'pyproject.toml'))) found.push('pip');
  if (fileExists(path.join(repoPath, 'Cargo.toml'))) found.push('cargo');
  if (fileExists(path.join(repoPath, 'go.mod'))) found.push('go');
  if (fileExists(path.join(repoPath, 'composer.json'))) found.push('composer');
  if (fileExists(path.join(repoPath, 'pom.xml'))) found.push('maven');
  if (fileExists(path.join(repoPath, 'build.gradle')) ||
      fileExists(path.join(repoPath, 'build.gradle.kts'))) found.push('gradle');
  return found;
}

// ---------------------------------------------------------------------------
// NPM Parser
// ---------------------------------------------------------------------------

function parseNpm(repoPath) {
  log('Parsing npm ecosystem...');
  var packages = [];
  var pkgJsonPath = path.join(repoPath, 'package.json');
  var lockPath = path.join(repoPath, 'package-lock.json');
  var yarnLockPath = path.join(repoPath, 'yarn.lock');

  var pkgJson = readJSON(pkgJsonPath);
  if (!pkgJson) return { packages: packages, lockFile: null, lockPresent: false };

  var directNames = new Set(Object.keys(pkgJson.dependencies || {}));
  var devNames = new Set(Object.keys(pkgJson.devDependencies || {}));

  var lockPresent = false;
  var lockFile = null;

  // Try package-lock.json first
  if (fileExists(lockPath)) {
    lockPresent = true;
    lockFile = 'package-lock.json';
    log('  Parsing package-lock.json for full dependency tree...');
    var lock = readJSON(lockPath);
    if (lock) {
      // lockfileVersion 2/3 uses "packages", v1 uses "dependencies"
      if (lock.packages) {
        var entries = Object.entries(lock.packages);
        for (var idx = 0; idx < entries.length; idx++) {
          var pkgPath = entries[idx][0];
          var info = entries[idx][1];
          if (pkgPath === '') continue; // root entry
          var name = pkgPath.replace(/^node_modules\//, '').replace(/^.*node_modules\//, '');
          if (!name) continue;
          var isDirect = directNames.has(name) || devNames.has(name);
          var license = extractNpmPackageLicense(repoPath, name, info);
          packages.push({
            name: name,
            version: info.version || '',
            license: license,
            direct: isDirect,
            ecosystem: 'npm',
          });
        }
      } else if (lock.dependencies) {
        // v1 format
        parseLockV1Deps(lock.dependencies, directNames, devNames, packages, repoPath);
      }
    }
  } else if (fileExists(yarnLockPath)) {
    lockPresent = true;
    lockFile = 'yarn.lock';
    log('  Parsing yarn.lock...');
    // yarn.lock is not JSON; extract names and versions with regex
    var yarnLock = readText(yarnLockPath);
    if (yarnLock) {
      var re = /^"?(@?[^@\n"]+)@[^:]+":?\n\s+version[:\s]+"?([^"\n]+)/gm;
      var m;
      var seen = new Set();
      while ((m = re.exec(yarnLock)) !== null) {
        var yarnName = m[1].trim();
        var yarnVersion = m[2].trim();
        var key = yarnName + '@' + yarnVersion;
        if (seen.has(key)) continue;
        seen.add(key);
        var yarnIsDirect = directNames.has(yarnName) || devNames.has(yarnName);
        var yarnLicense = extractNpmPackageLicense(repoPath, yarnName);
        packages.push({ name: yarnName, version: yarnVersion, license: yarnLicense, direct: yarnIsDirect, ecosystem: 'npm' });
      }
    }
  }

  // If no lock file, just use package.json direct deps
  if (!lockPresent) {
    log('  WARNING: No lock file found - using package.json only');
    var allDeps = Object.assign({}, pkgJson.dependencies || {}, pkgJson.devDependencies || {});
    var depEntries = Object.entries(allDeps);
    for (var di = 0; di < depEntries.length; di++) {
      var depName = depEntries[di][0];
      var depVersion = depEntries[di][1];
      var depLicense = extractNpmPackageLicense(repoPath, depName);
      packages.push({ name: depName, version: depVersion, license: depLicense, direct: true, ecosystem: 'npm' });
    }
  }

  return { packages: packages, lockFile: lockFile, lockPresent: lockPresent };
}

function parseLockV1Deps(deps, directNames, devNames, packages, repoPath) {
  var entries = Object.entries(deps);
  for (var i = 0; i < entries.length; i++) {
    var name = entries[i][0];
    var info = entries[i][1];
    var isDirect = directNames.has(name) || devNames.has(name);
    var license = extractNpmPackageLicense(repoPath, name);
    packages.push({
      name: name,
      version: info.version || '',
      license: license,
      direct: isDirect,
      ecosystem: 'npm',
    });
    if (info.dependencies) {
      parseLockV1Deps(info.dependencies, directNames, devNames, packages, repoPath);
    }
  }
}

function extractNpmPackageLicense(repoPath, pkgName, lockInfo) {
  // Try reading the installed package's package.json
  var installedPkgJson = path.join(repoPath, 'node_modules', pkgName, 'package.json');
  // Reject names that could escape node_modules (e.g. "../../x" from a crafted lockfile).
  var safeName = /^(@[\w.~-]+\/)?[\w.~-]+$/.test(pkgName) && pkgName.indexOf('..') === -1;
  var pkg = safeName ? readJSON(installedPkgJson) : null;
  if (pkg) {
    if (typeof pkg.license === 'string') return pkg.license;
    if (typeof pkg.license === 'object' && pkg.license && pkg.license.type) return pkg.license.type;
    if (Array.isArray(pkg.licenses) && pkg.licenses.length > 0) {
      return pkg.licenses.map(function (l) { return typeof l === 'string' ? l : l.type; }).join(' OR ');
    }
  }
  // Fallback: lock info may carry license (lockfileVersion 3)
  if (lockInfo && lockInfo.license) return lockInfo.license;
  return 'UNKNOWN';
}

// ---------------------------------------------------------------------------
// Pip Parser
// ---------------------------------------------------------------------------

function parsePip(repoPath) {
  log('Parsing pip ecosystem...');
  var packages = [];
  var lockPresent = false;
  var lockFile = null;

  // requirements.txt
  var reqPath = path.join(repoPath, 'requirements.txt');
  if (fileExists(reqPath)) {
    var text = readText(reqPath);
    if (text) {
      var lines = text.split('\n');
      for (var i = 0; i < lines.length; i++) {
        var trimmed = lines[i].trim();
        if (!trimmed || trimmed.charAt(0) === '#' || trimmed.charAt(0) === '-') continue;
        var match = trimmed.match(/^([A-Za-z0-9_.-]+)\s*([>=<~!]=?\s*\S+)?/);
        if (match) {
          packages.push({
            name: match[1],
            version: (match[2] || '').replace(/\s/g, ''),
            license: 'UNKNOWN',
            direct: true,
            ecosystem: 'pip',
          });
        }
      }
    }
  }

  // Pipfile
  var pipfilePath = path.join(repoPath, 'Pipfile');
  if (fileExists(pipfilePath)) {
    var pipText = readText(pipfilePath);
    if (pipText) {
      var inPackages = false;
      var pipLines = pipText.split('\n');
      for (var pi = 0; pi < pipLines.length; pi++) {
        var pLine = pipLines[pi];
        if (/^\[packages\]/.test(pLine)) { inPackages = true; continue; }
        if (/^\[/.test(pLine)) { inPackages = false; continue; }
        if (inPackages) {
          var pm = pLine.match(/^([A-Za-z0-9_.-]+)\s*=\s*"?([^"]*)"?/);
          if (pm) {
            var pName = pm[1];
            var pVersion = pm[2] === '*' ? '*' : pm[2];
            if (!packages.find(function (p) { return p.name.toLowerCase() === pName.toLowerCase(); })) {
              packages.push({ name: pName, version: pVersion, license: 'UNKNOWN', direct: true, ecosystem: 'pip' });
            }
          }
        }
      }
    }
  }

  // Pipfile.lock
  var pipfileLockPath = path.join(repoPath, 'Pipfile.lock');
  if (fileExists(pipfileLockPath)) {
    lockPresent = true;
    lockFile = 'Pipfile.lock';
    var lock = readJSON(pipfileLockPath);
    if (lock && lock.default) {
      var directNameSet = new Set(packages.map(function (p) { return p.name.toLowerCase(); }));
      var lockEntries = Object.entries(lock.default);
      for (var li = 0; li < lockEntries.length; li++) {
        var lName = lockEntries[li][0];
        var lInfo = lockEntries[li][1];
        var lVersion = (lInfo.version || '').replace(/^==/, '');
        var lIsDirect = directNameSet.has(lName.toLowerCase());
        if (!lIsDirect) {
          packages.push({ name: lName, version: lVersion, license: 'UNKNOWN', direct: false, ecosystem: 'pip' });
        } else {
          var existing = packages.find(function (p) { return p.name.toLowerCase() === lName.toLowerCase(); });
          if (existing && !existing.version) existing.version = lVersion;
        }
      }
    }
  }

  // pyproject.toml (PEP 621 / Poetry)
  var pyprojectPath = path.join(repoPath, 'pyproject.toml');
  if (fileExists(pyprojectPath)) {
    var pyText = readText(pyprojectPath);
    if (pyText) {
      // PEP 621: [project] dependencies
      var pepDeps = parsePyprojectDependencies(pyText);
      for (var di = 0; di < pepDeps.length; di++) {
        var dm = pepDeps[di].match(/^([A-Za-z0-9_.-]+)(?:\[[^\]]*\])?\s*(.*)$/);
        if (dm) {
          var dName = dm[1];
          if (!packages.find(function (p) { return p.name.toLowerCase() === dName.toLowerCase(); })) {
            packages.push({ name: dName, version: (dm[2] || '').trim(), license: 'UNKNOWN', direct: true, ecosystem: 'pip' });
          }
        }
      }

      // Poetry: [tool.poetry.dependencies]
      var inPoetryDeps = false;
      var pyLines = pyText.split('\n');
      for (var pyi = 0; pyi < pyLines.length; pyi++) {
        var pyLine = pyLines[pyi];
        if (/^\[tool\.poetry\.dependencies\]/.test(pyLine)) { inPoetryDeps = true; continue; }
        if (/^\[/.test(pyLine)) { inPoetryDeps = false; continue; }
        if (inPoetryDeps) {
          var pym = pyLine.match(/^([A-Za-z0-9_.-]+)\s*=\s*"?([^"]*)"?/);
          if (pym && pym[1] !== 'python') {
            var pyName = pym[1];
            if (!packages.find(function (p) { return p.name.toLowerCase() === pyName.toLowerCase(); })) {
              packages.push({ name: pyName, version: pym[2] || '', license: 'UNKNOWN', direct: true, ecosystem: 'pip' });
            }
          }
        }
      }
    }
  }

  // poetry.lock
  var poetryLockPath = path.join(repoPath, 'poetry.lock');
  if (fileExists(poetryLockPath)) {
    lockPresent = true;
    lockFile = lockFile || 'poetry.lock';
    // Poetry lock is TOML; parse name/version pairs
    var poetryText = readText(poetryLockPath);
    if (poetryText) {
      var poetryDirectNames = new Set(packages.filter(function (p) { return p.direct; }).map(function (p) { return p.name.toLowerCase(); }));
      var poetryRe = /\[\[package\]\]\s*\nname\s*=\s*"([^"]+)"\s*\nversion\s*=\s*"([^"]+)"/g;
      var poetryM;
      while ((poetryM = poetryRe.exec(poetryText)) !== null) {
        var poetryName = poetryM[1];
        var poetryVersion = poetryM[2];
        var poetryIsDirect = poetryDirectNames.has(poetryName.toLowerCase());
        if (!packages.find(function (p) { return p.name.toLowerCase() === poetryName.toLowerCase(); })) {
          packages.push({ name: poetryName, version: poetryVersion, license: 'UNKNOWN', direct: poetryIsDirect, ecosystem: 'pip' });
        }
      }
    }
  }

  return { packages: packages, lockFile: lockFile, lockPresent: lockPresent };
}

// ---------------------------------------------------------------------------
// Cargo Parser
// ---------------------------------------------------------------------------

function parseCargo(repoPath) {
  log('Parsing cargo ecosystem...');
  var packages = [];
  var lockPresent = false;
  var lockFile = null;

  var cargoTomlPath = path.join(repoPath, 'Cargo.toml');
  var cargoLockPath = path.join(repoPath, 'Cargo.lock');

  var directNames = new Set();

  if (fileExists(cargoTomlPath)) {
    var text = readText(cargoTomlPath);
    if (text) {
      var inDeps = false;
      var lines = text.split('\n');
      for (var i = 0; i < lines.length; i++) {
        var line = lines[i];
        if (/^\[dependencies\]/.test(line) || /^\[dev-dependencies\]/.test(line)) {
          inDeps = true; continue;
        }
        if (/^\[/.test(line)) { inDeps = false; continue; }
        if (inDeps) {
          var m = line.match(/^([A-Za-z0-9_-]+)\s*=\s*"?([^"{\n]*)"?/);
          if (m) {
            directNames.add(m[1]);
            packages.push({ name: m[1], version: m[2].trim(), license: 'UNKNOWN', direct: true, ecosystem: 'cargo' });
          }
        }
      }
    }
  }

  if (fileExists(cargoLockPath)) {
    lockPresent = true;
    lockFile = 'Cargo.lock';
    var lockText = readText(cargoLockPath);
    if (lockText) {
      var re = /\[\[package\]\]\s*\nname\s*=\s*"([^"]+)"\s*\nversion\s*=\s*"([^"]+)"/g;
      var lm;
      while ((lm = re.exec(lockText)) !== null) {
        var lName = lm[1];
        var lVersion = lm[2];
        if (!packages.find(function (p) { return p.name === lName && p.version === lVersion; })) {
          packages.push({ name: lName, version: lVersion, license: 'UNKNOWN', direct: directNames.has(lName), ecosystem: 'cargo' });
        }
      }
    }
  }

  return { packages: packages, lockFile: lockFile, lockPresent: lockPresent };
}

// ---------------------------------------------------------------------------
// Go Parser
// ---------------------------------------------------------------------------

function parseGo(repoPath) {
  log('Parsing go ecosystem...');
  var packages = [];
  var lockPresent = false;
  var lockFile = null;

  var goModPath = path.join(repoPath, 'go.mod');
  var goSumPath = path.join(repoPath, 'go.sum');

  if (fileExists(goModPath)) {
    var text = readText(goModPath);
    if (text) {
      var inRequire = false;
      var lines = text.split('\n');
      for (var i = 0; i < lines.length; i++) {
        var line = lines[i];
        if (/^require\s*\(/.test(line)) { inRequire = true; continue; }
        if (inRequire && /^\)/.test(line.trim())) { inRequire = false; continue; }
        var target = inRequire ? line : (line.match(/^require\s+(.*)/) || [])[1];
        if (target) {
          var m = target.trim().match(/^(\S+)\s+(v\S+)/);
          if (m) {
            var indirect = line.indexOf('// indirect') !== -1;
            packages.push({ name: m[1], version: m[2], license: 'UNKNOWN', direct: !indirect, ecosystem: 'go' });
          }
        }
      }
    }
  }

  if (fileExists(goSumPath)) {
    lockPresent = true;
    lockFile = 'go.sum';
  }

  return { packages: packages, lockFile: lockFile, lockPresent: lockPresent };
}

// ---------------------------------------------------------------------------
// Composer Parser
// ---------------------------------------------------------------------------

function parseComposer(repoPath) {
  log('Parsing composer ecosystem...');
  var packages = [];
  var lockPresent = false;
  var lockFile = null;

  var composerJsonPath = path.join(repoPath, 'composer.json');
  var composerLockPath = path.join(repoPath, 'composer.lock');

  var directNames = new Set();

  if (fileExists(composerJsonPath)) {
    var json = readJSON(composerJsonPath);
    if (json) {
      var allDeps = Object.assign({}, json.require || {}, json['require-dev'] || {});
      var depEntries = Object.entries(allDeps);
      for (var i = 0; i < depEntries.length; i++) {
        var name = depEntries[i][0];
        var version = depEntries[i][1];
        if (name === 'php' || name.indexOf('ext-') === 0) continue;
        directNames.add(name);
        packages.push({ name: name, version: version, license: 'UNKNOWN', direct: true, ecosystem: 'composer' });
      }
    }
  }

  if (fileExists(composerLockPath)) {
    lockPresent = true;
    lockFile = 'composer.lock';
    var lock = readJSON(composerLockPath);
    if (lock) {
      var allPkgs = (lock.packages || []).concat(lock['packages-dev'] || []);
      for (var li = 0; li < allPkgs.length; li++) {
        var pkg = allPkgs[li];
        var isDirect = directNames.has(pkg.name);
        var license = (pkg.license || []).join(' OR ') || 'UNKNOWN';
        var existing = packages.find(function (p) { return p.name === pkg.name; });
        if (existing) {
          existing.version = pkg.version || existing.version;
          existing.license = license;
        } else {
          packages.push({ name: pkg.name, version: pkg.version || '', license: license, direct: isDirect, ecosystem: 'composer' });
        }
      }
    }
  }

  return { packages: packages, lockFile: lockFile, lockPresent: lockPresent };
}

// ---------------------------------------------------------------------------
// Maven Parser
// ---------------------------------------------------------------------------

function parseMaven(repoPath) {
  log('Parsing maven ecosystem...');
  var packages = [];
  var pomPath = path.join(repoPath, 'pom.xml');

  if (fileExists(pomPath)) {
    var text = readText(pomPath);
    if (text) {
      // Simple XML regex extraction - good enough without an XML parser
      var depRe = /<dependency>\s*<groupId>([^<]+)<\/groupId>\s*<artifactId>([^<]+)<\/artifactId>\s*(?:<version>([^<]*)<\/version>)?/g;
      var m;
      while ((m = depRe.exec(text)) !== null) {
        packages.push({
          name: m[1] + ':' + m[2],
          version: m[3] || '',
          license: 'UNKNOWN',
          direct: true,
          ecosystem: 'maven',
        });
      }
    }
  }

  return { packages: packages, lockFile: null, lockPresent: false };
}

// ---------------------------------------------------------------------------
// Gradle Parser
// ---------------------------------------------------------------------------

function parseGradle(repoPath) {
  log('Parsing gradle ecosystem...');
  var packages = [];
  var gradlePath = fileExists(path.join(repoPath, 'build.gradle'))
    ? path.join(repoPath, 'build.gradle')
    : path.join(repoPath, 'build.gradle.kts');

  if (fileExists(gradlePath)) {
    var text = readText(gradlePath);
    if (text) {
      // Match: implementation 'group:artifact:version' or implementation("group:artifact:version")
      var depRe = /(?:implementation|api|compileOnly|runtimeOnly|testImplementation|classpath)\s*[\('"]+([^:'"]+):([^:'"]+):?([^)'"]*)[)'"]/g;
      var m;
      while ((m = depRe.exec(text)) !== null) {
        packages.push({
          name: m[1] + ':' + m[2],
          version: m[3] || '',
          license: 'UNKNOWN',
          direct: true,
          ecosystem: 'gradle',
        });
      }
    }
  }

  // gradle.lockfile
  var gradleLockPath = path.join(repoPath, 'gradle.lockfile');
  if (fileExists(gradleLockPath)) {
    return { packages: packages, lockFile: 'gradle.lockfile', lockPresent: true };
  }

  return { packages: packages, lockFile: null, lockPresent: false };
}

// ---------------------------------------------------------------------------
// SBOM Detection
// ---------------------------------------------------------------------------

function detectSbomFiles(repoPath) {
  log('Checking for existing SBOM files...');
  var sbomPatterns = [
    'bom.json', 'sbom.json', 'bom.xml',
    'sbom.xml', 'sbom.spdx', 'sbom.spdx.json',
  ];
  var found = [];

  function walkDir(dir, depth) {
    if (depth > 3) return; // limit recursion
    var entries;
    try { entries = fs.readdirSync(dir, { withFileTypes: true }); } catch (_e) { return; }
    for (var i = 0; i < entries.length; i++) {
      var entry = entries[i];
      if (entry.name.charAt(0) === '.' || entry.name === 'node_modules' || entry.name === 'vendor') continue;
      var fullPath = path.join(dir, entry.name);
      if (entry.isFile()) {
        var lower = entry.name.toLowerCase();
        if (sbomPatterns.indexOf(lower) !== -1 ||
            lower.endsWith('.spdx') ||
            lower.endsWith('.spdx.json') ||
            lower.endsWith('.spdx.rdf') ||
            lower.endsWith('.cdx.json') ||
            lower.endsWith('.cdx.xml')) {
          found.push(path.relative(repoPath, fullPath).replace(/\\/g, '/'));
        }
      } else if (entry.isDirectory()) {
        walkDir(fullPath, depth + 1);
      }
    }
  }

  walkDir(repoPath, 0);
  return found;
}

// ---------------------------------------------------------------------------
// Vulnerability Scanning
// ---------------------------------------------------------------------------

function runNpmAudit(repoPath) {
  if (!fileExists(path.join(repoPath, 'package.json'))) return null;
  var npm = resolveNpm();
  if (!npm) {
    log('  npm not found on PATH - skipping npm audit');
    return null;
  }
  log('Running npm audit...');
  // Audit from a private directory that holds only the manifest and
  // lockfile. The scanned repository's npm config file never loads, and the
  // operator's own user/global npm config is replaced by empty files so
  // the request goes to the public registry with TLS verification on.
  var isolated = makeIsolatedDir(repoPath, ['package.json', 'package-lock.json', 'npm-shrinkwrap.json']);
  // npm refuses to load one file as both user and global config, so two
  // distinct empty files are needed.
  var emptyUserConfig = path.join(isolated, '.empty-user-config');
  var emptyGlobalConfig = path.join(isolated, '.empty-global-config');
  fs.writeFileSync(emptyUserConfig, '');
  fs.writeFileSync(emptyGlobalConfig, '');
  var result;
  try {
    result = runTool(
      npm.file,
      npm.prefixArgs.concat([
        'audit', '--json', '--ignore-scripts', '--no-fund', '--no-update-notifier',
        '--userconfig', emptyUserConfig,
        '--globalconfig', emptyGlobalConfig,
      ]),
      isolated,
      30000,
      {
        npm_config_registry: 'https://registry.npmjs.org/',
        npm_config_strict_ssl: 'true',
      }
    );
  } finally {
    removeDir(isolated);
  }
  if (!result.stdout) {
    log('  npm audit produced no output' + (result.stderr ? ': ' + String(result.stderr).split('\n')[0] : ''));
    return null;
  }
  try {
    var audit = JSON.parse(result.stdout);
    // npm 7+ format has metadata.vulnerabilities
    if (audit.metadata && audit.metadata.vulnerabilities) {
      return audit.metadata.vulnerabilities;
    }
    // npm 6 format has advisories
    if (audit.advisories) {
      var counts = { critical: 0, high: 0, moderate: 0, low: 0, info: 0 };
      var advEntries = Object.values(audit.advisories);
      for (var i = 0; i < advEntries.length; i++) {
        var sev = advEntries[i].severity || 'info';
        if (counts[sev] !== undefined) counts[sev]++;
      }
      return counts;
    }
    // Fallback: check for vulnerabilities property
    if (audit.vulnerabilities) {
      var counts2 = { critical: 0, high: 0, moderate: 0, low: 0, info: 0 };
      var vulnEntries = Object.values(audit.vulnerabilities);
      for (var j = 0; j < vulnEntries.length; j++) {
        var sev2 = vulnEntries[j].severity || 'info';
        if (counts2[sev2] !== undefined) counts2[sev2]++;
      }
      return counts2;
    }
    return null;
  } catch (_e) {
    log('  Could not parse npm audit JSON output');
    return null;
  }
}

/**
 * pip-audit argv for a scanned repository's requirements file.
 * Plain `pip-audit -r FILE` resolves the requirements with pip, which is
 * the same as `pip install -r FILE`: a local path, VCS link or extra index
 * named in the file runs its setup.py on the operator's machine (CWE-829).
 * --disable-pip with --no-deps makes pip-audit read the pinned versions
 * from the file and query the vulnerability service without installing
 * anything. Unpinned entries are reported by pip-audit as errors and are
 * not audited.
 */
function pipAuditArgs(reqFile) {
  return ['--format', 'json', '--disable-pip', '--no-deps', '-r', reqFile];
}

/**
 * The strings in the [project] table's `dependencies = [...]` array of a
 * pyproject.toml. A single linear pass; the old lazy regex rescanned to the
 * end of the file from every "[project]" header (CWE-1333). Quotes are
 * tracked so a "]" inside a requirement (extras) does not end the array.
 */
function parsePyprojectDependencies(text) {
  var lines = text.split(/\r?\n/);
  var inProject = false;
  for (var i = 0; i < lines.length; i++) {
    var t = lines[i].trim();
    if (t.charAt(0) === '[' && t.charAt(t.length - 1) === ']' && t.indexOf('=') === -1) {
      inProject = t === '[project]';
      continue;
    }
    if (!inProject || !/^dependencies\s*=\s*\[/.test(t)) continue;
    // Scan from the opening bracket to its matching close.
    var rest = lines.slice(i).join('\n');
    var pos = rest.indexOf('[') + 1;
    var deps = [];
    var quote = null;
    var cur = '';
    for (; pos < rest.length; pos++) {
      var c = rest.charAt(pos);
      if (quote) {
        if (c === quote) { deps.push(cur.trim()); cur = ''; quote = null; }
        else cur += c;
      } else if (c === '"' || c === "'") {
        quote = c;
      } else if (c === ']') {
        break;
      } else if (c === '#') {
        var nl = rest.indexOf('\n', pos);
        if (nl === -1) break;
        pos = nl;
      }
    }
    return deps.filter(Boolean);
  }
  return [];
}

/**
 * True when filePath resolves (after symlinks) to a regular file inside
 * repoPath (CWE-59).
 */
function isRepoFile(repoPath, filePath) {
  try {
    // Resolving a path opens every link on it; refuse network targets at
    // any component (including chains of links) before realpath.
    if (linksToNetwork(filePath)) return false;
    var realRepo = fs.realpathSync(repoPath) + path.sep;
    var realFile = fs.realpathSync(filePath);
    return realFile.indexOf(realRepo) === 0 && fs.statSync(realFile).isFile();
  } catch (_e) {
    return false;
  }
}

// name[extras]==version or ===version, optional environment marker.
// No wildcard: "1.*" is a range, not a pin.
var PINNED_REQ_RE = /^([A-Za-z0-9][A-Za-z0-9._-]*(?:\[[A-Za-z0-9,._ -]+\])?)\s*===?\s*([A-Za-z0-9][A-Za-z0-9.!+_-]*)\s*(?:;.*)?$/;

/** Remove a pip comment: '#' at line start or after whitespace. Linear. */
function stripReqComment(line) {
  var i = line.indexOf('#');
  while (i !== -1) {
    if (i === 0 || /\s/.test(line.charAt(i - 1))) return line.slice(0, i);
    i = line.indexOf('#', i + 1);
  }
  return line;
}

/**
 * Read requirements.txt (and the -r files it includes, inside the repo
 * only) without running anything. Returns the pinned "name==version"
 * requirements that can be audited, and a gap for every line that cannot:
 * unpinned ranges, paths and URLs, pip options, and includes that leave the
 * repository. Nothing from these files is ever given to pip.
 */
function collectPinnedRequirements(repoPath) {
  var pinned = [];
  var pinnedSeen = {};
  var gaps = [];
  var seen = {};

  function gap(file, lineNo, reason, entry) {
    gaps.push({
      ecosystem: 'pip',
      file: path.relative(repoPath, file).replace(/\\/g, '/'),
      line: lineNo,
      reason: reason,
      entry: entry
    });
  }

  function addPin(spec) {
    if (!pinnedSeen[spec.toLowerCase()]) {
      pinnedSeen[spec.toLowerCase()] = true;
      pinned.push(spec);
    }
  }

  // Classify one requirement string; returns true when it was pinned.
  function classify(file, lineNo, line) {
    var m;
    if (line.indexOf('://') !== -1 || / @ /.test(line) || /^[./\\]/.test(line) || /^[A-Za-z]:[\\/]/.test(line)) {
      gap(file, lineNo, 'path or URL', redactUrl(line).slice(0, 100));
    } else if ((m = line.match(PINNED_REQ_RE))) {
      addPin(m[1].replace(/\s+/g, '') + '==' + m[2]);
      return true;
    } else {
      gap(file, lineNo, 'not pinned', redactUrl(line).slice(0, 100));
    }
    return false;
  }

  // pip joins a line ending in a backslash with the next one.
  function logicalLines(text) {
    var raw = text.split(/\r?\n/);
    var out = [];
    var buf = '';
    var start = 0;
    for (var i = 0; i < raw.length; i++) {
      var piece = stripReqComment(raw[i]);
      if (buf === '') start = i + 1;
      var trimmed = piece.trimEnd();
      if (trimmed.charAt(trimmed.length - 1) === '\\') {
        buf += trimmed.slice(0, -1) + ' ';
        continue;
      }
      out.push({ line: start, text: (buf + piece).trim() });
      buf = '';
    }
    if (buf) out.push({ line: start, text: buf.trim() });
    return out;
  }

  // Drop --hash=... options from a requirement line (pip-compile output).
  function stripHashes(line) {
    if (line.indexOf('--hash') === -1) return line;
    var tokens = line.split(/\s+/);
    var kept = [];
    for (var i = 0; i < tokens.length; i++) {
      if (tokens[i] === '--hash') { i++; continue; }
      if (tokens[i].indexOf('--hash=') === 0) continue;
      kept.push(tokens[i]);
    }
    return kept.join(' ');
  }

  function readReqFile(file, fromFile, fromLine, depth) {
    if (isNetworkPath(file, repoPath) || !isRepoFile(repoPath, file)) {
      gap(fromFile || file, fromLine || 0, 'include outside repository', fromFile ? '-r' : path.basename(file));
      return;
    }
    if (depth > 5) {
      gap(fromFile || file, fromLine || 0, 'include nesting too deep', '-r');
      return;
    }
    var real = fs.realpathSync(file);
    if (seen[real]) return;
    seen[real] = true;
    var lines = logicalLines(readText(file) || '');
    for (var i = 0; i < lines.length; i++) {
      var line = stripHashes(lines[i].text);
      var lineNo = lines[i].line;
      if (!line) continue;
      var m;
      if ((m = line.match(/^(?:-r|--requirement)(?:\s+|=)(.+)$/))) {
        readReqFile(path.resolve(path.dirname(file), m[1].trim()), file, lineNo, depth + 1);
      } else if (/^(?:-c|--constraint)\b/.test(line)) {
        // Constraint files limit versions; they add no requirements.
      } else if (/^(?:-e|--editable)\b/.test(line)) {
        gap(file, lineNo, 'path or URL', '-e');
      } else if (line.charAt(0) === '-') {
        // Options such as --index-url may carry credentials; record only the flag.
        gap(file, lineNo, 'option', line.split(/[\s=]/)[0]);
      } else {
        classify(file, lineNo, line);
      }
    }
  }

  var reqFile = path.join(repoPath, 'requirements.txt');
  if (fileExists(reqFile) || isSymlink(reqFile)) readReqFile(reqFile, null, 0, 0);

  // PEP 621 dependencies are audited too, even when requirements.txt exists.
  var pyproject = path.join(repoPath, 'pyproject.toml');
  if (isRepoFile(repoPath, pyproject)) {
    var pyText = readText(pyproject) || '';
    var deps = parsePyprojectDependencies(pyText);
    for (var d = 0; d < deps.length; d++) classify(pyproject, 0, deps[d]);
    if (pyText.indexOf('[tool.poetry') !== -1) gap(pyproject, 0, 'Poetry dependencies are not audited', '[tool.poetry]');
  }
  if (fileExists(path.join(repoPath, 'Pipfile')) || isSymlink(path.join(repoPath, 'Pipfile'))) {
    gap(path.join(repoPath, 'Pipfile'), 0, 'Pipfile is not audited', 'Pipfile');
  }
  return { pinned: pinned, gaps: gaps };
}

/**
 * Replace URL credentials (scheme://user:pass@host) with ***. Matches up to
 * the last '@' before the host, so a password containing '@' is covered.
 * Callers redact the whole line before truncating it.
 */
function redactUrl(text) {
  return text.replace(/\/\/[^/\s]*@/g, '//***@');
}

function isSymlink(p) {
  try { return fs.lstatSync(p).isSymbolicLink(); } catch (_e) { return false; }
}


/**
 * Audit the repository's pinned Python requirements with pip-audit.
 * Returns { counts, gaps }. counts is null when no audit ran. gaps lists
 * every requirement that was not audited, so a partial audit is never
 * reported as a clean one.
 */
function runPipAudit(repoPath) {
  var hasPip = fileExists(path.join(repoPath, 'requirements.txt')) ||
               fileExists(path.join(repoPath, 'Pipfile')) ||
               fileExists(path.join(repoPath, 'pyproject.toml'));
  if (!hasPip) return { counts: null, gaps: [] };

  var reqs = collectPinnedRequirements(repoPath);
  if (reqs.pinned.length === 0 && reqs.gaps.length === 0) {
    reqs.gaps.push({ ecosystem: 'pip', file: '', line: 0, reason: 'no Python dependencies found to audit', entry: '' });
  }
  if (reqs.pinned.length === 0) {
    log('  no pinned Python requirements to audit');
    return { counts: null, gaps: reqs.gaps };
  }

  var pipAudit = resolveBinary('pip-audit');
  if (!pipAudit) {
    log('  pip-audit not found on PATH - skipping');
    reqs.gaps.push({ ecosystem: 'pip', file: '', line: 0, reason: 'pip-audit not installed', entry: '' });
    return { counts: null, gaps: reqs.gaps };
  }
  log('Running pip-audit on ' + reqs.pinned.length + ' pinned requirement(s)...');
  // pip-audit only ever sees name==version lines written by this script,
  // in a private directory: no paths, URLs, options or includes.
  var isolated = fs.mkdtempSync(path.join(os.tmpdir(), 'package-evidence-pip-'));
  var result;
  try {
    var cleanReq = path.join(isolated, 'requirements.txt');
    fs.writeFileSync(cleanReq, reqs.pinned.join('\n') + '\n');
    result = runTool(pipAudit, pipAuditArgs(cleanReq), isolated, 60000);
  } finally {
    removeDir(isolated);
  }
  if (!result.ok && !result.stdout) {
    log('  pip-audit failed - skipping');
    reqs.gaps.push({ ecosystem: 'pip', file: '', line: 0, reason: 'pip-audit failed', entry: String(result.stderr || '').split('\n')[0].slice(0, 200) });
    return { counts: null, gaps: reqs.gaps };
  }
  try {
    var audit = JSON.parse(result.stdout);
    var counts = { critical: 0, high: 0, moderate: 0, low: 0, info: 0 };
    // pip-audit JSON is an object with a "dependencies" array; each entry lists its vulns.
    var deps = Array.isArray(audit) ? audit : (audit && Array.isArray(audit.dependencies) ? audit.dependencies : []);
    for (var i = 0; i < deps.length; i++) {
      if (!deps[i]) continue;
      if (deps[i].skip_reason) {
        reqs.gaps.push({ ecosystem: 'pip', file: '', line: 0, reason: 'skipped by pip-audit', entry: String(deps[i].name || '') + ': ' + String(deps[i].skip_reason).slice(0, 100) });
      }
      if (Array.isArray(deps[i].vulns)) {
        // pip-audit doesn't always provide severity; count as moderate
        counts.moderate += deps[i].vulns.length;
      }
    }
    return { counts: counts, gaps: reqs.gaps };
  } catch (_e) {
    log('  Could not parse pip-audit output');
    reqs.gaps.push({ ecosystem: 'pip', file: '', line: 0, reason: 'pip-audit output unreadable', entry: '' });
    return { counts: null, gaps: reqs.gaps };
  }
}

// ---------------------------------------------------------------------------
// Security Workflow & Tool Detection
// ---------------------------------------------------------------------------

function detectSecurityInfra(repoPath) {
  log('Checking for security infrastructure...');
  var result = {
    hasDependabot: false,
    hasRenovate: false,
    hasSecurityWorkflows: false,
    securityWorkflowFiles: [],
    scanToolsDetected: [],
  };

  // Dependabot
  if (fileExists(path.join(repoPath, '.github', 'dependabot.yml')) ||
      fileExists(path.join(repoPath, '.github', 'dependabot.yaml'))) {
    result.hasDependabot = true;
    result.scanToolsDetected.push('Dependabot');
  }

  // Renovate
  if (fileExists(path.join(repoPath, 'renovate.json')) ||
      fileExists(path.join(repoPath, 'renovate.json5')) ||
      fileExists(path.join(repoPath, '.renovaterc')) ||
      fileExists(path.join(repoPath, '.renovaterc.json'))) {
    result.hasRenovate = true;
    result.scanToolsDetected.push('Renovate');
  }

  // GitHub Actions workflows
  var workflowDir = path.join(repoPath, '.github', 'workflows');
  if (dirExists(workflowDir)) {
    try {
      var files = fs.readdirSync(workflowDir);
      var securityKeywords = /security|audit|scan|codeql|semgrep|snyk|trivy|grype|dependabot|sast|dast|supply.?chain|sbom/i;
      for (var i = 0; i < files.length; i++) {
        var file = files[i];
        if (!file.endsWith('.yml') && !file.endsWith('.yaml')) continue;
        var content = readText(path.join(workflowDir, file));
        if (content && securityKeywords.test(content)) {
          result.hasSecurityWorkflows = true;
          result.securityWorkflowFiles.push('.github/workflows/' + file);

          // Detect specific tools mentioned in the workflow
          if (/codeql/i.test(content)) result.scanToolsDetected.push('CodeQL');
          if (/semgrep/i.test(content)) result.scanToolsDetected.push('Semgrep');
          if (/snyk/i.test(content)) result.scanToolsDetected.push('Snyk');
          if (/trivy/i.test(content)) result.scanToolsDetected.push('Trivy');
          if (/grype/i.test(content)) result.scanToolsDetected.push('Grype');
          if (/ossf.scorecard/i.test(content)) result.scanToolsDetected.push('OSSF Scorecard');
        }
      }
    } catch (_e) { /* ignore */ }
  }

  // License scanner configs
  if (fileExists(path.join(repoPath, '.fossa.yml')) ||
      fileExists(path.join(repoPath, '.fossa.yaml'))) {
    result.scanToolsDetected.push('FOSSA');
  }
  if (fileExists(path.join(repoPath, '.snyk'))) {
    result.scanToolsDetected.push('Snyk');
  }

  // De-duplicate
  var unique = [];
  var seen = new Set();
  for (var j = 0; j < result.scanToolsDetected.length; j++) {
    var tool = result.scanToolsDetected[j];
    if (!seen.has(tool)) {
      seen.add(tool);
      unique.push(tool);
    }
  }
  result.scanToolsDetected = unique;

  return result;
}

// ---------------------------------------------------------------------------
// License Scanning Tool Detection
// ---------------------------------------------------------------------------

function detectLicenseScanner(repoPath) {
  // Check for dedicated license scanning config
  if (fileExists(path.join(repoPath, '.fossa.yml')) || fileExists(path.join(repoPath, '.fossa.yaml'))) {
    return { hasLicenseScanner: true, licenseScannerTool: 'FOSSA' };
  }

  // Check package.json scripts for license-checker
  var pkgJson = readJSON(path.join(repoPath, 'package.json'));
  if (pkgJson && pkgJson.scripts) {
    var scripts = JSON.stringify(pkgJson.scripts);
    if (/license-checker/i.test(scripts)) {
      return { hasLicenseScanner: true, licenseScannerTool: 'license-checker' };
    }
    if (/licensee/i.test(scripts)) {
      return { hasLicenseScanner: true, licenseScannerTool: 'licensee' };
    }
  }

  // Check for Snyk with license policy
  if (fileExists(path.join(repoPath, '.snyk'))) {
    var snykContent = readText(path.join(repoPath, '.snyk'));
    if (snykContent && /license/i.test(snykContent)) {
      return { hasLicenseScanner: true, licenseScannerTool: 'Snyk (license policy)' };
    }
  }

  return { hasLicenseScanner: false, licenseScannerTool: '' };
}

// ---------------------------------------------------------------------------
// Main Extraction
// ---------------------------------------------------------------------------

function extract(repoPath) {
  log('Extracting package evidence from: ' + repoPath);

  var ecosystems = detectEcosystems(repoPath);
  log('Detected package managers: ' + (ecosystems.length > 0 ? ecosystems.join(', ') : 'none'));

  // --- 1. Parse all ecosystems ---
  var allPackages = [];
  var lockFiles = [];
  var anyLockPresent = false;
  var primaryLockFile = null;

  var parsers = {
    npm: parseNpm,
    pip: parsePip,
    cargo: parseCargo,
    go: parseGo,
    composer: parseComposer,
    maven: parseMaven,
    gradle: parseGradle,
  };

  for (var ei = 0; ei < ecosystems.length; ei++) {
    var eco = ecosystems[ei];
    var parser = parsers[eco];
    if (!parser) continue;
    var result = parser(repoPath);
    allPackages = allPackages.concat(result.packages);
    if (result.lockPresent) {
      anyLockPresent = true;
      if (result.lockFile) {
        lockFiles.push(result.lockFile);
        if (!primaryLockFile) primaryLockFile = result.lockFile;
      }
    }
  }

  var directCount = allPackages.filter(function (p) { return p.direct; }).length;
  var transitiveCount = allPackages.filter(function (p) { return !p.direct; }).length;

  // --- 2. SBOM ---
  var sbomFiles = detectSbomFiles(repoPath);
  var lockFileCommitted = false;
  if (anyLockPresent && primaryLockFile) {
    // git runs against a private git directory and never reads the
    // repository's own config (CWE-73; see git-sandbox.js).
    var sandbox = prepareGitSandbox(repoPath);
    if (sandbox.ok) {
      try {
        lockFileCommitted = isGitTracked(path.join(repoPath, primaryLockFile), repoPath, sandbox.env);
      } finally {
        sandbox.cleanup();
      }
    } else {
      log('  Not running git: ' + sandbox.reason);
      lockFileCommitted = null;
    }
  }

  // --- 3. Vulnerabilities ---
  var auditResults = { critical: 0, high: 0, moderate: 0, low: 0, info: 0 };
  var npmAudit = ecosystems.indexOf('npm') !== -1 ? runNpmAudit(repoPath) : null;
  var pipResult = ecosystems.indexOf('pip') !== -1 ? runPipAudit(repoPath) : { counts: null, gaps: [] };
  var pipAudit = pipResult.counts;
  // Which audits produced results. An empty list means auditResults is not
  // evidence of zero vulnerabilities, only that no audit ran. "pip-partial"
  // means some requirements were audited and auditGaps lists the rest.
  var auditsRun = [];
  if (npmAudit) auditsRun.push('npm');
  if (pipAudit) auditsRun.push(pipResult.gaps.length > 0 ? 'pip-partial' : 'pip');
  var auditGaps = pipResult.gaps;

  if (npmAudit) {
    auditResults.critical += (npmAudit.critical || 0);
    auditResults.high += (npmAudit.high || 0);
    auditResults.moderate += (npmAudit.moderate || 0);
    auditResults.low += (npmAudit.low || 0);
    auditResults.info += (npmAudit.info || 0);
  }
  if (pipAudit) {
    auditResults.critical += (pipAudit.critical || 0);
    auditResults.high += (pipAudit.high || 0);
    auditResults.moderate += (pipAudit.moderate || 0);
    auditResults.low += (pipAudit.low || 0);
    auditResults.info += (pipAudit.info || 0);
  }

  var securityInfra = detectSecurityInfra(repoPath);

  // --- 4. Licenses ---
  var licenseSummary = {};
  var copyleftPackages = [];
  var unknownLicensePackages = [];

  for (var pi = 0; pi < allPackages.length; pi++) {
    var pkg = allPackages[pi];
    var lic = pkg.license || 'UNKNOWN';
    licenseSummary[lic] = (licenseSummary[lic] || 0) + 1;
    if (isCopyleft(lic)) copyleftPackages.push({ name: pkg.name, license: lic, ecosystem: pkg.ecosystem });
    if (lic === 'UNKNOWN') unknownLicensePackages.push({ name: pkg.name, ecosystem: pkg.ecosystem });
  }

  var licenseScanner = detectLicenseScanner(repoPath);

  // --- 5. Freshness ---
  var lockFileAgeDays = null;
  var lockFileAge = 'N/A';
  if (anyLockPresent && primaryLockFile) {
    lockFileAgeDays = getFileAgeDays(path.join(repoPath, primaryLockFile));
    if (lockFileAgeDays !== null) {
      lockFileAge = lockFileAgeDays === 0 ? 'today' :
                    lockFileAgeDays === 1 ? '1 day' :
                    lockFileAgeDays + ' days';
    }
  }

  var pinnedVersions = 0;
  var floatingVersions = 0;
  var directPackages = allPackages.filter(function (p) { return p.direct; });
  for (var fi = 0; fi < directPackages.length; fi++) {
    if (isVersionPinned(directPackages[fi].version)) pinnedVersions++;
    else floatingVersions++;
  }
  var totalPinnable = pinnedVersions + floatingVersions;
  var pinnedPercentage = totalPinnable > 0 ? Math.round((pinnedVersions / totalPinnable) * 100) : 0;

  // --- 6. AI Dependencies ---
  var aiDetected = [];
  var hasApiClients = false;
  var hasLocalInference = false;

  for (var ai = 0; ai < allPackages.length; ai++) {
    var aiPkg = allPackages[ai];
    var aiInfo = AI_PACKAGES[aiPkg.name] || AI_PACKAGES[aiPkg.name.toLowerCase()];
    if (aiInfo) {
      aiDetected.push({
        name: aiPkg.name,
        version: aiPkg.version,
        type: aiInfo.type,
        dataFlow: aiInfo.dataFlow,
      });
      if (aiInfo.type === 'api-client' || aiInfo.dataFlow === 'cloud') hasApiClients = true;
      if (aiInfo.type === 'local-inference' || aiInfo.dataFlow === 'local') hasLocalInference = true;
    }
  }

  // --- 7. Auto-fill fields ---
  var autoFillFields = {};

  if (copyleftPackages.length > 0) {
    autoFillFields['supplyChain.licenseContaminationRisk'] = true;
    autoFillFields['supplyChain.licenseContaminationDetail'] =
      copyleftPackages.length + ' copyleft-licensed package(s) detected: ' +
      copyleftPackages.map(function (p) { return p.name + ' (' + p.license + ')'; }).join(', ') +
      '. Review license compatibility with your distribution model.';
  }

  if (!anyLockPresent && ecosystems.length > 0) {
    autoFillFields['supplyChain.nonDeterministicBuildRisk'] = true;
    autoFillFields['supplyChain.nonDeterministicBuildDetail'] =
      'No lock file found. Builds are non-deterministic - dependency versions may change between installs. This is a supply chain risk. Generate and commit a lock file.';
  }

  if (hasApiClients) {
    autoFillFields['supplyChain.dataTransmissionRisk'] = true;
    autoFillFields['supplyChain.dataTransmissionDetail'] =
      'AI API client dependencies detected: ' +
      aiDetected.filter(function (a) { return a.dataFlow === 'cloud'; }).map(function (a) { return a.name; }).join(', ') +
      '. Data is transmitted to external cloud services. Review data processing agreements and ensure compliance with data residency requirements.';
  }

  if (auditResults.critical > 0 || auditResults.high > 0) {
    autoFillFields['security.dependencyVulnerabilityRisk'] = true;
    autoFillFields['security.dependencyVulnerabilityDetail'] =
      'Dependency audit found ' + auditResults.critical + ' critical and ' + auditResults.high + ' high severity vulnerabilities. Remediate before deployment.';
  }

  if (unknownLicensePackages.length > 0) {
    autoFillFields['supplyChain.unknownLicenseCount'] = unknownLicensePackages.length;
    autoFillFields['supplyChain.unknownLicenseNote'] =
      unknownLicensePackages.length + ' package(s) have unknown licenses. Manual license review required for compliance.';
  }

  if (aiDetected.length > 0) {
    autoFillFields['system.usesAiDependencies'] = true;
    autoFillFields['system.aiDependencyCount'] = aiDetected.length;
    autoFillFields['system.aiDataFlowSummary'] =
      (hasApiClients ? 'Cloud API calls detected (data leaves device). ' : '') +
      (hasLocalInference ? 'Local inference detected (data stays on device).' : '');
  }

  // --- Assemble output ---
  var output = {
    _meta: {
      extractor: 'package-evidence',
      version: VERSION,
      extractedAt: new Date().toISOString(),
      repoPath: repoPath,
      packageManagers: ecosystems,
    },
    inventory: {
      directDependencies: directCount,
      transitiveDependencies: transitiveCount,
      packages: allPackages,
    },
    sbom: {
      existingSbomFiles: sbomFiles,
      lockFilePresent: anyLockPresent,
      lockFileCommitted: lockFileCommitted,
      format: primaryLockFile || '',
    },
    vulnerabilities: {
      auditResults: auditResults,
      auditsRun: auditsRun,
      auditGaps: auditGaps,
      hasDependabot: securityInfra.hasDependabot,
      hasRenovate: securityInfra.hasRenovate,
      hasSecurityWorkflows: securityInfra.hasSecurityWorkflows,
      securityWorkflowFiles: securityInfra.securityWorkflowFiles,
      scanToolsDetected: securityInfra.scanToolsDetected,
    },
    licenses: {
      summary: licenseSummary,
      copyleftPackages: copyleftPackages,
      unknownLicensePackages: unknownLicensePackages,
      hasLicenseScanner: licenseScanner.hasLicenseScanner,
      licenseScannerTool: licenseScanner.licenseScannerTool,
    },
    freshness: {
      lockFileAge: lockFileAge,
      pinnedVersions: pinnedVersions,
      floatingVersions: floatingVersions,
      pinnedPercentage: pinnedPercentage,
    },
    aiDependencies: {
      detected: aiDetected,
      hasApiClients: hasApiClients,
      hasLocalInference: hasLocalInference,
    },
    autoFillFields: autoFillFields,
  };

  return output;
}

// ---------------------------------------------------------------------------
// Entry Point
// ---------------------------------------------------------------------------

function main() {
  var args = parseArgs();
  var repo = args.repo;
  var output = args.output;

  if (!dirExists(repo)) {
    process.stderr.write('Error: Repository path does not exist: ' + repo + '\n');
    process.exit(1);
  }

  var evidence = extract(repo);
  var json = JSON.stringify(evidence, null, 2);

  if (output) {
    var outputDir = path.dirname(output);
    if (!dirExists(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    fs.writeFileSync(output, json, 'utf8');
    log('Evidence written to: ' + output);
  } else {
    process.stdout.write(json + '\n');
  }

  // Summary to stderr
  var inv = evidence.inventory;
  var vuln = evidence.vulnerabilities.auditResults;
  var aiDeps = evidence.aiDependencies;
  log('--- Summary ---');
  log('Package managers: ' + (evidence._meta.packageManagers.join(', ') || 'none detected'));
  log('Dependencies: ' + inv.directDependencies + ' direct, ' + inv.transitiveDependencies + ' transitive');
  log('Lock file: ' + (evidence.sbom.lockFilePresent ? evidence.sbom.format : 'MISSING'));
  log('Vulnerabilities: ' + vuln.critical + ' critical, ' + vuln.high + ' high, ' + vuln.moderate + ' moderate, ' + vuln.low + ' low');
  log('Licenses: ' + Object.keys(evidence.licenses.summary).length + ' distinct, ' + evidence.licenses.copyleftPackages.length + ' copyleft, ' + evidence.licenses.unknownLicensePackages.length + ' unknown');
  log('AI dependencies: ' + aiDeps.detected.length + ' (API clients: ' + aiDeps.hasApiClients + ', Local inference: ' + aiDeps.hasLocalInference + ')');
  if (Object.keys(evidence.autoFillFields).length > 0) {
    log('Risk flags: ' + Object.keys(evidence.autoFillFields).filter(function (k) { return k.endsWith('Risk'); }).length);
  }
  log('Done.');
}

if (require.main === module) {
  main();
}

module.exports = {
  pipAuditArgs: pipAuditArgs,
  collectPinnedRequirements: collectPinnedRequirements,
  sanitizeManifest: sanitizeManifest,
  parsePyprojectDependencies: parsePyprojectDependencies
};
