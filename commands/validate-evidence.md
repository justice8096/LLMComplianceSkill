---
description: Run evidence-checker to validate completeness and identify gaps in collected compliance documentation
argument-hint: "[output_dir] [strict]"
---
# Validate Evidence

Check completeness of collected compliance documentation.

## Parameters

- **output_dir** (optional): Path to filled templates (default: output)
- **strict** (optional): Also fail on HIGH findings and on any template below 100% complete (default: false)
- **config_path** (optional): Path to compliance-config.json (default: compliance-config.json)

## Run

```bash
node <plugin root>/tools/evidence-checker.js --config <config_path> --output <output_dir> [--strict] [--json]
```

`<plugin root>` is the folder that holds this plugin's `tools/` directory (in a checkout, the repo root). Exit code 0 means no critical gaps; 1 means critical gaps, a strict-mode failure, or unreadable input.

## Checks

- Template completeness percentage
- Required fields vs optional fields
- Cross-template consistency
- Regulatory requirement coverage

## Output

Validation report with completeness scores, gaps, and recommended next steps.
