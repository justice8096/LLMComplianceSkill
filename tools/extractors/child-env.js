// @ai-generated - Claude Opus 5.5 (Anthropic)
'use strict';

/**
 * The environment handed to child processes (npm, git, pip-audit).
 *
 * Only the variables a tool needs to start are copied: search path, system
 * and temp folders, home folder, locale, proxy, and the operator's own git config location
 * (git-evidence reads the operator's trusted signing keys from it). Nothing else in the
 * operator's environment, such as an npm or registry token, reaches a
 * child process. Callers add their own fixed settings on top, for example
 * the git sandbox variables or the public npm registry.
 */

var ALLOW = [
  'PATH', 'PATHEXT', 'SYSTEMROOT', 'WINDIR', 'COMSPEC', 'SYSTEMDRIVE',
  'PROGRAMDATA', 'PROGRAMFILES', 'PROGRAMFILES(X86)', 'PROGRAMW6432',
  'COMMONPROGRAMFILES', 'COMMONPROGRAMFILES(X86)', 'OS', 'PROCESSOR_ARCHITECTURE',
  'NUMBER_OF_PROCESSORS', 'USERNAME', 'USER', 'LOGNAME', 'SHELL', 'TERM',
  'TEMP', 'TMP', 'TMPDIR',
  'HOME', 'USERPROFILE', 'HOMEDRIVE', 'HOMEPATH', 'APPDATA', 'LOCALAPPDATA',
  'LANG', 'LANGUAGE', 'LC_ALL', 'LC_CTYPE',
  'HTTP_PROXY', 'HTTPS_PROXY', 'NO_PROXY',
  'GIT_CONFIG_GLOBAL', 'XDG_CONFIG_HOME',
];

function childEnv(extra, source) {
  source = source || process.env;
  var out = {};
  Object.keys(source).forEach(function(name) {
    if (ALLOW.indexOf(name.toUpperCase()) !== -1) out[name] = source[name];
  });
  return Object.assign(out, extra || {});
}

module.exports = { childEnv: childEnv, ALLOW: ALLOW };