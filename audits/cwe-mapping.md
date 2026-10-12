# CWE Mapping & Compliance Framework Report
## LLMComplianceSkill — AI Compliance Evidence Collection Kit

**Report Date**: 2026-10-12
**Auditor**: Post-Commit Audit Skill (Claude Opus 5.5)
**Commit**: e368913 (branch fix/extractor-hostile-repo-and-evidence; fixes over main @ 304715e)
**Audit Type**: POST-FIX re-map after three fix rounds
**Inputs**: audits/sast-dast-scan.md (independent rounds 1–2, self-verified round-3 addendum), audits/supply-chain-audit.md

---

## Executive Summary

**Verdict: PASS.** No CRITICAL, HIGH or MEDIUM CWE is open in the code. What remains is LOW
repository-settings and process items, plus three INFO items (one by design).

| Severity | 304715e (pre-fix) | 2acfc1e (round 1) | c6afa61 (round 2) | e368913 (round 3, self-verified) |
|----------|---------|---------|---------|---------|
| HIGH | 1 | 0 | 0 | **0** |
| MEDIUM | 3 | 3 | 1 | **0** |
| LOW | 9 | 11 | 8 | **6** (all supply-chain/process) |
| INFO | 11 | 11 | 10 | **5** |

**Verification caveat:** rounds 1 and 2 were independently re-audited by an agent told to break the
fixes. Round 3 (the `git-sandbox.js` redesign and the commit-review fixes) is verified only by
failing-first tests, because the independent round-3 agent stopped before testing. Get an
independent break-it pass on `git-sandbox.js` before the next release.

---

## Fixed Across the Three Rounds

| CWE | Finding | Fixed in | How it is verified |
|-----|---------|----------|--------------------|
| CWE-829 / 94 | HIGH-01 pip-audit installed scanned requirements | 9cd7272, b439721 | Live exploit before the fix; 16 hostile variants (independent); pip-audit now only sees a file of `name==version` lines the extractor writes |
| CWE-427 | MEDIUM-01 bare `git` lookup | 9cd7272 | Planted `git.exe` test (independent) |
| CWE-73 / 200 | MEDIUM-02 repo config → include / UNC → NTLM leak | 3650b33 (part), 62c0791, e368913 | git never reads the repo config (`git-sandbox.js`); network gitdir/commondir in 5 spellings, links at any path component, object-store symlinks, alternates and subdirectories are all refused; tests |
| CWE-345 | LOW-03 repo vouches for its own signatures | 3650b33 | Test (RED 1 → GREEN 0) |
| CWE-754 | Fail-open revocation | 2acfc1e | Test |
| CWE-754 | INFO-06/07/08 evidence always empty/0/skipped | 9cd7272 | Tests on the evidence values |
| CWE-754 | LOW-04 / LOW-06 / INFO-12 pip audit reported clean while auditing nothing | b439721, 62c0791 | `auditsRun` / `auditGaps`; depth, pyproject, Pipfile and hash-pinned tests |
| CWE-15 | LOW-05 Volta key picks the toolchain | b439721 | `sanitizeManifest` test |
| CWE-1333 | LOW-02, INFO-01 quadratic regexes | b439721 | Timing tests (60k headers: ~3 s → ~10 ms) |
| CWE-353 / 79 | SC-02 / INFO-03 CDN without SRI; `innerHTML` | 9073c9a | Hashes recomputed and checked against the cdnjs API (independent); SBOM reads them from the HTML |
| CWE-1321 | INFO-04 prototype pollution | 9073c9a | vm-context test |
| CWE-22 / 59 | INFO-05 `--locale`; INFO-11/14 symlink escapes | 9073c9a, b439721, e368913 | Tests incl. an fs spy past the link |
| CWE-532 | Credentials in `auditGaps` | 62c0791, e368913 | Redact before truncating; tests for long and `@`-containing passwords |
| CWE-1104 | SC-01 stale SBOM; SC-16 SBOM/HTML drift | c6afa61, 62c0791 | Generated SBOM, `sbom:check` in CI |
| CWE-693 | SC-04 audit level; SC-09 tests not in CI | c6afa61 | `lint.yml` |
| CWE-1395 | SC-07 (part) Dependabot config | c6afa61 | `dependabot.yml` |

---

## Open CWE Mapping

| CWE | Finding | Sev. | Closes when | OWASP 2021 | NIST 800-53 | EU AI Act | ISO 27001:2022 | SOC 2 |
|-----|---------|------|-------------|------------|-------------|-----------|----------------|-------|
| CWE-693 | SC-05 no required status checks on `main` | LOW | Owner-approved setting applied after merge | A05 | CM-3 | Art. 17 | A.8.32 | CC8.1 |
| CWE-1395 | SC-07 Dependabot security updates off | LOW | Owner-approved setting applied after merge | A06 | RA-5, SI-2 | Art. 15 | A.8.8 | CC7.1 |
| CWE-494 | SC-06 CI does not pin the KB commit | LOW | First real sync writes `KB-SOURCE` | A08 | SI-7 | Art. 10 | A.8.30 | CC6.8 |
| CWE-345 | SC-08 provenance configured but never run | LOW | First `v*` tag | A08 | SR-4(3) | Art. 15 | A.5.21 | CC9.2 |
| CWE-1104 | SC-10 LLM registry not refreshed (`lastUpdated` 2026-03-15) | LOW | Registry refresh with per-model sources | A06 | CM-8 | Art. 11 | A.5.9 | CC3.2 |
| CWE-353 | SC-14 / INFO-15 upstream KB map lacks SRI; `sync-kb` would revert it | LOW | Upstream KB change merges (prepared locally) | A08 | SI-7(6) | Art. 15 | A.8.30 | CC6.8 |
| CWE-754 | INFO-10 Volta `npm-cli.js` layout missed | INFO | — | A04 | SI-11 | Art. 13 | A.8.15 | CC7.2 |
| CWE-359 | INFO-02 author emails in evidence | INFO | By design (handling note) | A02 | PT-2 | Art. 10(5) | A.5.34 | P4.1 |

---

## Aggregate Compliance Matrix

| Framework | 304715e | e368913 | Remaining gap |
|-----------|---------|---------|---------------|
| OWASP Top 10 2021 | GAP | **MET for code** | A05/A08 process items (SC-05, SC-14) |
| OWASP LLM Top 10 2025 | GAP (LLM03, LLM09) | **MET** | — |
| NIST SP 800-53 r5 | GAP (SI-7) | PARTIAL | CM-3 required checks |
| NIST SP 800-218A | PARTIAL | PARTIAL | PS.3 provenance not exercised yet |
| EU AI Act | PARTIAL | PARTIAL | Art. 17 QMS (required checks); Art. 11 registry freshness |
| ISO/IEC 27001:2022 | PARTIAL | PARTIAL | A.8.32 change management |
| SOC 2 | PARTIAL | PARTIAL | CC8.1 change management |
| MITRE ATT&CK | GAP (T1195.001, T1059.006, T1187) | **MET** | — |

---

## Lessons Recorded

1. **Pair every security test with an evidence test.** Each hardening step in this project's history
   broke the evidence it produces until tests checked both directions.
2. **Don't parse what the consumer parses.** The text guard on `.git/config` was bypassed six ways.
   Removing git's access to the untrusted config closed the whole class.
3. **Use more than one reviewer.** Independent agents, the automated commit review and failing-first
   tests each caught defects the others missed, including defects introduced by the fixes themselves.
