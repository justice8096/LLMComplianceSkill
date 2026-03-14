# AI Compliance Evidence Collection Kit

Open-source toolkit for gathering AI/LLM compliance evidence across 16+ jurisdictions. Built as a [Claude Code](https://claude.ai/claude-code) skill.

**[View the site](https://justice8096.github.io/LLMComplianceSkill/)** | **[Templates](#templates)** | **[Interactive Tools](#interactive-tools)** | **[Quick Start](#quick-start)**

---

## What This Is

When you build an AI-powered application, you need evidence that it complies with applicable regulations. This toolkit provides:

- **22 evidence templates** mapped to specific laws across 45+ regulations
- **6 interactive HTML tools** for compliance areas requiring human judgment
- **An autofill script** that populates templates from a single config file
- **Regulation research** covering 16 jurisdictions with specific provisions and deadlines

The output is designed to be **handed to your legal or compliance team** to help prove compliance.

## Quick Start

```bash
git clone https://github.com/justice8096/LLMComplianceSkill.git
cd LLMComplianceSkill

# 1. Create your project config
cp tools/compliance-config.example.json tools/compliance-config.json
# Edit compliance-config.json with your project details

# 2. Open interactive tools in your browser
# Load compliance-config.json into each tool, make decisions, save results

# 3. Run autofill
node tools/autofill.js

# 4. Evidence is in output/
ls output/
```

## How It Works

```
compliance-config.json
        │
        ├──▶ Interactive HTML Tools (human judgment)
        │     risk-classification.html
        │     impact-risk-scoring.html
        │     human-oversight.html
        │     bias-testing.html
        │     consent-design.html
        │     security-assessment.html
        │
        ▼
   autofill.js ──▶ 22 filled templates + MANIFEST.md
                    in output/
```

1. **Configure** — Fill `compliance-config.json` with your project metadata, jurisdictions, and system details
2. **Assess** — Open the HTML tools in your browser, load your config, make human-judgment decisions, save results back
3. **Autofill** — Run `node tools/autofill.js` to populate all templates
4. **Handoff** — Give `output/` to your compliance team

No server required. Everything runs locally with zero dependencies.

## Templates

| # | Template | Key Regulations |
|---|---------|----------------|
| 01 | System Transparency Document | EU AI Act Arts. 11-14, Colorado SB 24-205, UK DUA Act |
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

## Interactive Tools

| Tool | Template | Purpose |
|------|---------|---------|
| `risk-classification.html` | 17 | Decision tree for prohibited/high-risk/limited classification |
| `impact-risk-scoring.html` | 06 | Fundamental rights impact + risk matrix scoring |
| `human-oversight.html` | 09 | Oversight model, override mechanisms, bias prevention |
| `bias-testing.html` | 08 | Protected characteristics, fairness metrics, findings |
| `consent-design.html` | 10 | Legal basis selection, consent mechanisms, lifecycle |
| `security-assessment.html` | 15 | Threat model, security controls, infrastructure audit |

## Jurisdictions Covered

| Tier | Jurisdictions |
|------|--------------|
| **Enacted** | EU (27 + EEA), South Korea, Peru, Vietnam, Brazil |
| **Active Sector** | China, United Kingdom, United States (CO, CA, NYC, IL, TX, UT) |
| **Proposed** | Canada, India, Japan, Nigeria, Mexico, Colombia, Chile |
| **Voluntary** | Australia, New Zealand, Singapore |

## Key Deadlines

| Date | Jurisdiction | Event |
|------|-------------|-------|
| **Feb 2025** | EU | AI Act — Prohibited practices + AI Literacy |
| **Aug 2025** | EU | AI Act — GPAI obligations |
| **Jan 2026** | US-CA | SB 53 + AB 2013 |
| **Feb 2026** | UK | DUA Act — ADM reforms |
| **Jun 2026** | US-CO | Colorado AI Act (SB 24-205) |
| **Aug 2026** | EU | AI Act — Full applicability |
| **Dec 2026** | AU | Privacy Act ADM obligations |

## Using as a Claude Code Skill

Add this as a skill to your Claude Code sessions when building AI-powered applications:

1. Add the skill to your project
2. When planning features, Claude will reference applicable regulations
3. Use the templates and tools to gather evidence alongside development
4. The skill prioritizes actionable requirements and cites specific laws

## Disclaimer

This toolkit supports compliance evidence gathering. **It is not legal advice.** Always have completed templates reviewed by qualified legal counsel. Regulations may have changed since the last research update (March 2026).

## License

MIT
