---
description: Populate compliance evidence templates with extracted data and configuration values
---
# Autofill Templates

Populate compliance evidence templates with extracted data.

## Parameters

- **config_path** (required): Path to compliance-config.json
- **templates** (optional): Specific template numbers to fill (default: all)
- **output_dir** (optional): Output directory (default: output)

## Process

1. Load compliance config and extracted evidence
2. Match evidence fields to template placeholders
3. Fill templates with available data
4. Flag unfilled fields for manual completion

## Output

Filled markdown templates in the output directory.
