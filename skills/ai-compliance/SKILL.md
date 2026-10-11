---
name: ai-compliance
description: AI/LLM regulatory compliance knowledge covering 16+ jurisdictions including EU AI Act, GDPR, US state laws, UK AI governance, and frameworks like NIST AI RMF and ISO 42001
---
# AI Compliance Evidence Collection Skill

Identify applicable AI regulations for a given project, collect compliance evidence
across 16+ jurisdictions, populate 24 evidence templates from a config file, and
produce a compliance package ready for legal review.

---

## Workflow Overview

```
1. Configure   →  Edit compliance-config.json with system, org, and jurisdiction details
2. Assess      →  Open 21 interactive HTML tools to capture human-judgment fields
3. Extract     →  Run extract-evidence.js to pull git/package/CI evidence automatically
4. Autofill    →  Run autofill.js to populate all 24 templates
5. Validate    →  Run evidence-checker.js to identify gaps
6. Hand off    →  Deliver output/ folder to legal or compliance team
```

---

## Knowledge Base

Read the applicable regulation files before answering jurisdiction-specific questions.
Start with the Global Overview for cross-jurisdictional comparisons.

| File | Contents |
|------|----------|
| `AI-Regulations-Global-Overview.md` | Cross-cutting themes, compliance timeline, comparison matrix |
| `AI-Regulations-EU.md` | EU AI Act (2024) as amended by the Digital Omnibus (Reg. 2026/1744), GDPR, Data Act, sectoral rules |
| `AI-Regulations-UK.md` | UK DUA Act, ICO guidance, sector regulators |
| `AI-Regulations-UnitedStates.md` | CO SB 26-189, CA SB 53/AB 2013/SB 243/SB 942, NY RAISE Act, IL HB 3773/SB 315, CT PA 26-15, WA HB 2225, TX TRAIGA, NYC LL 144, federal preemption |
| `AI-Regulations-Canada.md` | AI for All strategy, Bill C-36 (privacy), Bill C-34 (chatbots), Ontario hiring disclosure, Quebec Law 25 |
| `AI-Regulations-China.md` | GenAI Measures, labeling, anthropomorphic AI measures (2026), ethics review, CAC registration |
| `AI-Regulations-Japan-SouthKorea.md` | South Korea AI Basic Act (in force), PIPA, Japan AI Promotion Act, AI Basic Plan, APPI 2026 amendment |
| `AI-Regulations-India-Singapore-ASEAN.md` | India IT Amendment Rules 2026, DPDP Rules, Singapore Model AI Governance (incl. Agentic), Vietnam Law on AI, ASEAN bills |
| `AI-Regulations-Australia.md` | Australian Standards for AI (2027 bill), Privacy Act ADM transparency, eSafety codes, AI6 guidance |
| `AI-Regulations-NewZealand.md` | Privacy Act 2020 incl. IPP 3A, Biometrics Code, Responsible AI guidance |
| `AI-Regulations-Mexico-LatinAmerica.md` | Peru Law 31814 + regulation, Brazil ECA Digital + PL 2338, Mexico sectoral AI rules, Chile rewrite |
| `AI-Regulations-Africa.md` | South Africa POPIA, Nigeria Digital Economy Bill, Kenya AI Bill 2026, AU framework |
| `AI-Regulations-World-Map.html` | Interactive D3.js global regulatory status visualization |

When multiple jurisdictions apply, prioritize by enforcement risk and earliest deadline.

---

## Evidence Collection Pipeline

### Step 1 — Configure

Create `tools/compliance-config.json` from the provided example:

```bash
cp tools/compliance-config.example.json tools/compliance-config.json
```

Populate the following sections:

| Section | Fields |
|---------|--------|
| `system` | AI system name, version, model type, foundation model, input/output types |
| `organization` | Company name, document owner, session reference |
| `project` | Target jurisdictions, risk level, sector |
| `dates` | Key compliance milestone dates |

### Step 2 — Interactive Assessment

Open each relevant HTML tool in any browser. Load the config file, complete the
human-judgment fields, and save results back. Each tool writes results to
`config.interactiveToolResults.<toolName>`.

| Tool | Template | Assessment Type |
|------|----------|-----------------|
| `risk-classification.html` | 17 | EU AI Act risk tier (prohibited / high / limited / minimal) |
| `pia-assessment.html` | 07 | Privacy Impact Assessment |
| `bias-testing.html` | 08 | Bias and fairness testing methodology |
| `human-oversight.html` | 09 | Oversight model and override mechanisms |
| `consent-design.html` | 10 | Legal basis selection and consent mechanism design |
| `consent-records-audit.html` | 10 | Consent records lifecycle audit |
| `dsr-rights-implementation.html` | 11 | Data subject rights implementation |
| `transparency-documentation.html` | 01 | System transparency documentation |
| `disclosure-toolkit.html` | 02 | User-facing disclosure design |
| `content-labeling.html` | 03 | AI content labeling specification |
| `automated-decision-logic.html` | 04 | Automated decision logic documentation |
| `training-data-disclosure.html` | 05 | Training data provenance |
| `impact-risk-scoring.html` | 06 | Fundamental rights impact and risk matrix |
| `governance-framework.html` | 12 | AI governance structure |
| `incident-management.html` | 13 | Incident response plan |
| `security-assessment.html` | 15 | Threat model and security controls |
| `content-moderation.html` | 16 | Content moderation policy |
| `conformity-assessment.html` | 19 | EU AI Act conformity assessment |
| `ai-literacy-training.html` | 18 | AI literacy training records |
| `supply-chain-risk.html` | 23 | Supply chain risk assessment |
| `llm-selector.html` | — | Select and document the foundation model used |

