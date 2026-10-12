# SAST/DAST Security Scan Report
## LLMComplianceSkill — AI Compliance Evidence Collection Kit

**Report Date**: 2026-10-12
**Auditor**: Post-Commit Audit Skill (Claude Opus 5.5) — independent re-audit
**Commit**: c6afa61
**Branch**: fix/extractor-hostile-repo-and-evidence
**Version**: 1.4.0
**Audit Type**: POST-FIX re-audit round 2 (b439721, 9073c9a, c6afa61 over 13ff5a3)

---

> ### Addendum: round 3 at e368913 (62c0791, e368913) — SELF-VERIFIED
>
> **Not an independent re-audit.** An independent round-3 agent was started on 62c0791 but stopped
> before running any probe, so it produced no verdict. Everything below was verified by the author
> with failing-first tests (each test fails without its fix and passes with it). An independent
> break-it pass on `git-sandbox.js` is recommended before release.
>
> **Design change for MEDIUM-02.** The text guard (`git-config-guard.js`) is deleted. Its six bypasses
> (G1–G6 below) showed that a checker cannot match git's config parser. `git-sandbox.js` instead runs git
> with a private `GIT_DIR` holding a config the extractor writes, plus copies of HEAD/refs/packed-refs/shallow,
> and points `GIT_OBJECT_DIRECTORY`, `GIT_INDEX_FILE` and `GIT_WORK_TREE` at the repository. git never
> reads the repository's config, so includes, quoting and size tricks no longer matter. git-evidence,
> package-evidence and sync-kb all use it, and `git()` refuses to run without it.
>
> | Item | Status at e368913 | Evidence |
> |------|-------------------|----------|
> | MEDIUM-02 G1 (>1 MiB config), G3 (quoting/continuation), G4 (one-line headers) | **FIXED (moot)** | Repo config never read: test `git reads neither the repo config nor its includes` |
> | MEDIUM-02 G2 (mixed-slash UNC in gitdir/commondir) | **FIXED** | `isNetworkPath` resolves with `path.win32.resolve`; test covers 5 spellings |
> | MEDIUM-02 G5 (subdirectory / bare repo) | **FIXED** | Refused: no `.git` at the given path; unit and end-to-end tests |
> | MEDIUM-02 G6 (`objects/info/alternates`) | **FIXED** | Refused; test |
> | Review of 62c0791: symlinks deep in the object store | **FIXED** (e368913) | Whole store walked; test `a symlinked loose object is refused` |
> | Review of 62c0791: gitdir/commondir through an intermediate link to a share | **FIXED** (e368913) | `linksToNetwork()` lstat-walks components and link chains; test |
> | Review of 62c0791: credentials leaked by truncate-then-redact; '@' in passwords | **FIXED** (e368913) | Redact first, match to last '@'; test |
> | Review of 62c0791: `-r` include through an intermediate link | **FIXED** (e368913) | `isRepoFile` uses `linksToNetwork`; test spies on fs calls past the link |
> | LOW-04 depth cap drops pins silently | **FIXED** | Gap `include nesting too deep`; test |
> | LOW-06 pyproject/Pipfile unaudited with requirements.txt | **FIXED** | pyproject pins audited, ranges/Pipfile/Poetry recorded as gaps; test |
> | INFO-12 hash-pinned requirements never audited | **FIXED** | Continuations joined, `--hash` stripped; test |
> | INFO-13 sync-kb git lacks hardening | **FIXED** | sync-kb runs git in the sandbox |
> | INFO-14 containment checks follow symlinks first | **FIXED** | `linksToNetwork` before `realpath` |
> | INFO-15 world-map fix only downstream | **OPEN** until the upstream KB change merges (prepared, not pushed; with it `sync-kb --check` reports 0 changed) |
> | INFO-10 Volta `npm-cli.js` layout | **OPEN** (INFO) |
> | INFO-02 PII in evidence JSON | **OPEN** (by design; handling note) |
>
> | Review of e368913 / fb24e28: `..` handling did not match Windows (a missing component before `..` failed open) | **FIXED** (follow-up commit on PR #24) | Windows collapses `..` textually and resolves relative link targets against the link's parent; `linksToNetwork` now does the same, and lstat errors other than ENOENT/ENOTDIR fail closed; test `a missing component followed by ".." cannot hide a network link` |
> | Review of e368913: NT-style link targets (`\\?\UNC`, `GLOBALROOT`, `\??\`, root-relative) not seen as remote | **FIXED** (fb24e28) | Only relative or drive-letter targets are followed; test creates links with `mklink` |
>
> Suite after the follow-up commit: **237/237 pass** with pip-audit on PATH.
>
> **Counts at fb24e28 (self-verified): Critical 0, High 0, Medium 0, Low 0, Info 3. Verdict: PASS.**

---

## Executive Summary

Three commits claim to close every finding still open at 2acfc1e:
- b439721 covers the extractors: MEDIUM-02, LOW-02, LOW-04, LOW-05, INFO-01, INFO-09, INFO-10 and INFO-11.
- 9073c9a covers the HTML files and autofill: INFO-03, INFO-04 and INFO-05.
- c6afa61 covers the supply chain (see `supply-chain-audit.md`).

This re-audit set out to break each fix, not to confirm it.

Results:
- **Fixed and holding up under probing:** LOW-02, LOW-05, INFO-01, INFO-03, INFO-04, INFO-05, INFO-09 and INFO-11.
- **MEDIUM-02 is PARTIALLY FIXED and stays MEDIUM.** The new `git-config-guard.js` catches the plain
  forms: `[include]`, `[includeIf]`, and values starting with `//` or `\\`. It can still be bypassed in at
  least six ways:
  - It **fails open** on a config file larger than 1 MiB.
  - It does not recognize mixed-separator UNC prefixes (`/\host`, `\/host`) or git quote-splitting
    (`""//host`).
  - It never inspects the config of a bare repository or of a parent repository that git finds by walking up.
  - It does not inspect `objects/info/alternates`.
- **LOW-04 is PARTIALLY FIXED.** Pins in a `-r` chain deeper than five levels are dropped silently, and the
  evidence still reports `auditsRun: ["pip"]` with no gaps. This was reproduced end to end.
- **INFO-10 is PARTIALLY FIXED.** `resolveBinary('git.exe')` now works, but `resolveNpm` still misses the
  Volta image layout.

New findings:
- **LOW-06:** `pyproject.toml` and `Pipfile` dependencies go unaudited, with no gap recorded, whenever a
  `requirements.txt` exists. Reproduced.
- **INFO-12:** hash-pinned (`pip-compile --generate-hashes`) requirements are never audited. This fails closed.
- **INFO-13:** `sync-kb.js` git hardening is incomplete.
- **INFO-14:** the guard and the requirements reader follow symlinks before checking them.
- **INFO-15:** the world-map fixes are not in the upstream knowledge base, so the next `sync-kb` run reverts
  them. CI's `kb-sync-check` job already fails because of this.

| Severity | Prior (2acfc1e) | This Audit (c6afa61) | Delta |
|----------|-----------------|----------------------|-------|
| Critical | 0 | 0 | — |
| High     | 0 | 0 | — |
| Medium   | 1 | 1 | 0 (MEDIUM-02 partial, still open) |
| Low      | 3 | 2 | −1 (LOW-02, LOW-05 fixed; LOW-04 partial; new LOW-06) |
| Info     | 8 | 6 | −2 (INFO-01/03/04/05/09/11 fixed; INFO-10 partial; new INFO-12/13/14/15) |
| **Total**| **12** | **9** | **−3** |

The prior Low count of 3 means LOW-02, LOW-04 and LOW-05; LOW-03 was fixed in 3650b33. The prior Info count of 8
means INFO-01, 02, 03, 04, 05, 09, 10 and 11.

### Prior-finding status

| ID | Prior severity | Status at c6afa61 |
|---|---|---|
| MEDIUM-02 repo config makes git open repo-chosen / UNC paths (CWE-73) | MEDIUM | **PARTIALLY FIXED — still MEDIUM** (guard bypasses below) |
| LOW-02 quadratic YAML comment regex (CWE-1333) | LOW | **FIXED** (`ci-evidence.js:74-86`, linear `indexOf` scan) |
| LOW-03 repo-local allowedSignersFile forges `signedCommits` | LOW | FIXED earlier (3650b33 / 2acfc1e); not re-tested this round |
| LOW-04 pip-audit claims clean audit with hidden pins (CWE-754) | LOW | **PARTIALLY FIXED — still LOW** (depth cap drops pins silently) |
| LOW-05 Volta shim chooses toolchain via package.json (CWE-15) | LOW | **FIXED** (`sanitizeManifest`, `package-evidence.js:267-285`) |
| INFO-01 pyproject regex ReDoS (CWE-1333) | INFO | **FIXED** (`parsePyprojectDependencies`, single pass) |
| INFO-02 PII in evidence JSON (CWE-359) | INFO | **OPEN** (by design; handling note) |
| INFO-03 world-map `innerHTML` + no SRI (CWE-79/353) | INFO | **FIXED in this repo** (SRI independently recomputed; see INFO-15 for revert risk) |
| INFO-04 prototype pollution sink, content-labeling (CWE-1321) | INFO | **FIXED** (`content-labeling.html:164-186`) |
| INFO-05 `autofill.js --locale` unvalidated (CWE-22) | INFO | **FIXED** (`autofill.js:698-704`, regex + allow-list) |
| INFO-09 `HASH_RE` rejects SHA-256 ids | INFO | **FIXED** (`git-evidence.js:81`) |
| INFO-10 binary-resolution residue | INFO | **PARTIALLY FIXED** (extension names fixed; Volta `npm-cli.js` layout still missed) |
| INFO-11 requirements symlink read outside repo (CWE-59) | INFO | **FIXED** (`isRepoFile` gate; see INFO-14 for the stat-before-check residue) |

**Overall Result: PASS** (zero CRITICAL/HIGH; see Verdict for the conditions).

Baseline facts:
- `npm test` without pip-audit on PATH: **219 tests, 217 pass, 0 fail, 2 skipped**.
- `npm test` with `D:\tmp\pip-audit-venv\Scripts` prepended to PATH: **219 tests, 219 pass, 0 fail, 0 skipped**.
- Environment: Node v24.15.0 (Volta), git 2.55.0.windows.5, pip-audit 2.10.1, Windows 11.

---

## Scope and Method

Reviewed:
- `git show` of b439721, 9073c9a and c6afa61 in full.
- `tools/extractors/git-config-guard.js`, `package-evidence.js`, `git-evidence.js`, `ci-evidence.js` and
  `resolve-binary.js`.
- `tools/autofill.js`, `tools/sync-kb.js` and `tools/generate-sbom.js`.
- The three world-map copies and `tools/interactive/content-labeling.html`.

Dynamic work was done only in the session scratchpad:
- Crafted requirements trees were run through `collectPinnedRequirements` and through the full
  `package-evidence.js` with pip-audit 2.10.1. pip-audit contacted only PyPI/OSV.
- An npm-audit workspace probe was run.
- The three CDN assets were downloaded into a new empty directory and hashed, never executed.
- The upstream knowledge-base world map was fetched for comparison.
- `sync-kb.js --check` was run against a fake knowledge base.

**Not tested dynamically:** the git-config-guard bypasses. They were established by code reading and by
string-level checks of the guard's own `isUncPath` classifier and Node's `path.win32.resolve`. No probe made git
or Windows open a UNC path in this round. Severity reflects that each bypass follows from documented git or
Windows path semantics, not from an observed SMB connection.

No code in the repository was modified.

---

## Verification of Fixes

### MEDIUM-02 — PARTIALLY FIXED (still MEDIUM)

`checkRepoGitConfig` (`git-config-guard.js:77-99`) runs before the first git call in `git-evidence.js:1071-1078`
(exit 2) and before `isGitTracked` in `package-evidence.js` (`lockFileCommitted: null`). The plain cases are
refused:
- `[include]`, `[ include ]`, `[INCLUDE]` and `[includeIf "…"]` headers at the start of a line, including with
  leading whitespace or a BOM. JS `\s` matches U+FEFF.
- `key = //host/…`, `key = \\host\…`, `"\\\\host\\…"` and `\\?\UNC\…` values.
- A `.git` symlink, which `lstat` reports as neither a file nor a directory.
- A UNC `gitdir:` or `commondir` written in those same forms.

Remaining bypasses, each of which lets git read config or object paths the guard never approved:

| # | Bypass | Where | Basis |
|---|---|---|---|
| G1 | **Fail-open on size**: `readSmall` returns `null` for any file over 1 MiB, and the loop `continue`s. A 1 MiB+ `.git/config` that is mostly comments, with an `[include]` anywhere in it, is reported `ok: true`. git reads it normally. | `git-config-guard.js:35`, `:84-85` | code reading |
| G2 | **Mixed-separator UNC**: `UNC_RE` matches only `\\` and `//`. Windows and Git for Windows treat any two leading separators as UNC. The guard returns `false` for `/\srv\share` and `\/srv/share`, and `path.win32.resolve` turns both into `\\srv\share\`. This applies to config values, the `.git` file's `gitdir:` and `commondir`. For `gitdir:`/`commondir`, the guard then calls `statSync` on the resolved UNC path itself (`readSmall`). | `git-config-guard.js:24`, `:55-56`, `:65-67` | string-level test (output below) |
| G3 | **git value quoting and continuation**: git concatenates quoted and unquoted parts and joins a value that ends in `\` with the next line. `path = ""//srv/share` and `path = "/"/srv/share` both yield `//srv/share`, but the guard sees a leading `"` followed by `"` or `/` and returns `false`. A value continued onto the next line is never tested, because only text after the first `=` on the *same* line is checked. | `git-config-guard.js:92-93` | string-level test; git config grammar |
| G4 | **Header position**: `INCLUDE_RE` is anchored to the start of the line. git's parser accepts another section header immediately after `]` on the same line (`[core][include] path = …`). The UNC test uses the first `=` on the line, so a subsection that contains `=` (`[x "="][include] path = //srv/s`) hides the value too. | `git-config-guard.js:25`, `:89-93` | code reading against git's `config.c` grammar; not executed |
| G5 | **Wrong repository inspected**: the guard looks only at `<repo>/.git`. If `--repo` is a **bare repository** (its `config` sits directly in the directory), or a **subdirectory of a repository** (git walks up to the parent's `.git`), the guard returns `ok: true` (`:80`). git then reads an unchecked config. `-C <repo>` is used with no `GIT_CEILING_DIRECTORIES` and no `--git-dir`. | `git-config-guard.js:46-50`, `:80`; `git-evidence.js:194` | code reading; git discovery semantics |
| G6 | **Non-config path files**: `objects/info/alternates` lists extra object directories, including UNC paths, and git opens them on every object read (`log`, `diff-tree`). The guard does not read it. | `git-config-guard.js:59-70` | code reading; gitrepository-layout(5) |

String-level evidence for G2/G3 (guard classifier vs. Windows normalization):
```
mixedA       guard says UNC: false  win32.resolve -> \\srv\share\
mixedB       guard says UNC: false  win32.resolve -> \\srv\share\
quotedEmpty  guard says UNC: false  win32.resolve -> \\srv\share\
quotedSplit  guard says UNC: false  win32.resolve -> \\srv\share\
plainFwd     guard says UNC: true   win32.resolve -> \\srv\share\
plainBack    guard says UNC: true   win32.resolve -> \\srv\share\
```

Mailmap, the gpg trust files and the signing programs stay pinned by `GIT_HARDENING` and
`getSigningOverrides`, so the only remaining vectors are the ones above. None of these keys is overridden by
`-c`: `core.worktree`, `core.attributesFile`, `core.excludesFile` and include files. Any of them reached through
G1–G5 is opened by git.

**Remediation**:
1. Fail closed when the config cannot be read for any reason (size, permissions, encoding).
2. Stop classifying values by pattern. Run git against a clean private config instead:
   - Copy `HEAD`, `refs/`, `packed-refs` and `objects/` (without `info/alternates`) into a temp git dir, write
     a minimal `config`, and pass `--git-dir`/`--work-tree` explicitly.
   - Or set `GIT_CONFIG_NOSYSTEM=1`, `GIT_CONFIG_GLOBAL=<operator file>` and `GIT_CEILING_DIRECTORIES`, and
     refuse whenever `git rev-parse --git-dir` (run with that environment and `--no-includes`-style text
     parsing) is not `<repo>/.git`.
3. If pattern-matching is kept:
   - Treat any value whose first two characters, after removing quotes, are both in `[\\/]` as UNC.
   - Join continuation lines before testing.
   - Search for `include` section headers anywhere on a line.
   - Refuse a non-empty `objects/info/alternates`.
   - Refuse bare repositories and paths whose git dir is not `<repo>/.git`.
4. Add a hostile-repo test for each of G1–G6.

### LOW-04 — PARTIALLY FIXED (still LOW)

pip-audit now sees only `name==version` lines that the extractor writes into a private temp dir
(`package-evidence.js:1114-1172`). Lines that cannot be audited become `auditGaps`, and `auditsRun` says
`pip-partial`. Probes of `collectPinnedRequirements` with pip-audit 2.10.1:

| Case | pinned | gaps | Verdict |
|---|---|---|---|
| clean: `requests==2.31.0`, `flask==3.0.0 ; marker` | both | none | correct; end to end `auditsRun:["pip"]`, 8 moderate, no gaps |
| `--requirement=sub/x.txt` | requests | none | include followed, correct |
| include loop a↔requirements | requests once | none | terminates, correct |
| `-r ../outside.txt` | — | include outside repository | fails closed |
| `-r nothere.txt` | — | gap | fails closed |
| `-rsub.txt` (no space) | — | option | fails closed (under-audits) |
| `requests==2.*`, `requests==${VER}`, `requests==\`+newline | — | not pinned | fails closed |
| `requests[socks]==2.31.0`, tab separators | pinned | none | correct |
| 20 MB file of junk lines | — | 100,000 gaps, 307 ms | no hang (see note) |
| **6-level `-r` chain ending in `requests==2.31.0`** | **—** | **none** | **fails open** |

**Fail-open reproduction**:
- `requirements.txt` = `idna==3.10` + `-r r1.txt`, with `r1.txt` → `r2.txt` → … → `r6.txt` = `requests==2.31.0`.
- The full extractor reports `moderate: 2, auditsRun: ["pip"], auditGaps: []`.
- The control (`idna==3.10` + `requests==2.31.0`) reports `moderate: 8`.

Six advisories are hidden and the evidence claims a complete audit. Cause:
`if (seen[real] || depth > 5) return;` (`package-evidence.js:1069`) returns without recording a gap.

Notes:
- The 20 MB case writes every invalid line into `auditGaps`, at up to 100 characters each, so the evidence JSON
  grows with the input. Consider capping the gap count.
- `readText` has no size cap.

**Remediation**: record a gap (`include depth limit`) when `depth > 5`, and test that.

### LOW-02 / INFO-01 — FIXED

- `stripYamlComments` (`ci-evidence.js:74-86`) is an `indexOf` scan, linear even for long whitespace runs.
- `parsePyprojectDependencies` is a single pass. It returns at the first `[project]` `dependencies` array, and
  bracket matching tracks quotes.

### LOW-05 — FIXED

`makeIsolatedDir` writes `sanitizeManifest(package.json)`, which keeps only `name`, `version`, `private`,
`workspaces`, `overrides` and the dependency fields (`package-evidence.js:267-285`). Dropped: `volta`,
`packageManager`, `engines`, `devEngines`, `scripts`, `config`, `publishConfig`.

`workspaces` is the only retained key that names paths. Probe: an isolated dir with
`"workspaces": ["<absolute path outside>/*"]` was run, and the outside package's manifest was then replaced
with invalid JSON. `npm audit --json --loglevel silly` produced no read, error or workspace log line, and the
extractor reported `auditsRun:["npm"]`. With a lockfile, npm audit builds the tree from `package-lock.json` and
does not glob workspaces.

Neither the registry URL nor the binary can be chosen from the manifest. The empty user and global npmrc files
still apply.

### INFO-03 — FIXED in this repository (see INFO-15)

All three copies are byte-identical (md5 `1b072113…`). The assets were downloaded into a fresh empty scratch
dir and hashed. They were not executed.

| Asset | Recomputed | In HTML |
|---|---|---|
| cdnjs d3 7.9.0 `d3.min.js` | `sha512-vc58qvvB…Qi/32A==` | match (also matches the cdnjs API `sri` field) |
| cdnjs topojson 3.0.2 `topojson.min.js` | `sha512-4UKI/XKm…/pO+82iRlg==` | match |
| jsDelivr `world-atlas@2.0.2/countries-110m.json` | `sha384-yOCJ+8Sh…EeZWHf` | match |

The scripts carry `crossorigin="anonymous"`. jsDelivr returns `access-control-allow-origin: *`, so the
`integrity` option passed to `fetch()` through `d3.json` is enforceable. No `innerHTML`, `outerHTML` or
`insertAdjacentHTML` remains. The tooltip is built with `createElement`/`textContent`/`replaceChildren`
(`AI-Regulations-World-Map.html:210-221`).

### INFO-04 — FIXED

`setState` copies only `Object.keys(...)` of plain objects and drops `__proto__`, `constructor` and
`prototype`. A missing `checklist` phase is created only when it is not an own property.

### INFO-05 — FIXED

`--locale` must match `^[a-z]{2}(-[A-Z]{2})?$` **and** appear in `i18n.listLocales()` (`autofill.js:698-704`).
Traversal values cannot pass both checks.

### INFO-09 — FIXED

`HASH_RE = /^[0-9a-f]{7,64}$/i`. It still cannot begin with `-`, so the argv gate holds.

### INFO-10 — PARTIALLY FIXED

`resolveBinary('git.exe')` now resolves (`resolve-binary.js:26-29`). The other half is still open. In a Volta
npm image, `npm-cli.js` sits next to `npm.cmd`, but `resolveNpm` (`package-evidence.js:213-226`) checks only
`bin/node_modules/npm/bin/npm-cli.js` and then the npm bundled with Node, so the operator's chosen npm is
silently replaced.

### INFO-11 — FIXED (residue in INFO-14)

`readReqFile` refuses any file that resolves outside the repo (`isUncPath` on the resolved path, then
`isRepoFile`), including a symlinked top-level `requirements.txt`. `-r` UNC forms (`//`, `\\`, `/\`) are all
caught, because the check runs on the `path.resolve` result.

---

## New Findings

### [LOW-06] `pyproject.toml` / `Pipfile` dependencies are unaudited, and no gap is recorded, when `requirements.txt` exists
**CWE**: CWE-754 (evidence fails open)
**File**: `tools/extractors/package-evidence.js:1121-1123`, `:1357`

The "Pipfile and pyproject.toml are not audited" gap is added only when there is **no** `requirements.txt`.

**Reproduction (pip-audit 2.10.1)**: a repo with `requirements.txt` = `idna==3.10`, `pyproject.toml`
`[project] dependencies = ["requests==2.31.0"]` and `Pipfile` `requests = "==2.31.0"` gave
`moderate: 2, auditsRun: ["pip"], auditGaps: []`. The vulnerable `requests` pin is hidden and the evidence
claims a complete pip audit.

**Remediation**: when `pyproject.toml` or `Pipfile` declares dependencies, always add a gap. Better, feed their
exact pins (already parsed by `parsePip`) through the same `PINNED_REQ_RE` path.

### [INFO-12] Hash-pinned requirements (`pip-compile --generate-hashes`) are never audited
**CWE**: CWE-754 (fails closed)
**File**: `package-evidence.js:1029`, `:1071-1092`

`requests==2.31.0 \` followed by `    --hash=sha256:…` produces two gaps: `not pinned` (the trailing `\`) and
`option`. A single-line `requests==2.31.0 --hash=…` is also `not pinned`. The most strictly pinned format is
therefore never audited. The `auditsRun` field stays honest, because it is empty or `pip-partial`.

**Remediation**: join `\`-continued lines, and accept trailing `--hash=` options on a pinned line.

### [INFO-13] `sync-kb.js` git call does not use the extractor hardening
**CWE**: CWE-426 / CWE-73 (latent)
**File**: `tools/sync-kb.js:125-131`

`kbCommit` passes only `core.fsmonitor` and `core.hooksPath`. A knowledge-base checkout whose own config sets
`log.showSignature=true` plus `gpg.program`, or an include or UNC path, would affect `git log -1`. The checkout is
same-owner and CI uses a fresh clone, so this is informational.

**Remediation**: reuse `GIT_HARDENING` and `checkRepoGitConfig`, or add `-c log.showSignature=false`.

### [INFO-14] Containment checks follow symlinks before validating them
**CWE**: CWE-59
**Files**: `git-config-guard.js:33` (`statSync` on `.git/config`, `config.worktree`, commondir targets);
`package-evidence.js:154-157`, `:1017-1020`, `:1063-1068` (`fileExists`/`realpathSync` on `requirements.txt` and `-r` targets)

A symlinked `.git/config` is **not refused**. `statSync` follows it, the guard checks the target's text, and git
then reads the same target. A symlink to a network location is dereferenced by the check itself. On Windows,
creating file symlinks needs Developer Mode or elevation, so the precondition is narrow.

**Remediation**: `lstat` first. Refuse symlinked config files, and refuse requirement files whose link target is
UNC, before calling `realpath`.

### [INFO-15] World-map SRI/`textContent` fix exists only downstream; the next `sync-kb` run reverts it
**CWE**: CWE-353 (regression risk)
**File**: `tools/sync-kb.js:46-48` (the world map is a synced file)

The upstream `justice8096/ai-regulatory-knowledge-base` `visualizations/AI-Regulations-World-Map.html` (fetched
2026-10-12) has 0 `integrity` attributes and 1 `innerHTML`. Running `sync-kb.js --check` against it reports
`differs` for all three copies. As a result:
- CI's `kb-sync-check` job fails on this branch.
- A routine `sync-kb` run would overwrite the fixed copies and restore INFO-03.

The 9073c9a commit message acknowledges this.

**Remediation**: land the same change in the knowledge base before merging. Add a test that every synced world
map carries `integrity=` and contains no `innerHTML`.

### [INFO-02] PII in evidence JSON — OPEN (handling note, unchanged)
Author and committer names and emails remain in the evidence (`git-evidence.js`). Treat outputs as personal data.

---

## Areas Reviewed and Found Clean

- **Pin rendering**: names and versions are limited by `PINNED_REQ_RE` (no spaces, `;`, `@`, `/` or newlines).
  Markers are dropped, and the file pip-audit reads lives in a private `mkdtemp` dir that is removed afterwards.
  pip-audit's cwd is that dir, not the repo.
- **package-evidence `runGit`**: still only `ls-files --error-unmatch -- <rel>`, now gated by the guard. The
  guard's weaknesses (MEDIUM-02) apply here too.
- **New tests**: 52 tests were added across three files. All pass, and 2 skip without pip-audit. None covers G1–G6,
  the depth cap, or LOW-06.
- **Process execution**: no new exec sites except `sync-kb.js` (absolute `git` via `resolveBinary`, argv array,
  no shell, output validated by a strict regex).

---

## DAST Assessment

There are no server components. Browser-facing changes:
- World map: SRI verified, DOM-safe tooltip.
- content-labeling: prototype guard verified.

`tools/interactive/` is otherwise unchanged and clean.

---

## Verdict

**PASS — 0 CRITICAL, 0 HIGH, 1 MEDIUM, 2 LOW, 6 INFO.**

The round closes eight findings outright, and the HTML and supply-chain fixes check out against independently
recomputed hashes. The PASS is conditional:

1. **MEDIUM-02**: the git-config guard is a denylist with at least six bypasses, including a 1 MiB fail-open and a
   bare or parent repository it never inspects. Replace it with a clean private git dir/config, or at least fail
   closed on G1, G2 and G5, before the extractor is run on untrusted repositories on Windows.
2. **LOW-04 residue and LOW-06**: the `auditsRun`/`auditGaps` contract can still claim a complete pip audit
   while pins are hidden. Each needs a one-line gap fix.
3. **INFO-15**: upstream the world-map fix before merging, or CI stays red and the fix is reverted on the next
   sync.

---

_Report generated by post-commit-audit skill (Step 1: SAST/DAST), independent re-audit round 2, 2026-10-12_
