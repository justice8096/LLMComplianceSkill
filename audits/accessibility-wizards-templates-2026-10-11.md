# Accessibility gates: interactive tools, templates and README

Date: 2026-10-11. Commit audited: `ed9e6d9` (main, after #14).
Skills applied: `dyslexia-support-skill:content-accessibility-check` and `dyscalculia-support-skill:content-accessibility-check`, locale `us`.
Audience: post-secondary, workplace (developers, compliance and privacy staff).

This extends `accessibility-gates.md`, which covered only the published SKILL.md and command files. This pass covers what that one did not: the 21 interactive HTML tools and `shared.js`, the 25 evidence templates, `README.md` and both `SKILL.md` files.

## Verdict

| Gate | Before fixes | After fixes (this branch) |
|------|--------------|---------------------------|
| Dyslexia | Partial | **Pass** |
| Dyscalculia | Concern, 19 of 27 (70%) | **Pass, 25 of 27 (93%)** |

Findings A-001 to A-008 and A-011 are fixed on branch `fix/a11y-gates-tools`. A-009 (table intro sentences) and A-010 (light theme and text-size control) remain open as LOW items and do not block either gate. The findings below describe the state before the fixes. The section "Results after fixes" at the end shows the re-check.

## Method

A script read every tool's CSS and output strings, and every markdown file's prose (code blocks, tables and URLs removed). It measured Flesch-Kincaid grade, sentence length, passive voice, font sizes under 14px, text justification, timers, pie charts, percentage outputs, decimals, long numbers and date formats. Contrast ratios were computed from the theme colours with the WCAG formula. A manual pass then applied the 12 Dyslexia UX Heuristics and the 15-dimension dyscalculia framework.

## Dyslexia results

| Domain | Score | Summary |
|--------|-------|---------|
| Typography and layout | **Partial** | Sans-serif, line-height 1.6, left-aligned, no justification. But labels, inputs, buttons and table cells are 13.6px, toggles 12.8px, badges 11.2px. |
| Content structure | **Pass** | Templates read at grade 4 to 10, average sentence 6 to 15 words. Only 15 sentences over 25 words across 28 files. |
| Navigation and interaction | **Partial** | Skip link, landmarks and a screen-reader step announcement exist. Sighted users see only coloured dots, with step names in hover tooltips. |
| Media and alternatives | **Pass** | No audio or video. Semantic HTML, `lang` set on every page, so text-to-speech works. |

### Readability (prose only)

| File | FK grade | Avg sentence | Over 25 words |
|------|----------|--------------|---------------|
| README.md | 11.0 | 10.3 | 0 of 30 |
| skills/ai-compliance/SKILL.md | 9.2 | 9.1 | 1 of 63 |
| skills/evidence-collection/SKILL.md | 11.5 | 9.6 | 0 of 19 |
| Templates 00 to 24 | 4.1 to 10.4 | 5.9 to 15.2 | 0 to 2 each |

Template 12 (Governance Framework) has the longest sentences, averaging 15.2 words. That is still inside the target range.

## Dyscalculia results

Dimensions 1 to 4 and 8 (CRA, number sense, multisensory, manipulatives, student progress monitoring) are written for math instruction. They do not apply to a compliance tool and are scored N/A. The remaining nine are scored below.

| Dimension | Score | Key finding |
|-----------|-------|-------------|
| Visual accessibility | 2 | Same small-text and contrast issues as the dyslexia gate |
| Accommodations and scaffolding | 2 | Step-by-step wizards, save and load, and auto-save after each edit reduce working memory load |
| Math anxiety | 3 | No timers, countdowns or time limits anywhere |
| Comorbidity support | 2 | Good screen-reader support. No user font or theme choice. |
| Data visualization | 2 | No pie charts. The 5x5 risk matrix shows numbers with colour as the only level cue. |
| Number-to-word alternatives | 2 | Risk scores always carry a word ("High (16/25)"). Completeness percentages do not. |
| Rounding and decimals | 2 | Whole numbers almost everywhere. The average risk score shows one decimal ("2.3/25") with no level word. |
| Percentage alternatives | 1 | PIA and other tools show "Completeness: 70%" with no count. Template 23 cites three statistics as bare percentages. |
| Cognitive processing | 3 | The tools do every calculation. No mental arithmetic is needed to finish any task. |
| **Total** | **19 / 27** | |

## Findings

### HIGH

**A-001: Body-size text under 14px in every tool.**
`shared.js` lines 424, 433, 441, 442, 450 and 459 set buttons, toggles, field labels, inputs, badges and result tables to 0.7em to 0.85em (11.2px to 13.6px). These are the main reading surfaces of a form. Individual tools add more: `llm-selector.html` (29 small-text rules), `consent-records-audit.html` and `dsr-rights-implementation.html` (15 each).
Fix: raise these to at least 0.875em (14px), labels and inputs to 1em. Effort: small.

**A-002: Secondary text below 4.5:1 contrast.**
`#6B7B8D` (h3 headings, the subtitle, inactive toggle text) measures 4.24:1 on the page and 3.23:1 on panels. The danger red `#e74c3c` measures 3.67:1 on panels.
Fix: use `#8A9AAB` (6.38 and 4.87) and `#F0705F` (6.29 and 4.80). Effort: small.

**A-003: Progress shown only as dots.**
`.progress-dot` is a 10px circle. Step names appear only in a hover tooltip, so keyboard and touch users cannot see where they are. Counting dots to find your place is itself a numerosity task.
Fix: add a visible line, "Step 3 of 7: Data categories", above the dots, reusing the existing `ui.progress.step` and `ui.progress.of` strings. Effort: small.

### MEDIUM

**A-004: Percentages without counts.**
Examples: `pia-assessment.html` lines 704, 857, 869 and 881, plus the exported markdown at lines 1062 to 1121. The warning "data protection measures incomplete (65%)" also hides the threshold it failed (70%).
Fix: show "13 of 20 measures (65%)" and "65%, below the 70% target". Effort: small to medium.

**A-005: Risk matrix uses colour as the only level cue.**
In `impact-risk-scoring.html` (line 369), the 5x5 matrix cells show the product (1 to 25) with low, medium and high distinguished only by colour.
Fix: add the level word or letter in each cell ("16 High"). Effort: small.

**A-006: Unlabelled decimal average.**
`impact-risk-scoring.html` line 423 shows "Average risk score 2.3/25" with no level word, unlike every other score.
Fix: round to a whole number and add the level, for example "2/25 (Low)". Effort: small.

**A-007: Three date formats.**
`skills/ai-compliance/SKILL.md` uses ISO dates (29) and "Feb 2, 2025" (14, in the deadline table at lines 271 to 286). `README.md` uses "Aug 2, 2026". Template 22 uses "22 Jan 2026" and "Nov 2026". Switching formats adds working memory load for dyscalculic readers. The earlier gate report said ISO was used throughout, which is no longer true.
Fix: pick one display format for prose and tables. GOV.UK guidance suggests "2 Feb 2026". Keep ISO in the JSON data. Effort: small.

**A-008: Bare statistics in template 23.**
Line 79 reads: "45% of AI-assisted development tasks introduce critical security flaws; 62% ... 78% ...", and line 85 says "~20% rate".
Fix: add natural frequencies ("about 9 in 20"). Separately, check the citation: the source is given only as "OpenSSF 2025". These figures will be copied into compliance documents, so they should link to the report. Effort: small.

### LOW

**A-009: Tables without an introductory sentence.**
Most template tables sit directly under a heading (between 3 and 21 per template). A one-line sentence saying what the table holds and what to fill in helps both groups of readers.
Fix: add one sentence per table section, starting with the largest templates (23, 19, 15). Effort: medium.

**A-010: Dark theme only, no text controls.**
The tools use a single navy theme (`#0B1426`) with no light, off-white or larger-text option. Many readers with dyslexia prefer a cream background.
Fix: add a `prefers-color-scheme: light` palette and a text-size toggle in the toolbar, persisted with the existing state store. Effort: medium.

**A-011: Wide prose lines.**
`#wizard-root` allows 900px, about 110 characters per line in alerts and descriptions. The target is 50 to 70.
Fix: `max-width: 70ch` on `.alert`, `p` and `.subtitle` inside the wizard. Effort: small.

## Strengths

The tools never impose time pressure, never ask the user to do arithmetic, and pair every risk score with a word. Templates are short-sentence and plain. Semantic landmarks, a skip link, `aria-live` step announcements and `role="status"` alerts are already in place from the F-001 to F-018 WCAG work.

## Remediation order

| Priority | Findings | Files | Unblocks |
|----------|----------|-------|----------|
| 1 | A-001, A-002, A-003, A-011 | `shared.js`, then the three tools with heavy local overrides | Dyslexia gate; Visual dimension |
| 2 | A-004, A-005, A-006 | `pia-assessment.html`, `impact-risk-scoring.html`, other tools with completeness percentages | Dyscalculia gate |
| 3 | A-007, A-008 | `SKILL.md`, `README.md`, templates 22 and 23 | Dyscalculia gate |
| 4 | A-009, A-010 | Templates, `shared.js` | Polish |

Priorities 1 to 3 are what both gates need. After them, re-run this check. The expected result is Pass for dyslexia and about 24 of 27 for dyscalculia.

## Results after fixes

Re-checked on branch `fix/a11y-gates-tools` with the same scripts, plus a headless Chromium pass that opened all 21 tools, stepped through every wizard step and measured the computed font size of every visible text node.

| Check | Before | After |
|-------|--------|-------|
| Smallest rendered text in any tool | 10.4px (risk matrix labels) | 14px |
| CSS rules under 14px | 127 | 0 |
| Secondary grey contrast (page / panel) | 4.24 / 3.23 | 6.38 / 4.87 |
| Danger red contrast (panel) | 3.67 | 4.80 |
| Visible step indicator | Dots only | "Step 3 of 7: Name" above the dots, all 21 tools |
| Percentage displays with no count, frequency or level word | 29 | 0 |
| Risk matrix cells | Number and colour | Number and level word ("16 High") |
| Average risk score | "2.3/25" | "2/25 (Low)" |
| Date formats in SKILL.md and README | 3 | 1 ("2 Feb 2026"); ISO kept only in data files and code blocks |
| Deadline table order | 2 rows out of order | Chronological |
| Template 23 statistics | 3 unsourced percentages | 1 cited figure with natural frequency |
| Page errors in any tool | 0 | 0 |

Two changes beyond the findings:

- Minimum sizes use `rem`, not `em`, so a small label nested in a small table cell can no longer shrink below 14px.
- The command safety rules added in #13 were only in the generated `commands/*.md`. A rebuild would have removed them, so they are now in `source/commands/`.

Rescored dyscalculia dimensions: Visual 3, Accommodations 2, Math anxiety 3, Comorbidity 2, Data visualization 3, Number-to-word 3, Rounding 3, Percentage alternatives 3, Cognitive processing 3. Total 25 of 27.

Accommodations and Comorbidity stay at 2 until A-010 (theme and text-size controls) is done.
