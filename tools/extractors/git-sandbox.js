// @ai-generated - Claude Opus 5.5 (Anthropic)
/**
 * Run git on a scanned repository without letting git read that
 * repository's own config (CWE-73).
 *
 * A repository's .git/config can make git open other files ([include],
 * [includeIf]) and path-valued keys can name UNC paths; on Windows opening
 * \\host\share sends the operator's NTLM hash to that host. git has no
 * switch to turn includes off, and checking the config text failed: git's
 * own parser accepts spellings a checker misses.
 *
 * So the extractors never let git see that config. prepareGitSandbox()
 * builds a private git directory holding a config written here, a copy of
 * HEAD and the refs, and points git at the repository's objects, index and
 * working tree through GIT_OBJECT_DIRECTORY, GIT_INDEX_FILE and
 * GIT_WORK_TREE. Two values are taken from the repository config, the
 * object format and ref storage, read with `git config --file`, which does
 * not follow includes and opens no path a value names.
 *
 * Layouts this cannot handle safely are refused: no .git at the given path
 * (a subdirectory, which git would resolve by walking up), symlinks in the
 * git directory, objects/info/alternates, and a gitdir or commondir that is
 * a network path.
 */

'use strict';

var fs = require('fs');
var os = require('os');
var path = require('path');
var { execFileSync } = require('child_process');
var { resolveBinary } = require('./resolve-binary');

var SMALL = 64 * 1024;

/**
 * True when p, resolved against base the way Windows does, is a UNC or
 * device path (\\host\share, //host/share, /\host, \\?\UNC\..., \\.\...).
 * Always false on other platforms, where such paths are local.
 */
function isNetworkPath(p, base) {
  if (process.platform !== 'win32') return false;
  var resolved = path.win32.resolve(base || 'C:\\', String(p).trim());
  return resolved.indexOf('\\\\') === 0;
}

/**
 * True when reaching p would pass through a symlink or junction whose
 * target is a network path, at any component and through chains of links.
 * Each component is examined with lstat, which does not follow the link
 * itself, so the network target is never opened. Fails closed on deep
 * chains.
 */
function linksToNetwork(p) {
  if (isNetworkPath(p)) return true;
  // Emulate realpath one component at a time. `resolved` never contains a
  // link, so lstat(resolved + component) follows nothing except, possibly,
  // that last component, which lstat does not follow. ".." is applied to the
  // resolved (physical) path, as Windows does.
  var start = path.isAbsolute(p) ? p : path.resolve(p);
  var resolved = path.parse(start).root;
  var pending = splitParts(start.slice(resolved.length));
  var hops = 0;
  while (pending.length) {
    var part = pending.shift();
    if (part === '.') continue;
    if (part === '..') { resolved = path.dirname(resolved); continue; }
    var next = path.join(resolved, part);
    var st = lstatOrNull(next);
    // Missing: nothing further exists, and nothing on the way was a link.
    if (!st) return false;
    if (!st.isSymbolicLink()) { resolved = next; continue; }
    if (++hops > 16) return true;
    var target = fs.readlinkSync(next);
    if (!isPlainLocalTarget(target)) return true;
    if (path.win32.isAbsolute(target) || path.isAbsolute(target)) {
      resolved = path.parse(target).root;
      pending = splitParts(target.slice(resolved.length)).concat(pending);
    } else {
      pending = splitParts(target).concat(pending);
    }
  }
  return false;
}

function splitParts(s) {
  return s.split(/[\\/]+/).filter(Boolean);
}

/**
 * A link target is followed only when it is a relative path or a
 * drive-letter path (C:\...). Anything else is treated as possibly remote:
 * UNC (\\host, //host), NT paths (\??\, \Device\, GLOBALROOT), and
 * root-relative paths (\x). On other platforms any target is local.
 */
function isPlainLocalTarget(target) {
  if (process.platform !== 'win32') return true;
  if (/^[A-Za-z]:[\\/]/.test(target)) return true;
  if (/^[\\/]/.test(target)) return false;
  if (/^[A-Za-z]:/.test(target)) return false; // drive-relative (C:x)
  return true;
}

function refuse(reason) {
  return { ok: false, reason: reason, env: null, cleanup: function () {} };
}

function lstatOrNull(p) {
  try { return fs.lstatSync(p); } catch (_e) { return null; }
}

