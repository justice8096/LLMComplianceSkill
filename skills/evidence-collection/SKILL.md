---
name: evidence-collection
description: Use when someone wants to collect, fill in or check AI compliance evidence for a project. It runs the git, package, CI and SAST/DAST extractors, autofills the 24 evidence templates from compliance-config.json and validates them with the evidence checker. The scripts need Node.js, so this part runs in Claude Code or a terminal.
---
# Evidence Collection Pipeline

Automated and interactive evidence collection for AI/LLM compliance documentation.

## Pipeline Steps

1. **Configure** — Create compliance-config.json with project metadata, jurisdictions, and risk classification
2. **Interactive Assessment** — 21 browser-based HTML tools for human-judgment assessments (risk classification, PIA, bias testing, etc.)
3. **Automated Extraction** — Run extract-evidence.js to pull evidence from git history, package manifests, CI/CD config and an existing SAST/DAST report
4. **Template Autofill** — Run autofill.js to populate 24 evidence templates with extracted data
5. **Validation** — Run evidence-checker.js to verify completeness and flag gaps
6. **Deliverable Handoff** — Package evidence for compliance review

## Templates

24 evidence templates. The full list with the laws behind each one is in the ai-compliance skill. By number:
- Transparency and disclosure: 01 System Transparency, 02 User-Facing Disclosure, 03 Content Labeling, 04 Automated Decision Logic, 05 Training Data
- Risk, privacy and fairness: 06 Impact/Risk Assessment, 07 Privacy Impact Assessment, 08 Bias Testing, 09 Human Oversight
- Data subject and consent: 10 Consent Records, 11 Data Subject Rights
- Governance and operations: 12 Governance Framework, 13 Incident Management, 14 Registration/Filing, 15 Security Assessment, 16 Content Moderation
- Classification and conformity: 17 Risk Classification, 18 AI Literacy Training, 19 Conformity Assessment
- Planning: 20 Sector-Specific Matrix, 21 Jurisdiction Selector, 22 Deadline Tracker
- Supply chain and security testing: 23 Supply Chain Risk, 24 SAST/DAST Scan

## Extractors

- **git-evidence.js** — Commit history, contributors, review patterns
- **package-evidence.js** — Dependencies, licenses, versions
- **ci-evidence.js** — Pipeline configuration, test coverage, deployment patterns
- **sast-dast-evidence.js** — Findings from an existing SAST/DAST scan report

## Internationalization

Templates and tools support 7 locales: en, zh-CN, ko, ja, pt-BR, es, fr. Every locale file has the same keys as en.json, which a test enforces.
