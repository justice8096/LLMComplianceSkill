# Supply Chain Security Audit
## LLMComplianceSkill — AI Compliance Evidence Collection Kit

**Report Date**: 2026-10-11
**Auditor**: Post-Commit Audit Skill (Claude Opus 5.5)
**Commit**: 3e0afa9 (merged to `main` as squash commit 304715e; trees are identical, `git diff 3e0afa9 304715e` is empty)
**Branch**: main
**Version**: 1.4.0
**Audit Type**: POST-COMMIT Re-audit
**Delta Range**: `git diff 1586ec7..HEAD` (156 files, +27,098 / −2,294)
**Method**: supply-chain-security skill (`supply-chain-auditor`): dependency analysis, CI/CD pipeline, SBOM, SLSA, container/runtime. Every finding below was checked against the file on disk at the cited line.

## Round-3 update at e368913 (2026-10-12) — self-verified

Not independently re-audited (the round-3 agent stopped before testing). Changes since c6afa61:

| ID | Status at e368913 | Evidence |
|----|-------------------|----------|
| SC-14 | **OPEN until upstream merge** | The same SRI/`textContent` change is committed in a local clone of `justice8096/ai-regulatory-knowledge-base` (branch `fix/world-map-sri`), not pushed. Against that clone `sync-kb --check` reports `0 changed, 29 already current`, so `kb-sync-check` passes once it lands upstream. |
| SC-15 | **FIXED** | `sync-kb.js` runs git in `git-sandbox.js` (private GIT_DIR, repo config never read). |
| SC-16 | **FIXED** | `generate-sbom.js` reads the URL and SRI hash for each CDN component from all three map copies and emits them as `hashes` (SHA-512 / SHA-384). Generation throws, and `sbom:check` fails, if a copy stops loading the URL, drops the integrity value, or the copies disagree. Tests cover both. |
| SC-05, SC-07 (repo settings) | **Approved by the owner, scheduled after PR #23 merges** | Required status checks on `main`; Dependabot security updates on. |
| SC-06, SC-08, SC-10 | unchanged (PARTIAL) | See the c6afa61 table below. |

**Counts at e368913 (self-verified)**: Critical 0, High 0, Medium 0, Low 6 (SC-05, SC-06, SC-07, SC-08, SC-10,
SC-14; SC-14 closes when the upstream change merges, SC-05/SC-07 when the approved settings are applied), Info 2
(SC-12, SC-13, positive controls). **Verdict: PASS.**

## Post-fix re-check at c6afa61 (2026-10-12)

**Auditor**: Post-Commit Audit Skill (Claude Opus 5.5), independent re-audit.
**Range**: b439721, 9073c9a and c6afa61 over 13ff5a3, on branch `fix/extractor-hostile-repo-and-evidence`.

**Method**:
- Read the three diffs.
- Resolved each action SHA with `git ls-remote` against its tag.
- Ran `generate-sbom.js` twice and compared the output byte for byte.
- Compared the SBOM against `tooling/package-lock.json`.
- Recomputed the SRI values from cdnjs and jsDelivr into a fresh empty scratch dir. The files were never executed.
- Fetched the upstream knowledge-base world map and ran `sync-kb.js --check` against it.
- Queried branch protection and Dependabot settings through the GitHub API (read-only).
- `npm test`: 219 tests, 217 pass and 2 skip without pip-audit; 219/219 pass with pip-audit on PATH.

