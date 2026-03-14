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
- `templates/` — 22 evidence templates covering all compliance categories
- `tools/autofill.js` — Auto-fills templates from `compliance-config.json`
- `tools/interactive/` — 6 HTML tools for human-judgment fields (risk classification, bias testing, consent design, human oversight, impact scoring, security assessment)
- `tools/data/` — Extracted jurisdiction matrix and deadline data in JSON
- Workflow: Edit config → Run interactive tools → Run autofill → Review output → Hand to legal

## Updating
- When adding or updating a jurisdiction, update both the regional file and the Global Overview
- Keep the world map HTML data in sync with regional file changes
- Maintain the comparison matrix in Global Overview when any jurisdiction's status changes
