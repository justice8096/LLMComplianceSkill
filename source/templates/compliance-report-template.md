# LLM Compliance Assessment Report Template

Use this template to structure comprehensive AI/LLM regulatory compliance assessment reports. This template mirrors the assessment structure detailed in `skills/ai-compliance.md`.

---

## AI/LLM COMPLIANCE ASSESSMENT

### Provenance Block (required — do not omit)

This block is the linchpin of the addendum-filing workflow under the [Skill Versioning and Addendum Framework](https://github.com/justice8096/SecondBrainData/blob/main/SoftwarePractices/Skill-Versioning-and-Addendum-Framework.md). Every generated compliance assessment must capture skill version, commit hash, source currency, jurisdictions evaluated, and regulation versions so prior outputs can be identified for addendum filings when authorities, evidence, defects, structure, or voice change downstream.

| Field | Value |
|-------|-------|
| **Skill Version** | LLMComplianceSkill v[X.Y.Z] |
| **Commit Hash** | `[git-short-hash]` |
| **Generated** | {{YYYY-MM-DD}} |
| **Sources Current As Of** | {{YYYY-MM}} (except where individual sections note otherwise) |
| **Jurisdictions Evaluated** | {{list, e.g. EU, US-Federal, US-CA, US-CO, US-NY, UK, CA, JP}} |
| **Regulation Versions** | {{EU AI Act (Reg. 2024/1689) phase: prohibitions 2025-02 / GPAI 2025-08 / full 2026-08; GDPR (Reg. 2016/679); NIST AI RMF 1.0 + Generative AI Profile (AI 600-1, 2024-07); ISO/IEC 42001:2023; etc.}} |
| **Changelog** | https://github.com/justice8096/LLMComplianceSkill/blob/main/CHANGELOG.md |

---

## Subject System

| Field | Value |
|-------|-------|
| **Project** | {{PROJECT_NAME}} |
| **System Type** | {{e.g. RAG, fine-tuned LLM, agentic system, embedding service, GPAI deployment, foundation model training}} |
| **Risk Tier (EU AI Act)** | {{Unacceptable / High-Risk Annex III / Limited / Minimal / GPAI / GPAI w/ systemic risk}} |
| **Deployment Geography** | {{user populations: EU, US-Federal, US-State, UK, ...}} |
| **Data Subjects** | {{e.g. employees, consumers, minors, protected classes}} |
| **Assessor** | Claude (automated analysis) |
| **Assessment Date** | {{YYYY-MM-DD}} |
| **Type** | {{Initial assessment / Re-assessment after material change / Pre-deployment / Periodic review}} |

---

## Executive Summary

{{2-3 sentence summary of overall compliance posture. Composite score and most critical gaps.}}

### Findings Summary

| Severity | Count | Description |
|----------|-------|-------------|
| CRITICAL | {{X}} | {{brief summary of critical findings}} |
| HIGH     | {{X}} | {{brief summary of high findings}} |
| MEDIUM   | {{X}} | {{brief summary of medium findings}} |
| LOW      | {{X}} | {{brief summary of low findings}} |
| **Total**| **{{X}}** | |

### Compliance by Jurisdiction

| Jurisdiction | Pass | Fail | N/A | Evidence Coverage |
|-------------|------|------|-----|-------------------|
| EU (AI Act) | {{X}} | {{X}} | {{X}} | {{%}} |
| EU (GDPR) | {{X}} | {{X}} | {{X}} | {{%}} |
| US Federal | {{X}} | {{X}} | {{X}} | {{%}} |
| US State (per state) | {{X}} | {{X}} | {{X}} | {{%}} |
| ISO 42001 | {{X}} | {{X}} | {{X}} | {{%}} |
| NIST AI RMF | {{X}} | {{X}} | {{X}} | {{%}} |

---

## Findings

### CRITICAL Findings

{{Per-finding: ID, citation (specific Article / Section), affected control, evidence gap, recommended remediation, addendum-flag if this changes a prior assessment.}}

### HIGH Findings

{{Same structure.}}

### MEDIUM Findings

{{Same structure.}}

### LOW Findings

{{Same structure.}}

---

## Regulation Crosswalk

Identifies which controls satisfy multiple jurisdictions simultaneously, and where jurisdictional divergence requires separate controls.

| Control Area | EU AI Act | GDPR | NIST AI RMF | ISO 42001 | US State (CA/CO/NY) |
|--------------|-----------|------|-------------|-----------|---------------------|
| Risk Management | Art. 9 | Art. 35 DPIA | GOVERN-1, MAP | 6.1 | varies |
| Transparency | Art. 13, 50, 52 | Art. 12-14 | MANAGE-4 | 8.3 | varies |
| Human Oversight | Art. 14 | — | MEASURE-3 | 8.5 | varies |
| Data Governance | Art. 10 | Art. 5-6, 32 | MAP-3 | 7.5 | varies |
| Bias & Fairness | Art. 10(2)(f), Art. 15 | Art. 22 (ADM) | MEASURE-2.11 | 8.3 | NYC LL 144, IL HB3773 |

---

## Composite Score

| Domain | Score | Weight | Weighted |
|--------|-------|--------|----------|
| Regulatory Coverage | {{X/100}} | 25% | {{X}} |
| Evidence Quality | {{X/100}} | 20% | {{X}} |
| Risk Management | {{X/100}} | 20% | {{X}} |
| Transparency & Documentation | {{X/100}} | 15% | {{X}} |
| Human Oversight | {{X/100}} | 10% | {{X}} |
| Governance & Training | {{X/100}} | 10% | {{X}} |
| **Composite** | | 100% | **{{X}}** |

### Score Interpretation

- **90-100**: Audit-ready
- **75-89**: Substantially compliant; address HIGH findings before audit
- **60-74**: Material gaps; not audit-ready
- **<60**: Significant remediation needed before any pre-audit posture is defensible

---

## Remediation Roadmap

{{Prioritized action items with owner, due date, dependency on regulatory phase-in (e.g. "must close before EU AI Act GPAI obligations effective 2025-08-02"), and addendum impact if a regulation changes between assessment and remediation.}}

---

## What Passed

{{List of controls that demonstrably satisfy requirements with evidence.}}

---

## Addendum Triggers

This assessment must be supplemented with an addendum if any of the following occurs before the next periodic re-assessment:

- EU AI Act delegated act or implementing regulation alters Annex III high-risk categorization for this system type
- GDPR enforcement guidance from EDPB materially changes Art. 22 (automated decision-making) application
- NIST AI RMF 1.0 is superseded (NIST AI RMF 2.0 development underway)
- ISO/IEC 42001 amendment or related ISO/IEC 23894 update
- US state law passes or amends applicable AI / biometric / discrimination statute
- Skill itself changes — see CHANGELOG `[authority]` entries; downstream addendum filings may be needed for prior assessments

---

*Generated by LLMComplianceSkill. See [CHANGELOG](https://github.com/justice8096/LLMComplianceSkill/blob/main/CHANGELOG.md) for the version history and addendum-trigger criteria.*
