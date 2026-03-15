# LLMComplianceSkill

## Purpose
This is a Claude Code skill that helps gather AI and LLM compliance information for relevant jurisdictions while creating a software project. When building an application that uses AI, reference these files to identify applicable regulations, required disclosures, risk classifications, and compliance deadlines for the countries the project will operate in.

## Knowledge Base Structure
- `AI-Regulations-Global-Overview.md` — Map of content, cross-cutting themes, compliance timeline, comparison matrix
- Regional files cover: EU, UK, US, Canada, China, Japan/South Korea, India/Singapore/ASEAN, Australia, New Zealand, Mexico/Latin America, Africa
- `AI-Regulations-World-Map.html` — Interactive D3.js visualization of global regulatory status

## How to Use This Skill
- Add this skill to your planning and coding sessions when building AI-powered applications
- Use it to gather compliance evidence for the jurisdictions your project will operate in
- The output is designed to be handed to a legal or compliance expert to help prove compliance
- Use the Global Overview for cross-jurisdictional comparisons and timeline queries
- Cite specific laws, dates, and provisions — do not generalize
- If a regulation's status may have changed since the last update date, note that caveat

## Key Conventions
- All files include metadata: GitHub session number, upload date, author (human name or LLM model), specific laws the file serves as evidence for, and additional context as needed
- Files use a consistent structure: Overview → Key Legislation → Existing Laws → What This Means for Developers → Resources
- Dates are absolute (not relative) to remain accurate over time
- "Last Updated" header in each file indicates research freshness
- The world map uses four-tier classification: enacted, active-sector, proposed, voluntary

## Response Guidelines
- Lead with the most actionable compliance requirement for the user's jurisdiction
- Distinguish between enacted/binding law and voluntary/proposed frameworks
- Always note key compliance deadlines
- When multiple jurisdictions apply, prioritize by enforcement risk
- Include a disclaimer that this is research, not legal advice

## Evidence Collection Kit

### Templates (23)
- `templates/` — 23 evidence templates (00–23) covering all compliance categories
- Includes supply chain risk (23) with MITRE ATLAS, OWASP LLM03, NIST SP 800-218A, EU AI Act Art. 25

### Interactive Tools (21)
- `tools/interactive/` — 21 browser-based HTML wizard tools for human-judgment fields
- All tools use `createWizard()` from `shared.js` with sessionStorage auto-persist
- Each tool has a `stateKey`, `getState`, and `setState` for persistence across page reloads
- Includes: risk classification, bias testing, consent design, human oversight, impact scoring, security assessment, LLM selector, supply chain risk, and 13 others
- Design: navy #0B1426, amber #D4943A, teal #2A7B7B — zero innerHTML, zero external dependencies

### LLM Registry
- `tools/data/llm-registry.json` — Index file pointing to 6 chunked registry files
- `tools/data/llm-registry-*.json` — 66 models across Meta, Mistral, Google, Microsoft, Chinese providers, and API-only services
- Each model includes compliance metadata, autoFillFields, deployment info, and license details
- Browser loads via `Promise.all` on chunk URLs; Node.js loads sequentially

### Evidence Extractors
- `tools/extractors/git-evidence.js` — Git history analysis (commits, PRs, AI attribution, security practices)
- `tools/extractors/package-evidence.js` — Package ecosystem analysis (npm/pip/cargo/go/composer/maven/gradle)
- `tools/extractors/ci-evidence.js` — CI/CD pipeline analysis (GitHub Actions/GitLab CI/Azure DevOps/etc.)
- `tools/extract-evidence.js` — Runner that orchestrates all 3 extractors and merges into config
- All extractors are zero-dependency Node.js scripts using `execFileSync` for git CLI

### Autofill
- `tools/autofill.js` — Auto-fills templates from `compliance-config.json`
- Integrates LLM registry data, extracted evidence, and manual config
- `tools/compliance-config.example.json` — Example configuration

### Data Files
- `tools/data/jurisdiction-matrix.json` — Jurisdiction comparison data
- `tools/data/deadline-data.json` — Compliance deadline tracking data

### Workflow
1. Run `node extract-evidence.js --repo /path/to/repo` to auto-extract evidence
2. Open interactive tools in browser for human-judgment fields
3. Edit `compliance-config.json` for remaining manual fields
4. Run `node autofill.js` to fill templates
5. Review output and hand to legal/compliance team

## Technical Conventions
- Security pre-commit hook flags unsafe shell patterns even in comments/docs/markdown — avoid trigger words like `exec()` in generated text
- Large generated files (50+ model entries, extensive JSON) should be split across multiple agents writing separate chunk files — single agents hit token limits
- Interactive tools use targeted DOM manipulation (toggle `display:none`) instead of `refreshStep()` for fields with in-progress text — prevents form data loss
- Extractors output JSON to stdout, progress/errors to stderr — designed for piping
- `normalizeModel()` maps registry fields (`countryOfOrigin` to `country`, ISO codes to full names)
- Security: use `execFileSync` with argument arrays, never string-interpolated shell commands
- No `document.body.textContent = ''` — wizard framework handles DOM lifecycle

## Obsidian Integration
- Knowledge base exports go to `D:/SecondBrainData/SoftwarePractices/`
- Templates export to `AI-Compliance-Templates/` subfolder
- Use `[[wikilinks]]` for cross-note references in exported Obsidian notes
- Existing vault notes to keep in sync: Evidence-Collection-Pipeline-Architecture, Wizard-Rendering-Pattern, Claude-Code-Plugin-Skill-Structure, Law-Evidence-Matrix, LLMComplianceSkill-Lessons-Learned

## Updating
- When adding or updating a jurisdiction, update both the regional file and the Global Overview
- Keep the world map HTML data in sync with regional file changes
- Maintain the comparison matrix in Global Overview when any jurisdiction's status changes
- When adding LLM models, add to the appropriate chunk file and update the index if needed
- When adding templates, create a matching interactive tool and update autofill.js
- When exporting to Obsidian, update the corresponding vault notes (pipeline architecture, lessons learned)
- New templates should be copied to `D:/SecondBrainData/SoftwarePractices/AI-Compliance-Templates/`
