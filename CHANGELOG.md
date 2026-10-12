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

### Changed `[structural]`
- The plugin root no longer has a `package.json` or `package-lock.json`. Claude Code runs `npm ci` when a plugin root holds that pair, and the Directory holds such a plugin for review (LOCKFILE_AUTO_INSTALL). The scripts moved into `tooling/package.json` beside the build tooling; run them from the repo root with `npm --prefix tooling run <script>`. Tests, the SBOM and the KB sync still run with plain `node`. CI and a test fail if a package manifest or lockfile reappears in the root.
- Maintainer notes moved from `CLAUDE.md` to `CONTRIBUTING.md`. A plugin-root `CLAUDE.md` is not loaded for people who install the plugin, and the Directory flags it (ROOT_CLAUDE_MD).
- The poster PDF is no longer in the repository (the Directory cannot inspect it, BINARIES_NOT_INSPECTED); it is attached to the GitHub Release. `generate_poster.py` writes to `dist/`.

### Security `[defect]`
- The extractors and the KB sync gave npm, git and pip-audit the operator's whole environment, so a token in it (`NPM_TOKEN`, an npm auth setting, `GITHUB_TOKEN`) could travel with the npm audit request (MCP_FORWARDS_CREDENTIAL_ENV). Child processes now get an allowlist from `tools/extractors/child-env.js`: search path, system, temp and home folders, locale, proxy and the operator's git config location.
- The CI syntax check lists tracked `.js` files with `git ls-files` instead of a folder glob that also matched an image (UNREAD_ASSET_REFERENCED).

### Added `[structural]`
- Plugin icon (1024x1024 PNG) for the Directory listing, in the same family as the dyslexia-support-skill and dyscalculia-support-skill icons: navy, "AI" with a checkmark.

## [1.5.0] - 2026-10-12

Security and supply-chain release. No regulatory content changed; the world map changed only in how it loads its scripts (SRI) and builds its tooltip. Extractor fixes from the post-commit SAST audit of 2026-10-11 (`audits/sast-dast-scan.md`). **Addendum guidance:** evidence produced by `git-evidence.js` or `package-evidence.js` with 1.4.0 understated signed commits (always 0), had an empty `topAiModifiedFiles`, and on Windows omitted npm audit results without saying so. Re-run the extractors and file an addendum for any artifact that used those fields. Re-run also if you scanned an untrusted Python repository with 1.4.0.

### Security `[defect]`
- `package-evidence.js` ran `pip-audit -r <repo>/requirements.txt`, which installs the listed requirements; a local path or VCS entry in a scanned repository ran its `setup.py` on the operator's machine (CWE-829, HIGH-01). pip-audit now runs with `--disable-pip --no-deps`: it reads pinned versions only and installs nothing. Unpinned entries are not audited.
- `git-evidence.js` started a bare `git`, so on Windows a `git.exe` in the working directory could run (CWE-427, MEDIUM-01). Both extractors now share `tools/extractors/resolve-binary.js`, which resolves tools to absolute paths from PATH only.
- A scanned repository's own `.git/config` can make git open another file (`[include]`, `[includeIf]`) or a UNC path. On Windows, opening a UNC path sends the operator's NTLM hash to that host (CWE-73, MEDIUM-02). git cannot turn this off from the command line, and checking the config text is not enough: git's parser accepts spellings a checker misses. So git no longer reads the repository's config at all. `tools/extractors/git-sandbox.js` builds a private git directory with a config the extractor writes, copies HEAD and the refs, and points git at the repository's objects, index and working tree. Only the object format and ref storage are taken from the repository config, read with `git config --file`, which follows no includes. Layouts that cannot be handled safely are refused before any git call: no `.git` at the given path (a subdirectory, which git would resolve by walking up to the parent), symlinks in the git directory, `objects/info/alternates`, and a gitdir or commondir that is a network path in any slash spelling.
- pip-audit now only sees a `name==version` file the extractor writes itself. The scanned `requirements.txt` and its `-r` includes are read as text, inside the repository only (symlinks that leave it are refused, CWE-59). No path, URL, option or include from the repository reaches pip.
- npm audit no longer lets the scanned `package.json` choose the toolchain: its isolated copy keeps only the dependency fields, so `volta`, `packageManager`, `engines`, `devEngines` and `scripts` are dropped (CWE-15, LOW-05).
- The world-map page loads d3 and topojson with SRI hashes and fetches the topology pinned to `world-atlas@2.0.2`, also with an integrity check (CWE-353). The tooltip is built with `textContent` instead of `innerHTML`. The upstream knowledge-base copy needs the same change, or `sync-kb` will overwrite it.
- `content-labeling.html` ignores `__proto__`, `constructor` and `prototype` keys when it restores saved state (CWE-1321). `autofill.js --locale` accepts only an installed locale code (CWE-22).
- Two regular expressions took quadratic time on crafted input (CWE-1333): YAML comment stripping in `ci-evidence.js` and `[project]` dependency parsing in `package-evidence.js`. Both now use linear scans.

