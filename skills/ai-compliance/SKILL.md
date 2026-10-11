---
name: ai-compliance
description: Use when someone asks which AI laws apply to an AI or LLM product, whether it is high-risk or prohibited, what disclosures, labels, registrations or deadlines a jurisdiction requires, or how two jurisdictions compare. Covers 25 jurisdictions with data current as of 2026-10-11, including the EU AI Act as amended by the Digital Omnibus, GDPR, US state laws (CA, NY, IL, CT, WA, CO, TX), the UK, Korea AI Basic Act, Vietnam, India, China and more, plus NIST AI RMF and ISO 42001. Research output, not legal advice.
---
# AI Compliance Evidence Collection Skill

> **Data current as of 11 Oct 2026.** Regulation files, deadlines and jurisdiction matrix were
> synced from ai-regulatory-knowledge-base v1.2.0. Verify any deadline after that date.

Identify applicable AI regulations for a given project, collect compliance evidence
across 25 jurisdictions, populate 24 evidence templates from a config file, and
produce a compliance package ready for legal review.

**Where each part runs.** Jurisdiction lookup, risk classification, disclosure and deadline
guidance work anywhere this skill loads, including claude.ai and Cowork: the regulation corpus
and data files ship inside this skill under `references/`. The interactive HTML tools are static
pages that open in any browser from a local checkout, no Node needed. Only the three scripts
(`extract-evidence.js`, `autofill.js`, `evidence-checker.js`) need Node.js, so run those from
Claude Code or a terminal.

**Paths.** In the commands below, `tools/` is the `tools/` folder at the plugin root: two folders
above this SKILL.md in an installed plugin, or the repo root in a checkout. Run the scripts with
that full path from the user's project, and keep the user's `compliance-config.json` and
`output/` folder in their project, not inside the plugin folder.

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
Each file ends with an "Executive Instruments to Watch" table (issuer, publication source,
mandate end); the Global Overview carries the consolidated political-sunset table. Executive
instruments survive a change of leader until revoked, so treat a mandate-end date as a
re-verification trigger, not an expiry.
Start with the Global Overview for cross-jurisdictional comparisons. The files live in
`references/regulations/` next to this SKILL.md (mirrored to the repo root for the site and
older tooling; `npm run sync:kb` keeps both copies identical to ai-regulatory-knowledge-base).

| File | Contents |
|------|----------|
| `references/regulations/AI-Regulations-Global-Overview.md` | Cross-cutting themes, compliance timeline, comparison matrix |
| `references/regulations/AI-Regulations-EU.md` | EU AI Act (2024) as amended by the Digital Omnibus (Reg. 2026/1744), GDPR, Data Act, sectoral rules |
| `references/regulations/AI-Regulations-UK.md` | UK DUA Act, ICO guidance, sector regulators |
| `references/regulations/AI-Regulations-UnitedStates.md` | CO SB 26-189, CA SB 53/AB 2013/SB 243/SB 942, NY RAISE Act, IL HB 3773/SB 315, CT PA 26-15, WA HB 2225, TX TRAIGA, NYC LL 144, federal preemption |
| `references/regulations/AI-Regulations-Canada.md` | AI for All strategy, Bill C-36 (privacy), Bill C-34 (chatbots), Ontario hiring disclosure, Quebec Law 25 |
| `references/regulations/AI-Regulations-China.md` | GenAI Measures, labeling, anthropomorphic AI measures (2026), ethics review, CAC registration |
| `references/regulations/AI-Regulations-Japan-SouthKorea.md` | South Korea AI Basic Act (in force), PIPA, Japan AI Promotion Act, AI Basic Plan, APPI 2026 amendment |
| `references/regulations/AI-Regulations-India-Singapore-ASEAN.md` | India IT Amendment Rules 2026, DPDP Rules, Singapore Model AI Governance (incl. Agentic), Vietnam Law on AI, ASEAN bills |
| `references/regulations/AI-Regulations-Australia.md` | Australian Standards for AI (2027 bill), Privacy Act ADM transparency, eSafety codes, AI6 guidance |
| `references/regulations/AI-Regulations-NewZealand.md` | Privacy Act 2020 incl. IPP 3A, Biometrics Code, Responsible AI guidance |
| `references/regulations/AI-Regulations-Mexico-LatinAmerica.md` | Peru Law 31814 + regulation, Brazil ECA Digital + PL 2338, Mexico sectoral AI rules, Chile rewrite |
| `references/regulations/AI-Regulations-Africa.md` | South Africa POPIA, Nigeria Digital Economy Bill, Kenya AI Bill 2026, AU framework |
| `references/regulations/AI-Regulations-World-Map.html` | Interactive D3.js global regulatory status visualization |

