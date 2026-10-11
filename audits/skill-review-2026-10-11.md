# skill-reviewer: ai-compliance plugin

Review of `D:\LLMComplianceSkill` at `main` `a4bfa93`, run with `/skill-reviewer review` (full lens), with extra attention to the discoverability and parseability lenses. Plugin shape: 2 skills, 5 commands, 2 manifests, a build that generates the root files from `source/`.

## TL;DR

This is a regulatory knowledge skill with an evidence pipeline attached. The knowledge half is well built for answering questions on any surface: dated banners, a shipped regulation corpus, a "read the data files, not memory" rule, and a fixed four-tier vocabulary. The weak half is everything a user touches when installing from the Directory. The license is stated two different ways, the install instructions describe a clone that Claude Code does not pick up, and two commands advertise parameters the scripts do not accept. Most other findings are one pattern: numbers and facts typed into prose that have drifted from the data they describe.

**Weakness clusters:**
1. Docs describe the repo checkout, not the installed plugin: install steps, relative script paths, commands with no invocation.
2. Hand-maintained counts and facts drift: extractors, deadlines, models, KB version, locale keys, template 24, jurisdiction tiers.

## Strengths to keep

- 🟣 **Explicit surface split** (`skills/ai-compliance/SKILL.md:14-19`). It states what works in claude.ai and Cowork (lookup, classification, deadlines) and what needs Node (three scripts), so the skill does not promise pipeline steps where it cannot run them.
  *Generalizes:* any skill with optional scripts should say which parts degrade on which surface.
- 🟣 **Dated data with a re-verification trigger** (`SKILL.md:7-8`, `SKILL.md:38-42`, `SKILL.md:308-310`). Every answer path carries an "as of" date, and executive-order mandate ends are framed as "re-verify", not "expired".
- 🟣 **Data over memory** (`SKILL.md:211`). Lookups must come from `references/data/*.json`, and the build ships `references/` inside the skill (`build.ts:211-214`). CI fails if the corpus drifts from the knowledge base.
  *Generalizes:* put the ground truth next to SKILL.md and tell the model to read it.
- 🟣 **One status vocabulary** (`SKILL.md:231`). Enacted / Active Sector / Proposed / Voluntary is fixed, and so is the legal-advice disclaimer (`SKILL.md:229`).
- 🟣 **Untrusted-input rules in the commands** (`commands/extract-evidence.md:23`, `commands/compliance-assessment.md:19`). A requirement only counts as "met" with a checked artifact, and repo text is treated as data.
- 🟣 **Codes tied to the data file** (`commands/jurisdiction-lookup.md:15`). Jurisdiction codes come from `jurisdiction-matrix.json`, not a hand-typed list.
- 🟣 **CI-usable outputs** (`tools/evidence-checker.js:434`, extractor `_meta` blocks). The checker exits 1 on critical gaps, and each extractor result carries the extractor name, version and timestamp.

## Findings

### 🔴 1. License stated as both MIT and CC0

**Why:** the Directory listing and every downstream user see conflicting terms. `LICENSE:3` and `plugin.json:9` say CC0 1.0. `README.md` § License and `source/manifest.json:7` say MIT.

**Fix:** set the README license section and `source/manifest.json` `license` to `CC0-1.0`.

*`README.md:195-197` · `source/manifest.json:7` · `.claude-plugin/plugin.json:9` · `LICENSE:3` · Small · ✅ quick win*

### 🔴 2. Commands advertise parameters the scripts do not accept

**Why:** `/validate-evidence` offers `strict` and `/autofill-templates` offers `templates`. The checker has no `--strict` flag (`evidence-checker.js:27-34`) and autofill has no template filter (`autofill.js:685-689`), so a user who asks for either gets something other than what they asked for, without being told.

**Fix:** remove both parameters, or implement `--strict` (exit 1 on any incomplete template) and `--template NN` in autofill. While there, add autofill's real `--locale` flag to the command.

*`commands/validate-evidence.md:11` · `commands/autofill-templates.md:11` · Small*

### 🟡 3. Skill descriptions are noun phrases with no triggers

