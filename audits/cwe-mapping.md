# CWE Mapping Report
## LLMComplianceSkill — AI Compliance Evidence Collection Kit

**Report Date**: 2026-03-29
**Auditor**: Post-Commit Audit Skill (Claude Sonnet 4.6)
**Commit**: 1586ec7
**Branch**: main
**Audit Type**: POST-MERGE Audit (delta from ff26c8d)

---

## Executive Summary

No new CWEs were introduced in commits a15f82f, af8535f, or 1586ec7. The test suite,
locale files, and package.json are structurally clean. Two residual low-severity CWEs
and four informational CWEs carry forward unchanged from the prior audit.

| Status | CWEs | Change from Prior |
|--------|------|------------------|
| Fixed (cumulative) | 4 | CWE-78, CWE-400, CWE-20, CWE-829 |
| Active (Low) | 2 | CWE-88, CWE-116 — unchanged |
| Active (Info) | 4 | CWE-1333, CWE-312, CWE-707, N/A — unchanged |
| New in this audit | 0 | — |
| **Total Active** | **6** | Unchanged from prior |

**Overall Result: PASS**

---

## New Code CWE Scan (1586ec7 delta)

### tests/*.test.js
- `execFileSync(process.execPath, ['--check', filePath])` — argument array, not shell string.
  `process.execPath` and `filePath` are both constants derived from `__dirname`. NOT CWE-78.
- No regex patterns susceptible to ReDoS. NOT CWE-1333.
- No file writes, no PII handling. NOT CWE-312.
- No network calls. NOT CWE-918.
- **Result: CLEAN**

### package.json
- No dependencies; no indirect CWE-1104 (Use of Unmaintained Third-Party Component) exposure.
- **Result: CLEAN**

### tools/i18n/locales/*.json
- Static data files. No code execution path. No applicable CWEs.
- **Result: CLEAN**

---

## Active CWE Inventory

### CWE-88 — Argument Injection (Low)
**File**: `tools/extractors/git-evidence.js`
**Location**: Revert commit detection — `--grep` argument with regex pattern
**Description**: The `^Revert ` regex is passed as a `--grep` argument to git via
`execFileSync`. While shell injection is prevented (argument array, not shell string),
a repository path containing null bytes could cause unexpected git behavior.
**CVSS Base**: 2.1 (Local/Low/None/None)
**Status**: Accepted — low exploitability, requires control of repo path
**Mapped To**:
- EU AI Act Art. 15 (accuracy/robustness): DOCUMENTED
- OWASP LLM03 (training data poisoning — analogous injection): DOCUMENTED
- NIST SP 800-218A (secure development): DOCUMENTED
- CIS Control 16 (application software security): DOCUMENTED

### CWE-116 — Improper Encoding or Escaping of Output (Low)
**File**: `tools/extractors/git-evidence.js`
**Location**: Author/committer string parsing
**Description**: Git log output is split on `|||` delimiter and the parsed author name
is used as a key in a contributors object. If a commit author name contains `|||`, the
splitting could yield unexpected results. Not a security vulnerability; correctness concern.
**CVSS Base**: 1.8 (Local/Low/None/None)
**Status**: Accepted — delimiter conflict is cosmetically possible but not exploitable
**Mapped To**:
- CWE-20 (Improper Input Validation): Related
- OWASP Top 10 A03:2021 (Injection — analogous): DOCUMENTED

---

## Informational CWE Inventory

### CWE-1333 — Uncontrolled Resource Consumption via Regex (Info)
**File**: `tools/extractors/package-evidence.js`
**Description**: Regex patterns for parsing dependency files could exhibit catastrophic
backtracking on adversarial inputs. Exploitability requires attacker control of local
project files — not an external attack surface.
**Mitigation**: Input is always operator-controlled local files.

### CWE-312 — Cleartext Storage of Sensitive Information (Info)
**File**: `tools/extractors/git-evidence.js` (output)
**Description**: Evidence JSON output includes git committer email addresses. Downstream
distribution of the JSON file could expose PII under GDPR.
**Mitigation**: Tool documentation should note output may contain PII and should be
treated as internal documentation, not distributed publicly.

### CWE-707 — Improper Neutralization (Info)
**File**: `tools/autofill.js`
**Description**: Config values filled into Markdown tables are not escaped for Markdown
special characters. Not a security issue — cosmetic/formatting risk only.

### N/A — Test Glob Portability (Info)
**Description**: `tests/**/*.test.js` glob in `package.json` npm script is expanded by
Node's `--test` flag directly on Node 22, not by the shell. Verified working on
Windows/Node v22.18.0. If used with an older Node version or a different shell, glob
expansion behavior may differ.
**Mitigation**: `engines.node: ">=18.0.0"` ensures minimum version.

---

## Framework Cross-Reference Matrix

| CWE | EU AI Act | OWASP LLM | NIST SP 800-218A | CIS v8 | SLSA | Colorado SB | UK Cyber |
|-----|-----------|-----------|------------------|--------|------|-------------|----------|
| CWE-78 (FIXED) | Art. 15 | LLM04 | 3.1.5 | 16.1 | L3 | S6-1-1702(1) | Sec. 9 |
| CWE-400 (FIXED) | Art. 15 | LLM10 | 3.1.6 | 12.1 | — | — | Sec. 9 |
| CWE-20 (FIXED) | Art. 9 | LLM01 | 3.1.1 | 16.12 | — | S6-1-1702(7) | Sec. 5 |
| CWE-829 (FIXED) | Art. 25 | LLM05 | 2.5.3 | 16.6 | L2 | S6-1-1702(5) | Sec. 12 |
| CWE-88 (Low) | Art. 15 | LLM03 | 3.1.5 | 16.1 | — | — | — |
| CWE-116 (Low) | Art. 15 | — | 3.1.2 | 16.12 | — | — | — |
| CWE-1333 (Info) | Art. 15 | LLM10 | 3.1.6 | 12.1 | — | — | — |
| CWE-312 (Info) | Art. 10 | LLM06 | — | 3.11 | — | S6-1-1702(9) | Sec. 5 |
| CWE-707 (Info) | Art. 13 | — | 3.1.2 | 16.12 | — | — | — |

---

_Report generated by post-commit-audit skill — 2026-03-29_
