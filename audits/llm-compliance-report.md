# LLM Compliance & Transparency Report
## LLMComplianceSkill

**Report Date:** 2026-03-29
**Auditor:** LLM Governance & Compliance Team
**Project:** LLMComplianceSkill — evidence-collection-pipeline branch (Claude-assisted development)
**Framework:** EU AI Act Art. 25, OWASP LLM Top 10 2025, NIST SP 800-218A
**Audit Type:** INITIAL

---

## Executive Summary

**Overall LLM Compliance Score: 74/100 — GOOD**

This is the first compliance audit of the LLMComplianceSkill project. The project is an AI compliance evidence collection toolkit that helps developers gather regulatory evidence when building AI-powered applications. The latest commit (406d908) added a SAST/DAST scan evidence extractor and T24 template.

The project scores well on transparency, risk classification, and consent/authorization dimensions due to its nature as a compliance tool with extensive documentation. Primary gaps are in supply chain provenance (no CI/CD, no SBOM) and bias assessment (no formal FP/FN measurement for the new extractor).

| Dimension | Score | Status |
|-----------|------:|-------|
| 1. System Transparency | 82/100 | GOOD |
| 2. Training Data Disclosure | 70/100 | GOOD |
| 3. Risk Classification | 88/100 | GOOD |
| 4. Supply Chain Security | 42/100 | NEEDS IMPROVEMENT |
| 5. Consent & Authorization | 95/100 | EXCELLENT |
| 6. Sensitive Data Handling | 78/100 | GOOD |
| 7. Incident Response | 80/100 | GOOD |
| 8. Bias Assessment | 55/100 | DEVELOPING |
| **Overall** | **74/100** | **GOOD** |

---

## Dimension 1: System Transparency — 82/100 (GOOD)

**Evidence:**
- `CLAUDE.md` explicitly documents that Claude Code is used for development, with Co-Authored-By headers in commits
- All commits from 406d908 include `Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>`
- `tools/extractors/sast-dast-evidence.js` file header documents its purpose, author, and what it serves
- Template and extractor files include metadata headers (laws served, template version, last updated)
- `tools/data/llm-registry.json` tracks 66 LLM models with provenance metadata

**Gaps:**
- No per-file attribution indicating which specific functions were AI-generated vs. human-written
- README does not include a top-level AI disclosure statement
- The interactive HTML tools lack `<meta>` tags or comments attributing AI involvement

**Regulatory mapping:** EU AI Act Art. 52, NIST AI RMF MAP 1.1, ISO 27001 A.8.9

---

## Dimension 2: Training Data Disclosure — 70/100 (GOOD)

**Evidence:**
- `sast-dast-evidence.js` documents the knowledge sources it validates against (OWASP Top 10 2021, OWASP LLM Top 10 2025, CWE Top 25 2023, NIST SP 800-53, EU AI Act, MITRE ATT&CK/ATLAS, ISO 27001, SOC 2) directly in the `KNOWN_TEST_SUITES` constant
- `CLAUDE.md` references specific laws and frameworks (MITRE ATLAS, OWASP LLM03, NIST SP 800-218A, EU AI Act Art. 25)
- Template files include `Laws served` metadata headers citing specific articles
- LLM registry entries include `license` and `countryOfOrigin` fields for model provenance

**Gaps:**
- No explicit documentation of which Claude model version produced which code artifacts
- Model version used during development (Claude Opus 4.6) is captured in commit Co-Authored-By but not in a dedicated disclosure file
- Framework versions (e.g., "OWASP Top 10 2021" vs "2024") are cited but not with specific publication URLs or checksums

**Regulatory mapping:** EU AI Act Art. 53, NIST AI RMF MEASURE 2.6

---

## Dimension 3: Risk Classification — 88/100 (GOOD)

**Evidence:**
- SAST/DAST scan found 7 findings; all have accurate CWE IDs (CWE-22, CWE-200, CWE-1333, CWE-20)
- CWE mapping cross-references all findings to 8 compliance frameworks
- Severity classifications align with industry standards — path traversal correctly rated MEDIUM for a CLI tool, not HIGH
- False positive rate is low: INFO findings explicitly note "not a vulnerability"
- The new `sast-dast-evidence.js` extractor itself performs test suite validation — the project eats its own cooking
- Accepted residual risks are documented with rationale (single-user CLI, no network exposure)

**Gaps:**
- No CVSS scores assigned to findings (CWE severity used instead)
- No formal false positive rate measurement

**Regulatory mapping:** EU AI Act Art. 25, NIST SP 800-53 RA-3, OWASP LLM Top 10 2025 LLM09

---

## Dimension 4: Supply Chain Security — 42/100 (NEEDS IMPROVEMENT)

**Evidence:**
- Zero external dependencies eliminates transitive vulnerability risk
- `sast-dast-evidence.js` uses the most restrictive module profile (fs + path only)
- `.gitignore` excludes `.env` and `.claude/`
- CLAUDE.md documents `execFileSync` with argument arrays (not string interpolation)

