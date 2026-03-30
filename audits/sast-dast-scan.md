# SAST/DAST Security Scan Report
## LLMComplianceSkill — AI Compliance Evidence Collection Kit

**Report Date**: 2026-03-29
**Auditor**: Post-Commit Audit Skill (Claude Sonnet 4.6)
**Commit**: 1586ec7
**Branch**: main
**Audit Type**: POST-MERGE Audit (commits a15f82f, af8535f, 1586ec7 since prior PASS ff26c8d)

---

## Executive Summary

No new security findings were introduced in the three commits since the prior PASS audit
(ff26c8d). The new code — a Node.js test suite, locale JSON files, and package.json — is
structurally clean. Two prior low-severity findings carry forward. All medium findings
remain fixed.

| Severity | Prior Audit (ff26c8d) | This Audit (1586ec7) | Delta |
|----------|----------------------|----------------------|-------|
| Critical | 0                    | 0                    | —     |
| High     | 0                    | 0                    | —     |
| Medium   | 0                    | 0                    | —     |
| Low      | 2                    | 1                    | -1    |
| Info     | 4                    | 3                    | -1    |
| **Total**| **6**                | **4**                | **-2**|

**Overall Result: PASS**

---

## New Code Reviewed (1586ec7 delta)

### tests/i18n.test.js — CLEAN
- Uses `node:test` and `node:assert/strict` (built-in Node.js modules)
- No external network calls
- No file writes; reads locale JSON from local filesystem only
- No user-controlled input paths

### tests/locale-parity.test.js — CLEAN
- Reads locale files from `tools/i18n/locales/` only
- Uses only `node:test`, `node:assert/strict`, `fs`, `path`
- No external calls

### tests/deadline-data.test.js — CLEAN
- Reads `tools/data/deadline-data.json` and `tools/data/jurisdiction-matrix.json`
- Static data validation only; no network, no user input

### tests/extractors.test.js — CLEAN
- Uses `execFileSync(process.execPath, ['--check', filePath])` for syntax validation
  - `process.execPath` is the current Node.js binary (not user-controlled)
  - `filePath` is computed from `path.join(__dirname, '..', ...)` using constants
  - Not injectable; arguments are an array, not a shell string
- Integration tests call `git-evidence.js --repo <repoRoot>` where `repoRoot = path.join(__dirname, '..')`
  - Fixed path, not user-controlled
  - Uses `execFileSync` with argument array (safe pattern already established in codebase)
- Timeout set to 30000ms on all extractor invocations

### package.json — CLEAN
- Zero `dependencies` — no npm packages installed
- Zero `devDependencies` — no npm packages installed
- `scripts` section only: `node --test tests/**/*.test.js`
- `engines.node: ">=18.0.0"` — appropriate minimum version specification
- `private: true` — not publishable to npm

### tools/i18n/locales/*.json (translations) — CLEAN
- Static JSON; no code execution
- No external references
- All keys verified against en.json schema (109 parity tests passing)

---

## Active Findings

### [LOW-01] Partial Token Splitting for Git Grep Regex — CARRY-FORWARD
**CWE**: CWE-88 (Argument Injection or Modification)
**File**: `tools/extractors/git-evidence.js`
**Status**: Accepted (low exploitability)

The revert commit detection passes a regex pattern `^Revert ` as a `--grep` argument to
`git log`. While the argument array pattern prevents shell injection, a repo path containing
embedded null bytes or special git filter syntax could produce unexpected behavior.
Exploitability is negligible in practice (requires attacker control of the repo path).

**Mitigation in place**: `execFileSync` with argument array. No shell interpolation.
**Recommended fix**: Validate repo path characters before passing to git commands.
**Risk accepted**: LOW — no external surface, tool is operator-run against own repos.

---

## Informational Findings (carry-forward)

### [INFO-01] ReDoS Potential in Package Evidence Regexes
**CWE**: CWE-1333 (Uncontrolled Resource Consumption via Regex)
**File**: `tools/extractors/package-evidence.js`
**Detail**: Several regex patterns used for parsing `package.json`, `requirements.txt`,
and similar files could exhibit catastrophic backtracking on adversarially crafted inputs.
Risk is negligible since input is always a local file controlled by the operator.

### [INFO-02] PII in Evidence JSON Output
**CWE**: CWE-312 (Cleartext Storage of Sensitive Information)
**File**: `tools/extractors/git-evidence.js`
**Detail**: `git log` output includes committer email addresses in the evidence JSON.
Operators should be aware that the JSON output may be PII under GDPR if distributed.
The tool itself does not transmit data; this is a downstream handling reminder.

### [INFO-03] Markdown Template Field Injection
**CWE**: CWE-707 (Improper Neutralization)
**File**: `tools/autofill.js`
**Detail**: Values filled into markdown templates are not sanitized for markdown special
characters. A field value containing `|` or newlines could break table formatting.
No security impact; cosmetic/functional concern only.

---

## Previously Fixed Findings (ff26c8d)

| Finding | CWE | Fix |
|---------|-----|-----|
| OS command injection in git-evidence.js | CWE-78 | execFileSync with array args |
| Uncontrolled resource consumption (no timeout) | CWE-400 | timeout: 60000ms added |
| Missing input validation in autofill.js | CWE-20 | REQUIRED_CONFIG_KEYS schema check |
| Unpinned GitHub Actions | CWE-829 | SHA-pinned actions/checkout and setup-node |

---

## DAST Assessment

DAST is not applicable to this project's server-side components (all Node.js CLI tools,
no HTTP server). The browser-based interactive tools (`tools/interactive/*.html`) are
served statically and contain no server-side processing.

Browser-side security review of the 21 HTML tools:
- Zero `innerHTML` assignments — all DOM manipulation uses `createElement`/`appendChild`
- Zero external script imports — all JavaScript is inline or from same-origin `shared.js`
- Zero external API calls — `XMLHttpRequest` in `shared.js` loads only same-origin locale JSON
- Zero dynamic code execution functions used for logic
- sessionStorage used for form persistence — no sensitive data stored

**Browser-side assessment: CLEAN**

---

_Report generated by post-commit-audit skill — 2026-03-29_
