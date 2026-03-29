# SAST/DAST Security Scan Report
## LLMComplianceSkill

**Report Date**: 2026-03-29
**Auditor**: Post-Commit Audit — SAST/DAST Scanner
**Commit**: 4dcdb1c
**Branch**: master
**Scan Scope**: `tools/*.js`, `tools/extractors/*.js`, `tools/interactive/*.html`, `tools/interactive/shared.js`

---

## Executive Summary

| Severity | Count |
|----------|-------|
| CRITICAL | 0 |
| HIGH | 0 |
| MEDIUM | 2 |
| LOW | 3 |
| INFO | 4 |
| **Total** | **9** |

**Overall Result**: PASS (zero critical/high findings)

The LLMComplianceSkill codebase demonstrates strong security hygiene for a developer tool. The zero-dependency, offline-only design substantially eliminates entire attack surface categories (no npm supply chain exposure, no network attack surface, no server-side injection). Findings are limited to medium-severity issues appropriate to a browser-based local tool and low-severity style issues.

---

## Phase 1: SAST — Static Analysis

### MEDIUM Findings

---

#### SAST-M-001 — Shell String Interpolation in `git-evidence.js`
**CWE**: CWE-78 (OS Command Injection — Improper Neutralization of Special Elements)
**File**: `tools/extractors/git-evidence.js`
**Line**: ~56
**CVSS**: 5.5 (Medium) — local exploitability only, user supplies repo path

**Description**: The `repoPath` argument is interpolated into a shell command string passed to `execSync`. While the inline comment documents that this path originates from the same user running the script, shell metacharacters in a path could cause unintended command execution if the path were ever sourced from an untrusted input (CI environment variable, config file read from disk).

**Contrast with `extract-evidence.js`**: The runner script correctly uses `execFileSync` with an explicit argument array — this is the established project pattern and should be applied consistently.

**Remediation**: Refactor the git helper to pass arguments as an array to `execFileSync` rather than interpolating into a shell string. This eliminates the shell expansion surface entirely.

**Regulatory mapping**: OWASP A03:2021 — Injection; CWE-78; NIST SP 800-53 SI-10

---

#### SAST-M-002 — JSON Parsed Without Schema Validation
**CWE**: CWE-20 (Improper Input Validation)
**Files**: `tools/autofill.js` (line 20), `tools/evidence-checker.js` (line 14)
**CVSS**: 4.3 (Medium) — local tool, operator-supplied input

**Description**: Config files and data files are parsed without schema validation. A malformed config file could trigger property-access errors deep in template processing, producing silently incomplete outputs. The SECURITY.md acknowledges this limitation explicitly.

**Remediation**: Add a lightweight schema check (required top-level keys: `organization`, `system`, `jurisdictions`) before processing. Emit a clear error to stderr and exit non-zero if required fields are missing or wrong type.

**Regulatory mapping**: CWE-20; NIST SP 800-53 SI-10; SOC 2 CC6.1

---

### LOW Findings

---

#### SAST-L-001 — Silent Failure Path in Browser File Export (`shared.js`)
**CWE**: CWE-390 (Detection of Error Condition Without Action)
**File**: `tools/interactive/shared.js`
**Severity**: LOW

**Description**: `FileReader.onload` catches JSON parse errors and alerts the user. However, `saveConfigToFile` and `exportMarkdown` create Blob/URL objects without error handling. A failure in restrictive browser environments would fail silently without user notification.

**Remediation**: Wrap blob-creation calls in try/catch and display a user-visible error on failure.

---

#### SAST-L-002 — No Timeout on `execSync` git Operations
**CWE**: CWE-400 (Uncontrolled Resource Consumption)
**File**: `tools/extractors/git-evidence.js`
**Severity**: LOW

**Description**: `execSync` is called with `maxBuffer: 50 MB` but no `timeout` option. A repository with an extremely large history could block indefinitely, especially when the `--days` parameter is set high.

**Remediation**: Add `timeout: 60000` (60 s) to all `execSync` options, consistent with the 120 s timeout already set in `extract-evidence.js`.

