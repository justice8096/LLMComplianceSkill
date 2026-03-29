# CWE Mapping Report — LLMComplianceSkill

> **Scan Date:** 2026-03-29
> **Scanner:** Manual SAST review (Claude Opus 4.6)
> **Scope:** Commit 406d908 — `tools/extractors/sast-dast-evidence.js`, `tools/autofill.js` (modified portions)
> **Files Scanned:** 2
> **Audit Cycle:** 1 (initial)

---

## Overall Assessment

**PASS** — No critical or high-severity vulnerabilities found. Two informational-level findings documented for completeness. The scanned files are zero-dependency Node.js CLI tools that read local files and write JSON output. No network access, no child_process usage, no user-facing web surface. Attack surface is limited to operator-controlled CLI arguments and locally-generated audit files.

---

## Finding Summary

| Severity | This Audit | Resolved | Active |
|----------|:----------:|:--------:|:------:|
| **Critical** | 0 | 0 | 0 |
| **High** | 0 | 0 | 0 |
| **Medium** | 0 | 0 | 0 |
| **Low** | 1 | 0 | 1 |
| **Info** | 2 | 0 | 2 |
| **Total** | 3 | 0 | 3 |

---

## Detailed Findings

### INFO — Unvalidated CLI Path Arguments

- **File:** `tools/extractors/sast-dast-evidence.js`, lines 31, 33
- **CWE:** CWE-22 (Improper Limitation of a Pathname to a Restricted Directory)
- **Description:** `path.resolve(argv[++i])` passes user-supplied `--repo` and `--output` CLI arguments directly to file system operations without restricting to a specific directory.
- **Risk Assessment:** Informational only. This is a CLI tool run by the repository operator, not a server or web application. The operator is expected to specify arbitrary paths. No privilege boundary is crossed.
- **Status:** OPEN (accepted risk — by design for CLI tools)

### LOW — Prototype Pollution via Markdown Table Header Injection

- **File:** `tools/extractors/sast-dast-evidence.js`, line 188
- **CWE:** CWE-1321 (Improperly Controlled Modification of Object Prototype Attributes)
- **Description:** `parseMarkdownTable()` assigns `row[headers[k]] = cells[k]` where `headers` are extracted from markdown file content. A crafted markdown file with a column header of `__proto__` or `constructor` could modify the object prototype chain.
- **Risk Assessment:** Low. The markdown files are locally-generated audit reports (not user-uploaded content). Downstream code accesses only hardcoded key names (e.g., `row['Severity']`, `row['CWE ID']`), so a polluted prototype would not alter control flow. Exploitability requires the operator to place a maliciously crafted file in `audits/`.
- **Mitigation available:** Use `Object.create(null)` instead of `{}` for the `row` object, or add a guard to skip `__proto__` and `constructor` keys.
- **Status:** OPEN (low priority)

### INFO — Regex Run in Loop Without Catastrophic Backtracking Guard

- **File:** `tools/extractors/sast-dast-evidence.js`, line 250
- **CWE:** CWE-1333 (Inefficient Regular Expression Complexity)
- **Description:** `findingPattern` runs a global regex in a while loop against the full file content. The regex pattern uses alternation on fixed strings and `.+` which is greedy but bounded by newlines. It matches markdown heading patterns like `### RESOLVED — ...`.
- **Risk Assessment:** Informational only. The regex pattern does not exhibit catastrophic backtracking characteristics — the alternation is on fixed strings. Input is local markdown files of bounded size (audit reports, typically under 100KB).
- **Status:** OPEN (accepted risk — no backtracking concern with this pattern)

---

## CWE Inventory

| CWE ID | Name | Original Severity | Current Status |
|--------|------|-------------------|----------------|
| CWE-22 | Improper Limitation of a Pathname to a Restricted Directory | Info | OPEN (accepted) |
| CWE-1321 | Improperly Controlled Modification of Object Prototype Attributes | Low | OPEN |
| CWE-1333 | Inefficient Regular Expression Complexity | Info | OPEN (accepted) |