### Step 3 — Automated Extraction

Run `tools/extract-evidence.js` to pull evidence directly from the repository:

```bash
node tools/extract-evidence.js --repo /path/to/target-repo --config tools/compliance-config.json
```

The extractor analyzes three sources and merges findings into the config:

| Extractor | Evidence Gathered |
|-----------|-------------------|
| `extractors/git-evidence.js` | Commit history, human vs. AI attribution, signing practices, branch protection |
| `extractors/package-evidence.js` | npm / pip / cargo / go / maven / gradle dependency inventory and license breakdown |
| `extractors/ci-evidence.js` | GitHub Actions / GitLab CI / Azure DevOps pipeline security posture |

All extractors are zero-dependency Node.js using `execFileSync` with argument arrays (no shell injection surface).

### Step 4 — Autofill Templates

Populate all 24 evidence templates from config data and interactive tool results:

```bash
node tools/autofill.js --config tools/compliance-config.json --output output/
```

Writes to `output/`:
- 24 filled Markdown templates
- `MANIFEST.md` — index of all templates with section completeness
- `compliance-config-snapshot.json` — config state at generation time

### Step 5 — Validate

Check all templates for completeness and compliance gaps:

```bash
# Full validation
node tools/evidence-checker.js --config tools/compliance-config.json --output output/

# Single template
node tools/evidence-checker.js --config tools/compliance-config.json --output output/ --template 07

# Machine-readable output
node tools/evidence-checker.js --config tools/compliance-config.json --output output/ --json

# Verbose mode (shows all fields including passing)
node tools/evidence-checker.js --config tools/compliance-config.json --output output/ --verbose
```

The checker produces `output/evidence-check-report.txt` with gap analysis organized by template.

### Step 6 — Hand Off

Deliver the `output/` folder to the legal or compliance team. Contents:
- 24 filled evidence templates
- `MANIFEST.md`
- `compliance-config-snapshot.json`
- `evidence-check-report.txt`

---

## Evidence Templates

| # | Template | Primary Regulations |
|---|----------|---------------------|
| 01 | System Transparency Document | EU AI Act Arts. 11-14, Colorado SB 26-189, UK DUA Act |
| 02 | User-Facing Disclosure Toolkit | EU AI Act Art. 50, Colorado, California, China |
| 03 | Content Labeling Spec | EU AI Act, China Content Labeling, CA SB 942 |
| 04 | Automated Decision Logic | EU, UK, Colorado, Australia |
| 05 | Training Data Disclosure | EU GPAI, CA AB 2013, UK, Australia |
| 06 | Impact/Risk Assessment | EU AI Act Art. 9, Colorado, South Korea |
| 07 | Privacy Impact Assessment | 20+ laws across 17 jurisdictions |
| 08 | Bias Testing | EU, UK, Colorado, NYC LL 144, California, Australia |
| 09 | Human Oversight Design | EU AI Act Art. 14, UK DUA Act, Australia |
| 10 | Consent Records | GDPR, UK GDPR, Australia, South Korea PIPA |
| 11 | Data Subject Rights | 14+ data protection laws globally |
| 12 | Governance Framework | EU, UK, Australia, Singapore, South Korea |
| 13 | Incident Management | EU, China, CA SB 53, South Korea |
| 14 | Registration/Filing Tracker | EU, China CAC, Peru, South Korea |
| 15 | Security Assessment | EU AI Act Art. 15, China GenAI specs, UK |
| 16 | Content Moderation | China, India |
| 17 | Risk Classification | EU Annex III, Colorado, South Korea, Brazil, Peru |
| 18 | AI Literacy Training Record | EU Art. 4 (enforceable Feb 2025) |
| 19 | Conformity Assessment | EU AI Act Arts. 9-15 |
| 20 | Sector-Specific Matrix | Finance, healthcare, employment, education |
| 21 | Jurisdiction Selector | Country selection → required template list |
| 22 | Compliance Deadline Tracker | All deadlines through 2027+ |
| 23 | Supply Chain Risk | Foundation model provenance, vendor assessments |

---

## Supporting Data

| File | Contents |
|------|----------|
| `tools/data/jurisdiction-matrix.json` | Which templates each jurisdiction requires |
| `tools/data/deadline-data.json` | 21 compliance deadlines with exact dates |
| `tools/data/llm-registry.json` | Index for 66-model LLM registry (chunked across 6 files) |
| `tools/data/llm-registry-*.json` | Per-provider model registry chunks (Meta, Mistral, Google/Microsoft, China, API-only, other open) |

