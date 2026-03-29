# LLM Compliance and Transparency Report
## LLMComplianceSkill

**Report Date**: 2026-03-29
**Auditor**: LLM Governance and Compliance Team
**Project**: LLMComplianceSkill (Claude-assisted development)
**Framework**: EU AI Act Art. 25, OWASP LLM Top 10 2025, NIST SP 800-218A
**Audit Type**: INITIAL

---

## Executive Summary

| Dimension | Score | Status |
|-----------|-------|--------|
| 1. System Transparency | 88 | GOOD |
| 2. Training Data Disclosure | 72 | GOOD |
| 3. Risk Classification | 82 | GOOD |
| 4. Supply Chain Security | 85 | GOOD |
| 5. Consent and Authorization | 92 | EXCELLENT |
| 6. Sensitive Data Handling | 94 | EXCELLENT |
| 7. Incident Response | 78 | GOOD |
| 8. Bias Assessment | 55 | DEVELOPING |
| **Overall** | **81** | **GOOD** |

**Overall LLM Compliance Score: 81/100 -- GOOD**

The LLMComplianceSkill project demonstrates strong compliance foundations. Its zero-dependency, offline-first architecture eliminates entire risk categories that other AI tools face. The project purpose -- helping teams gather AI compliance evidence -- creates an expectation of exemplary self-compliance, and it largely delivers. The primary gap is Bias Assessment, where no formal FP/FN measurement or multi-framework detection coverage analysis has been published.

---

## Dimension 1: System Transparency -- 88/100

**Score rationale**: GOOD (70-89 band)

**Positive evidence**:

- README explicitly states the project is "Built as a Claude Code skill" and lists Claude Code as the development environment
- CLAUDE.md documents technical conventions and AI-assisted development context
- Commit messages use conventional-commit prefixes with Claude Code co-authoring implied by the toolchain
- SECURITY.md design principles clearly document tool capabilities and limitations
- SKILL.md (rewritten in the most recent commit 4dcdb1c) provides full operational transparency
- The project own Template 01 (System Transparency Document) signals that developers understand and apply transparency principles

**Gaps**:

- No per-file attribution comments indicating which code was AI-generated vs human-written
- README mentions Claude Code as the development platform but does not quantify AI contribution percentage
- No explicit statement of human-vs-AI role split in a user-facing location

**Regulatory mapping**:

- EU AI Act Art. 52 -- Transparency obligations: SUBSTANTIALLY MET
- NIST AI RMF MAP 1.1 -- Context and limitations: MET (SECURITY.md Known Limitations section)
- ISO 27001 A.8.9 -- Configuration management: MET

---

## Dimension 2: Training Data Disclosure -- 72/100

**Score rationale**: GOOD (70-89 band, lower end)

**Positive evidence**:

- Project explicitly references and cites regulatory frameworks: EU AI Act, NIST SP 800-218A, OWASP LLM Top 10 2025, ISO 27001, SOC 2, CWE database
- tools/data/llm-registry.json documents LLM providers with model cards, licenses, training data summaries, and known limitations
- Regulation research files (AI-Regulations-*.md) covering 16 jurisdictions cite specific articles, deadlines, and sources
- LLM registry populates autoFillFields.transparencyDoc.trainingDataSummary fields, showing systematic framework citation

**Gaps**:

- Project itself does not have a published model card or training data disclosure for the AI (Claude) used to develop it
- Framework source versions are not consistently cited with dates in all locations
- No explicit documentation of which Claude model version was used to generate which components

**Regulatory mapping**:

- EU AI Act Art. 53 -- Technical documentation: PARTIALLY MET
- NIST AI RMF MEASURE 2.6 -- Data provenance: PARTIALLY MET

---

## Dimension 3: Risk Classification -- 82/100

**Score rationale**: GOOD

**Positive evidence**:

- Template 17 (Risk Classification) and Template 06 (Impact/Risk Assessment) demonstrate systematic risk classification capabilities
- tools/data/jurisdiction-matrix.json includes risk classification categories aligned with EU AI Act risk tiers
- SAST findings in this audit are correctly classified with CWE references and CVSS scores
- LLM registry includes compliance.systemicRisk flags for high-capability models
- Interactive tools (risk-classification.html, impact-risk-scoring.html) implement structured risk assessment workflows

