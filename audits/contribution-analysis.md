# Contribution Analysis Report
## LLMComplianceSkill — AI Compliance Evidence Collection Kit

**Report Date**: 2026-10-11
**Project Duration**: 2026-03-29 (prior audit, 1586ec7) → 2026-10-11 (main @ 304715e)
**Contributors**: Justice (Human); Claude, 5 model versions (AI Assistant): Sonnet 4.6, Opus 4.7, Fable 5.1, Haiku 5.5, Opus 5.5
**Deliverable**: v1.1.0 → v1.4.0 — multi-format build, regulatory refresh to Oct 2026, Directory submission prep, extractor hardening, a11y gates, 6-locale i18n of all 21 tools, dependency-free plugin root
**Audit Type**: Delta since 1586ec7, with cumulative estimate
**Auditor**: Post-Commit Audit Skill (Claude Opus 5.5)

---

## Method and Its Limits

The figures below come from commit metadata, not from keystroke-level observation:

- `git log 1586ec7..304715e`: 20 commits, +28,177 / −3,373 lines, 16 merged via PR (#5–#22).
- Every one of the 20 commits carries a `Co-Authored-By: Claude …` trailer.
- The project's own extractor (`node tools/extractors/git-evidence.js`, 365-day window) reports
  31 of 35 commits AI-attributed (**89%**), one AI tool detected (Claude).

A trailer shows that Claude took part in a commit. It does not show how much of the diff a
human rewrote before committing. The human share below is therefore an estimate from the work
pattern (who chose scope, who ran reviews, who merged), not a measurement. Treat it as ±10 points.

---

## Executive Summary

**Overall Collaboration Model**: Human-directed, AI-implemented, review-gated. Justice picks the
work (regulatory refresh, Directory submission, a11y gates, i18n), commissions independent reviews
(soundcheck, Codex P1/P2 on PRs, plugin scan, skill review, Claude Security), and merges via PR.
Claude writes nearly all of the code, prose and translations.

This cycle is more AI-heavy than the last. Much of it is bulk work (translating 21 tools into
6 languages, refreshing 12 regulation files), where AI implementation dominates by nature.

**Contribution Balance (this cycle, 1586ec7 → 304715e)**:
- **Architecture & Design**: 80/20 (Justice/Claude)
- **Code Generation**: 5/95 (Justice/Claude)
- **Security Auditing**: 30/70 (Justice/Claude)
- **Remediation Implementation**: 10/90 (Justice/Claude)
- **Testing & Validation**: 20/80 (Justice/Claude)
- **Documentation**: 10/90 (Justice/Claude)
- **Domain Knowledge**: 45/55 (Justice/Claude)
- **Overall (this cycle)**: ~25% Human / ~75% AI

**Cumulative (project lifetime)**: ~30% Human / ~70% AI (prior: 38/62)

---

## Commit History Summary (since 1586ec7)

| Commit | Model (trailer) | Type | Description |
|--------|-----------------|------|-------------|
| 9204e46 | Sonnet 4.6 | audit | Post-commit audit 1586ec7, PASS 92/100 |
| ff900a7 | Sonnet 4.6 | fix | Resolve 5 audit INFO/LOW items |
| 381bcff | Opus 4.7 | chore | Add LICENSE (CC0 1.0) |
| 6dc3b77 | Opus 4.7 | fix(a11y) | WCAG CRITICAL + HIGH F-001–F-009 in shared.js (#5) |
| d41d355 | Opus 4.7 | fix(a11y) | WCAG MEDIUM + LOW F-010–F-018 (#6) |
| f8ae415 | Opus 4.7 | release | v1.1.0 + v1.2.0 multi-format build + versioning framework (#7) |
| a5660cc | Fable 5.1 | release | v1.3.0 regulatory refresh to Oct 2026 + autofill fixes (#8) |
| 3cae41f | Fable 5.1 | chore | Directory submission prep (#9) |
| d2288a2 | Fable 5.1 | fix | Ship regulation corpus inside the skill (Codex P1/P2) (#10) |
| 7f68fb2 | Fable 5.1 | fix(security) | Harden extractors against hostile repositories (#11) |
| 776116d | Haiku 5.5 | fix | Autofill crash on template 23; checker false positives (#12) |
| 3b9ca56 | Opus 5.5 | fix(security) | Soundcheck review follow-ups (#13) |
| ed9e6d9 | Opus 5.5 | fix | Count AI tools once per commit; sync-kb line endings (#14) |
| 124e65f | Opus 5.5 | fix(a11y) | Dyslexia + dyscalculia gates for interactive tools (#15) |
| a053570 | Opus 5.5 | docs | One-line intro above every template table (#16) |
| f055712 | Opus 5.5 | i18n | New UI strings + table intros, 6 locales (#17) |
| 3f49d4e | Opus 5.5 | i18n | Translate hardcoded text in all 21 tools (#18) |
| a4bfa93 | Opus 5.5 | i18n | One rule for law names; official Chinese names (#20) |
| 8c61e59 | Opus 5.5 | release | v1.4.0 Directory readiness fixes (#21) |
| 304715e | Opus 5.5 | chore | Move build tooling out of root package.json (#22) |

**Signing**: all 20 commits are signed. Local commits verify with Justice's SSH key (`G`).
GitHub squash merges are signed by GitHub's web-flow key `B5690EEEBB952194`; they show `E`
(key not in the local keyring), not unsigned.

---

## Attribution Matrix

### 1. Architecture & Design — 80/20
Justice set the cycle's goals: Directory submission, shipping the corpus inside the skill, the
a11y gate policy, the 6-locale target, and keeping the plugin root dependency-free. Claude
proposed the implementation structure, for example `tools/sync-kb.js` and moving tooling to
`tooling/package.json` with a CI guard.

### 2. Code Generation — 5/95
All 20 commits are AI co-authored. The new code: sync-kb.js, extractor hardening, autofill fixes,
build.ts and the multi-format pipeline, a11y fixes in shared.js, i18n plumbing. Justice's direct
code edits could not be found in the diffs; his role was review and merge.

### 3. Security Auditing — 30/70
Justice chose to commission several independent reviews: soundcheck (#13), Codex P1/P2 on PRs
#8–#10, plugin security scan, Claude Security results, skill review, and this audit. That is a
real human control: findings came from more than one tool and model, not one self-review.
AI ran the scans and wrote the findings.

### 4. Remediation Implementation — 10/90
Claude implemented every fix (#10–#14, #21). Justice decided which findings to fix and merged
them via PR.

### 5. Testing & Validation — 20/80
The test suite grew from 109 to 157 tests (all passing at 304715e), including regression tests for
fixed defects (template-23 autofill, trailer double-count, CRLF sync) and the doc-claims guard
for the dependency-free root. Tests are AI-written; Justice confirms results at merge.

### 6. Documentation — 10/90
Regulation files, templates, README, CHANGELOG, CLAUDE.md and translations are AI-drafted.
Justice's own documentation input is the a11y policy (plain-language and dyslexia/dyscalculia
gates) that every doc is checked against.

### 7. Domain Knowledge — 45/55
Justice's domain knowledge is in which jurisdictions and laws matter and in the review
standards. The regulatory research for the Oct 2026 refresh (12 regulation files, 47 deadline
entries) was AI-researched against cited authorities with pinned dates.

---

## Quality Assessment

| Criterion | Grade | Notes |
|-----------|-------|-------|
| Code Correctness | A- | 157/157 tests pass; regression tests for each fixed defect; see sast-dast-scan.md for open findings |
| Test Coverage | A- | +48 tests this cycle; doc-claims tests guard README claims; no coverage % measured |
| Documentation | B+ | Strong and accessible, but README's AI disclosure is stale (names only Sonnet 4.6, "~62%") |
| Production Readiness | A- | Released as v1.4.0 and accepted for Directory submission prep; 0 npm vulnerabilities |
| **Overall** | **A-** | |

---

## Findings for the Human-AI Workflow

1. **Stale AI disclosure (README.md:187).** The README says the project "was built with Claude
   Sonnet 4.6" and that "approximately 62%" was AI-generated. Since then, 5 model versions have
   contributed and the git-evidence extractor measures 89% AI-attributed commits. For a
   compliance toolkit, its own disclosure should be current. Fix: name all model versions (or
   say "Claude models; the trailer in each commit names the version") and update the share.
2. **Model churn.** Five model versions in one cycle is fine and is disclosed per commit. But it
   means "the AI" is not one system. Assessments of AI quality should be per-model if needed.
3. **Strength: independent review.** Using several reviewers (soundcheck, Codex, Claude Security,
   plugin scan) is the strongest human control in this project. Keep it.

**Trend**: AI share of implementation rose (62% → ~70% cumulative). Human control moved from
writing code to choosing work, commissioning reviews, and gating merges via PR. All three of
those are visible in the git record.

---

## Remediation Cycle (same day, branch fix/extractor-hostile-repo-and-evidence)

1. **What was found.** At 304715e: HIGH-01 (pip-audit installs scanned repos), MEDIUM-01 (bare
   `git`), and three silent evidence regressions (INFO-06/07/08).
2. **Who directed the fixes.** Justice chose option "b": fix on a branch, then re-audit before
   anything is committed to main.
3. **Who implemented them.** Claude (Opus 5.5), test first: 7 failing tests, then fixes in 9cd7272.
   The hostile-`setup.py` test reproduced the HIGH against real pip-audit 2.10.1 before the fix.
4. **Verification.** A separate agent was told to break the fixes. All five held, and it found that
   the signing repair had opened LOW-03 (a repo vouching for its own signatures) plus new MEDIUM-02
   vectors. Claude fixed those in 3650b33 (2 more failing-first tests). Final suite: 166/166.
5. **Split for this cycle.** Direction and the scope decision: Justice. Implementation, tests and
   reports: Claude. Adversarial verification: a second Claude agent. About 10/90 (Justice/Claude),
   in line with the code-generation dimension above.

**Lesson:** the independent re-audit caught a defect introduced by the fix itself, which a self-review
would probably have missed. Having a second agent try to break the fix, rather than grade it, is
worth keeping as standard practice.