| ID | Prior | Status at c6afa61 | Evidence |
|---|---|---|---|
| SC-01 | MEDIUM | **FIXED** | `tools/generate-sbom.js` writes CycloneDX 1.5 with version 1.4.0, license CC0-1.0 and 35 components: 32 tooling packages (`scope: excluded`, sha512 hashes) plus 3 CDN libraries (`scope: required`). This equals the 32 unique name@version entries in `tooling/package-lock.json`. Two runs gave byte-identical output (md5 `f4a55570…`, the same as the committed `sbom.json`). `npm run sbom:check` passes, and CI runs it (`lint.yml` unit-tests job). Residue: SC-16. |
| SC-02 | MEDIUM | **FIXED in this repo; residue in SC-14** | The recomputed hashes match the HTML: d3 7.9.0 `sha512-vc58qvvB…`, topojson 3.0.2 `sha512-4UKI/XKm…` and world-atlas@2.0.2 `sha384-yOCJ+8Sh…`. All three copies are identical and use `crossorigin="anonymous"`. jsDelivr sends ACAO `*`, so the fetch-integrity check is enforceable. |
| SC-03 | LOW | **FIXED** | `tooling/.npmrc` `save-exact=true`. The existing caret ranges in `tooling/package.json` remain but stay locked by `npm ci` and the hash-locked lockfile, which is the accepted mitigation. |
| SC-04 | LOW | **FIXED** | `npm audit --prefix tooling --audit-level=moderate`. |
| SC-05 | LOW | **OPEN** | GitHub API, 2026-10-12: `required_status_checks: null`, `required_pull_request_reviews: null`, `enforce_admins: false`. The new test, SBOM and audit jobs are still advisory. |
| SC-06 | LOW | **PARTIAL** | `sync-kb.js` now records `<sha> <date>` in `skills/ai-compliance/references/KB-SOURCE`, but no `KB-SOURCE` file exists in the tree yet (no sync has run since). CI still checks out the KB default branch with no `ref:`. `--check` only prints a note on a SHA mismatch and does not fail. |
| SC-07 | LOW | **PARTIAL** | `.github/dependabot.yml` is valid v2 (npm `/tooling` weekly with `versioning-strategy: increase`; github-actions `/` weekly). The repo setting `automated-security-fixes` is still `enabled: false`. |
| SC-08 | LOW | **PARTIAL (configured, not exercised)** | The `release-provenance` job is gated by `if: startsWith(github.ref, 'refs/tags/v')` and needs lint-js, dependency-audit and unit-tests. Only this job gets `id-token: write` and `attestations: write`; the workflow default is `contents: read`. It uses `persist-credentials: false` and `npm run setup` (`npm ci --ignore-scripts`). The action pin `96278af6caaf10aea03fd8d33a09a777ca52d62f` is the peeled commit of `actions/attest-build-provenance` tag **v3.2.0** (verified with `git ls-remote`). No `v*` tag has been pushed since (latest is v1.4.0, which predates this commit), so **no attestation exists yet**. |
| SC-09 | LOW | **FIXED** | The unit-tests job runs `npm test` and `npm run sbom:check`. |
| SC-10 | LOW | **PARTIAL** | Llama 3.1 and 3.2 `trainingDataCutoff` changed from 2024-12 to 2023-12. `lastUpdated` is still 2026-03-15, and there is still no per-model `sourceUrl` or `retrievedAt`. |
| SC-11 | INFO | **FIXED** | `package.json` `engines.node: ">=20.0.0"`. |
| SC-12 | INFO | unchanged (positive control) | Install scripts are neutralized by `--ignore-scripts`, including in the new release job. |
| SC-13 | INFO | unchanged (positive control) | Lockfile is unchanged by these commits. |

Other checks:
- `actions/checkout@34e11487…` = v4.3.1 and `actions/setup-node@49933ea5…` = v4.4.0 (both verified).
- `sync-kb.js` runs git by absolute path, with an argv array, no shell and a strict output regex.

### New findings at c6afa61

| ID | Severity | File:Line | Finding | Recommendation |
|----|----------|-----------|---------|----------------|
| SC-14 | LOW | `tools/sync-kb.js:46-48`; upstream `ai-regulatory-knowledge-base/visualizations/AI-Regulations-World-Map.html` | The SRI fix exists only in the three downstream copies. The upstream map, fetched 2026-10-12, has 0 `integrity` attributes and still uses `innerHTML`. `sync-kb.js --check` against it reports all three copies as `differs`, so: (a) the `kb-sync-check` CI job fails on this branch, and because of SC-05 that does not block a merge; (b) the next routine `sync-kb` run silently reverts SC-02 and SAST INFO-03. | Land the same change upstream before merging. Add a test asserting `integrity=` in every synced map. |
| SC-15 | INFO | `tools/sync-kb.js:125-131` | `kbCommit` runs `git log` with only `core.fsmonitor`/`core.hooksPath` overrides. There is no `log.showSignature=false`, no signing-program pin, and no `checkRepoGitConfig`. The KB checkout has the same owner (and is a fresh clone in CI), so this is latent. | Reuse the extractor's `GIT_HARDENING` and guard. |
| SC-16 | INFO | `tools/generate-sbom.js:35-42`, `:96-110` | The CDN components carry no `hashes`, although the SRI digests are known. `RUNTIME_CDN` is maintained by hand, and neither `sbom:check` nor any test cross-checks it against the `<script>`/`fetch` URLs in the HTML (the SC-01 test only asserts that the components exist). A CDN version bump in the HTML would leave a stale SBOM while `sbom:check` passes. | Parse the URLs and `integrity` values from the map HTML, emit them as `hashes`, and fail `--check` on any mismatch. |

### SLSA build level at c6afa61

