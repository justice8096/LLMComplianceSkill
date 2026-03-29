# SAST/DAST Security Scan Report

**Project:** LLMComplianceSkill
**Scan Date:** 2026-03-29
**Scanner:** Manual SAST/DAST review (LLM-driven)
**Files Scanned:** 5
**Commits Since Last Audit:** 406d908

---

## Before/After Summary

| Severity | Previous Audit | This Audit | Delta |
|----------|---------------|------------|-------|
| CRITICAL | N/A | 0 | — |
| HIGH | N/A | 0 | — |
| MEDIUM | N/A | 1 | — |
| LOW | N/A | 3 | — |
| INFO | N/A | 3 | — |
| **Total** | **N/A** | **7** | **—** |

This is the initial audit for this repository.

---

## Findings

### MEDIUM — Uncontrolled directory creation via --output CLI argument

- **CWE:** CWE-22 (Path Traversal)
- **File:** `tools/extractors/sast-dast-evidence.js:672-674`
- **Description:** The `outputResult` function calls `fs.mkdirSync(outDir, { recursive: true })` where `outDir` is derived from the user-supplied `--output` argument via `path.resolve()`. While `path.resolve()` canonicalizes the path (preventing naive `../` traversal), no validation constrains the output directory to a safe location.
- **Risk context:** Low exploitability — this is a local CLI tool run by the developer. The user who runs the command already has filesystem access. Pattern is consistent with `git-evidence.js` and `package-evidence.js` which use the same approach.
- **Remediation:** Accepted residual risk for a local CLI tool. If exposed via an automated pipeline with untrusted input, add a bounds check: `if (!outputPath.startsWith(expectedBase)) throw new Error('Output path outside allowed directory');`

### LOW — Repo path written into JSON output

- **CWE:** CWE-200 (Information Exposure)
- **File:** `tools/extractors/sast-dast-evidence.js:604-605`
- **Description:** The `_meta.repoPath` field in JSON output contains the absolute filesystem path of the scanned repository. If committed to a public repository, this leaks the developer's local directory structure.
- **Risk context:** Information disclosure only. Same pattern exists in all other extractors by design — repoPath is intentional for evidence traceability.
- **Remediation:** Accepted. Document that extractor output files should not be committed to public repos without sanitization.

### LOW — Unbounded greedy quantifier in regex over trusted input

- **CWE:** CWE-1333 (ReDoS)
- **File:** `tools/extractors/sast-dast-evidence.js:248`
- **Description:** The `findingPattern` regex uses `.+` (greedy, unbounded) in a `g`-flag exec loop. The alternation group uses fixed-length alternatives — no catastrophic backtracking path exists. Input is a locally-generated audit file, not web input.
- **Risk context:** Not exploitable as ReDoS.
- **Remediation:** Accepted. No action required for local CLI use.

### LOW — JSON.parse without error handling in runner

- **CWE:** CWE-20 (Input Validation)
- **File:** `tools/autofill.js:21`, `tools/extract-evidence.js:53`
- **Description:** `loadJSON()` calls `JSON.parse(fs.readFileSync(...))` without a try/catch. A corrupted config file produces an unhelpful stack trace. Robustness issue, not a security vulnerability.
- **Risk context:** No security risk. Affects developer experience only.
- **Remediation:** Accepted. Pre-existing pattern across the codebase.

### INFO — No dynamic code execution in sast-dast-evidence.js (positive finding)

- **CWE:** N/A
- **File:** `tools/extractors/sast-dast-evidence.js` (entire file)
- **Description:** Confirmed — imports only `fs` and `path`. No dynamic code execution patterns, no shell spawning, no dynamic module loading. Audit file paths are hardcoded string literals. Cleanest extractor in the pipeline.
- **Remediation:** None needed.

### INFO — Template 24 has no executable content

- **CWE:** N/A
- **File:** `templates/24-SAST-DAST-Scan.md`
- **Description:** Static markdown only. No embedded scripts, no HTML tags, no injection vectors. Values populated by autofill.js using escaped regex replacement on markdown cells — no injection risk.
- **Remediation:** None needed.

### INFO — jurisdiction-matrix.json changes are data-only

- **CWE:** N/A
- **File:** `tools/data/jurisdiction-matrix.json`
- **Description:** Adds template "24" entries to `templateRequirements` and `templateNames`. Static key-value string literals flowing into markdown table cells via escaped regex replacement.
- **Remediation:** None needed.

---

## Additional Checks

**Hardcoded Secrets:** CLEAN — No API keys, tokens, passwords, or credentials in any of the 5 files.

**Deserialization:** CLEAN — No JSON.parse on network input. sast-dast-evidence.js does not parse JSON at all.

**Race Conditions:** CLEAN — All file operations synchronous. No TOCTOU window.

**Command Injection:** CLEAN — extract-evidence.js uses `execFileSync(process.execPath, args)` with argument array. sast-dast-evidence.js has no child_process usage.

**XSS:** N/A — CLI scripts producing markdown/JSON, no browser context.

---

## DAST Findings

N/A — no web-facing components exposed by this commit.

---

## Overall Assessment

**PASS** — 0 critical, 0 high, 1 medium (accepted residual risk for local CLI tool), 3 low (all accepted). The new sast-dast-evidence.js extractor follows strong security practices: zero external dependencies, no shell spawning, hardcoded audit file paths, synchronous operations only.
