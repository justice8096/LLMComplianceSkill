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

/** No symlinks among the object store's entries (packs, loose dirs). */
function checkObjectStore(objectsDir) {
  requireRealDir(objectsDir, 'objects directory');
  if (lstatOrNull(path.join(objectsDir, 'info', 'alternates'))) {
    throw new Error('objects/info/alternates is not supported (it makes git open other object stores)');
  }
  var dirs = [objectsDir, path.join(objectsDir, 'pack'), path.join(objectsDir, 'info')];
  for (var i = 0; i < dirs.length; i++) {
    if (!lstatOrNull(dirs[i])) continue;
    var entries = fs.readdirSync(dirs[i]);
    for (var j = 0; j < entries.length; j++) {
      if (fs.lstatSync(path.join(dirs[i], entries[j])).isSymbolicLink()) {
        throw new Error('object store contains a symlink: ' + entries[j]);
      }
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
    requireRealDir(gitDir, 'git directory');
  }

  var commonDir = gitDir;
  if (lstatOrNull(path.join(gitDir, 'commondir'))) {
    var c = readSmallFile(path.join(gitDir, 'commondir'), 'commondir').trim();
    if (isNetworkPath(c, gitDir)) return refuse('commondir points at a network path');
    commonDir = path.resolve(gitDir, c);
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

module.exports = { prepareGitSandbox: prepareGitSandbox, isNetworkPath: isNetworkPath };