### Fixed `[defect]`
- Signed-commit counts were always 0, because blanking `gpg.program` and its siblings broke signature verification (INFO-07). These programs are now pinned to the operator's global git config or the default program on PATH, so a scanned repository still cannot choose them. `gpg.ssh.allowedSignersFile` and `gpg.ssh.revocationFile` are pinned to the operator's global config too. Without that, a scanned repository could vouch for its own signatures (CWE-345) or point either file at a UNC path (CWE-73). As a result, a signature counts as good only for a key the operator trusts.
- A scanned repository's `mailmap.file` / `mailmap.blob` config is ignored, because it could name a UNC path. The in-tree `.mailmap` still applies. Repo-level `include.path` cannot be turned off from the command line, so that UNC risk remains (see audits/sast-dast-scan.md MEDIUM-02).
- `topAiModifiedFiles` was always empty, because the commit hash came after `--` and git read it as a path (INFO-06). Root commits are now included too.
- On Windows, npm audit was silently skipped: the lookup chose the extensionless `npm` shell script, which cannot be started (INFO-08). Evidence now lists `vulnerabilities.auditsRun`, so an empty list shows that no audit ran, instead of reading as zero vulnerabilities.
- A pip audit could report zero vulnerabilities while auditing nothing: pip-audit ignores `-r` includes and stops at the first unpinned line (LOW-04). Includes inside the repository are now followed. Every line that cannot be audited (unpinned, path or URL, option, outside include) is listed in the new `vulnerabilities.auditGaps`, and `auditsRun` says `pip-partial` when any gap exists.
- SHA-256 repositories got no AI attribution, because commit IDs longer than 40 hex digits were rejected (INFO-09).

## [1.4.0] - 2026-10-11

Security, accessibility and translation release. No regulatory content changed beyond the knowledge-base syncs listed under `[authority]`, so outputs generated with 1.3.0 do not need addenda for legal content; re-run the extractors if you scanned an untrusted repository with 1.3.0 (see the extractor fixes below).