**Why:** the router reads the SKILL.md `description`. `SKILL.md:3` opens "AI/LLM regulatory compliance knowledge covering…" and `evidence-collection/SKILL.md:3` opens "Automated and interactive evidence collection pipeline…". Neither says when to use the skill, and both differ from the task-first `plugin.json:5`.

**Fix:** in `source/skills/*.md`, start with "Use when the user asks whether an AI or LLM product is high-risk, what disclosures, registrations or deadlines apply in a jurisdiction (EU AI Act, Colorado, Korea…), or wants to collect compliance evidence." Then rebuild.

*`skills/ai-compliance/SKILL.md:3` · `skills/evidence-collection/SKILL.md:3` · `.claude-plugin/plugin.json:5` · Small · ✅ quick win*

### 🟡 4. Template 24 missing from both template tables

**Why:** both files say "24 templates", but each table stops at 23, so SAST/DAST Scan Evidence (`templates/24-SAST-DAST-Scan.md`) can't be discovered.

**Fix:** add a row: `| 24 | SAST/DAST Scan Evidence | EU AI Act Art. 15, NIST SSDF, OWASP |`.

*`SKILL.md:181-205` · `README.md:95-119` · Small · ✅ quick win*

### 🟡 5. Wrong template groupings in evidence-collection

**Why:** the skill lists "Human oversight and accountability (10-13)" and "Transparency (14-17)". Templates 10 to 13 are consent, data subject rights, governance and incidents, and 14 is registration, so the model routes requests to the wrong template.

**Fix:** replace the grouping with a pointer to the ai-compliance template table, or list the real ranges.

*`skills/evidence-collection/SKILL.md:20-26` · Small · ✅ quick win*

### 🟡 6. Version still 1.3.0 after ten merged PRs

**Why:** the installed copy is 1.3.0 at `5cb665c`, which still has the pre-#11 shell-based extractors. Main is also 1.3.0, so update checks see nothing new.

**Fix:** bump to 1.4.0 in `source/manifest.json` and `plugin.json`, add a CHANGELOG entry, then tag and release.

*`.claude-plugin/plugin.json:4` · `source/manifest.json:4` · Small · ✅ quick win*

### 🟡 7. Install instructions describe a clone Claude Code does not register

**Why:** `README.md:27` clones over SSH into `~/.claude/plugins/` and `README.md:40` says Claude Code "auto-discovers" it. Plugins are installed through a marketplace, as the installed entry `ai-compliance@llm-compliance-skill` shows, and the SSH URL fails for anyone without a GitHub key.

**Fix:** replace both blocks with `/plugin marketplace add justice8096/LLMComplianceSkill`, then `/plugin install ai-compliance@llm-compliance-skill`. Keep an HTTPS clone only for running the scripts.

*`README.md:24-40` · `README.md:177-183` · Small*

### 🟡 8. README and SKILL.md give different jurisdiction tiers

**Why:** the same question gets contradictory answers depending on which file is read. Brazil is "Enacted" in the README and "Active Sector" in SKILL.md. India and Mexico are "Proposed" in the README and "Active Sector" in SKILL.md. Australia is "Voluntary" in the README and "Active Sector" in SKILL.md.

**Fix:** treat the SKILL.md table (synced to the knowledge base) as the source and regenerate the README table from it in `build.ts`.

*`README.md:153-158` · `SKILL.md:264-269` · Small*

### 🟡 9. Script paths only work from a repo checkout

**Why:** `node tools/extract-evidence.js` and `cp tools/compliance-config.example.json` assume the working directory is the repo. An installed plugin lives under `~/.claude/plugins/cache/.../1.3.0`, so in a user's project these commands fail with "file not found".

**Fix:** tell Claude to run scripts from the plugin root (two levels above this SKILL.md) and keep the config in the user's project. Then confirm by running `/compliance-assessment` from a scratch project.

*`SKILL.md:71-74` · `SKILL.md:121` · `SKILL.md:139` · `SKILL.md:153` · Medium*

### 🟡 10. Commands never say how to run anything

**Why:** each command lists parameters and steps but no script, no `$ARGUMENTS`, and no `argument-hint`. For example, `/extract-evidence` never names `extract-evidence.js`, so the model has to guess the invocation every time.

