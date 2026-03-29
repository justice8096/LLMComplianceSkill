---
name: ai-compliance
description: >
  This skill should be used when the user asks about "AI compliance", "EU AI Act",
  "AI regulations", "compliance evidence", "GDPR for AI", "risk classification",
  "AI disclosure requirements", "privacy impact assessment", "bias testing",
  "human oversight", "consent records", "incident management", "governance framework",
  "training data disclosure", "GPAI obligations", "Colorado AI Act", "China GenAI",
  or mentions building an AI/LLM application that needs to comply with regulations
  in specific countries or jurisdictions. Also trigger when the user says "generate
  compliance templates", "check compliance", "run evidence checker", "fill compliance
  config", "what regulations apply to my AI app", or asks about compliance deadlines.
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
| `AI-Regulations-EU.md` | EU AI Act (2024), GDPR, sectoral rules |
| `AI-Regulations-UK.md` | UK DUA Act, ICO guidance, sector regulators |
| `AI-Regulations-UnitedStates.md` | CO SB 24-205, CA SB 53/AB 2013, NYC LL 144, IL AEDT, TX HB 1709, UT SB 149, federal guidance |
| `AI-Regulations-Canada.md` | AIDA (Bill C-27), CPPA, province-level rules |
| `AI-Regulations-China.md` | GenAI Measures, Algorithm Recommendation Regulations, Deep Synthesis Rules, CAC registration |
| `AI-Regulations-Japan-SouthKorea.md` | South Korea AI Act, PIPA amendments, Japan AI governance guidelines |
| `AI-Regulations-India-Singapore-ASEAN.md` | DPDP Act, Singapore Model AI Governance, ASEAN AI Governance Framework |
| `AI-Regulations-Australia.md` | Privacy Act amendments, AI Ethics Principles, sector-specific rules |
| `AI-Regulations-NewZealand.md` | Algorithm Charter, Privacy Act 2020, proposed AI guidance |
| `AI-Regulations-Mexico-LatinAmerica.md` | Peru D.U. 007-2022, Brazil LGPD + PL 2338, Mexico proposed AI bill |
| `AI-Regulations-Africa.md` | South Africa POPIA, Nigeria proposed AI policy, AU framework |
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
| 01 | System Transparency Document | EU AI Act Arts. 11-14, Colorado SB 24-205, UK DUA Act |
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
- If a regulation's status may have changed since March 2026, note that caveat.
- Use the four-tier classification consistently: **Enacted** / **Active Sector** / **Proposed** / **Voluntary**.

---

## Jurisdiction Coverage

| Tier | Jurisdictions |
|------|---------------|
| **Enacted** | EU (27 + EEA), South Korea, Peru, Vietnam, Brazil |
| **Active Sector** | China, United Kingdom, United States (CO, CA, NYC, IL, TX, UT) |
| **Proposed** | Canada, India, Japan, Nigeria, Mexico, Colombia, Chile |
| **Voluntary** | Australia, New Zealand, Singapore |

---

## Key Deadlines

| Date | Event |
|------|-------|
| Feb 2, 2025 | EU AI Act — Prohibited practices + AI Literacy (Art. 4) enforceable |
| Aug 2, 2025 | EU AI Act — GPAI model obligations enforceable |
| Jan 2026 | US-CA — SB 53 (safety) + AB 2013 (training data) effective |
| Feb 2026 | UK — DUA Act automated decision-making reforms |
| Jun 2026 | US-CO — Colorado AI Act (SB 24-205) effective |
| Aug 2, 2026 | EU AI Act — Full applicability (high-risk AI systems) |
| Dec 2026 | AU — Privacy Act automated decision-making obligations |

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
