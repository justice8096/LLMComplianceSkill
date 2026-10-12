# LLM Compliance & Transparency Report
## LLMComplianceSkill — AI Compliance Evidence Collection Kit

**Report Date**: 2026-10-11
**Auditor**: Post-Commit Audit Skill (Claude Opus 5.5)
**Commit**: 3650b33 (branch fix/extractor-hostile-repo-and-evidence, over main @ 304715e)
**Framework**: EU AI Act (Art. 10–17, 25, 50), OWASP LLM Top 10 2025, NIST SP 800-218A, NIST AI RMF
**Audit Type**: POST-FIX re-audit. Baseline 1586ec7 (2026-03-29) → pre-fix 304715e → post-fix 3650b33

---

## Executive Summary

**Overall Score: 84/100 — GOOD**

| Point | Score | Note |
|-------|-------|------|
| 1586ec7 (March) | 85 (mean) | Headline was reported as 92, but its own 10 dimensions average 85.1 |
| 304715e (pre-fix) | 83 | HIGH-01 open; 3 evidence fields silently wrong |
| **3650b33 (post-fix)** | **84** | HIGH fixed and independently re-audited; evidence restored |

The fix cycle closed the HIGH finding, which let a scanned repo run code via `pip-audit`. It also
closed the bare-`git` lookup and the three evidence regressions. It did not raise the score into
the 86–88 range forecast at 304715e, because the forecast assumed the hygiene items would be
fixed too. They weren't, by design: this branch was scoped to code fixes. The stale README AI
disclosure and the stale SBOM still hold Transparency, Supply Chain and AI Attribution down.

---

## Score Breakdown

| Dimension | 1586ec7 | 304715e | 3650b33 | Driver of latest change |
|-----------|---------|---------|---------|-------------------------|
| Transparency & Documentation | 87 | 84 | 84 | CHANGELOG has addendum guidance for affected evidence (+); README:187 AI disclosure still stale (−) |
| Risk Classification & Controls | 90 | 92 | 92 | Unchanged |
| Security Posture | 91 | 78 | 88 | HIGH-01 and MEDIUM-01 fixed; MEDIUM-02 (`include.path` UNC) open; LOW-04/05 new |
| Privacy & Data Governance | 88 | 88 | 88 | Unchanged (INFO-02 emails carried forward) |
| Human Oversight Design | 95 | 95 | 95 | Unchanged |
| Testing & Validation | 90 | 85 | 87 | +9 regression tests, each checking that the attack is blocked AND the evidence is correct; still not run in CI |
| Supply Chain Security | 86 | 80 | 80 | No dependency changes; SBOM / SRI / provenance items open |
| Incident Response | 92 | 92 | 92 | Fix → independent re-audit → follow-up fix shown working in one cycle |
| Bias Assessment | 60 | 66 | 66 | Unchanged |
| AI Attribution | 72 | 70 | 72 | Per-file AI attribution works again (INFO-06); README still stale |
| **Overall (mean)** | **85** | **83** | **84** | |

Status bands: EXCELLENT 90+, GOOD 70–89, DEVELOPING 50–69, NEEDS IMPROVEMENT <50.

---

## AI System Disclosure

| Field | Value |
|-------|-------|
| AI models used (since 1586ec7) | Claude Sonnet 4.6, Opus 4.7, Fable 5.1, Haiku 5.5, Opus 5.5 (Anthropic) |
| Role | Implementation, regulatory research drafting, translation, security review, report generation |
| Human oversight | Justice chooses the work, approves the fix scope ("b": fix on a branch, then re-audit), and merges via PR |
| Attribution in commits | `Co-Authored-By: Claude <model>` on every commit since 1586ec7, including 9cd7272 and 3650b33 |
| AI-attributed commits (365 d) | 89%, measured by this project's own `git-evidence.js` |
| Disclosure in README | **STALE**: README.md:187 says "Claude Sonnet 4.6", "approximately 62%" (finding T-1, open) |
| Independent review | The fix commit was re-audited by a separate agent instructed to break it, not confirm it |

---

## Evidence Integrity

The pre-fix audit rated three silent evidence failures as MEDIUM for this project, because this
project's output is evidence for a legal reviewer. Status now:

| Finding | Pre-fix effect | Status at 3650b33 |
|---------|---------------|-------------------|
| INFO-07 signedCommits | Always 0 | **FIXED.** Counts signatures from keys the operator trusts; this repo 0 → 10 |
| LOW-03 (introduced by the INFO-07 fix) | Repo could claim 100% signed | **FIXED** in 3650b33 |
| INFO-06 topAiModifiedFiles | Always `[]` | **FIXED.** Real per-file list, root commits included |
| INFO-08 npm audit on Windows | Silently skipped | **FIXED.** Runs, and evidence lists `auditsRun` |
| LOW-04 pip audit with `-r` include or unpinned lines | — | **OPEN.** Can report `auditsRun:["pip"]` with 0 vulnerabilities while auditing nothing |

**Downstream impact (EU AI Act Art. 13).** Evidence generated with v1.4.0 understated signed
commits and per-file AI attribution, and on Windows omitted npm audit results. The CHANGELOG
Unreleased entry tells users to re-run the extractors and file addenda. That is the project's own
Skill Versioning framework working as designed.

---

## Recommendations (ordered)

1. **Fix LOW-04 before the next release.** If pip-audit reports any unpinned or skipped requirement,
   or the file contains `-r`/`-c` includes, do not add `pip` to `auditsRun`. Instead record
   `pip (partial)` with the skipped count. Otherwise "clean" evidence can be false.
2. **Close MEDIUM-02.** Run git with `GIT_CONFIG_NOSYSTEM=1` and a controlled `GIT_CONFIG_GLOBAL`,
   and refuse (with a logged reason) repos whose `.git/config` contains `[include` or `[includeIf`.
3. **Refresh README.md:187 AI disclosure and regenerate `sbom.json`** (v1.4.0, CC0-1.0, real components).
4. **Run `npm test` in CI** and make the lint/test jobs required checks on `main`.
5. **Add SRI to the world-map CDN scripts** (all three copies; fix in the KB repo so `sync-kb` carries it).

## Regulatory Roadmap

- EU AI Act Art. 15 (robustness/cybersecurity): **no longer blocked**. The remaining MEDIUM is a
  Windows credential leak that requires a hostile repo and an outbound SMB path.
- NIST SSDF PS.3: release provenance (SLSA L2) is still missing.
- NIST AI RMF MEASURE 2.6: record the KB commit in bundled regulation files (SC-06).

## Next Audit

When this branch merges (re-check that main matches 3650b33). Then a full audit before v1.5.0 or the
next regulatory refresh, whichever comes first.

*This report is compliance research, not legal advice.*
