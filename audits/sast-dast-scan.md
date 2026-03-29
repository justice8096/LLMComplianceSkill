# SAST/DAST Security Scan Report
## LLMComplianceSkill — AI Compliance Evidence Collection Kit

**Report Date**: 2026-03-29
**Auditor**: Post-Commit Audit Skill (Claude Sonnet 4.6)
**Commit**: ff26c8d
**Branch**: master
**Audit Type**: POST-FIX Re-audit (following CONDITIONAL PASS on 4dcdb1c)

---

## Executive Summary

This re-audit follows targeted security hardening in commit `ff26c8d`. All four medium/low
findings from the prior audit have been resolved. The project now has **zero critical, zero
high, zero medium** findings. Two low-severity and four informational items remain, all
accepted or non-actionable without broader project scope changes.

| Severity | Prior Audit | This Audit | Delta |
|----------|-------------|------------|-------|
| Critical | 0           | 0          | —     |
| High     | 0           | 0          | —     |
| Medium   | 2           | 0          | -2    |
| Low      | 3           | 2          | -1    |
| Info     | 4           | 4          | —     |
| **Total**| **9**       | **6**      | **-3**|

**Overall Result: PASS**

---

## Findings

### LOW Findings

---

#### [LOW-01] Partial Token Splitting for Git Arguments
**CWE**: CWE-88 (Argument Injection or Modification)
**File**: `tools/extractors/git-evidence.js`, line 59
**Status**: Residual / Accepted

**Description**: The `git()` helper now correctly uses `execFileSync` with an argument array
(fixing CWE-78). The tokenisation uses `cmd.split(/\s+/)` on a flat string. All call sites
currently pass literal string constants, meaning no user-controlled input flows into `cmd`.
The risk of argument injection is negligible in this codebase but is noted for completeness.

**Code Snippet**:
```js
const args = ['-C', repoPath, ...cmd.split(/\s+/).filter(Boolean)];
```

**Remediation**: Convert all call sites to pass explicit token arrays directly, eliminating
the split entirely. This is low-priority given no external input reaches `cmd` today.

---

#### [LOW-02] `--since` Date Argument Constructed via String Interpolation
**CWE**: CWE-116 (Improper Encoding or Escaping of Output)
**File**: `tools/extractors/git-evidence.js`, line 77
**Status**: Residual / Low Risk

**Description**: `sinceArg()` builds `--since="<ISO date>"` as a quoted string that is then
tokenised by the `cmd.split` in `git()`. Because the date is derived from `new Date()` (not
user input), there is no injection risk in practice. However, the quoted string with embedded
spaces is not cleanly tokenised and will be passed as a single token including the quotes,
which git accepts but is fragile.

**Code Snippet**:
```js
return `--since="${d.toISOString().split('T')[0]}"`;
```

**Remediation**: Pass the date as a separate array element: `['--since', d.toISOString()...]`.
No security impact today; purely a robustness improvement.

---

### INFO Findings

---

#### [INFO-01] No Automated Secret Scanning in CI
**CWE**: CWE-312 (Cleartext Storage of Sensitive Information)
**File**: `.github/workflows/lint.yml`
**Status**: Accepted — project has no credentials by design

**Description**: The CI workflow performs JavaScript syntax checking only. There is no
`truffleHog`, `git-secrets`, or `gitleaks` step. The project is offline-only with no
credentials, API keys, or secrets, so the practical risk is negligible.

**Remediation**: Add `gitleaks` or GitHub secret scanning as a defence-in-depth measure for
the case where a contributor accidentally commits credentials.

---

#### [INFO-02] No Formal DAST Surface
**CWE**: N/A
**File**: Project-wide
**Status**: Accepted — no HTTP surface present

**Description**: The project is a CLI/Node.js toolkit with no web server, API endpoints, or
browser-accessible surface. Dynamic application security testing (DAST — HTTP header checks,
CORS, TLS, cookie flags) is not applicable.

---

#### [INFO-03] Regex Complexity in `autofill.js`
**CWE**: CWE-1333 (Inefficient Regular Expression Complexity / ReDoS)
**File**: `tools/autofill.js`, lines 58–64, 75–77, 83–84
**Status**: Informational — bounded by Markdown template size

**Description**: Several regex patterns in `fillTableField()`, `fillCheckbox()`, and
`fillJurisdictionCheckbox()` use `*` and `+` quantifiers with character-class alternatives
on user-indirectly-controlled template content. Input is read from trusted local Markdown
template files, not from untrusted network input. Theoretical ReDoS risk is present but
practically unexploitable.

---

#### [INFO-04] Extractor Accuracy and Bias Not Formally Measured
**CWE**: CWE-707 (Improper Neutralization — detection gap)
**File**: `tools/extractors/git-evidence.js`
**Status**: Informational — see LLM Compliance Bias Assessment dimension

**Description**: The git-evidence extractor uses heuristic pattern matching (commit message
keywords, file naming conventions) to classify evidence. False-positive and false-negative
rates are not formally documented. This is tracked in the LLM Compliance report as a
Bias Assessment dimension gap.

---

## Fixed Findings (Prior Audit to This Audit)

| ID | CWE | Description | Fix Commit |
|----|-----|-------------|------------|
| MEDIUM-01 | CWE-78 | Shell injection via `execSync` string interpolation in `git-evidence.js` | ff26c8d |
| MEDIUM-02 | CWE-20 | Missing required key schema validation in `autofill.js` | ff26c8d |
| LOW-01 (prior) | CWE-400 | No timeout on `execSync` calls — potential resource exhaustion | ff26c8d |
| LOW-02 (prior) | CWE-829 | GitHub Actions not SHA-pinned in `lint.yml` | ff26c8d |

---

## Scan Scope

| Area | Checked | Result |
|------|---------|--------|
| Command injection (CWE-78) | Yes | FIXED |
| Input validation (CWE-20) | Yes | FIXED |
| Resource exhaustion (CWE-400) | Yes | FIXED |
| Dependency confusion / CI pinning (CWE-829) | Yes | FIXED |
| Hardcoded secrets | Yes | None found |
| Path traversal (CWE-22) | Yes | None found |
| ReDoS (CWE-1333) | Yes | Informational only |
| SQL/XSS injection | Yes | N/A — no DB, no web UI |
| Cryptographic weaknesses | Yes | N/A — no crypto operations |
| Race conditions | Yes | None found (single-threaded CLI) |
| HTTP security headers / CORS / TLS | Yes | N/A — no HTTP surface |

---

*Generated by post-commit-audit skill — 2026-03-29*
