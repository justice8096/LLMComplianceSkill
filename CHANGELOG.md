<!-- SPDX-License-Identifier: CC0-1.0 -->

# Changelog

All notable changes to this skill are tracked here. Per the [Skill Versioning and Addendum Framework](https://github.com/justice8096/SecondBrainData/blob/main/SoftwarePractices/Skill-Versioning-and-Addendum-Framework.md), every change is classified by driver so downstream audit-artifact consumers can assess whether prior outputs need addendum filings.

Format: [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) with **change-driver tags** appended per entry:

- `[authority]` — underlying regulation, standard, or evidence base changed
- `[defect]` — typo, broken citation, misspelled term, wrong CFR number, factual error
- `[structural]` — section restructure, new locale, new lifespan layer, new domain, new severity scale
- `[voice]` — wording refinement, tone adjustment, ambiguity fix, accessibility improvement

All four drivers affect admissibility / persuasive weight of downstream artifacts. Every change is tracked equally.

## [Unreleased]

## [1.2.0] — 2026-05-16

Skill Versioning and Addendum Framework integration. Aligns LLMComplianceSkill with the framework piloted in dyscalculia-support-skill v1.3.0–v1.3.2 and applied to dyslexia-support-skill v1.3.0. Adds the build-time root-canonical sync that prevents the drift defect we've now seen in three repos.

### Added `[structural]`
- `build.ts` now syncs root canonical (`commands/*.md` + `skills/*/SKILL.md`) from `source/` as part of `npm run build`. Reads `description` from `source/manifest.json`, preserves existing root frontmatter fields (`argument-hint`, `allowed-tools`), and replaces body content with `source/commands/*.md` / `source/skills/*.md`. Also runnable standalone via `npm run build:root-canonical`. Mirrors the pattern shipped in dyscalculia-support-skill v1.3.1.
- Compliance-report Provenance Block in `source/templates/compliance-report-template.md` — every generated compliance assessment now starts with skill version, commit hash, generation date, sources-current-as-of, jurisdiction-set, regulation versions, changelog URL.
- `CHANGELOG.md` (this file) adopting the [Skill Versioning and Addendum Framework](https://github.com/justice8096/SecondBrainData/blob/main/SoftwarePractices/Skill-Versioning-and-Addendum-Framework.md) four-driver classification, with retroactive entries for v1.0.0, v1.0.1, and v1.1.0.

### Added `[authority]`
- Inline "*Sources current as of 2026-05*" markers with authority-version pins per major jurisdiction section in `source/skills/ai-compliance.md`. Pins include EU AI Act (Regulation (EU) 2024/1689, in force 2024-08-01, with prohibitions effective 2025-02-02, GPAI obligations 2025-08-02, full applicability 2026-08-02), GDPR (Regulation (EU) 2016/679), NIST AI Risk Management Framework 1.0 (2023-01) + Generative AI Profile (NIST AI 600-1, 2024-07), ISO/IEC 42001:2023, ISO/IEC 23894:2023, EEOC AI guidance (2023-05), state laws (CO AI Act 2024 effective 2026-02-01, CA SB-1047 vetoed 2024-09 / SB-942 enacted 2024-09, NYC Local Law 144 effective 2023-07, TX HB 2060 ongoing).

### Changed `[structural]`
- Root canonical files (`commands/*.md`, `skills/*/SKILL.md`) re-derived from `source/*` for the first time since v1.1.0 multi-format build landed. Root description metadata reflects manifest.

### Process notes
- v1.2.0 builds on v1.1.0 (PR #7, the multi-format build pipeline). PR #6 ships F-010..F-018 WCAG accessibility fixes that had been sitting unpushed since 2026-05-10 — independent of this framework rollout.

## [1.1.0] — 2026-05-16

Multi-format build pipeline migration. Adds the source/build/dist infrastructure that mirrors the pattern shipped in dyslexia-support-skill and dyscalculia-support-skill repos.

### Added `[structural]`
- `source/manifest.json` — central definition of 2 skills (`ai-compliance`, `evidence-collection`), 5 commands (`compliance-assessment`, `extract-evidence`, `validate-evidence`, `autofill-templates`, `jurisdiction-lookup`), 1 template (`compliance-config`).
- `source/skills/*.md` + `source/commands/*.md` + `source/templates/*.md` — source-of-truth content per manifest entry.
- `build.ts` — TypeScript build pipeline generating 6 output formats: `claude-plugin`, `openai`, `n8n`, `prompts`, `mcp-server`, `cli`.
- `tsconfig.json` — TypeScript configuration for tsx-based execution.
- `package.json` build scripts: `build`, `build:claude`, `build:openai`, `build:n8n`, `build:mcp`, `build:prompts`, `build:cli`, `build:watch`, `validate`, `type-check`.
- `.gitignore` — `dist/` now ignored.

### Fixed `[defect]`
- The in-progress migration that had been sitting untracked since 2026-05-10 added `"type": "module"` to `package.json`, which broke `node:test` execution against the existing CommonJS test files. v1.1.0 ships without that field (tsx handles ESM-in-TS without needing package-level `type:module`); all 109 existing tests pass.

## [1.0.1] — 2026-04-15 (retroactively documented)

### Added `[structural]`
- Evidence collection pipeline: extractors (git, package, CI, SAST/DAST), i18n with 25 templates, 21 interactive assessment tools.
- 109-test integration suite covering deadline data, extractors, i18n, jurisdiction matrix, locale parity.

### Changed `[authority]`
- CWE-78 fix for `execFileSync` argument handling.

### Added `[structural]`
- Schema validation across templates.
- SHA-pinned CI workflow.

## [1.0.0] — Initial Release

### Added `[structural]`
- AI/LLM compliance evidence collection toolkit covering 16+ jurisdictions (EU AI Act, GDPR, US state laws, UK AI governance, NIST AI RMF, ISO 42001) with 24 templates and automated evidence extraction.

---

## Change-driver workflow

When making a change:

1. **Classify the driver** — one of `[authority]`, `[defect]`, `[structural]`, `[voice]`.
2. **Cite the trigger** — for `[authority]`: name the law/standard/study that changed. For `[defect]`: describe what was wrong. For `[structural]`/`[voice]`: explain why.
3. **Estimate addendum burden** — would any prior generated compliance assessment / evidence package / audit report need addendum filings as a result of this change? If yes, flag it; the skill's `/compliance-addendum` command (planned) will use this signal to identify affected artifacts.

## Audit-artifact provenance

Every compliance assessment, evidence package, or audit report generated by this skill must include a provenance block of the form:

```
Generated YYYY-MM-DD by LLMComplianceSkill vX.Y.Z (<git-short-hash>)
Sources current as of YYYY-MM except where individual sections note otherwise.
Jurisdictions evaluated: [EU, US, UK, CA, ...]
Regulation versions: [EU AI Act (Reg. 2024/1689), GDPR (Reg. 2016/679), NIST AI RMF 1.0, ...]
Skill changelog: https://github.com/justice8096/LLMComplianceSkill/blob/main/CHANGELOG.md
```

This is the linchpin of the addendum-filing workflow. Without it, the addendum command cannot identify which artifacts are affected by which changes.

## Related framework documentation

- [Skill Versioning and Addendum Framework](https://github.com/justice8096/SecondBrainData/blob/main/SoftwarePractices/Skill-Versioning-and-Addendum-Framework.md) — the cross-skill engineering principle this CHANGELOG implements.
- [Master Task List entry 17](https://github.com/justice8096/SecondBrainData) — rollout plan to other inspection-and-documentation skills (`post-commit-audit`, `supply-chain-security`, `sast-dast-scanner`, `cwe-mapper`).
- [Sister skill: dyscalculia-support-skill](https://github.com/justice8096/dyscalculia-support-skill) — pilot implementation of this framework.
- [Sister skill: dyslexia-support-skill](https://github.com/justice8096/dyslexia-support-skill) — same framework applied.