When multiple jurisdictions apply, prioritize by enforcement risk and earliest deadline.

---

## Evidence Collection Pipeline

### Step 1 — Configure

Create `compliance-config.json` in the user's project from the example that ships with the plugin:

```bash
cp <plugin root>/tools/compliance-config.example.json ./compliance-config.json
```

Then pass `--config ./compliance-config.json` to every script below.

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

The extractor runs four extractors and merges their findings into the config (the previous config is kept as `compliance-config.json.bak`):

| Extractor | Evidence Gathered |
|-----------|-------------------|
| `extractors/git-evidence.js` | Commit history, human vs. AI attribution, signing practices, branch protection |
| `extractors/package-evidence.js` | npm / pip / cargo / go / maven / gradle dependency inventory and license breakdown |
| `extractors/ci-evidence.js` | GitHub Actions / GitLab CI / Azure DevOps pipeline security posture |
| `extractors/sast-dast-evidence.js` | Findings from an existing SAST/DAST scan report (feeds template 24) |

All extractors are zero-dependency Node.js using `execFileSync` with argument arrays (no shell injection surface).

### Step 4 — Autofill Templates

Populate all 24 evidence templates from config data and interactive tool results:

```bash
node tools/autofill.js --config tools/compliance-config.json --output output/

# Only some templates, or another language
node tools/autofill.js --config tools/compliance-config.json --output output/ --template 07,08
node tools/autofill.js --config tools/compliance-config.json --output output/ --locale es
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

# Strict mode (also fail on HIGH findings or any template below 100% complete)
node tools/evidence-checker.js --config tools/compliance-config.json --output output/ --strict
```

The checker produces `output/evidence-check-report.txt` with gap analysis organized by template.

**Exit codes:** 0 when there are no critical gaps; 1 when there are critical gaps, when `--strict`
finds a HIGH finding or an incomplete template, or when the config or output folder cannot be read.

**`--json` shape** (`schemaVersion` 1): `schemaVersion`, `tool` (`"evidence-checker"`), `date`,
`organization`, `system`, `templates` (keyed by template number, each with `name`, `exists`,
`completeness` 0-100 and `deepCheck.findings[]` of `{severity, section, message}`),
`crossReferences`, and `summary` (`templates`, `critical`, `high`, `medium`).

### Step 6 — Hand Off

Deliver the `output/` folder to the legal or compliance team. Contents:
- 24 filled evidence templates
- `MANIFEST.md`
- `compliance-config-snapshot.json`
- `evidence-check-report.txt`

---

## Evidence Templates

Each template below collects one kind of evidence. The last column lists the main laws that ask for it.

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
| 24 | SAST/DAST Scan Evidence | EU AI Act Art. 15, NIST SSDF, OWASP |

---

## Supporting Data

Read these data files for jurisdiction and deadline lookups instead of relying on memory.

| File | Contents |
|------|----------|
| `references/data/jurisdiction-matrix.json` (copy of `tools/data/`) | Which templates each of the 25 jurisdictions requires |
| `references/data/deadline-data.json` (copy of `tools/data/`) | 50 compliance deadlines with exact dates (2023-2028) |
| `tools/data/llm-registry.json` | Index for the 64-model LLM registry (chunked across 6 files) |
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

> **Sources current as of 11 Oct 2026.** Verify status before using in any binding legal context.

