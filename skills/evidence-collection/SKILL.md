---
name: evidence-collection
description: Automated and interactive evidence collection pipeline with 24 templates, 3 extractors (git, package, CI), autofill, and validation for compliance documentation
---
# Evidence Collection Pipeline

Automated and interactive evidence collection for AI/LLM compliance documentation.

## Pipeline Steps

1. **Configure** — Create compliance-config.json with project metadata, jurisdictions, and risk classification
2. **Interactive Assessment** — 21 browser-based HTML tools for human-judgment assessments (risk classification, PIA, bias testing, etc.)
3. **Automated Extraction** — Run extract-evidence.js to pull evidence from git history, package.json, and CI/CD config
4. **Template Autofill** — Run autofill.js to populate 24 evidence templates with extracted data
5. **Validation** — Run evidence-checker.js to verify completeness and flag gaps
6. **Deliverable Handoff** — Package evidence for compliance review

## Templates

24 evidence templates covering:
- Model documentation and data governance (01-05)
- Testing and validation (06-09)
- Human oversight and accountability (10-13)
- Transparency and explainability (14-17)
- Risk management and incident response (18-21)
- Supply chain and third-party risk (22-24)

## Extractors

- **git-evidence.js** — Commit history, contributors, review patterns
- **package-evidence.js** — Dependencies, licenses, versions
- **ci-evidence.js** — Pipeline configuration, test coverage, deployment patterns

## Internationalization

Templates and tools support 7 locales: en, zh-CN, ko, ja, pt-BR, es, fr (692 keys each).
