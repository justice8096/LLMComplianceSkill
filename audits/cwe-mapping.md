# CWE Mapping & Compliance Framework Report
## LLMComplianceSkill — AI Compliance Evidence Collection Kit

**Report Date**: 2026-10-11
**Auditor**: Post-Commit Audit Skill (Claude Opus 5.5)
**Commit**: 3650b33 (branch fix/extractor-hostile-repo-and-evidence; fixes over main @ 304715e)
**Audit Type**: POST-FIX re-map (prior map at 304715e: FAIL, CWE-829 HIGH open)
**Inputs**: audits/sast-dast-scan.md (re-audit at 9cd7272 + 3650b33 addendum), audits/supply-chain-audit.md

---

## Executive Summary

**Verdict: PASS.** No CRITICAL or HIGH CWE is open. CWE-829 (pip-audit installing scanned
repos) and CWE-427 (bare `git` lookup) are fixed and checked by regression tests. An independent
re-audit tried 16 hostile `requirements.txt` variants and a planted `git.exe`; neither fix broke.

The fix cycle had a side effect worth recording. Repairing signature verification (CWE-754) made
`ssh-keygen` run again, which opened two new routes: a repo could vouch for its own signatures
(CWE-345) or point trust files at a UNC path (CWE-73). The follow-up commit 3650b33 closed both.
CWE-73 stays MEDIUM, because a repo's `include.path` can still name a UNC path, and git cannot turn
that off from the command line.

| Severity | 304715e | 3650b33 | Open CWEs at 3650b33 |
|----------|---------|---------|----------------------|
| HIGH | 1 | **0** | — |
| MEDIUM | 3 | 3 | CWE-73 (include.path UNC), CWE-1104 (stale SBOM), CWE-353 (CDN without SRI) |
| LOW | 9 | 11 | CWE-1333, CWE-754, CWE-15, CWE-1357, CWE-693 ×3, CWE-494, CWE-1395, CWE-345 (no provenance), CWE-1104 |
| INFO | 11 | 11 | CWE-1333, CWE-359, CWE-79 (latent), CWE-1321, CWE-22, CWE-59, CWE-754 ×2, CWE-1104, + 2 positive controls |

---

## Fixed in This Cycle

| CWE | Finding | Fix commit | Verified by |
|-----|---------|-----------|-------------|
| CWE-829 / 94 | HIGH-01 pip-audit `-r` installed scanned requirements | 9cd7272 | Live exploit before the fix (setup.py ran); 16 hostile variants after it; regression test |
| CWE-427 | MEDIUM-01 bare `git` in git-evidence.js | 9cd7272 | Planted `git.exe` test (Windows); independent re-audit |
| CWE-754 | INFO-06 topAiModifiedFiles always empty | 9cd7272 | Regression test; self-scan lists real files |
| CWE-754 | INFO-07 signedCommits always 0 | 9cd7272 | Regression test; self-scan 0 → 10 |
| CWE-754 | INFO-08 npm audit silently skipped on Windows | 9cd7272 | Regression test; `auditsRun` field |
| CWE-345 | LOW-03 repo vouches for its own signatures (introduced by the INFO-07 fix) | 3650b33 | Regression test (RED 1 → GREEN 0) |
| CWE-73 (part) | MEDIUM-02 trust files + mailmap.file can name UNC paths | 3650b33 | Regression test for mailmap; trust files pinned |

---

## Open CWE Mapping