- **Achieved: still L0.** Provenance generation is now configured. When it runs on a `v*` tag, it would produce
  Sigstore-signed, GitHub-hosted provenance, which meets Build L2 for its subjects. **It has not been exercised**:
  no tag has been pushed since c6afa61, and no attestation exists to verify. This audit cannot confirm that the
  job succeeds; for example, `npm run build` must produce `dist/**` on the runner.
- **Projected after the first successful tag run: L2 for `dist/**` and `sbom.json`.** The marketplace installs the
  plugin from the git source tree (`source: "./"`), not from `dist/`, so the attestation does not cover what
  Claude Code users actually install. To make the claim honest for that channel, attest a source archive of the
  tagged commit (for example, `git archive` output) as well.
- **Build L3 remains out of reach**: no required reviews (SC-05), and `enforce_admins: false`.

**Counts at c6afa61**: Critical 0, High 0, Medium 0, Low 6 (SC-05, SC-06, SC-07, SC-08, SC-10, SC-14), Info 4
(SC-12, SC-13, SC-15, SC-16). The prior count was Critical 0, High 0, Medium 2, Low 8 (SC-03 through SC-10),
Info 3. **Verdict: PASS** (zero CRITICAL/HIGH). Fix SC-14 before merging, because otherwise the SRI fix is reverted
by the project's own sync tool.

---

> **Post-fix re-check at 9cd7272 (2026-10-11).** The fix commit changes 7 files and no manifests, lockfiles, workflows or SBOM. No dependencies were added, so every finding below stands unchanged. The commit does reduce one supply-chain risk outside this report's scope: `package-evidence.js` no longer lets pip-audit install a scanned repository's requirements (SAST HIGH-01, CWE-829; see sast-dast-scan.md). Verdict unchanged: **PASS**.

---

## Executive Summary

Between 1586ec7 (2026-03-29) and HEAD the repository grew a TypeScript build pipeline. From v1.1.0 (2026-05-16)
until commit 3e0afa9, `tsx`, `typescript` and `@types/node` were root `devDependencies`. This put about 40 MB of
`node_modules`, including a native `esbuild.exe`, into users' plugin caches. See
`audits/plugin-security-scan-2026-10-11.md` WARNING 2.

Commit 3e0afa9 moves the build tooling into `tooling/package.json` and `tooling/package-lock.json`. The root
package now has **zero dependencies**, and two guards keep it that way: a CI step and a unit test. The tooling
lockfile is in good shape:
- All 32 entries have `sha512` integrity hashes.
- Every `resolved` URL points to `registry.npmjs.org`.
- `npm audit signatures` verifies registry signatures for all 6 installed packages, plus provenance attestations
  for 3 of them.
- CI installs with `npm ci --ignore-scripts`.

The new CI workflow has least-privilege `permissions`, SHA-pinned actions and a pinned Node version.

The remaining issues are about integrity and documentation, not exploitable dependency risk:
- `sbom.json` is stale. It describes v1.0.1 under MIT with no components.
- Three copies of the world-map page load third-party CDN scripts without Subresource Integrity. One of those
  copies now ships inside the skill. The 1586ec7 report missed these scripts.
- No build provenance is generated, so the honest SLSA Build level is **L0**. The prior report's "1+" was an
  overstatement, not a regression.

**Overall Result: PASS** (0 Critical, 0 High, 2 Medium, 7 Low, 3 Info)

---

## Dependency Inventory

### Runtime (shipped to plugin users)
| Source | Count | Change vs 1586ec7 |
|--------|-------|-------------------|
| npm root `dependencies` | 0 | — |
| npm root `devDependencies` | 0 | — (were 3 from v1.1.0 to 3e0afa9; removed) |
| Node built-ins (`fs`, `path`, `child_process`, `os`, `node:test`, `node:assert`) | 6 | — |
| Browser CDN scripts (world map): d3 7.9.0, topojson 3.0.2 (cdnjs) | 2 | Not reported at 1586ec7 (already present); now also shipped in `skills/ai-compliance/references/regulations/` |
| Browser CDN data: `world-atlas@2` countries-110m.json (jsDelivr, floating major) | 1 | As above |

