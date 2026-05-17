# Extract Evidence

Automatically extract compliance evidence from project artifacts.

## Parameters

- **project_path** (required): Path to project
- **config_path** (optional): Path to compliance-config.json (default: compliance-config.json)

## Extractors

1. **Git Evidence** — Commit history, review practices, contributor patterns
2. **Package Evidence** — Dependencies, licenses, version management
3. **CI Evidence** — Pipeline config, test coverage, deployment practices

## Output

Evidence JSON files ready for template autofill.
