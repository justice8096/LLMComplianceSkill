// @ai-generated - Claude Opus 5.5 (Anthropic)
/**
 * Locate an executable on the operator's PATH and return its absolute path,
 * or null when it is not installed. Shared by the extractors so that every
 * external tool is started by absolute path.
 *
 * The lookup never consults the current directory, so a file of the same
 * name inside a scanned repository is never chosen (CWE-427; on Windows the
 * default search order tries the current directory first).
 *
 * On Windows only PATHEXT extensions are tried. An extensionless file there
 * is a POSIX shell script (npm ships one beside npm.cmd) that cannot be
 * started directly.
 */

'use strict';

var fs = require('fs');
var path = require('path');

function resolveBinary(name) {
  var dirs = (process.env.PATH || '').split(path.delimiter).filter(Boolean);
  var exts = [''];
  if (process.platform === 'win32') {
    exts = (process.env.PATHEXT || '.COM;.EXE;.BAT;.CMD').split(';').filter(Boolean);
    // A name that already carries one of these extensions ("git.exe") is
    // looked up as given.
    var given = path.extname(name).toLowerCase();
    if (given && exts.some(function (e) { return e.toLowerCase() === given; })) exts = [''];
  }
  for (var i = 0; i < dirs.length; i++) {
    // Relative PATH entries (including "." and "") would reintroduce
    // cwd-first resolution; skip them.
    if (!path.isAbsolute(dirs[i])) continue;
    for (var j = 0; j < exts.length; j++) {
      var candidate = path.join(dirs[i], name + exts[j]);
      try {
        if (fs.statSync(candidate).isFile()) return candidate;
      } catch (_e) { /* keep looking */ }
    }
  }
  return null;
}

module.exports = { resolveBinary: resolveBinary };
