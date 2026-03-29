# CWE Mapping Report
## LLMComplianceSkill

**Report Date**: 2026-03-29
**Auditor**: Post-Commit Audit — CWE Mapper
**Commit**: 4dcdb1c
**Source Findings**: `audits/sast-dast-scan.md`, `audits/supply-chain-audit.md`
**Frameworks Mapped**: OWASP Top 10 2021, OWASP LLM Top 10 2025, NIST SP 800-53, EU AI Act, ISO 27001, SOC 2, MITRE ATT&CK, MITRE ATLAS

---

## Executive Summary

| Metric | Value |
|--------|-------|
| Total CWEs identified | 6 |
| Frameworks mapped | 8 |
| Critical/High CWEs | 0 |
| Medium CWEs | 2 |
| Low/Info CWEs | 4 |

All findings are from Phase 1 scanning. No critical or high severity CWEs were identified. The dominant themes are input validation (CWE-20), command injection via shell interpolation (CWE-78), and operational/hygiene issues (CWE-390, CWE-400, CWE-1333, CWE-693).

---

## Per-CWE Mappings

---

### CWE-78 — Improper Neutralization of Special Elements in an OS Command

**Source Finding**: SAST-M-001
**Severity**: MEDIUM
**File**: `tools/extractors/git-evidence.js`

| Framework | Mapping | Reference |
|-----------|---------|-----------|
| OWASP Top 10 2021 | A03:2021 — Injection | Category |
| OWASP LLM Top 10 2025 | LLM08 — Excessive Agency (tool use without sanitization) | Indirect |
| NIST SP 800-53 | SI-10 (Information Input Validation) | Control |
| EU AI Act | Art. 25 — Risk management system obligations | Indirect |
| ISO 27001 | A.8.28 (Secure coding) | Control |
| SOC 2 | CC6.1 (Logical and physical access controls) | Indirect |
| MITRE ATT&CK | T1059 — Command and Scripting Interpreter | Technique |
| MITRE ATLAS | AML.T0010 — Command and Scripting Interpreter | Technique |

**Notes**: Shell string interpolation is the classic vector for OS command injection. In this project the attack surface is limited to local use with operator-supplied paths, making exploitation require local access. The risk is best described as a code quality issue with a theoretically exploitable path under adversarial conditions (e.g., if repo path is read from a CI environment variable that an attacker controls).

---

### CWE-20 — Improper Input Validation

**Source Finding**: SAST-M-002
**Severity**: MEDIUM
**Files**: `tools/autofill.js`, `tools/evidence-checker.js`

| Framework | Mapping | Reference |
|-----------|---------|-----------|
| OWASP Top 10 2021 | A03:2021 — Injection (broad) | Category |
| OWASP LLM Top 10 2025 | LLM09 — Misinformation (silent failures produce incomplete output) | Direct |
| NIST SP 800-53 | SI-10 (Information Input Validation) | Control |
| EU AI Act | Art. 25 — Accuracy and robustness obligations | Direct |
| ISO 27001 | A.8.28 (Secure coding) | Control |
| SOC 2 | CC3.2 (Risk assessment) | Indirect |
| MITRE ATT&CK | T1190 — Exploit Public-Facing Application | Low relevance (local tool) |
| MITRE ATLAS | AML.T0043 — Craft Adversarial Data | Indirect |

**Notes**: Missing schema validation means a malformed config silently produces partially-filled compliance templates. For a compliance evidence tool, silent partial output is a high-impact functional failure even if the security risk is low — users may submit incomplete evidence to regulators believing it is complete.

---

### CWE-390 — Detection of Error Condition Without Action

**Source Finding**: SAST-L-001
**Severity**: LOW
**File**: `tools/interactive/shared.js`

| Framework | Mapping | Reference |
|-----------|---------|-----------|
| OWASP Top 10 2021 | A09:2021 — Security Logging and Monitoring Failures | Indirect |
| OWASP LLM Top 10 2025 | LLM09 — Misinformation (silent failure) | Indirect |
| NIST SP 800-53 | SI-11 (Error Handling) | Control |
| EU AI Act | Art. 25 — Reliability obligations | Indirect |
| ISO 27001 | A.8.16 (Monitoring activities) | Indirect |
| SOC 2 | CC7.2 (System monitoring) | Indirect |
| MITRE ATT&CK | N/A | — |
| MITRE ATLAS | N/A | — |

---

### CWE-400 — Uncontrolled Resource Consumption