**Unique CWEs:** 3

---

## CWE to Compliance Framework Cross-Reference

| CWE | Status | OWASP Top 10 2021 | OWASP LLM Top 10 2025 | NIST SP 800-53 | EU AI Act | ISO 27001 | SOC 2 | MITRE ATT&CK | MITRE ATLAS |
|-----|--------|-------------------|----------------------|----------------|-----------|-----------|-------|--------------|-------------|
| CWE-22 | OPEN (accepted) | A01:2021 Broken Access Control | — | AC-6, SI-10 | Art. 15 | A.8.3 | CC6.1 | T1083 (File Discovery) | — |
| CWE-1321 | OPEN | A03:2021 Injection | LLM03 Supply Chain | SI-10 | Art. 15 | A.8.28 | CC6.1 | T1059 (Command/Scripting) | AML.T0043 (Craft Adversarial Data) |
| CWE-1333 | OPEN (accepted) | A04:2021 Insecure Design | — | SI-10 | — | A.8.28 | CC7.1 | T1499.004 (Application DoS) | — |

---

## Aggregate Compliance Matrix

| Framework | CWEs Mapped | Active CWEs | Coverage Notes |
|-----------|:-----------:|:-----------:|----------------|
| OWASP Top 10 2021 | 3/10 | 3 (all info/low) | A01, A03, A04 touched — all at info/low severity |
| OWASP LLM Top 10 2025 | 1/10 | 1 (low) | LLM03 via prototype pollution only — no prompt injection, no model theft vectors |
| NIST SP 800-53 | 3/20 | 3 (all info/low) | AC-6 (least privilege), SI-10 (input validation) families touched |
| EU AI Act | 2/9 | 2 (info/low) | Art. 15 (cybersecurity) — minimal findings |
| ISO 27001 | 3/3 | 3 (all info/low) | A.8.3 (information access), A.8.28 (secure coding) |
| SOC 2 | 3/3 | 3 (all info/low) | CC6.1 (logical access), CC7.1 (system operations) |
| MITRE ATT&CK | 3/3 | 3 (all info/low) | T1083, T1059, T1499.004 — low exploitability in CLI context |
| MITRE ATLAS | 1/3 | 1 (low) | AML.T0043 via prototype pollution only — theoretical |

---

## Risk Trend

| Cycle | Date | Critical | High | Medium | Low | Info | Total | Assessment |
|:-----:|------|:--------:|:----:|:------:|:---:|:----:|:-----:|------------|
| 1 | 2026-03-29 | 0 | 0 | 0 | 1 | 2 | 3 | PASS |

---

## Assessment Notes

### Architecture Context

This scan covers a **zero-dependency Node.js CLI tool** that:
- Reads local markdown files from `audits/` directory
- Parses them with regex and string operations
- Outputs structured JSON to stdout or a file
- Has no network access, no child_process, no dynamic code evaluation
- Is run by the repository operator (not exposed as a service)

### Why These Findings Are Low/Info Severity

1. **No privilege boundary crossed** — The CLI tool runs with the operator's permissions on local files. Path traversal (CWE-22) is by design for a CLI tool that accepts `--repo` and `--output` flags.

2. **Prototype pollution (CWE-1321) has negligible exploitability** — The markdown files parsed are locally-generated audit reports. An attacker would need write access to the `audits/` directory, at which point they already have more damaging options. Additionally, downstream code only reads hardcoded keys.

3. **ReDoS (CWE-1333) is not exploitable** — The regex patterns use fixed-string alternation without nested quantifiers. Input size is bounded by audit file size.

### Recommendations

- **Optional hardening:** Replace `var row = {}` with `var row = Object.create(null)` in `parseMarkdownTable()` to eliminate the theoretical prototype pollution vector.
- **No other changes required** for the current threat model (operator-run CLI tool reading local files).

---

*This is a security research artifact, not legal advice. Findings should be reviewed by a qualified security professional.*
