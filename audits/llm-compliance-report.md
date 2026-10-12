# LLM Compliance & Transparency Report
## LLMComplianceSkill — AI Compliance Evidence Collection Kit

**Report Date**: 2026-10-12
**Auditor**: Post-Commit Audit Skill (Claude Opus 5.5)
**Commit**: e368913 (branch fix/extractor-hostile-repo-and-evidence, over main @ 304715e)
**Framework**: EU AI Act (Art. 10–17, 25, 50), OWASP LLM Top 10 2025, NIST SP 800-218A, NIST AI RMF
**Audit Type**: POST-FIX re-audit after three fix rounds. Baseline 1586ec7 → pre-fix 304715e → 3650b33 → e368913

---

## Executive Summary

**Overall Score: 88/100 — GOOD** (1586ec7: 85 · 304715e: 83 · 3650b33: 84 · **e368913: 88**)

All code findings from the 2026-10-11 audit are fixed: one HIGH, two MEDIUM, and the LOW/INFO
extractor and HTML items. The README AI disclosure is current, the SBOM is generated and checked in
CI, and the test suite (233 tests) runs in CI. The score stays below EXCELLENT for three reasons:
- **Process controls aren't enforced yet.** CI checks are not required on `main`, and the
  owner-approved settings are pending the merge.
- **Provenance has never run.** It is configured but no `v*` tag has exercised it.
- **The last round lacks independent review.** The `git-sandbox.js` redesign is verified by tests
  only, not by an independent re-audit.

---

## Score Breakdown

| Dimension | 1586ec7 | 304715e | 3650b33 | e368913 | Driver of latest change |
|-----------|---------|---------|---------|---------|-------------------------|
| Transparency & Documentation | 87 | 84 | 84 | 90 | README AI disclosure: all five models, 90% AI-attributed commits, how to recompute; CHANGELOG addendum guidance |
| Risk Classification & Controls | 90 | 92 | 92 | 92 | Unchanged |
| Security Posture | 91 | 78 | 88 | 93 | MEDIUM-02 closed by design (git never reads repo config); all extractor LOW/INFO fixed; −2 because round 3 is not independently verified |
| Privacy & Data Governance | 88 | 88 | 88 | 89 | Credentials redacted from `auditGaps`; INFO-02 emails by design |
| Human Oversight Design | 95 | 95 | 95 | 95 | Unchanged; the owner approved repository-setting changes explicitly |
| Testing & Validation | 90 | 85 | 87 | 92 | 233 tests, each fix failing-first, now run in CI; `sbom:check` in CI |
| Supply Chain Security | 86 | 80 | 80 | 86 | Generated SBOM with SRI-derived hashes, Dependabot config, provenance job, audit level moderate; SLSA build still L0 in practice (never run) |
| Incident Response | 92 | 92 | 92 | 93 | Four fix → review cycles in two days, each with written status |
| Bias Assessment | 60 | 66 | 66 | 66 | Unchanged |
| AI Attribution | 72 | 70 | 72 | 80 | README current; per-file AI attribution restored; SHA-256 repos supported |
| **Overall (mean)** | **85** | **83** | **84** | **88** | |

Status bands: EXCELLENT 90+, GOOD 70–89, DEVELOPING 50–69, NEEDS IMPROVEMENT <50.

---

## AI System Disclosure

| Field | Value |
|-------|-------|
| AI models used | Claude Sonnet 4.6, Opus 4.7, Fable 5.1, Haiku 5.5, Opus 5.5 (Anthropic) |
| Role | Implementation, research drafting, translation, security review, report generation |
| Human oversight | Justice chooses the work and scope, approves pushes, PRs and repository-setting changes |
| Attribution | `Co-Authored-By: Claude <model>` on every commit; README states 90% AI-attributed commits (git-evidence.js, 2026-10-12) |
| Disclosure in README | **CURRENT** (finding T-1 closed) |
| Review model | Fixes verified by failing-first tests; rounds 1–2 also by an independent agent told to break them; an automated commit review ran on every commit |

---

## Evidence Integrity

| Evidence field | Before | Now |
|----------------|--------|-----|
| `securityPractices.signedCommits` | Always 0; then forgeable by the repo | Counts only signatures from keys the operator trusts, honouring the operator's revocation list |
| `aiCodeGeneration.topAiModifiedFiles` | Always `[]` | Real list; root commits and SHA-256 repos included |
| `vulnerabilities.auditResults` | Could read "0" when no audit ran | Read together with `auditsRun` (npm / pip / pip-partial) and `auditGaps` (each unaudited line, credentials redacted) |
| `sbom.lockFileCommitted` | git read the repo's config | git runs in a private git directory |

Users who produced evidence with v1.4.0 should re-run the extractors and file addenda (CHANGELOG `[Unreleased]`).

---

## Recommendations (ordered)

1. **Merge the upstream KB world-map change first** (prepared locally, not pushed). Without it, `kb-sync-check`
   fails on PR #23 and the next sync reverts the SRI fix.
2. **Apply the two approved settings after merge**: required status checks on `main`; Dependabot security updates.
3. **Get an independent break-it pass on `git-sandbox.js`** (the round-3 independent re-audit did not complete).
4. **Tag a release** to exercise the provenance job (SLSA build L2 for `dist/**` and `sbom.json`).
5. **Refresh the LLM registry** with per-model `sourceUrl` and `retrievedAt` (SC-10).

## Next Audit

After PR #23 merges and the settings are applied; then before v1.5.0.

*This report is compliance research, not legal advice.*