| Authority | Version | Key dates |
|-----------|---------|-----------|
| EU AI Act | Regulation (EU) 2024/1689, amended by Regulation (EU) 2026/1744 (Digital Omnibus, in force 27 Jul 2026) | Prohibitions and AI literacy 2 Feb 2025; GPAI 2 Aug 2025; Art. 50 transparency and penalties 2 Aug 2026; Annex III high-risk 2 Dec 2027; Annex I 2 Aug 2028 |
| GDPR | Regulation (EU) 2016/679 | In force |
| NIST AI RMF | 1.0 (2023-01) plus Generative AI Profile AI 600-1 (2024-07) | Voluntary |
| ISO/IEC | 42001:2023, 42005:2025, 42006:2025, 23894:2023 | Voluntary |
| EEOC AI guidance | 2023-05 | Guidance |
| Colorado | SB 26-189 (signed 14 May 2026; replaces SB 24-205) | Effective 1 Jan 2027 |
| US executive branch | EO 14409 "Promoting Advanced AI Innovation and Security" (2 Jun 2026) | Federal cyber directives; voluntary 30-day pre-release review for covered frontier models; nothing binding on private companies |
| US executive branch | Executive order "Inaugurating the Era of Super Intelligence" (29 Sep 2026) | Terminology: agencies use "SI" for "AI"; defined by reference to 15 U.S.C. 9401(3); no statute or regulation changed; legislative language due about 28 Nov 2026 |
| New York | RAISE Act | Effective 1 Jan 2027 |
| Illinois | HB 3773; SB 315 | 1 Jan 2026; 1 Jan 2027 |
| Connecticut | Public Act 26-15 | Phased from 1 Oct 2026 |
| Washington | HB 2225 | Effective 1 Jan 2027 |
| Texas | TRAIGA (HB 149) | Effective 1 Jan 2026 |
| New York City | Local Law 144 | Effective 2023-07 |
| California | SB 53, AB 2013, SB 243; SB 942; CCPA ADMT regulations | 1 Jan 2026; 2 Aug 2026; 1 Jan 2027 |
| South Korea | AI Basic Act | In force 22 Jan 2026 |
| Vietnam | Law on AI 134/2025/QH15 | In force 1 Mar 2026 |
| India | IT Amendment Rules 2026 | In force 20 Feb 2026 |
| United Kingdom | Data (Use and Access) Act 2025 | ADM reforms 5 Feb 2026 |
| Australia | Privacy Act ADM transparency | Commences 10 Dec 2026 |

Jurisdictions are grouped by how far their AI rules have got, from enacted law to voluntary guidance.

| Tier | Jurisdictions |
|------|----------------|
| **Enacted** | EU (27 + EEA), South Korea, Peru, Vietnam |
| **Active Sector** | China, United Kingdom, United States (CA, NY, IL, CT, WA, TX, CO, NYC, UT), Brazil, Mexico, India, Australia |
| **Proposed** | Canada, Japan, Nigeria, Kenya, Colombia, Chile, Thailand, Malaysia, Indonesia, Philippines |
| **Voluntary** | New Zealand, Singapore, Egypt, South Africa |

---

## Key Deadlines

Dates are listed earliest first.

| Date | Event |
|------|-------|
| 2 Feb 2025 | EU AI Act — Prohibited practices + AI Literacy (Art. 4) enforceable |
| 2 Aug 2025 | EU AI Act — GPAI model obligations enforceable |
| 1 Jan 2026 | US-CA — SB 53 (safety) + AB 2013 (training data) effective |
| 22 Jan 2026 | KR — AI Basic Act in force (fines deferred to about Jan 2027) |
| 5 Feb 2026 | UK — DUA Act automated decision-making reforms |
| 20 Feb 2026 | IN — IT Amendment Rules 2026 (synthetic content labelling) |
| 1 Mar 2026 | VN — Law on AI in force |
| 27 Jul 2026 | EU — Digital Omnibus on AI in force (high-risk dates moved) |
| 2 Aug 2026 | EU AI Act — Art. 50 transparency, penalties, AI Office GPAI enforcement |
| 29 Sep 2026 | US — Executive order renames AI to "Super Intelligence" (SI) in federal documents; terminology only |
| 2 Dec 2026 | EU AI Act — machine-readable marking grace period ends |
| 10 Dec 2026 | AU — Privacy Act automated decision-making obligations |
| 1 Jan 2027 | US — CO SB 26-189, NY RAISE Act, IL SB 315, WA HB 2225, CA CCPA ADMT and SB 947 |
| 13 May 2027 | IN — DPDP Rules core obligations |
| 2 Dec 2027 | EU AI Act — Annex III high-risk applicability |
| 2 Aug 2028 | EU AI Act — Annex I embedded high-risk applicability |

---

## Authoritative Sources

- EU AI Act full text: https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32024R1689
- GDPR: https://gdpr-info.eu/
- NIST AI RMF: https://www.nist.gov/system/files/documents/2023/01/26/AI%20RMF%201.0.pdf
- ISO/IEC 42001: https://www.iso.org/standard/81230.html
- MITRE ATLAS: https://atlas.mitre.org/

---

**Knowledge base last updated**: 11 Oct 2026 (ai-regulatory-knowledge-base v1.2.0). Regulations change
frequently; verify the status of proposed frameworks and any deadline after that date before relying
on them for compliance decisions. This is research output, not legal advice.
