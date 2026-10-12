# AI Compliance Evidence Collection Kit

![Lint](https://github.com/justice8096/LLMComplianceSkill/actions/workflows/lint.yml/badge.svg)
![Release](https://img.shields.io/github/v/release/justice8096/LLMComplianceSkill)

Open-source toolkit for gathering AI/LLM compliance evidence across 25 jurisdictions (regulatory data current as of 11 Oct 2026). Built as a [Claude Code](https://claude.ai/claude-code) skill; the regulatory knowledge half also runs in claude.ai and Cowork, the evidence pipeline needs Node.js.

**[View the site](https://justice8096.github.io/LLMComplianceSkill/)** | **[Templates](#templates)** | **[Interactive Tools](#interactive-tools)** | **[Quick Start](#quick-start)**

---

## What This Is

When you build an AI-powered application, you need evidence that it complies with applicable regulations. This toolkit provides:

- **24 evidence templates** mapped to specific laws across 45+ regulations
- **21 interactive HTML tools** for compliance areas requiring human judgment
- **An autofill script** that populates templates from a single config file
- **4 automated evidence extractors** for git, package, CI/CD and SAST/DAST report analysis
- **Regulation research** covering 25 jurisdictions with specific provisions and 50 dated deadlines, synced from [ai-regulatory-knowledge-base](https://github.com/justice8096/ai-regulatory-knowledge-base) via `node tools/sync-kb.js`

The output is designed to be **handed to your legal or compliance team** to help prove compliance.

## Installation

In Claude Code, add this repository as a plugin marketplace and install the plugin:

```
/plugin marketplace add justice8096/LLMComplianceSkill
/plugin install ai-law-evidence@llm-compliance-skill
```

To update later, run `/plugin marketplace update llm-compliance-skill`, then reinstall.

To run the scripts or open the interactive tools without Claude Code, clone the repo over HTTPS:

```bash
git clone https://github.com/justice8096/LLMComplianceSkill.git
```

## Quick Start

```bash
git clone https://github.com/justice8096/LLMComplianceSkill.git
cd LLMComplianceSkill

# 1. Create your project config
cp tools/compliance-config.example.json tools/compliance-config.json
# Edit compliance-config.json with your project details

# 2. (Optional) Extract evidence automatically from your repo
node tools/extract-evidence.js --repo /path/to/your-repo --config tools/compliance-config.json

# 3. Open interactive tools in your browser
# Load compliance-config.json into each tool, make decisions, save results

# 4. Run autofill
node tools/autofill.js --config tools/compliance-config.json --output output/

# 5. Validate completeness
node tools/evidence-checker.js --config tools/compliance-config.json --output output/

# 6. Evidence is in output/
ls output/
```

## How It Works

```mermaid
flowchart TD
    Input([AI Project + Target Jurisdictions])

    Input --> Config[compliance-config.json\nSystem · Org · Jurisdiction · Dates]

    Config --> IT[21 Interactive HTML Tools\nbrowser-based, zero dependencies\nhuman-judgment assessments]
    Config --> EX[extract-evidence.js\ngit history · package deps\nCI/CD pipeline analysis]

    IT --> AF[autofill.js\nPopulates 24 evidence templates\nfrom config + tool results]
    EX --> AF

    AF --> OUT[output/\n24 filled templates\nMANIFEST.md\ncompliance-config-snapshot.json]

    OUT --> CHK[evidence-checker.js\nValidation · Gap analysis\nevidence-check-report.txt]

    CHK --> Handoff([Compliance Package\nfor Legal Review])
```

No server required. Everything runs locally with zero external dependencies.

## Templates

Each template below collects one kind of evidence. The last column lists the main laws that ask for it.

| # | Template | Key Regulations |
|---|---------|----------------|
| 01 | System Transparency Document | EU AI Act Arts. 11-14, Colorado SB 26-189, UK DUA Act |
| 02 | User-Facing Disclosure Toolkit | EU AI Act Art. 50, Colorado, California, China |
| 03 | Content Labeling Spec | EU AI Act, China Content Labeling, California SB 942 |
| 04 | Automated Decision Logic | EU, UK, Colorado, Australia |
| 05 | Training Data Disclosure | EU GPAI, California AB 2013, UK, Australia |
| 06 | Impact/Risk Assessment | EU AI Act Art. 9, Colorado, South Korea |
| 07 | Privacy Impact Assessment | 20+ laws across 17 jurisdictions |
| 08 | Bias Testing | EU, UK, Colorado, NYC LL 144, California, Australia |
| 09 | Human Oversight Design | EU AI Act Art. 14, UK DUA Act, Australia |
| 10 | Consent Records | GDPR, UK GDPR, Australia, South Korea PIPA |
| 11 | Data Subject Rights | 14+ data protection laws globally |
| 12 | Governance Framework | EU, UK, Australia, Singapore, South Korea |
| 13 | Incident Management | EU, China, California SB 53, South Korea |
| 14 | Registration/Filing Tracker | EU, China CAC, Peru, South Korea |
| 15 | Security Assessment | EU AI Act Art. 15, China GenAI specs, UK |
| 16 | Content Moderation | China, India |
| 17 | Risk Classification | EU Annex III, Colorado, South Korea, Brazil, Peru |
| 18 | AI Literacy Training | EU Art. 4 (already enforceable) |
| 19 | Conformity Assessment | EU AI Act Arts. 9-15 |
| 20 | Sector-Specific Matrix | Finance, healthcare, employment, education |
| 21 | Jurisdiction Selector | Select countries → get required template list |
| 22 | Compliance Deadline Tracker | All deadlines through 2027+ |
| 23 | Supply Chain Risk | Foundation model provenance, vendor assessments |
| 24 | SAST/DAST Scan Evidence | EU AI Act Art. 15, NIST SSDF, OWASP |

## Interactive Tools

Each tool below is a step-by-step form that fills in one template. Open the file in a browser; nothing needs to be installed.

| Tool | Template | Purpose |
|------|---------|---------|
| `risk-classification.html` | 17 | Decision tree for prohibited/high-risk/limited classification |
| `impact-risk-scoring.html` | 06 | Fundamental rights impact + risk matrix scoring |
| `human-oversight.html` | 09 | Oversight model, override mechanisms, bias prevention |
| `bias-testing.html` | 08 | Protected characteristics, fairness metrics, findings |
| `consent-design.html` | 10 | Legal basis selection, consent mechanisms, lifecycle |
| `security-assessment.html` | 15 | Threat model, security controls, infrastructure audit |
| `pia-assessment.html` | 07 | Privacy impact assessment workflow |
| `transparency-documentation.html` | 01 | System transparency documentation |
| `disclosure-toolkit.html` | 02 | User-facing disclosure design |
| `content-labeling.html` | 03 | AI content labeling specification |
| `automated-decision-logic.html` | 04 | Automated decision logic documentation |
| `training-data-disclosure.html` | 05 | Training data provenance |
| `governance-framework.html` | 12 | AI governance structure |
| `incident-management.html` | 13 | Incident response plan |
| `content-moderation.html` | 16 | Content moderation policy |
| `conformity-assessment.html` | 19 | EU AI Act conformity assessment |
| `ai-literacy-training.html` | 18 | AI literacy training records |
| `consent-records-audit.html` | 10 | Consent records lifecycle audit |
| `dsr-rights-implementation.html` | 11 | Data subject rights implementation |
| `supply-chain-risk.html` | 23 | Supply chain risk assessment |
| `llm-selector.html` | — | Select and document the foundation model used |

## Jurisdictions Covered

Jurisdictions are grouped by how far their AI rules have got, from enacted law to voluntary guidance.

| Tier | Jurisdictions |
|------|--------------|
| **Enacted** | EU (27 + EEA), South Korea, Peru, Vietnam |
| **Active Sector** | China, United Kingdom, United States (CA, NY, IL, CT, WA, TX, CO, NYC, UT), Brazil, Mexico, India, Australia |
| **Proposed** | Canada, Japan, Nigeria, Kenya, Colombia, Chile, Thailand, Malaysia, Indonesia, Philippines |
| **Voluntary** | New Zealand, Singapore, Egypt, South Africa |

## Key Deadlines

These are the dates that matter most, earliest first.

| Date | Jurisdiction | Event |
|------|-------------|-------|
| **2 Feb 2025** | EU | AI Act — Prohibited practices + AI Literacy |
| **2 Aug 2025** | EU | AI Act — GPAI obligations |
| **1 Jan 2026** | US-CA | SB 53 + AB 2013 |
| **22 Jan 2026** | KR | AI Basic Act in force |
| **5 Feb 2026** | UK | DUA Act — ADM reforms |
| **2 Aug 2026** | EU | AI Act — Art. 50 transparency + penalties (high-risk delayed to Dec 2027 by Digital Omnibus) |
| **10 Dec 2026** | AU | Privacy Act ADM obligations |
| **1 Jan 2027** | US | CO SB 26-189, NY RAISE Act, IL SB 315, CA CCPA ADMT |
| **2 Dec 2027** | EU | AI Act — Annex III high-risk applicability |

## Using as a Claude Code Skill

Add this as a skill to your Claude Code sessions when building AI-powered applications:

1. Install the plugin from its marketplace (see [Installation](#installation))
2. When planning features, Claude will reference applicable regulations
3. Use the templates and tools to gather evidence alongside development
4. The skill prioritizes actionable requirements and cites specific laws

## AI Attribution

This project was built with [Claude](https://www.anthropic.com/claude) models from Anthropic. A human directed and reviewed the work. So far the models are Sonnet 4.6, Opus 4.7, Fable 5.1, Haiku 5.5 and Opus 5.5.

Each commit has a `Co-Authored-By` trailer. The trailer names the model that helped. AI-generated source files say `@ai-generated` in their first lines.

As of 12 Oct 2026, 90% of commits in the last 365 days are AI-attributed (36 of 40). To get the current figure, run `node tools/extractors/git-evidence.js --repo .` and read `aiAttributionPercentage`.

See [`audits/contribution-analysis.md`](audits/contribution-analysis.md) for the full collaboration breakdown per component.

## Disclaimer

This toolkit supports compliance evidence gathering. **It is not legal advice.** Always have completed templates reviewed by qualified legal counsel. Regulations may have changed since the last research update (11 Oct 2026).

## License

CC0 1.0 Universal (public domain dedication). See [LICENSE](LICENSE).
