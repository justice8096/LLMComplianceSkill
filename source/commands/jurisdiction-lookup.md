# Jurisdiction Lookup

Look up AI regulations and deadlines for a specific jurisdiction.

## Parameters

- **jurisdiction** (required): Target jurisdiction code
- **include_deadlines** (optional): Include upcoming deadlines (default: true)

## Covered Jurisdictions

Use the codes from `skills/ai-compliance/references/data/jurisdiction-matrix.json` (repo-root path, valid from a plugin checkout; `tools/data/jurisdiction-matrix.json` is the same file in the full repo).

| Region | Codes |
|--------|-------|
| Europe | EU, UK |
| United States | US-CA, US-NY, US-IL, US-CT, US-WA, US-CO, US-TX, US-UT, US-NYC |
| Americas | CA (Canada), BR, MX, PE |
| Asia-Pacific | CN, JP, KR, IN, SG, VN, AU, NZ |
| Africa | NG, ZA |

## Output

Applicable regulations, current status (enacted/proposed/voluntary), key requirements, and upcoming deadlines.