**Fix:** add `argument-hint` frontmatter and a "Run" line with the exact command to each of the five commands.

*`commands/*.md` · Medium*

### 🟡 11. Counts and versions in prose have drifted from the data

**Why:** readers and the model get wrong facts.
- **Extractors:** the docs say three, but four run (`extract-evidence.js:64-67`).
- **Deadlines:** the docs say 47, but `deadline-data.json` has 50.
- **LLM registry:** "66-model", but the registry has 64.
- **Knowledge base version:** v1.1.0, but its `package.json` is 1.2.0.
- **Locale keys:** "692 keys", but there are 2,770.
- **Research date:** the README disclaimer still says "March 2026".

**Fix:** correct the numbers, and add a test that reads the data files and fails when the prose disagrees.

*`SKILL.md:8,124,216,217,308` · `evidence-collection/SKILL.md:3,36` · `README.md:19-20,193` · Medium*

### 🟢 12. Checker JSON has no schema version or documented shape

**Why:** CI consumers can't detect format changes, and the exit-code contract (1 on critical) is only visible in code.

**Fix:** add `"schemaVersion": 1, "tool": "evidence-checker"` to the object at `evidence-checker.js:425`. Then document in SKILL.md step 5: top-level `date, organization, system, templates{NN:{…}}, crossReferences, summary{templates, critical, high, medium}`, plus the exit codes (0 ok, 1 critical gaps or bad input).

*`tools/evidence-checker.js:425,434` · Small · ✅ quick win*

### 🟢 13. extract-evidence says it outputs JSON files

**Why:** the command says "Evidence JSON files". In fact the script merges results into the config and writes a `.bak` copy (`extract-evidence.js:105`), so a user looks for files that don't exist.

**Fix:** say "Merges evidence into compliance-config.json; the previous version is saved as compliance-config.json.bak."

*`commands/extract-evidence.md:21` · Small · ✅ quick win*

### 🟢 14. The build writes a different plugin identity

**Why:** `build.ts:198-205` builds `dist/claude-plugin/plugin.json` from `source/manifest.json`. That gives the name `llm-compliance`, license MIT and a different description, while the shipped manifest says `ai-compliance` and CC0. Shipping `dist/` would publish a different plugin.

**Fix:** read name, license and description from `.claude-plugin/plugin.json`, or align `source/manifest.json` and assert equality in `npm run validate`.

*`build.ts:198-205` · `source/manifest.json:3-7` · Medium*

### ⚪ 15. Jurisdiction vocabulary differs between the manifest and the lookup

**Why:** `source/manifest.json:71` offers `eu, uk, us, canada…`, but `/jurisdiction-lookup` uses `EU`, `US-CA` and so on.

**Fix:** use the matrix codes in both.

*`source/manifest.json:71` · Small · ✅ quick win*

### ⚪ 16. Attribution claim no longer true

**Why:** the README says all commits carry Claude Sonnet 4.6 attribution, but later commits name other models.

**Fix:** say "commits include a Co-Authored-By trailer naming the model used".

*`README.md:187` · Small · ✅ quick win*

## Patterns across findings

- **Prose counts drift.** Findings 4, 5, 8 and 11 all come from facts retyped by hand in several files. A single test that derives the counts from `tools/data/*.json` and `templates/` would stop the whole cluster.
- **Three sources of manifest truth disagree.** `source/manifest.json`, `.claude-plugin/plugin.json` and the build output differ on name, license and description (1, 3, 14). Pick `plugin.json` as the source and generate the rest.
- **Written for the repo, not the installed plugin.** Findings 7, 9 and 10 share one blind spot. Testing one install from the marketplace into a scratch project would surface all three.

**Next step:** fix 1 and 2 before the Directory submission, then 3 to 8 in one pass (all Small), then bump the version (6) and reinstall. Re-run skill-reviewer after that pass and watch the finding count drop. That's the loop.

*Severity legend: 🔴 fix before publishing · 🟡 fix before next release · 🟢 polish · ⚪ skip · 🟣 strength*