| CWE | Findings | Sev. | OWASP 2021 | OWASP LLM 2025 | NIST 800-53 | EU AI Act | ISO 27001:2022 | SOC 2 | ATT&CK | ATLAS |
|-----|----------|------|------------|----------------|-------------|-----------|----------------|-------|--------|-------|
| CWE-73 / 200 | MEDIUM-02 repo `include.path` → UNC path → NTLM hash leak (Windows) | MED | A01 | LLM02 | AC-3, SC-7 | Art. 15 | A.8.28 | CC6.1 | T1187 Forced Authentication | — |
| CWE-1104 | SC-01 stale SBOM; SC-10 registry 7 months old; SC-11 Node 18 EOL | MED / LOW / INFO | A06 | LLM03 | CM-8, SR-4 | Art. 11 + Annex IV | A.5.9, A.8.8 | CC3.2 | — | — |
| CWE-353 | SC-02 / INFO-03 world-map CDN scripts without SRI | MED | A08 | LLM03 | SI-7(6), SR-4 | Art. 15 | A.8.30 | CC6.8 | T1195.002 | AML.T0010 |
| CWE-1333 | LOW-02 `ci-evidence.js:77`; INFO-01 `package-evidence.js:557` | LOW / INFO | A04 | LLM10 | SC-5, SI-10 | Art. 15 | A.8.28 | CC7.1 | T1499.004 | — |
| CWE-754 | LOW-04 `-r` include hides pins, yet `auditsRun:["pip"]` reports 0 vulns; INFO-09 SHA-256 repos get 0 AI attribution; INFO-10 resolver edge cases | LOW / INFO | A04 | LLM09 | SI-11, AU-6 | Art. 12, 13 | A.8.15 | CC7.2 | — | — |
| CWE-15 | LOW-05 scanned `package.json` `"volta"` key picks the npm version (Volta shim) | LOW | A05 | LLM03 | CM-6 | Art. 15 | A.8.9 | CC6.8 | — | — |
| CWE-1357 | SC-03 caret ranges in tooling (lockfile mitigates) | LOW | A06 | LLM03 | SR-3 | Art. 15 | A.5.21 | CC9.2 | — | — |
| CWE-693 | SC-04 audit-level high; SC-05 no required checks; SC-09 tests not in CI | LOW | A05 | — | CM-3, SA-11 | Art. 17 | A.8.32 | CC8.1 | — | — |
| CWE-494 | SC-06 KB checkout not pinned | LOW | A08 | LLM03 | SI-7 | Art. 10 | A.8.30 | CC6.8 | T1195.001 | AML.T0020 |
| CWE-345 | SC-08 no release provenance | LOW | A08 | LLM03 | SR-4(3) | Art. 15 | A.5.21 | CC9.2 | T1195 | — |
| CWE-1395 | SC-07 no Dependabot | LOW | A06 | LLM03 | RA-5, SI-2 | Art. 15 | A.8.8 | CC7.1 | — | — |
| CWE-359 | INFO-02 author emails in evidence JSON | INFO | A02 | LLM02 | PT-2 | Art. 10(5); GDPR Art. 5(1)(c) | A.5.34 | P4.1 | — | — |
| CWE-79 (latent) | INFO-03 world-map tooltip `innerHTML` on constant data | INFO | A03 | LLM05 | SI-10 | — | A.8.28 | CC7.1 | — | — |
| CWE-1321 | INFO-04 `content-labeling.html:179` (own sessionStorage) | INFO | A08 | — | SI-10 | — | A.8.28 | CC7.1 | — | — |
| CWE-22 / 59 | INFO-05 `--locale` path; INFO-11 `requirements.txt` symlink not checked with `isRepoFile` | INFO | A01 | — | AC-3 | — | A.8.28 | CC6.1 | — | — |

---

## Aggregate Compliance Matrix

| Framework | 304715e | 3650b33 | Remaining gap |
|-----------|---------|---------|---------------|
| OWASP Top 10 2021 | GAP (A08) | PARTIAL | A01 include.path (MED); A08 SRI (MED) |
| OWASP LLM Top 10 2025 | GAP (LLM03, LLM09) | PARTIAL | LLM09 LOW-04 (pip audit can report clean while auditing nothing) |
| NIST SP 800-53 r5 | GAP (SI-7) | PARTIAL | CM-8 stale SBOM |
| NIST SP 800-218A | PARTIAL | PARTIAL | PS.3 provenance |
| EU AI Act | PARTIAL (Art. 15 blocked) | PARTIAL | Art. 13 accuracy now restored for signing / AI-file / npm evidence; LOW-04 remains |
| ISO/IEC 27001:2022 | PARTIAL | PARTIAL | A.8.8 / A.5.9 inventory |
| SOC 2 | PARTIAL | PARTIAL | CC3.2 inventory |
| MITRE ATT&CK | GAP (T1195.001, T1059.006) | PARTIAL | T1187 via include.path |
| MITRE ATLAS | PARTIAL | PARTIAL | AML.T0010 via CDN without SRI |

---

## Lesson Recorded for the Next Hardening Pass

Each security fix in this project's history had a side effect on the evidence it produces:
- F1 / F2 / F4 (7f68fb2, 3b9ca56) blocked attacks but zeroed three evidence fields.
- The INFO-07 repair restored the evidence but let the repo vouch for itself.

The regression tests now check **both** directions for each control: the attack is blocked, and
the honest evidence is still produced. Keep that pairing for every future extractor change.