### Fixed `[defect]`
- Further extractor hardening (#13, #14): git calls also blank `gpg.program`, `gpg.ssh.program`, `gpg.x509.program` and `log.showSignature`; changelog, CODEOWNERS, CONTRIBUTING and LICENSE only count when the real path is a regular file inside the repo (symlink escape, CWE-59); signed-commit counts include only good signatures; lockfile package names cannot escape `node_modules`; pip-audit reads `requirements.txt` and parses the `dependencies[].vulns` shape; CI keyword checks ignore YAML comments; SLSA and signing are detected from real actions only.
- `git-evidence.js` counted each AI tool once per matching pattern, so a Claude trailer counted three times (#14). `sync-kb --check` reported every file as changed on Windows checkouts because it compared line endings (#14).
- `pia-assessment.html` labelled rights "Right to be Access", "Right to be Erasure" (#18).
- `/validate-evidence` advertised a `strict` option and `/autofill-templates` a template filter that the scripts did not accept. `evidence-checker.js --strict` and `autofill.js --template 07,08` now exist.
- License stated as MIT in `README.md` and `source/manifest.json`; it is CC0 1.0 everywhere, matching `LICENSE`.
- Stale facts in SKILL.md, README and the evidence-collection skill: four extractors (not three), 50 deadlines (not 47), 64 registry models (not 66), knowledge base v1.2.0 (not v1.1.0); template 24 was missing from both template tables; README jurisdiction tiers disagreed with SKILL.md; evidence-collection template groupings were wrong.
- The command safety rules added to `commands/*.md` lived only in generated files and were lost on rebuild; they now live in `source/commands/` (#15).
- Security hardening of the evidence extractors after a Claude Security scan of 2026-10-11 (report in `audits/CLAUDE-SECURITY-RESULTS-2026-10-11.md`, 4 verified findings, 6 candidates rejected):
  - `git-evidence.js`: `git()` now takes an argv array and refuses command strings; commit records are NUL-separated (`%x00`) instead of a marker line, and every hash is checked against `^[0-9a-f]{7,40}$` and passed after `--`. A commit body containing the old marker line could previously forge a record whose first line was split into extra git arguments (CWE-88, HIGH; `git diff-tree --output=<path>` overwrote any file the operator could write).
  - `git-evidence.js` and `package-evidence.js`: every git call carries `-c core.fsmonitor=false -c core.hooksPath=<null device> -c diff.external= -c protocol.allow=never`, so a repository's own `.git/config` cannot make git run a program during extraction (CWE-426, MEDIUM).
  - `package-evidence.js`: `execSync` (shell) replaced by `execFileSync` with argv arrays and binaries resolved to absolute paths from PATH, never from the scanned directory; on Windows a planted `npm.cmd` in the scanned repository would otherwise have run as the operator (CWE-427, HIGH). `npm audit` now runs from a private temporary copy of `package.json` and the lockfile with `--userconfig`/`--globalconfig` pointed at empty files, `npm_config_strict_ssl=true` and the public registry, so a repository `.npmrc` cannot proxy the request or capture the operator's registry token (CWE-918, MEDIUM). `isGitTracked` passes the path after `--` instead of quoting it into a shell string.
  - Side effects of the argv conversion: `--grep="^Revert "` and the quoted `tag --format="..."` strings were previously split or passed with literal quotes, so revert detection and release-tag parsing silently returned wrong data; both now work.
  - New `tests/extractor-hardening.test.js` (6 tests) builds hostile repositories and proves the forged-record, hooks/fsmonitor and `.npmrc` paths are closed. Suite: 118 tests.
- `SECURITY.md` corrected: the "no network access" claim now names the two exceptions (`npm audit`/`pip-audit`, and the world-map page's CDN scripts), and Known Limitations tells operators to scan fresh clones rather than unpacked archives.

### Changed `[authority]`
- Synced ai-regulatory-knowledge-base v1.2.0: every regulation file gains an "Executive Instruments to Watch" section and the Global Overview a political-sunset table (22 executives, term-end dates); EO 14409 (Jun 2, 2026) added as `us.eo14409`; 2026 leadership changes recorded (UK, Vietnam, Chile, Peru, Colombia, Japan). A bimonthly scheduled sweep (1st of even months) now produces a change report.
- Synced ai-regulatory-knowledge-base v1.1.1: the Sep 29, 2026 executive order "Inaugurating the Era of Super Intelligence" (executive-branch terminology change from AI to SI, defined by reference to 15 U.S.C. 9401(3); no statute or regulation changed; legislative language due about Nov 28, 2026; voluntary White House Accord on Super Intelligence). Two deadline entries added (`us.superIntelligenceOrder`, `us.superIntelligenceOrder.legislativeLanguage`); SKILL.md authority table and key-deadline table updated.

### Changed `[voice]`
- SKILL.md opens with a "Data current as of 2026-10-11" banner and a "Where each part runs" note (knowledge half works in claude.ai and Cowork; the HTML tools open in any browser; only the three Node scripts need Claude Code or a terminal; Codex P2 on PR #9). Jurisdiction counts corrected to 25 in README, manifest, plugin.json and SKILL.md.
- Authority-version pins rewritten from one 1,000-character paragraph into a 19-row table; jurisdiction-lookup command lists codes in a table grouped by region. Driven by the dyslexia and dyscalculia content checks (audits/accessibility-gates.md).

### Changed `[voice]` (accessibility and translation, #15 to #20)
- Interactive tools pass the dyslexia and dyscalculia gates (report in `audits/accessibility-wizards-templates-2026-10-11.md`): no text under 14px, 4.5:1 contrast, visible "Step N of M" text, prose capped at 70 characters, percentages shown with counts or natural frequencies, level words beside every score, whole-number averages, one date format, deadline tables in date order.
- Every template table has a one-line intro sentence (212 tables).
- All 21 tools are translated into es, fr, pt-BR, ja, ko and zh-CN: about 1,900 previously hardcoded strings via the new `toolText` locale section, plus the progress line, skip link, landmark labels and table intros. Exported markdown stays English.
- Law names follow one rule in every locale (`tools/i18n/law-names.json`); zh-CN uses the regulations' official names.
- Skill descriptions now start with when to use them; commands gain `argument-hint` and a Run line; SKILL.md says where the scripts live in an installed plugin and documents the checker's exit codes and `--json` shape (`schemaVersion` 1).
- README installs through `/plugin marketplace add` instead of a clone into `~/.claude/plugins/`.

### Added `[structural]`
- CI: dependency audit job and a check that the bundled regulation files match the knowledge base. `.gitattributes` keeps text files LF.
- Tests for extractor hardening, i18n parity, table intros, tool text, law names and documentation claims (counts, license, version, template tables).
- The regulation corpus (12 files + world map) and the two data files now ship inside the skill at `skills/ai-compliance/references/{regulations,data}/`, mirrored by `tools/sync-kb.js`; SKILL.md paths point there. claude.ai and Cowork package only `skills/<name>/`, so the repo-root copies were not reaching those surfaces (Codex P1 on PR #9). `build.ts` copies `references/` into `dist/claude-plugin/`.
- `.claude-plugin/marketplace.json` so the repo installs as a single-plugin directory marketplace (`claude plugin marketplace add <path>`); `plugin.json` now follows the plugin schema (author object, CC0-1.0 license, homepage, keywords) and leads with what works in claude.ai.

## [1.3.0] - 2026-10-11

Regulatory refresh to October 2026, synced from ai-regulatory-knowledge-base v1.1.0 (commit 89f3a6a). Prior outputs generated against v1.2.0 cite deadlines and laws that have since changed (Colorado, EU high-risk dates); downstream consumers should file addenda for any template 17, 21 or 22 produced before this release.

### Changed `[authority]`
- All 12 root `AI-Regulations-*.md` files and `AI-Regulations-World-Map.html` replaced with the October 2026 knowledge-base versions (EU Digital Omnibus, Regulation (EU) 2026/1744; Colorado SB 26-189; NY RAISE Act; IL SB 315; CT Public Act 26-15; WA HB 2225; Korea AI Basic Act in force; Vietnam Law on AI; India IT Amendment Rules 2026; China anthropomorphic AI measures; Australia AI standards announcement; Peru regulation phases; Brazil ECA Digital; Kenya AI Bill; South Africa policy withdrawal).
- `tools/data/deadline-data.json` regenerated: 21 entries became 47. EU full applicability (`eu.aiAct.full`) moved from 2026-08-02 to 2027-12-02 with a new `eu.aiAct.transparency` entry for what actually applied on 2026-08-02; Colorado entry replaced by `usCo.sb26189` (2027-01-01); added Korea, Vietnam, India, Peru, Brazil, Connecticut, New York, Illinois, Washington, Japan APPI, EU Data Act and CCPA entries.
- `tools/data/jurisdiction-matrix.json`: statuses and keyDeadlines updated (Brazil, Mexico, India, Australia to active-sector; EU keyDeadline 2027-12-02; Colorado 2027-01-01). Jurisdiction set unchanged at 22.
- Templates 00, 03, 17, 20, 21, 22 and the "Laws served" headers of 01, 02, 04, 06, 08 updated: SB 24-205 references replaced by SB 26-189 (with the dropped duties noted), frontier-model regimes added to the classification table, deadline tables rebuilt for 2026-2028, Vietnam and Kenya rows added to the jurisdiction selector.
- `source/skills/ai-compliance.md` (and the built `skills/ai-compliance/SKILL.md`): file-contents table, tier table, key-deadline table and the authority-version pin paragraph updated; "sources current as of 2026-10-11".
- `README.md`, `Evidence-Requirements.md`, `Law-Evidence-Matrix.md`: Colorado, EU and new state-law rows updated.

### Fixed `[defect]`
- Interactive wizards for templates 01, 04 and 06 (`tools/interactive/*.html`) and their localized subtitles no longer cite the repealed Colorado SB 24-205 in export text (Codex P2 on PR #8); the i18n field key `colorado-sb-24-205` is now `colorado-sb-26-189`, and `riskClassification.coloradoSB26189` is the config key (the old `coloradoSB24205` key is still read).
- `tools/autofill.js` jurisdiction checkbox filler no longer prefix-matches: selecting `US-NY` (United States - New York) used to also tick New York City in template 21.
- `tools/autofill.js` now honors `--output <dir>` (it previously always wrote to `output/`, so `evidence-checker.js --output` could never find the files).
- `tools/autofill.js` and `tools/evidence-checker.js` strip a UTF-8 BOM before `JSON.parse`; configs saved by Notepad or PowerShell `Set-Content -Encoding UTF8` no longer crash with "Unexpected token".
- Em dashes in `deadline-data.json` (which rendered as mojibake on Windows) replaced with hyphens; a test now guards against their return.

### Added `[structural]`
- `tools/data/jurisdiction-matrix.json` gains three jurisdictions (22 -> 25): `US-NY` (RAISE Act), `US-CT` (Public Act 26-15) and `US-WA` (HB 2225), with template requirements mapped on an inclusive basis (binding duties plus strongly advisable evidence). Locale names added in all seven locales; tests updated to 25.
- Template requirements re-mapped for the 2026 laws: `US-CO` (SB 26-189: notices, ADM logic and human review in; impact assessment kept as advisable), `US-CA` (adds CCPA ADMT, SB 947, SB 243 and SB 53 governance/security templates) and `US-IL` (adds SB 315 frontier templates incl. 19 Conformity Assessment for the third-party audit).
- `tools/sync-kb.js` (`npm run sync:kb`, `npm run sync:kb:check`): copies the regulation files and world map from a sibling or `--from` checkout of ai-regulatory-knowledge-base, so the knowledge base is the single source of truth and this repo can be checked for drift in CI.
- Tests: `eu.aiAct.transparency` presence, no `usCo.sb24205`, ASCII-only law names.

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
