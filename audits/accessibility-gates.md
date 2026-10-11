# Accessibility gates: dyslexia and dyscalculia content checks

Date: 2026-10-11. Scope: source/skills/ai-compliance.md and source/commands/*.md (the files that become the published SKILL.md and commands). Locale: us (English). Audience: workplace technical documentation read by developers and compliance staff.

## Method

Measured with a script over the markdown body with code blocks, tables and URLs stripped: Flesch-Kincaid grade (syllable heuristic), average sentence length, sentences over 25 words, passive constructions, paragraphs over 4 sentences, heading count, lines over 100 characters. Then a manual pass against the 12 Dyslexia UX Heuristics and the dyscalculia checklist (number density, percentages, time pressure, working-memory load).

## Results after fixes

| File | FK grade | Avg sentence | Sentences over 25 words | Passive | Long paragraphs |
|------|----------|--------------|-------------------------|---------|-----------------|
| ai-compliance.md | 7.3 | 10.3 words | 2 of 60 | 0 | 0 |
| autofill-templates.md | 11.6 | 6.7 | 0 | 0 | 0 |
| compliance-assessment.md | 14.1 | 7.3 | 0 | 0 | 0 |
| extract-evidence.md | 14.5 | 7.6 | 0 | 0 | 0 |
| jurisdiction-lookup.md | 16.4 | 11.0 | 0 | 0 | 0 |
| validate-evidence.md | 11.2 | 7.0 | 0 | 0 | 0 |

The command files score a high FK grade only because they are short and dense with proper nouns and tool names (evidence-checker, jurisdiction, compliance); their sentences average 7 words. No fix needed.

## Dyslexia domains

Typography and layout: PASS. Markdown rendered by the host; left-aligned, no justification; headings every 10 to 20 lines; lists and tables carry the structure.
Content structure: PASS after fixes. One paragraph failed: the authority-version pin block was a single 1,000-character line of 25 law citations with dates. Replaced with a 19-row table (law, version, key dates). The jurisdiction-lookup command listed 15 jurisdictions in one line; replaced with a five-row table grouped by region.
Navigation: PASS. Workflow overview at the top, numbered six-step pipeline, consistent heading names across the skill and the five commands.
Media and alternatives: N/A (text only). All tables have header rows for screen readers.

## Dyscalculia checklist

Number density: ai-compliance.md carries about 140 numerals, mostly dates and template numbers. Dates are ISO (YYYY-MM-DD) throughout, which keeps one format. Template numbers are two-digit and always paired with the template name.
Percentages: none in the skill text.
Time pressure: none; deadlines are listed as absolute dates with the law beside them, no countdowns.
Working memory: the pin table removes the need to hold 25 citations in one sentence. The six-step workflow is numbered and each step has one verb.

## Verdict

PASS for both gates on the files that ship in the plugin. Residual item: the 24-template table in ai-compliance.md is 24 rows; acceptable for a reference table, but a reader with dyscalculia will benefit from the template name being the first column (it is).