---

#### SAST-L-003 — Regex Construction from User-Supplied Field Names (ReDoS Risk)
**CWE**: CWE-1333 (Inefficient Regular Expression Complexity)
**File**: `tools/autofill.js`
**Severity**: LOW

**Description**: `fieldName` values from config are used to construct regex patterns after basic metacharacter escaping. The escaping covers standard metacharacters. Risk is low because inputs are operator-controlled and template files are bounded in size.

**Remediation**: Accepted risk. Consider string-based matching for simple table-row lookups as a performance improvement for large templates.

---

## Phase 2: DAST — Dynamic / Browser Security Analysis

### INFO Findings

---

#### DAST-I-001 — No Content Security Policy (Static File Delivery)
**CWE**: CWE-693 (Protection Mechanism Failure)
**Scope**: `tools/interactive/*.html`
**Severity**: INFO

**Description**: Interactive HTML tools do not define a `<meta http-equiv="Content-Security-Policy">` header. If served over HTTP no CSP restricts inline script execution. Risk is accepted by design — this is a local developer tool. No external scripts are loaded, no `eval()`, `innerHTML`, or `document.write()` is used.

**Recommendation**: Add a CSP meta tag as defence-in-depth for users who serve tools over HTTP.

---

#### DAST-I-002 — localStorage / sessionStorage Data Retention
**CWE**: CWE-312 (Cleartext Storage of Sensitive Information)
**Scope**: `tools/interactive/*.html`
**Severity**: INFO

**Description**: Interactive tools use `sessionStorage` for in-progress form state. Compliance config data persists in browser storage. On a shared workstation this data could be accessed by another user. Data stored is configuration metadata, not PII or secrets.

**Recommendation**: Document that users on shared workstations should use private/incognito browser mode.

---

#### DAST-I-003 — HTTPS Enforcement (GitHub Pages)
**CWE**: CWE-319 (Cleartext Transmission of Sensitive Information)
**Scope**: GitHub Pages deployment
**Severity**: INFO

**Description**: GitHub Pages enforces HTTPS by default. README links use `https://`. No cleartext transmission risk exists.

**Status**: CONFIRMED MITIGATED

---

#### DAST-I-004 — Subresource Integrity for External Assets
**CWE**: CWE-494 (Download of Code Without Integrity Check)
**Scope**: `tools/interactive/*.html`
**Severity**: INFO

**Description**: No external CDN resources are loaded. All scripts reference only `shared.js` (same-directory relative path). No SRI concern.

**Status**: NOT APPLICABLE — no external assets loaded

---

## Hardcoded Secrets Scan

No hardcoded secrets, API keys, tokens, or credentials detected in any scanned file. The project has no network access capability and no authentication surface, making secret exposure structurally impossible.

---

## Cryptographic Assessment

No cryptographic operations are performed. No weak algorithm usage.

---

## Summary Table

| ID | Severity | CWE | File | Status |
|----|----------|-----|------|--------|
| SAST-M-001 | MEDIUM | CWE-78 | `tools/extractors/git-evidence.js` | OPEN |
| SAST-M-002 | MEDIUM | CWE-20 | `tools/autofill.js`, `tools/evidence-checker.js` | OPEN (acknowledged in SECURITY.md) |
| SAST-L-001 | LOW | CWE-390 | `tools/interactive/shared.js` | OPEN |
| SAST-L-002 | LOW | CWE-400 | `tools/extractors/git-evidence.js` | OPEN |
| SAST-L-003 | LOW | CWE-1333 | `tools/autofill.js` | ACCEPTED |
| DAST-I-001 | INFO | CWE-693 | `tools/interactive/*.html` | ACCEPTED |
| DAST-I-002 | INFO | CWE-312 | `tools/interactive/*.html` | ACCEPTED |
| DAST-I-003 | INFO | CWE-319 | GitHub Pages | MITIGATED |
| DAST-I-004 | INFO | CWE-494 | `tools/interactive/*.html` | NOT APPLICABLE |

---

*Generated by post-commit-audit skill — 2026-03-29*