### Build-only (`tooling/`, never installed into the plugin cache)
| Package | Declared (`tooling/package.json`) | Locked (`tooling/package-lock.json`) | License | Registry signature | Provenance attestation |
|---------|----------------------|--------------------|---------|-----|-----|
| tsx | `^4.7.0` (:8) | 4.23.15 (:523) | MIT | verified | verified |
| typescript | `^5.3.3` (:7) | 5.9.3 (:542) | Apache-2.0 | verified | none |
| @types/node | `^20.10.0` (:6) | 20.19.43 (:456) | MIT | verified | none |
| esbuild (transitive) | — | 0.28.2 (:466), `hasInstallScript` | MIT | verified | verified |
| @esbuild/win32-x64 (installed platform binary) | — | 0.28.2 | MIT | verified | verified |
| undici-types (transitive) | — | 6.21.0 (:556) | MIT | verified | none |
| fsevents (optional, darwin) | — | 2.3.3 (:508), `hasInstallScript` | MIT | n/a (not installed on win32) | — |
| @esbuild/* other platforms (optional) | — | 25 × 0.28.2 | MIT | n/a (not installed) | — |

Lockfile facts, verified by parsing `tooling/package-lock.json`:
- `lockfileVersion: 3`
- 32 package entries, 32 with `integrity`, all `sha512-`
- 0 `resolved` URLs outside `https://registry.npmjs.org/`
- 0 git, tarball or file specifiers
- install scripts present only in `esbuild` and `fsevents`; both are neutralized by `--ignore-scripts`

`npm audit` results: root has 0 vulnerabilities, `tooling/` has 0 vulnerabilities.

### Root lockfile consistency
`package-lock.json:1-16` holds only the root entry: name `llm-compliance-skill`, version 1.4.0, license
`CC0-1.0`, engines `>=18.0.0`. No `node_modules/*` keys remain. This matches `package.json:1-31`, which declares
no dependencies. **Consistent.**

### License compliance
Every build-only dependency is MIT or Apache-2.0, and none ship to users. The runtime CDN libraries are
ISC-licensed (d3, topojson-client and world-atlas). All of these are compatible with the project's `CC0-1.0`
license (`LICENSE`, `package.json:6`, `.claude-plugin/plugin.json:9`). There is no GPL or AGPL contamination.

---

## CI/CD Pipeline (`.github/workflows/lint.yml`)

| Control | Status | Evidence |
|---------|--------|----------|
| Workflow `permissions` least-privilege | PASS | `lint.yml:3-4` `contents: read` (absent at 1586ec7) |
| Third-party actions SHA-pinned | PASS | `lint.yml:18,20,36,38,60,64,70` (checkout `34e1148…`, setup-node `49933ea…`) |
| Node toolchain pinned | PASS | `lint.yml:22,40,72` `22.18.0` (was floating `'20'` at 1586ec7) |
| Deterministic install | PASS | `lint.yml:43` `npm ci --prefix tooling --ignore-scripts` |
| Install scripts disabled | PASS | `lint.yml:43`; also `package.json:9` (`npm run setup`) |
| Vulnerability gate | PARTIAL | `lint.yml:46` `--audit-level=high` (moderate passes; see SC-04) |
| Root-stays-dependency-free guard | PASS | `lint.yml:48-50`; mirrored by `tests/doc-claims.test.js:97-105` |
| Build works from tooling install | PASS | `lint.yml:52-53` `npm run validate` |
| Secrets referenced | NONE | No `secrets.*` or `env:` token use in the workflow |
| Cross-repo checkout credentials | PASS | `lint.yml:68` `persist-credentials: false` on the KB checkout |
| Job timeouts | PASS | `lint.yml:16,34,57` `timeout-minutes: 10` |
| Trigger branch correct | PASS | `lint.yml:8,10` `main` (was `master` at 1586ec7, but the default branch is `main`) |
| Unit tests in CI | FAIL | No `npm test` step in any job (see SC-09) |
| Required status checks | FAIL | GitHub branch protection `required_status_checks: null` (see SC-05) |

The latest runs (`gh run list`) show Lint passing on `main` push 38184446648 and on PR 38184365933 for this commit.

---

## SBOM

| Check | Result | Evidence |
|-------|--------|----------|
| Present | Yes | `sbom.json` (added in ff900a7, 2026-03-29, after the 1586ec7 report) |
| Format | CycloneDX **1.5** | `sbom.json:2-3` |
| Generated by a tool | No | Hand-authored. `sbom.json:10-12` names "Claude Sonnet 4.6" as the tool; there is no cyclonedx-npm output |
| Matches current version | **No** | `sbom.json:23,24,34,50` say `1.0.1`; `package.json:3` says `1.4.0` |
| Matches current license | **No** | `sbom.json:30` says `MIT`; `package.json:6` and `LICENSE` say `CC0-1.0` |
| Freshness | **Stale** | `sbom.json:7` timestamp `2026-03-30T00:13:38.948Z` predates 2 major build changes and 4 releases |
| Components complete | **No** | `sbom.json:47` `components: []` omits the 6 installed tooling packages (scope: excluded/dev) and the 3 runtime CDN dependencies |
| VEX statements | None | No `vulnerabilities` array |

See SC-01. The SBOM was not regenerated, as this audit's scope requires.

---

## SLSA Assessment (v1.0)

The deliverable is the git source tree itself. Claude Code installs the plugin from the marketplace `source: "./"`
(`.claude-plugin/marketplace.json:13`) at a commit SHA, so there is no separately built artifact to attest.

| Level | Requirement | Status | Evidence |
|-------|-------------|--------|----------|
| L1 | Version control | PASS | GitHub `justice8096/LLMComplianceSkill`, public |
| L1 | Build recipe committed | PASS | `package.json:8-26`, `build.ts`, `lint.yml` |
| L1 | Scripted build on hosted platform | PASS | GitHub Actions `lint.yml` |
| L1 | **Provenance available** | **FAIL** | No provenance generated for any tag or artifact (no slsa-github-generator, no `actions/attest-build-provenance`) |
| L2 | Signed provenance | FAIL | n/a without provenance |
| L2 | No force-push / immutable history | PASS | Branch protection: `allow_force_pushes: false`, `allow_deletions: false` |
| L2 | Build logs retained | PASS | GitHub Actions default retention |
| L3 | Signed commits | PASS | Branch protection `required_signatures: true`; 3e0afa9 has a good SSH signature (ED25519); squash merges are GitHub web-flow signed |
| L3 | Review required before merge | FAIL | `required_pull_request_reviews: null`; `enforce_admins: false` |
| L3/L4 | All transitive dependencies pinned by hash | PARTIAL | Build tooling is hash-locked; runtime CDN scripts have no hash (SC-02) |
| L4 | Reproducible / hermetic build | NOT ASSESSED | No distributed build output |

**Current SLSA Build Level: L0 (formal)**. All L1 prerequisites are met except provenance generation. The source
track is stronger than the build track: signed commits are required and force-push is blocked.

**Correction to 1586ec7:** that report rated "1+ (L2 infrastructure present, unsigned provenance)". Under SLSA v1.0,
L1 requires provenance to exist, and none has ever been produced. The downgrade corrects the rating; it is not a
regression.

**Path to L1/L2:** add `actions/attest-build-provenance` (or slsa-github-generator) on tag push, attesting a source
tarball of the release commit plus `sbom.json`. That reaches signed-provenance L2 in one workflow file.

---

## Plugin Distribution Surface

| Item | Status | Evidence |
|------|--------|----------|
| Marketplace manifest | Single plugin, `source: "./"`, no permissions/tools/hooks | `.claude-plugin/marketplace.json:8-16` |
| Plugin manifest version matches release | PASS (was a WARNING in the plugin scan) | `.claude-plugin/plugin.json:4` `1.4.0` = `package.json:3` = tag `v1.4.0` |
| Hooks / MCP servers auto-run on install | None | No `hooks/`, no `.mcp.json`, no `mcpServers` key |
| Dependencies pulled into plugin cache | 0 (was ~925 files / 40 MB) | `package.json` has no deps; guarded at `lint.yml:48-50` and `tests/doc-claims.test.js:97-105` |
| Tracked binaries / archives | 0 executables | `git ls-files` has no `.exe/.dll/.so/.node/.wasm/.tgz/.zip` |
| Files installed | 171 tracked files, including `tooling/package.json` and its lock (inert without `npm run setup`) | `git ls-files` |
| Extractor's own `npm audit` call hardened | PASS | `tools/extractors/package-evidence.js:892-913` (`--ignore-scripts`, `--userconfig` empty, `npm_config_registry` and `npm_config_strict_ssl` forced) |

Status of the plugin-scan items (`audits/plugin-security-scan-2026-10-11.md`):

| Plugin-scan finding | Status at HEAD |
|---------------------|----------------|
| WARNING 1: shell-based extractor | Fixed in source (`execFileSync`, `package-evidence.js:40,217`). Users still need to reinstall. |
| WARNING 2: `node_modules` in cache | Root cause removed by 3e0afa9 |
| WARNING 3: version not bumped | Resolved: 1.4.0 |

Claude Security findings F2 and F3 (repo-local `.npmrc` during `npm audit`) are addressed at the cited
`package-evidence.js` lines.

---

## Model Supply Chain Data Source (`tools/data/llm-registry*.json`)

The registry is static JSON: 1 index file plus 6 chunk files covering 64 models (meta 5, mistral 8,
google-microsoft 12, china 10, other-open 15, api-only 14). It is loaded same-origin by
`tools/interactive/llm-selector.html` and feeds the autofill for Template 23 (Supply Chain Risk) and Template 05
(Training Data Disclosure). It fetches nothing at runtime and does not reference model weights.

| Check | Result | Evidence |
|-------|--------|----------|
| Last updated | 2026-03-15; unchanged since 6d19d8b, before 1586ec7 | `tools/data/llm-registry.json:4` |
| Per-model source citation / retrieval date | Absent. Entries carry `license`, `trainingDataCutoff` and `compliance` fields with no source URL | `tools/data/llm-registry-meta.json:4-41` (schema), other chunks identical |
| Weight digests / model-card hashes | Absent | — |
| Spot-check accuracy | `meta-llama-3.1` `trainingDataCutoff: "2024-12"` looks inconsistent with Meta's published model card (December 2023); needs verification | `tools/data/llm-registry-meta.json:15` |

See SC-10. Facts are not copyrightable, and the 1586ec7 license analysis still holds.

---

## Knowledge-Base Provenance (`tools/sync-kb.js`)

`sync-kb.js` makes **no network calls**. It copies files from a **local** checkout of
`justice8096/ai-regulatory-knowledge-base`:
- default path: `../ai-regulatory-knowledge-base` (`tools/sync-kb.js:22`)
- override: `--from` (`tools/sync-kb.js:25`)

It writes three destinations, one of which is the shipped `skills/ai-compliance/references/`
(`tools/sync-kb.js:32-39`). In CI, `lint.yml:64-68` checks out that repository's **default branch with no `ref:`
pin** and fails if the bundled copies differ (`lint.yml:74-76`).

This is a drift detector, not a provenance record. Neither the script nor the bundled files record which KB commit
they were copied from; `tools/sync-kb.js:100` logs only the local path. The KB repository has the same owner, so
the trust boundary is unchanged. See SC-06.

---

## Findings

| ID | Severity | File:Line | Finding | Recommendation |
|----|----------|-----------|---------|----------------|
| SC-01 | MEDIUM | `sbom.json:3,7,23-34,47,50` | SBOM is stale and hand-authored. It shows version 1.0.1 (current 1.4.0), license MIT (current CC0-1.0), timestamp 2026-03-30, and `components: []`. It omits the 6 installed tooling packages and the 3 runtime CDN dependencies. A compliance toolkit that publishes an inaccurate SBOM undercuts its own EU AI Act Art. 25 / NIST SSDF PS.3.2 evidence. | Regenerate with `npx @cyclonedx/cyclonedx-npm --prefix tooling` (dev scope marked `excluded`), add the CDN libraries as components, and add a CI check that `sbom.json` version equals `package.json` version. |
| SC-02 | MEDIUM | `AI-Regulations-World-Map.html:45-46,210`; `docs/world-map.html:45-46,210`; `skills/ai-compliance/references/regulations/AI-Regulations-World-Map.html:45-46,210` | d3 7.9.0 and topojson 3.0.2 load from cdnjs **without `integrity`/`crossorigin` (SRI)**. Topology data loads from jsDelivr at floating major `world-atlas@2`. A CDN or package-publisher compromise executes script in the viewer's browser (including the GitHub Pages site). The scripts were present but missed at 1586ec7. Exposure widened in range because a third copy now ships inside the skill package. Claude Security rejected this as "no attacker-controlled source"; under the supply-chain lens, the upstream CDN is the attacker. | Add `integrity="sha512-…" crossorigin="anonymous"` to both scripts, pin `world-atlas@2.0.2`, or vendor all three files into the repo. Apply in the KB repo so `sync-kb` propagates the fix. |
| SC-03 | LOW | `tooling/package.json:6-8` | Caret ranges (`^20.10.0`, `^5.3.3`, `^4.7.0`). **Mitigated:** CI and `npm run setup` both use `npm ci` against a hash-locked lockfile (`lint.yml:43`, `package.json:9`). Residual risk: a contributor running `npm install` in `tooling/` silently floats versions. | Accept, or pin exact versions with `save-exact=true` in `tooling/.npmrc`. |
| SC-04 | LOW | `.github/workflows/lint.yml:46` | `npm audit --audit-level=high` lets moderate advisories in build tooling pass CI. | Lower to `moderate`. The tooling tree is 6 packages, so noise is negligible. |
| SC-05 | LOW | GitHub branch protection for `main` (API); guard at `lint.yml:48-50` | `required_status_checks: null`, `required_pull_request_reviews: null`, `enforce_admins: false`. The zero-dependency guard and the audit gate are advisory: a red Lint run does not block a merge. | Require the `Dependency vulnerability audit`, `JavaScript syntax check` and `kb-sync-check` jobs as status checks on `main`. |
| SC-06 | LOW | `.github/workflows/lint.yml:64-68`; `tools/sync-kb.js:22,100` | KB checkout is unpinned (default branch HEAD), and the bundled regulation corpus records no source commit. You cannot tell which KB revision a release shipped. | Record the KB commit SHA (`git -C <from> rev-parse HEAD`) into a `references/KB-SOURCE` file on sync, and check it out by that SHA in CI. |
| SC-07 | LOW | `.github/` (no `dependabot.yml`); repo setting `dependabot_security_updates: disabled` | Nothing automates updates for `tooling/` npm packages or the SHA-pinned actions. SHA pins will age silently. | Add `.github/dependabot.yml` with `npm` (`directory: /tooling`) and `github-actions` ecosystems, and enable Dependabot security updates. |
| SC-08 | LOW | `.github/workflows/lint.yml` (whole file); tag `v1.4.0` | No build provenance or release attestation, which makes the build track SLSA L0. Carried forward from 1586ec7 INFO 2. | Add `actions/attest-build-provenance` on `v*` tags (see SLSA path). |
| SC-09 | LOW | `.github/workflows/lint.yml:12-76` | The 157-test suite (`package.json:24`) never runs in CI. This includes the zero-dependency regression test (`tests/doc-claims.test.js:97-105`). Build integrity rests on local runs. | Add an `npm test` step (no install needed; tests use built-ins only). |
| SC-10 | LOW | `tools/data/llm-registry.json:4`; `tools/data/llm-registry-meta.json:15` | The model-supply-chain data source is 7 months stale (lastUpdated 2026-03-15). Entries have no per-model source citation or retrieval date. A spot-check value looks wrong (Llama 3.1 cutoff `2024-12` vs Meta's model card, December 2023). These values autofill compliance evidence (Templates 05, 23). | Add `sourceUrl` and `retrievedAt` per model, verify cutoffs against model cards, and show `lastUpdated` in the llm-selector UI. |
| SC-11 | INFO | `package.json:28-30` | `engines.node: ">=18.0.0"` admits Node 18, which reached end of life in April 2025. CI is pinned to 22.18.0, which resolves the reproducibility half of 1586ec7 INFO 3. | Raise the floor to `>=20`. |
| SC-12 | INFO | `tooling/package-lock.json:466-470,508-513` | `esbuild` and `fsevents` declare install scripts. Both are neutralized by `--ignore-scripts` (`lint.yml:43`, `package.json:9`), and `npm run validate` passes without them, so nothing relies on them. | None. This is a positive control. |
| SC-13 | INFO | `tooling/package-lock.json` (all 32 entries) | Positive: 32/32 `sha512` integrity, 100% `registry.npmjs.org`, `npm audit signatures` with 6/6 signatures verified and 3 attestations verified (esbuild, @esbuild/win32-x64, tsx). | None. |

---

## Risk Matrix

| Severity \ Likelihood | Likely | Possible | Unlikely |
|-----------------------|--------|----------|----------|
| **Critical** | — | — | — |
| **High** | — | — | — |
| **Medium** | SC-01 (certain: inaccurate today) | — | SC-02 (needs CDN/publisher compromise) |
| **Low** | SC-09, SC-10 | SC-04, SC-05, SC-06, SC-07 | SC-03, SC-08 |
| **Info** | — | SC-11 | SC-12, SC-13 |

---

## Framework Compliance

| Framework | Control | Status | Findings |
|-----------|---------|--------|----------|
| NIST SP 800-218 / 218A (SSDF) | PO.3.2 toolchain security | PASS | Pinned actions, `npm ci --ignore-scripts`, pinned Node |
| NIST SP 800-218 / 218A | PS.1.1 protect code from tampering | PASS | Required signed commits, no force-push, secret scanning + push protection enabled |
| NIST SP 800-218 / 218A | PS.2.1 integrity verification for releases | FAIL | SC-08 |
| NIST SP 800-218 / 218A | PS.3.2 SBOM per release | FAIL | SC-01 |
| NIST SP 800-218 / 218A | PW.4.1 vet third-party components | PARTIAL | SC-02, SC-04, SC-07 |
| EU AI Act Art. 25 / Art. 11 + Annex IV | Third-party component and value-chain documentation | PARTIAL | SC-01, SC-10 |
| OpenSSF Scorecard | Pinned-Dependencies | PARTIAL | Actions and lockfile pinned; CDN scripts not (SC-02) |
| OpenSSF Scorecard | Token-Permissions | PASS | `lint.yml:3-4` |
| OpenSSF Scorecard | Branch-Protection | PARTIAL | SC-05 |
| OpenSSF Scorecard | Dependency-Update-Tool | FAIL | SC-07 |
| OpenSSF Scorecard | Signed-Releases | FAIL | SC-08 |
| OpenSSF Scorecard | Code-Review | FAIL | SC-05 (reviews not required) |
| OpenSSF Scorecard | Dangerous-Workflow | PASS | No `pull_request_target`, no untrusted interpolation |
| CISA Secure Software Dev Attestation | Provenance / SBOM | FAIL | SC-01, SC-08 |
| ISO/IEC 42001 | A.10.3 suppliers / A.7.5 data provenance | PARTIAL | SC-06, SC-10 |
| ENISA 2025 supply-chain guidance | Supplier and component integrity | PARTIAL | SC-02 |
| SLSA v1.0 | Build track | L0 | SC-08 |
| SLSA v1.0 | Source integrity (signed and protected) | MET | Branch protection API |

---

## Delta vs 1586ec7 (2026-03-29)

| Area | 1586ec7 | HEAD (3e0afa9 / 304715e) | Direction |
|------|---------|--------------------------|-----------|
| Root npm deps | 0 | 0 (3 devDeps existed May–Oct, now removed and guarded) | = (guard added ▲) |
| Build tooling | none | `tooling/`: 3 direct, 32 locked, 6 installed on win32 | new, well-controlled |
| Lockfile | none | Root lock (consistent, empty); tooling lock (sha512, npmjs-only) | ▲ |
| Registry signature verification | n/a | 6/6 verified, 3 attestations | ▲ |
| `npm audit` | n/a | root 0, tooling 0 | = |
| CI permissions | no `permissions:` block | `contents: read` | ▲ |
| CI trigger branch | `master` | `main` | ▲ (CI now runs on the default branch) |
| CI Node version | `'20'` floating | `22.18.0` | ▲ |
| CI jobs | syntax check | + dependency audit, zero-dep guard, validate, KB drift check | ▲ |
| CI unit tests | none | none | = (SC-09) |
| Action pinning | SHA | SHA | = |
| Branch protection | not assessed | signed commits, no force-push; no required checks or reviews | assessed (SC-05) |
| SBOM | none ("recommend generating") | present but stale and incomplete | ▲ then ▼ (SC-01) |
| CDN scripts without SRI | present, **not reported** | present in 3 copies, 1 shipped in skill | ▼ exposure (SC-02) |
| Extractor subprocess hygiene | `execSync` shell | `execFileSync` + isolated npm config | ▲ |
| Plugin cache payload | ~2.6 MB | ~2.6 MB (40 MB `node_modules` regression from v1.1.0 fixed) | = |
| License | MIT | CC0-1.0 | changed (SBOM not updated, SC-01) |
| LLM registry | lastUpdated 2026-03-15 | unchanged | ▼ ageing (SC-10) |
| SLSA rating | "1+" | L0 build / source protected | corrected, not regressed |

### Corrections to the 1586ec7 report
1. "No external APIs called" was wrong. `AI-Regulations-World-Map.html` already loaded cdnjs and jsDelivr
   resources at 1586ec7 (lines 45-46 and 210 are unchanged).
2. "SLSA Level 1+" overstated the build level. SLSA v1.0 L1 requires provenance, and none existed.

---

## ToS & Legal Compliance (Phase 1) — carry-forward with update

The external touchpoints are unchanged from 1586ec7, with two additions:
- **cdnjs / jsDelivr (public CDNs):** permitted use for loading open-source libraries; integrity issue only (SC-02).
- **GitHub checkout of `ai-regulatory-knowledge-base` in CI:** same owner, public repository, read-only token.

There are still no AI platform API calls, no scraping and no authentication bypass.

**Overall ToS Assessment: CLEAN.**

---

## Verdict

**PASS.** There are no Critical or High findings. Commit 3e0afa9 removes the build-tooling payload from the plugin
supply chain, puts it behind a hash-locked, signature-verified, script-free install, and guards against
regression. The two Medium items, the stale SBOM (SC-01) and the CDN scripts without SRI (SC-02), should be fixed
before the next tagged release. SC-05 (required status checks) is the cheapest change with the most effect,
because it makes the new zero-dependency guard binding.

**SLSA Build Level: L0** (L1 prerequisites met except provenance; source track protected by required signatures and no force-push).

---

_Report generated by post-commit-audit skill (supply-chain-security / supply-chain-auditor) — 2026-10-11_