---

## Response Guidelines

- Lead with the most actionable compliance requirement for the user's jurisdiction.
- Distinguish between enacted/binding law and voluntary/proposed frameworks.
- Always note key compliance deadlines with exact dates.
- When multiple jurisdictions apply, prioritize by enforcement risk.
- Cite specific laws, articles, and provisions — do not generalize.
- Include a disclaimer that this is research output, not legal advice.
- If a regulation's status may have changed since October 2026, note that caveat.
- Use the four-tier classification consistently: **Enacted** / **Active Sector** / **Proposed** / **Voluntary**.

---

## Jurisdiction Coverage

> *Sources current as of 2026-10-11. Authority-version pins: EU AI Act (Regulation (EU) 2024/1689, in force 2024-08-01, as amended by the Digital Omnibus on AI, Regulation (EU) 2026/1744, in force 2026-07-27; prohibitions + AI Literacy Art. 4 effective 2025-02-02; GPAI obligations 2025-08-02; Art. 50 transparency and penalties 2026-08-02; Annex III high-risk 2027-12-02; Annex I 2028-08-02); GDPR (Regulation (EU) 2016/679); NIST AI Risk Management Framework 1.0 (2023-01) + Generative AI Profile NIST AI 600-1 (2024-07); ISO/IEC 42001:2023 + 42005:2025 + 42006:2025 + ISO/IEC 23894:2023; EEOC AI guidance (2023-05); CO SB 26-189 (signed 2026-05-14, effective 2027-01-01, replaces SB 24-205); NY RAISE Act (effective 2027-01-01); IL HB 3773 (2026-01-01) + SB 315 (2027-01-01); CT Public Act 26-15 (phased from 2026-10-01); WA HB 2225 (2027-01-01); TX TRAIGA HB 149 (2026-01-01); NYC Local Law 144 (2023-07); CA SB 53 + AB 2013 + SB 243 (2026-01-01), SB 942 (2026-08-02), CCPA ADMT regulations (2027-01-01); KR AI Basic Act (2026-01-22); VN Law on AI 134/2025/QH15 (2026-03-01); IN IT Amendment Rules 2026 (2026-02-20); UK DUA Act (2026-02); AU Privacy Act ADM provisions (2026-12-10). Verify status before using in any binding legal context.*

| Tier | Jurisdictions |
|------|----------------|
| **Enacted** | EU (27 + EEA), South Korea, Peru, Vietnam |
| **Active Sector** | China, United Kingdom, United States (CA, NY, IL, CT, WA, TX, CO, NYC, UT), Brazil, Mexico, India, Australia |
| **Proposed** | Canada, Japan, Nigeria, Kenya, Colombia, Chile, Thailand, Malaysia, Indonesia, Philippines |
| **Voluntary** | New Zealand, Singapore, Egypt, South Africa |

---

## Key Deadlines

| Date | Event |
|------|-------|
| Feb 2, 2025 | EU AI Act — Prohibited practices + AI Literacy (Art. 4) enforceable |
| Aug 2, 2025 | EU AI Act — GPAI model obligations enforceable |
| Jan 2026 | US-CA — SB 53 (safety) + AB 2013 (training data) effective |
| Feb 2026 | UK — DUA Act automated decision-making reforms |
| Jan 22, 2026 | KR — AI Basic Act in force (fines deferred to about Jan 2027) |
| Feb 20, 2026 | IN — IT Amendment Rules 2026 (synthetic content labelling) |
| Mar 1, 2026 | VN — Law on AI in force |
| Jul 27, 2026 | EU — Digital Omnibus on AI in force (high-risk dates moved) |
| Aug 2, 2026 | EU AI Act — Art. 50 transparency, penalties, AI Office GPAI enforcement |
| Dec 2, 2026 | EU AI Act — machine-readable marking grace period ends |
| Dec 10, 2026 | AU — Privacy Act automated decision-making obligations |
| Jan 1, 2027 | US — CO SB 26-189, NY RAISE Act, IL SB 315, WA HB 2225, CA CCPA ADMT and SB 947 |
| May 13, 2027 | IN — DPDP Rules core obligations |
| Dec 2, 2027 | EU AI Act — Annex III high-risk applicability |
| Aug 2, 2028 | EU AI Act — Annex I embedded high-risk applicability |

---

## Authoritative Sources

- EU AI Act full text: https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32024R1689
- GDPR: https://gdpr-info.eu/
- NIST AI RMF: https://www.nist.gov/system/files/documents/2023/01/26/AI%20RMF%201.0.pdf
- ISO/IEC 42001: https://www.iso.org/standard/81230.html
- MITRE ATLAS: https://atlas.mitre.org/

---

**Knowledge base last updated**: March 2026. Regulations change frequently — verify status
of proposed frameworks before relying on them for compliance decisions.