**Gaps:**
- No CI/CD pipeline — SLSA L0
- No SBOM (required for EU AI Act Art. 25)
- No verified commit signing
- No automated security scanning of the project itself
- No lockfile or explicit package manifest documenting zero-dep stance
- Pre-commit hooks documented but not framework-managed

**Regulatory mapping:** NIST SP 800-218A, SLSA v1.0, EU AI Act Art. 25, ISO 27001 A.15

---

## Dimension 5: Consent & Authorization — 95/100 (EXCELLENT)

**Evidence:**
- All extractors are CLI tools that require explicit invocation with `node extractor.js --repo <path>`
- No automatic execution, no background processes, no scheduled tasks
- `extract-evidence.js` runner does not push or commit — it only writes JSON to config
- `autofill.js` generates output to `output/` directory, never overwrites the original templates
- Push confirmation is documented as a manual step in CLAUDE.md conventions
- User retains full control over which output files to use

**Gaps:**
- `autofill.js` does overwrite files in `output/` without prompting; a `--dry-run` flag would be ideal

**Regulatory mapping:** EU AI Act Art. 14, NIST AI RMF GOVERN 1.2, SOC 2 CC6.1

---

## Dimension 6: Sensitive Data Handling — 78/100 (GOOD)

**Evidence:**
- SAST scan confirmed: no hardcoded secrets, API keys, or credentials in any file
- `.gitignore` correctly excludes `.env` and `.claude/`
- Extractors write to local files only, no network transmission of scan results
- `sast-dast-evidence.js` reads audit files from a local path — no remote calls

**Gaps:**
- `_meta.repoPath` in extractor JSON output contains absolute filesystem path (CWE-200, LOW severity, accepted)
- If compliance-config.json contains sensitive system names, it could inadvertently capture sensitive project details
- No documented data retention policy for generated evidence files

**Regulatory mapping:** GDPR Art. 5, NIST SP 800-53 SC-28, ISO 27001 A.8.11, SOC 2 CC6.7

---

## Dimension 7: Incident Response — 80/100 (GOOD)

**Evidence:**
- All extractors output progress to stderr and results to stdout — clean separation
- Errors surface via `process.stderr.write` with tool prefixes (e.g., `[sast-dast-evidence] Error: ...`)
- Non-zero exit codes on invalid repo paths
- SAST findings include explicit remediation guidance
- Accepted risks are documented with rationale in the scan report
- The post-commit-audit workflow itself defines a fix-then-reaudit loop
- CWE mapping includes historical tracking (Prior Cycle vs. This Cycle) for regression detection

**Gaps:**
- No automated alerting on new HIGH/CRITICAL findings
- `autofill.js` does not surface warnings when required fields are missing from templates
- No structured exit codes distinguishing parse errors from security findings

**Regulatory mapping:** NIST SP 800-53 IR-4, ISO 27001 A.16, SOC 2 CC7.3

---

## Dimension 8: Bias Assessment — 55/100 (DEVELOPING)

**Evidence:**
- `sast-dast-evidence.js` validates against 9 known test suites and reports gaps explicitly — gap-aware by design
- The `KNOWN_TEST_SUITES` constant documents known detection limits (e.g., CWE Top 25 has 25 entries; only 3 were found in the test project)
- OWASP LLM Top 10 coverage gaps are explicitly listed in `testSuiteValidation.suites` output
- The extractor is language-agnostic (parses markdown, not code) — no language bias

**Gaps:**
- No measured false positive or false negative rate for the LLM-driven SAST scanner
- No documentation of which vulnerability classes the LLM-driven scanner systematically misses
- Coverage is dependent on the quality of cwe-mapping.md — if the upstream audit missed findings, the extractor will too
- No multi-language validation that detection is equitable across Python, Go, Java, etc.

**Regulatory mapping:** EU AI Act Art. 10, NIST AI RMF MEASURE 2.11, OWASP LLM Top 10 2025 LLM09

---

## Recommendations

| Priority | Action | Dimension | Impact |
|----------|--------|-----------|--------|
| P1 | Add GitHub Actions CI with ShellCheck and Node.js linting | Supply Chain | +20 pts D4, enables SLSA L1 |
| P1 | Generate minimal CycloneDX SBOM documenting Node.js runtime | Supply Chain | +10 pts D4, EU AI Act Art. 25 |
| P2 | Add top-level AI disclosure to README | Transparency | +5 pts D1 |
| P2 | Document false positive/negative rates for LLM-driven scanner | Bias | +15 pts D8 |
| P3 | Enable GPG commit signing | Supply Chain | +5 pts D4 |
| P3 | Add `--dry-run` flag to autofill.js | Consent | +3 pts D5 |

---

## Regulatory Roadmap

**For EU AI Act Art. 25 full compliance:** Address supply chain gap (SBOM + CI/CD). The compliance toolkit itself must demonstrate the controls it helps others document.

**For NIST SP 800-218A:** Add automated security scanning of this project in CI (PS.3, PW.4).

**Next audit recommended:** After CI/CD pipeline is added (target: next major merge to main).

---

*This report is generated as part of the post-commit-audit workflow. It is compliance evidence, not legal advice.*
