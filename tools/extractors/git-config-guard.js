// @ai-generated - Claude Opus 5.5 (Anthropic)
/**
 * Check a scanned repository's own git configuration before any git command
 * runs against it.
 *
 * git reads the repository config on every call, and some of it cannot be
 * overridden from the command line. An `[include]` or `[includeIf]` section
 * makes git open another config file, and any path-valued key can name a
 * UNC path (\\host\share or //host/share). On Windows, opening a UNC path
 * sends the operator's NTLM credentials to that host (CWE-73 / CWE-200).
 *
 * The check reads the config files as text and never runs git, so it is
 * safe to call on a hostile repository. A `.git` file whose gitdir is a UNC
 * path is refused before that path is opened.
 */

'use strict';

var fs = require('fs');
var path = require('path');

// \\host\share, //host/share, \\?\UNC\host\share, and the same with
// forward slashes.
var UNC_RE = /^\s*"?\s*(\\\\|\/\/|\\\\\?\\UNC\\)/i;
var INCLUDE_RE = /^\s*\[\s*include(if)?\b/i;

function isUncPath(value) {
  return UNC_RE.test(value);
}

function readSmall(file) {
  try {
    var st = fs.statSync(file);
    // A git config is a few KB. Refuse to read anything huge.
    if (!st.isFile() || st.size > 1024 * 1024) return null;
    return fs.readFileSync(file, 'utf8');
  } catch (_e) {
    return null;
  }
}

/**
 * Locate the git directory for repoPath without running git.
 * Returns { gitDir } or { error }.
 */
function findGitDir(repoPath) {
  var dotGit = path.join(repoPath, '.git');
  var st;
  try { st = fs.lstatSync(dotGit); } catch (_e) { return { gitDir: null }; }
  if (st.isDirectory()) return { gitDir: dotGit };
  if (!st.isFile()) return { error: '.git is neither a directory nor a file' };
  var text = readSmall(dotGit) || '';
  var m = text.match(/^gitdir:\s*(.+?)\s*$/m);
  if (!m) return { error: '.git file has no gitdir line' };
  if (isUncPath(m[1])) return { error: '.git points at a UNC (network) path: ' + m[1] };
  return { gitDir: path.resolve(repoPath, m[1]) };
}

function configFiles(gitDir) {
  var files = [path.join(gitDir, 'config'), path.join(gitDir, 'config.worktree')];
  // Linked worktrees share the main repository's config via commondir.
  var common = readSmall(path.join(gitDir, 'commondir'));
  if (common) {
    common = common.trim();
    if (isUncPath(common)) return { error: 'commondir points at a UNC (network) path' };
    var commonDir = path.resolve(gitDir, common);
    files.push(path.join(commonDir, 'config'), path.join(commonDir, 'config.worktree'));
  }
  return { files: files };
}

/**
 * Returns { ok: true, reason: null } when the repository config is safe to
 * let git read, or { ok: false, reason } when git must not run on it.
 * A directory that is not a git repository passes; git will report that.
 */
function checkRepoGitConfig(repoPath) {
  var found = findGitDir(repoPath);
  if (found.error) return { ok: false, reason: found.error };
  if (!found.gitDir) return { ok: true, reason: null };
  var cf = configFiles(found.gitDir);
  if (cf.error) return { ok: false, reason: cf.error };
  for (var i = 0; i < cf.files.length; i++) {
    var text = readSmall(cf.files[i]);
    if (text === null) continue;
    var lines = text.split(/\r?\n/);
    for (var j = 0; j < lines.length; j++) {
      var line = lines[j];
      if (INCLUDE_RE.test(line)) {
        return { ok: false, reason: 'repository config has an include section (' + path.basename(cf.files[i]) + ' line ' + (j + 1) + '); git would read another config file' };
      }
      var eq = line.indexOf('=');
      if (eq !== -1 && isUncPath(line.slice(eq + 1))) {
        return { ok: false, reason: 'repository config names a UNC (network) path (' + path.basename(cf.files[i]) + ' line ' + (j + 1) + ')' };
      }
    }
  }
  return { ok: true, reason: null };
}

module.exports = { checkRepoGitConfig: checkRepoGitConfig, isUncPath: isUncPath };