/** Read a small regular file that is not a symlink, or throw. */
function readSmallFile(p, what) {
  var st = lstatOrNull(p);
  if (!st) throw new Error(what + ' is missing');
  if (st.isSymbolicLink()) throw new Error(what + ' is a symlink');
  if (!st.isFile()) throw new Error(what + ' is not a file');
  if (st.size > SMALL) throw new Error(what + ' is too large');
  return fs.readFileSync(p, 'utf8');
}

function requireRealDir(p, what) {
  var st = lstatOrNull(p);
  if (!st) throw new Error(what + ' is missing');
  if (st.isSymbolicLink()) throw new Error(what + ' is a symlink');
  if (!st.isDirectory()) throw new Error(what + ' is not a directory');
}

/** Copy a directory tree of regular files. Any symlink aborts. */
function copyTree(src, dst, what, depth) {
  if (depth > 32) throw new Error(what + ' is nested too deeply');
  fs.mkdirSync(dst, { recursive: true });
  var entries = fs.readdirSync(src);
  for (var i = 0; i < entries.length; i++) {
    var s = path.join(src, entries[i]);
    var d = path.join(dst, entries[i]);
    var st = fs.lstatSync(s);
    if (st.isSymbolicLink()) throw new Error(what + ' contains a symlink: ' + entries[i]);
    if (st.isDirectory()) copyTree(s, d, what, depth + 1);
    else if (st.isFile()) fs.copyFileSync(s, d);
  }
}

function copyIfFile(src, dst, what) {
  var st = lstatOrNull(src);
  if (!st) return;
  if (st.isSymbolicLink()) throw new Error(what + ' is a symlink');
  if (st.isFile()) fs.copyFileSync(src, dst);
}

/**
 * No symlinks or junctions anywhere in the object store: loose objects,
 * packs, indexes, commit-graph chains. git opens these files directly.
 */
function checkObjectStore(objectsDir) {
  requireRealDir(objectsDir, 'objects directory');
  if (lstatOrNull(path.join(objectsDir, 'info', 'alternates'))) {
    throw new Error('objects/info/alternates is not supported (it makes git open other object stores)');
  }
  var stack = [{ dir: objectsDir, depth: 0 }];
  while (stack.length) {
    var top = stack.pop();
    if (top.depth > 8) throw new Error('object store is nested too deeply');
    var entries = fs.readdirSync(top.dir);
    for (var j = 0; j < entries.length; j++) {
      var full = path.join(top.dir, entries[j]);
      var st = fs.lstatSync(full);
      if (st.isSymbolicLink()) throw new Error('object store contains a symlink: ' + path.relative(objectsDir, full));
      if (st.isDirectory()) stack.push({ dir: full, depth: top.depth + 1 });
    }
  }
}

/** One value from a config file, without includes. null when unset. */
function configValue(git, file, key) {
  try {
    return execFileSync(git, ['config', '--file', file, '--get', key], {
      cwd: os.tmpdir(),
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
      timeout: 10000,
      // --file reads only this file; includes are off unless --includes.
      windowsHide: true
    }).trim().toLowerCase() || null;
  } catch (e) {
    if (e.status === 1) return null; // key not set
    throw new Error('repository config could not be read by git');
  }
}