**Gaps**:

- Project itself has not published a risk self-classification (what risk tier does LLMComplianceSkill fall under the EU AI Act?)
- CWE-20 (SAST-M-002) represents a risk that partially undermines the accuracy promise: silent incomplete output is a compliance risk

**Regulatory mapping**:

- EU AI Act Art. 25 -- Obligations of providers of GPAI models: MET for tool design; PARTIAL for self-classification
- NIST SP 800-53 RA-3 -- Risk Assessment: MET
- OWASP LLM Top 10 2025 LLM09 -- Misinformation: PARTIALLY MET (CWE-20 gap)

---

## Dimension 4: Supply Chain Security -- 85/100

**Score rationale**: GOOD

**Positive evidence**:

- Zero external runtime dependencies -- eliminates npm dependency confusion, typosquatting, transitive compromise
- No node_modules directory; no npm install required
- CI workflow uses GitHub Actions pinned to @v4 version tags
- extract-evidence.js uses execFileSync with explicit argument arrays (supply-chain-aware secure coding)
- SECURITY.md documents the zero-dependency design principle as a supply chain risk mitigation
- Template 23 (Supply Chain Risk) in the toolkit demonstrates systematic supply chain thinking

**Gaps**:

- GitHub Actions pinned to mutable @v4 tags rather than immutable SHA digests (SC-001)
- No formal SBOM generated
- SLSA L1 achieved; L2 requires signed build provenance

**Regulatory mapping**:

- NIST SP 800-218A -- Secure Software Development: SUBSTANTIALLY MET
- SLSA v1.0 -- L1 achieved, L2 partial
- EU AI Act Art. 25 -- Risk management: MET
- ISO 27001 A.15 -- Supplier relationships: EXCELLENT (no external suppliers)

---

## Dimension 5: Consent and Authorization -- 92/100

**Score rationale**: EXCELLENT

**Positive evidence**:

- All tools are explicitly opt-in: users must run scripts manually, nothing runs automatically
- Interactive HTML tools require explicit user actions at each decision point -- full human oversight
- Template autofill skips fields with existing non-placeholder content, respecting prior human decisions
- No destructive operations (no file deletion, no remote API calls, no automatic git commits)
- The --push flag in the orchestration script explicitly prompts for confirmation before pushing
- Users can override or disable any recommendation by editing output templates
- Wizard framework uses sessionStorage (not localStorage) for in-progress state, respecting session boundaries

**Gaps**:

- No explicit undo mechanism for autofill (re-run silently overwrites output/ directory)

**Regulatory mapping**:

- EU AI Act Art. 14 -- Human oversight: EXCELLENT
- NIST AI RMF GOVERN 1.2 -- Human oversight: MET
- SOC 2 CC6.1 -- Access controls: MET

---

## Dimension 6: Sensitive Data Handling -- 94/100

**Score rationale**: EXCELLENT

**Positive evidence**:

- Zero network access -- no data ever leaves the user machine
- No credentials, API keys, or secrets exist in the project
- Interactive tools store only compliance config metadata in browser storage -- no PII
- extract-evidence.js collects only git metadata (commit counts, author counts, commit message patterns) -- no file content
- git-evidence.js explicitly avoids reading file contents; it analyses git log output only
- SECURITY.md explicitly states "No HTTP calls, no external APIs" and "No backend, no authentication surface"
- Template output is written to a local output/ directory under user control

**Gaps**:

- sessionStorage data retention (DAST-I-002) -- low-risk on dedicated workstations, worth documenting for shared environments
- No confirmed .gitignore entry for output/ directory (compliance templates may contain sensitive org/system details)

**Regulatory mapping**:

- GDPR Art. 5 -- Data minimization: EXCELLENT (no data collected beyond local analysis)
- NIST SP 800-53 SC-28 -- Protection of information at rest: MET
- ISO 27001 A.8.11 -- Data masking: N/A (no sensitive data in processing pipeline)
- SOC 2 CC6.7 -- Data classification: MET