**Source Finding**: SAST-L-002
**Severity**: LOW
**File**: `tools/extractors/git-evidence.js`

| Framework | Mapping | Reference |
|-----------|---------|-----------|
| OWASP Top 10 2021 | A05:2021 — Security Misconfiguration | Indirect |
| OWASP LLM Top 10 2025 | LLM10 — Unbounded Consumption | Direct |
| NIST SP 800-53 | SC-5 (Denial of Service Protection) | Control |
| EU AI Act | Art. 25 — Robustness | Indirect |
| ISO 27001 | A.8.6 (Capacity management) | Indirect |
| SOC 2 | A1.1 (Availability — capacity planning) | Indirect |
| MITRE ATT&CK | T1499 — Endpoint Denial of Service | Low relevance |
| MITRE ATLAS | N/A | — |

---

### CWE-1333 — Inefficient Regular Expression Complexity

**Source Finding**: SAST-L-003
**Severity**: LOW (ACCEPTED)
**File**: `tools/autofill.js`

| Framework | Mapping | Reference |
|-----------|---------|-----------|
| OWASP Top 10 2021 | A05:2021 — Security Misconfiguration | Indirect |
| OWASP LLM Top 10 2025 | LLM10 — Unbounded Consumption | Indirect |
| NIST SP 800-53 | SC-5 (Denial of Service Protection) | Indirect |
| EU AI Act | Art. 25 — Robustness | Indirect |
| ISO 27001 | A.8.28 (Secure coding) | Control |
| SOC 2 | CC6.1 (Logical access controls) | Low relevance |
| MITRE ATT&CK | T1499 — Endpoint Denial of Service | Low relevance |
| MITRE ATLAS | N/A | — |

---

### CWE-693 — Protection Mechanism Failure

**Source Finding**: DAST-I-001
**Severity**: INFO (ACCEPTED)
**File**: `tools/interactive/*.html`

| Framework | Mapping | Reference |
|-----------|---------|-----------|
| OWASP Top 10 2021 | A05:2021 — Security Misconfiguration | Direct |
| OWASP LLM Top 10 2025 | N/A | — |
| NIST SP 800-53 | SC-44 (Detonation Chambers) / SC-18 (Mobile Code) | Indirect |
| EU AI Act | Art. 25 — Cybersecurity measures | Indirect |
| ISO 27001 | A.8.28 (Secure coding) | Control |
| SOC 2 | CC6.7 (Data transmission) | Indirect |
| MITRE ATT&CK | T1059.007 — JavaScript | Low relevance |
| MITRE ATLAS | N/A | — |

---

## Aggregate Compliance Matrix

| Framework | Total Controls Touched | Findings Mapped | Coverage Status |
|-----------|----------------------|-----------------|-----------------|
| OWASP Top 10 2021 | A03, A05, A09 | 6 findings | Addressed |
| OWASP LLM Top 10 2025 | LLM08, LLM09, LLM10 | 4 findings | Addressed |
| NIST SP 800-53 | SI-10, SI-11, SC-5, SC-28 | 5 findings | Addressed |
| EU AI Act (Art. 25) | Accuracy, Robustness, Cybersecurity | 5 findings | Addressed |
| ISO 27001 | A.8.6, A.8.16, A.8.28 | 5 findings | Addressed |
| SOC 2 | CC3.2, CC6.1, CC7.2, A1.1 | 4 findings | Addressed |
| MITRE ATT&CK | T1059, T1499 | 2 findings | Addressed |
| MITRE ATLAS | AML.T0010, AML.T0043 | 2 findings | Addressed |

---

## Priority Remediation Order

| Priority | CWE | Finding | Effort |
|----------|-----|---------|--------|
| 1 | CWE-78 | SAST-M-001 — Shell interpolation in git-evidence.js | Low (refactor one function) |
| 2 | CWE-20 | SAST-M-002 — Missing config schema validation | Low (add key check in loadConfig) |
| 3 | CWE-400 | SAST-L-002 — No timeout on execSync | Trivial (add timeout option) |
| 4 | CWE-390 | SAST-L-001 — Silent failure in browser export | Low (add try/catch) |
| 5 | CWE-693 | DAST-I-001 — No CSP header | Trivial (add meta tag) |
| 6 | CWE-1333 | SAST-L-003 — ReDoS in regex | ACCEPTED (bounded input) |

---

*Generated by post-commit-audit skill — 2026-03-29*