function build(repoPath) {
  repoPath = path.resolve(repoPath);
  var dotGit = path.join(repoPath, '.git');
  var st = lstatOrNull(dotGit);
  if (!st) {
    return refuse('no .git at the repository root (pass the top-level directory; subdirectories and bare repositories are not scanned)');
  }
  if (st.isSymbolicLink()) return refuse('.git is a symlink');

  var gitDir;
  if (st.isDirectory()) {
    gitDir = dotGit;
  } else {
    var m = readSmallFile(dotGit, '.git file').match(/^gitdir:\s*(.*?)\s*$/m);
    if (!m) return refuse('.git file has no gitdir line');
    if (isNetworkPath(m[1], repoPath)) return refuse('.git points at a network path');
    gitDir = path.resolve(repoPath, m[1]);
    if (linksToNetwork(gitDir)) return refuse('.git points at a network path through a link');
    requireRealDir(gitDir, 'git directory');
  }

  var commonDir = gitDir;
  if (lstatOrNull(path.join(gitDir, 'commondir'))) {
    var c = readSmallFile(path.join(gitDir, 'commondir'), 'commondir').trim();
    if (isNetworkPath(c, gitDir)) return refuse('commondir points at a network path');
    commonDir = path.resolve(gitDir, c);
    if (linksToNetwork(commonDir)) return refuse('commondir points at a network path through a link');
    requireRealDir(commonDir, 'common git directory');
  }

  var objectsDir = path.join(commonDir, 'objects');
  checkObjectStore(objectsDir);

  var indexFile = path.join(gitDir, 'index');
  var indexStat = lstatOrNull(indexFile);
  if (indexStat && indexStat.isSymbolicLink()) return refuse('index is a symlink');

  var configFile = path.join(commonDir, 'config');
  var cst = lstatOrNull(configFile);
  if (!cst || cst.isSymbolicLink() || !cst.isFile()) return refuse('repository config is missing or a symlink');

  var git = resolveBinary('git');
  if (!git) return refuse('git not found on PATH');
  var version = configValue(git, configFile, 'core.repositoryformatversion') || '0';
  var objectFormat = configValue(git, configFile, 'extensions.objectformat');
  var refStorage = configValue(git, configFile, 'extensions.refstorage');
  if (!/^[01]$/.test(version)) return refuse('unsupported repository format version ' + version);
  if (objectFormat && ['sha1', 'sha256'].indexOf(objectFormat) === -1) return refuse('unsupported object format ' + objectFormat);
  if (refStorage && ['files', 'reftable'].indexOf(refStorage) === -1) return refuse('unsupported ref storage ' + refStorage);

  var dir = fs.mkdtempSync(path.join(os.tmpdir(), 'extractor-gitdir-'));
  try {
    var cfg = '[core]\n\trepositoryformatversion = ' + version + '\n\tbare = false\n';
    if (objectFormat || refStorage) {
      cfg += '[extensions]\n';
      if (objectFormat) cfg += '\tobjectFormat = ' + objectFormat + '\n';
      if (refStorage) cfg += '\trefStorage = ' + refStorage + '\n';
    }
    fs.writeFileSync(path.join(dir, 'config'), cfg);
    fs.writeFileSync(path.join(dir, 'HEAD'), readSmallFile(path.join(gitDir, 'HEAD'), 'HEAD'));
    fs.mkdirSync(path.join(dir, 'objects'));
    copyIfFile(path.join(commonDir, 'packed-refs'), path.join(dir, 'packed-refs'), 'packed-refs');
    copyIfFile(path.join(commonDir, 'shallow'), path.join(dir, 'shallow'), 'shallow');
    if (lstatOrNull(path.join(commonDir, 'refs'))) {
      requireRealDir(path.join(commonDir, 'refs'), 'refs');
      copyTree(path.join(commonDir, 'refs'), path.join(dir, 'refs'), 'refs', 0);
    } else {
      fs.mkdirSync(path.join(dir, 'refs'));
    }
    if (refStorage === 'reftable') {
      requireRealDir(path.join(commonDir, 'reftable'), 'reftable');
      copyTree(path.join(commonDir, 'reftable'), path.join(dir, 'reftable'), 'reftable', 0);
    }
  } catch (e) {
    fs.rmSync(dir, { recursive: true, force: true });
    throw e;
  }

  return {
    ok: true,
    reason: null,
    env: {
      GIT_DIR: dir,
      GIT_WORK_TREE: repoPath,
      GIT_OBJECT_DIRECTORY: objectsDir,
      GIT_INDEX_FILE: indexStat ? indexFile : path.join(dir, 'index')
    },
    cleanup: function () {
      try { fs.rmSync(dir, { recursive: true, force: true }); } catch (_e) { /* best effort */ }
    }
  };
}

/**
 * Returns { ok, reason, env, cleanup }. When ok, run every git command for
 * this repository with `env` merged into the process environment, and call
 * cleanup() when done. When not ok, do not run git on the repository.
 */
function prepareGitSandbox(repoPath) {
  try {
    return build(repoPath);
  } catch (e) {
    return refuse(e.message);
  }
}

module.exports = { prepareGitSandbox: prepareGitSandbox, isNetworkPath: isNetworkPath, linksToNetwork: linksToNetwork };