---

## Dimension 7: Incident Response -- 78/100

**Score rationale**: GOOD

**Positive evidence**:

- SECURITY.md provides formal vulnerability disclosure policy: 48-hour acknowledgement, 14-day fix SLA
- GitHub private vulnerability reporting is configured per SECURITY.md
- evidence-checker.js surfaces compliance gaps with actionable output
- extract-evidence.js catches extractor failures and records error messages in the evidence object
- CI workflow fails fast on syntax errors (node --check || exit 1)
- Known limitations are explicitly documented in SECURITY.md

**Gaps**:

- CWE-20 (SAST-M-002): malformed config can produce silently incomplete template output
- No automated alerting if compliance deadlines in deadline-data.json are breached
- No CHANGELOG.md to track security fixes over time
- No formal runbook for responding to a compromised autofill output scenario

**Regulatory mapping**:

- NIST SP 800-53 IR-4 -- Incident handling: SUBSTANTIALLY MET
- ISO 27001 A.16 -- Incident management: SUBSTANTIALLY MET
- SOC 2 CC7.3 -- Incident response: MET

---

## Dimension 8: Bias Assessment -- 55/100

**Score rationale**: DEVELOPING (50-69 band)

**Positive evidence**:

- Template 08 (Bias Testing) demonstrates the project team understands bias assessment requirements
- Interactive bias-testing.html tool provides structured methodology for users to document their own bias assessments
- LLM registry includes openSource flags and provenance information for model-selection bias awareness
- Jurisdiction coverage is broad (16 jurisdictions) suggesting awareness of geographic bias in compliance tooling

**Gaps**:

- No published false positive / false negative rate analysis for evidence extraction tools
- git-evidence.js AI attribution detection (scanning commit messages for "claude", "co-authored", "generated") has unknown FP/FN rates
- No formal test suite for extractors against known-good and known-bad git repositories
- Template-filling accuracy (fillTableField regex coverage) has no published test results
- No acknowledgement of extractor accuracy detection gaps in core documentation

**Regulatory mapping**:

- EU AI Act Art. 10 -- Data governance: PARTIALLY MET
- NIST AI RMF MEASURE 2.11 -- Fairness: DEVELOPING
- OWASP LLM Top 10 2025 LLM09 -- Misinformation: PARTIALLY MET

---

## Recommendations

1. **Fix CWE-78 and CWE-20** (MEDIUM SAST findings): refactor git-evidence.js to use argument arrays, and add config schema validation to autofill.js. Both are low-effort and would improve Incident Response and Risk Classification scores.

2. **Publish a bias/accuracy assessment** for the git-evidence extractor AI attribution detection: document the keyword list, known false positive scenarios, and test results. This would raise Bias Assessment from 55 to the 70+ range.

3. **Add per-session disclosure**: when autofill.js runs, emit a brief disclosure header in MANIFEST.md noting that output was partially auto-generated and requires human review.

4. **Publish a self-compliance declaration**: run the project own Template 17 (Risk Classification) against LLMComplianceSkill itself and commit the result.

5. **Add SHA pinning to GitHub Actions**: replace @v4 mutable tags with immutable SHA digests in lint.yml.

---

## Regulatory Roadmap

| Regulation | Current Gap | Target |
|------------|-------------|--------|
| EU AI Act Art. 52 (Transparency) | Missing per-file attribution | Add AI-generated markers to key files |
| EU AI Act Art. 25 (GPAI) | No self-risk-classification | Complete Template 17 for own project |
| NIST AI RMF MEASURE 2.11 | No FP/FN measurement | Publish extractor accuracy analysis |
| SLSA v1.0 L2 | No signed provenance | Add slsa-github-generator to CI |
| CycloneDX 1.4 | No SBOM | Generate minimal SBOM in release workflow |

**Recommended next audit date**: 2026-06-29 (90 days)

---

*Generated by post-commit-audit skill -- 2026-03-29*
