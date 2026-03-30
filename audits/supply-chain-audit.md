# Supply Chain Security Audit
## LLMComplianceSkill — AI Compliance Evidence Collection Kit

**Report Date**: 2026-03-29
**Auditor**: Post-Commit Audit Skill (Claude Sonnet 4.6)
**Commit**: 1586ec7
**Branch**: main
**Audit Type**: POST-MERGE Audit

---

## Executive Summary

The addition of `package.json` in commit `1586ec7` is the primary supply chain change
since the prior audit. Critically, `package.json` contains **zero npm dependencies** —
only `scripts` and `engines` fields. The supply chain attack surface remains at zero
external packages. SLSA Level 1+ status is maintained.

**Overall Result: PASS**

---

## Dependency Inventory

### Runtime Dependencies
| Source | Count | Change |
|--------|-------|--------|
| npm (package.json `dependencies`) | 0 | — |
| npm (package.json `devDependencies`) | 0 | — |
| Python (requirements.txt) | N/A | N/A |
| Node built-in modules used | fs, path, child_process, os, node:test, node:assert | +node:test, +node:assert |

### Build Dependencies
| Tool | Version Pin | Method |
|------|-------------|--------|
| Node.js | `>=18.0.0` (engines field) | Loose range — see INFO |
| actions/checkout | SHA-pinned in lint.yml | Pinned |
| actions/setup-node | SHA-pinned in lint.yml | Pinned |

---

## SLSA Assessment

| Level | Requirement | Status |
|-------|-------------|--------|
| L1 | Build scripted, not manual | PASS — `npm test` runs `node --test` |
| L1 | Provenance: source repo documented | PASS — GitHub.com/justice8096/LLMComplianceSkill |
| L2 | Hosted build service | PASS — GitHub Actions lint.yml |
| L2 | Signed provenance | PENDING — `slsa-github-generator` not yet added |
| L3 | Isolated build | NOT APPLICABLE — no compiled artifacts |

**Current SLSA Level**: 1+ (L2 infrastructure present, unsigned provenance)

---

## New Supply Chain Items (1586ec7 delta)

### package.json
```json
{
  "dependencies": (none),
  "devDependencies": (none),
  "scripts": {
    "test": "node --test tests/**/*.test.js"
  },
  "engines": { "node": ">=18.0.0" }
}
```
**Risk**: NONE. No packages installed. `node --test` is a Node.js built-in (node:test
module, available since Node 18). Zero supply chain exposure introduced.

**SBOM opportunity**: With `package.json` now present, CycloneDX SBOM can be generated
via `npx @cyclonedx/cyclonedx-npm --output-file sbom.json`. This would satisfy the
INFO item from the prior audit. Recommended before next release.

### tests/*.test.js
All test files `require()` only Node.js built-in modules:
- `node:test` — built-in test runner
- `node:assert/strict` — built-in assertion library
- `fs`, `path`, `os`, `child_process` — built-in Node.js core

Zero third-party packages introduced by the test suite.

### tools/i18n/locales/*.json (zh-CN, ko, ja, pt-BR updates)
Static JSON data files. No executable code. No external data fetched at build or runtime.

---

## License Compliance

| Component | License | Compatibility |
|-----------|---------|---------------|
| Node.js built-ins | MIT (Node.js core) | Compatible |
| All project code | MIT (project) | Compatible |
| Regulatory content in KB | Public domain (law text) | Compatible |
| LLM model registry data | Factual (not copyrightable) | Compatible |

The LLM registry (`tools/data/llm-registry-*.json`) contains factual metadata about
published AI models (parameter counts, licenses, deployment types). Facts are not
copyrightable under Feist v. Rural Telephone (US) and equivalent EU database law.
Using model names is nominative trademark use — permitted for factual reference.

---

## ToS & Legal Compliance Assessment (Phase 1)

This section covers all external touchpoints in the codebase.

### External Touchpoints Identified

| Touchpoint | Access Method | ToS Risk |
|------------|---------------|----------|
| Git CLI | execFileSync, local only | CLEAN — tool executes against operator's own repo |
| npm/pip/cargo manifests | fs.readFileSync, local only | CLEAN — reads local project files |
| GitHub Actions YAML | fs.readFileSync, local only | CLEAN — reads local CI config files |
| Locale JSON files | XMLHttpRequest, same-origin | CLEAN — served from same local server |
| LLM registry | Static JSON, no API calls | CLEAN — factual directory data, no platform ToS applies |
| EU AI Act / regulatory text | Static MD files, no API | CLEAN — public domain law summaries |

**No external APIs called. No scraping. No rate-limit evasion. No authentication bypass.**

### Risk Classification

| Category | Status | Notes |
|----------|--------|-------|
| Social media platforms | N/A | Not accessed |
| Job boards | N/A | Not accessed |
| AI platform APIs (OpenAI, Anthropic, etc.) | N/A | Not called at runtime |
| Financial/market data | N/A | Not accessed |
| Government data | CLEAN | Regulatory text is public domain |
| GitHub API | N/A | Only GitHub Actions runs (own repo) |

**Overall ToS Assessment: CLEAN — no violations, no exposure.**

---

## Informational Items (carry-forward)

1. **No CycloneDX SBOM** — now unblocked by package.json addition. Recommend generating
   before next public release to satisfy EU AI Act Art. 25 supply chain documentation.

2. **SLSA L2 provenance unsigned** — `slsa-github-generator` action not yet integrated.
   Low urgency for private/open-source toolkit; relevant if distributed as commercial tool.

3. **Node.js version loose pin** — `engines.node: ">=18.0.0"` allows any Node 18+.
   Recommend pinning CI to a specific LTS version (e.g., `22.18.0`) to ensure
   reproducible test runs.

---

_Report generated by post-commit-audit skill — 2026-03-29_
