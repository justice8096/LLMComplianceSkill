# Run Compliance Assessment

Assess an AI/LLM system against applicable regulations and generate a gap analysis.

## Parameters

- **project_path** (required): Path to the AI/LLM project
- **jurisdictions** (optional): Target jurisdictions (default: auto-detect from config)
- **risk_level** (optional): AI system risk classification (default: high)

## Process

1. Load or create compliance-config.json
2. Identify applicable regulations per jurisdiction
3. Run automated evidence extraction
4. Map evidence to regulatory requirements
5. Identify gaps and generate compliance report

## Output

Compliance gap analysis with per-jurisdiction status, missing evidence, and remediation steps.
