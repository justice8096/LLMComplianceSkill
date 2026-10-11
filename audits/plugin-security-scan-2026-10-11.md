## Security Scan — ai-compliance@llm-compliance-skill — 2026-10-11

**SHA**: 5cb665c24ee107530df31d46647b143548a389da | **Installed**: 2026-10-11T12:31:12.414Z | **Last updated**: 2026-10-11T12:31:12.414Z
**Scope**: user | **Install path**: C:\Users\justi\.claude\plugins\cache\llm-compliance-skill\ai-compliance\1.3.0

### Summary
1,065 files scanned (140 plugin files read or pattern-checked in full, 925 under `node_modules/` inventoried) | 0 critical | 3 warnings | 4 info

### Findings

#### [WARNING] tools/extractors/package-evidence.js:203
- **Check**: A (shell execution with interpolated input), applied to the plugin's scripts since there are no hook scripts
- **Issue**: The installed copy is the pre-#11 extractor. It runs `git`, `npm audit` and `pip-audit` through `execSync` (a shell), with a path from the scanned repository placed inside the command string. A crafted file name in a repo you scan could inject shell commands. Main replaced this with argv-only `execFileSync` and an isolated npm directory (#11, #13).
- **Excerpt**: `var result = runCmd('git ls-files --error-unmatch "' + rel + '"', repoPath, 5000);`
- **Recommendation**: Update the plugin. Bump the version on main first (see the next finding), then reinstall from the GitHub marketplace. Until then, do not run the extractors against repositories you do not trust.

#### [WARNING] (install path) node_modules/
- **Check**: D (binaries, size)
- **Issue**: The install contains 925 `node_modules` files (about 40 MB), including `@esbuild/win32-x64/esbuild.exe` (10.9 MB) and the TypeScript compiler. These are the repo's dev dependencies (`tsx`, `typescript`) and are not tracked in git. They were copied because the plugin was installed from a local working tree. The plugin itself is 2.6 MB.
- **Excerpt**: `node_modules\@esbuild\win32-x64\esbuild.exe  10.86 MB`
- **Recommendation**: Safe in origin, but reinstall from the GitHub marketplace so only tracked files are copied. Make sure the Directory submission points at the GitHub repo, not a local folder.

#### [WARNING] .claude-plugin/plugin.json:4
- **Check**: D (content replaced without a version bump)
- **Issue**: The installed commit is `5cb665c`, version 1.3.0. Main is now `a4bfa93` after ten merged PRs (security fixes, accessibility, translations) and still says 1.3.0, so an update check sees no change.
- **Excerpt**: `"version": "1.3.0",`
- **Recommendation**: Bump to 1.4.0 with a CHANGELOG entry and a tag, then reinstall.

#### [INFO] tools/extractors/git-evidence.js:428-438
- **Check**: B (credential-adjacent paths)
- **Issue**: Mentions `id_rsa`, `.aws`, `*.pem` and `credentials`. These are patterns the extractor looks for in the scanned repo's `.gitignore`, to report whether secrets are excluded. It never reads the user's own credential files.
- **Excerpt**: `{ pattern: /id_rsa/m, name: 'id_rsa' },`
- **Recommendation**: Safe to ignore.

#### [INFO] tools/interactive/llm-selector.html:123, tools/interactive/shared.js:48
- **Check**: A (network calls)
- **Issue**: `fetch` and `XMLHttpRequest` load only the plugin's own JSON files through relative paths (`../data/llm-registry.json`, `../i18n/locales/<code>.json`). There are no external hosts.
- **Excerpt**: `fetch('../data/llm-registry.json')`
- **Recommendation**: Safe to ignore.

#### [INFO] templates/15-Security-Assessment.md:38
- **Check**: B (injection phrases)
- **Issue**: The words "prompt injection, jailbreaking" appear as rows in a threat checklist, not as instructions.
- **Excerpt**: `| **Model attacks** | Adversarial inputs, prompt injection, jailbreaking | | | |`
- **Recommendation**: Safe to ignore.

#### [INFO] CHANGELOG.md:5, 50, 120
- **Check**: B (base64-like blobs)
- **Issue**: The matches are long GitHub URLs to `justice8096/SecondBrainData/blob/main/SoftwarePractices/...`, not encoded data. They do disclose the name of a personal notes repository in a public file.
- **Excerpt**: `github.com/justice8096/SecondBrainData/blob/main/SoftwarePractices/Skill...`
- **Recommendation**: Safe. Remove the links if that repository is private.

### Clean Areas
- No `hooks/` directory or `hooks.json`: nothing runs automatically on Claude Code events.
- `.claude-plugin/plugin.json` and `marketplace.json` grant no permissions, tools or hooks.
- `commands/*.md` and `skills/*/SKILL.md`:
  - no prompt-injection phrases
  - no `allowed-tools`
  - no hidden HTML comments (the only one is an SPDX license line in CHANGELOG.md)
  - no zero-width characters
  - no instructions to edit settings or install anything
- `tools/*.js`, `tools/extractors/*.js`, `generate_poster.py`, `.github/workflows/lint.yml`:
  - no reads of secret-named environment variables
  - no `eval` or obfuscated payloads
  - no shell-profile writes, cron or other persistence
  - no silent installs
- Images and the PDF poster are expected binary types.

### Verdict

**REVIEW RECOMMENDED**

There is nothing malicious: no hooks, no permissions, no exfiltration, no injected instructions. The install is a stale local copy that still has the shell-based extractor fixed in #11, and it carries 40 MB of dev dependencies. A version bump and a clean reinstall from GitHub clears all three warnings.

Run this scan again after the author releases a fix, or review the flagged files manually before using this plugin.
