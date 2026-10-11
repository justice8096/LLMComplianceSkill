# Autofill Templates

Populate compliance evidence templates with extracted data.

## Parameters

- **config_path** (required): Path to compliance-config.json
- **templates** (optional): Template numbers to fill, comma-separated, e.g. `07,08` (default: all)
- **output_dir** (optional): Output directory (default: output)
- **locale** (optional): Output language: en, es, fr, pt-BR, ja, ko, zh-CN (default: en)

## Run

```bash
node <plugin root>/tools/autofill.js --config <config_path> --output <output_dir> [--template 07,08] [--locale es]
```

`<plugin root>` is the folder that holds this plugin's `tools/` directory (in a checkout, the repo root).

## Process

1. Load compliance config and extracted evidence
2. Match evidence fields to template placeholders
3. Fill templates with available data
4. Flag unfilled fields for manual completion

## Output

Filled markdown templates in the output directory.
