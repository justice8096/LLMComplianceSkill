#!/usr/bin/env node
/**
 * AI Compliance Evidence Collection Kit — Auto-Fill Script
 * Reads compliance-config.json, fills template fields that don't need human input,
 * writes filled templates to ../output/
 *
 * Usage: node autofill.js [--config path/to/config.json]
 */

const fs = require('fs');
const path = require('path');

const TOOLS_DIR = __dirname;
const TEMPLATES_DIR = path.join(TOOLS_DIR, '..', 'templates');
const OUTPUT_DIR = path.join(TOOLS_DIR, '..', 'output');
const DATA_DIR = path.join(TOOLS_DIR, 'data');

// --- Load data ---
function loadJSON(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function loadConfig(configPath) {
  const cfg = loadJSON(configPath);
  return cfg;
}

// --- Template field replacement ---
function fillTableField(md, fieldName, value) {
  // Match: | Field Name | <empty or placeholder> |
  // Handles variations with spaces and placeholder brackets
  const escaped = fieldName.replace(/[.*+?^${}()|[\]\\\/]/g, '\\$&');
  const re = new RegExp(
    `(\\|\\s*${escaped}\\s*\\|)([^|]*)(\\|)`,
    'gm'
  );
  return md.replace(re, (match, prefix, oldVal, suffix) => {
    const trimmed = oldVal.trim();
    // Only fill if empty or contains a placeholder like [YYYY-MM-DD]
    if (trimmed === '' || trimmed.startsWith('[') || trimmed === 'Value') {
      return `${prefix} ${value} ${suffix}`;
    }
    return match;
  });
}

function fillCheckbox(md, itemText, checked) {
  if (!checked) return md;
  const escaped = itemText.replace(/[.*+?^${}()|[\]\\\/]/g, '\\$&');
  const re = new RegExp(`\\[ \\](\\s*${escaped})`, 'g');
  return md.replace(re, `[x]$1`);
}

function fillJurisdictionCheckbox(md, jurisdictionName) {
  // Match: [ ] **jurisdiction**  or  [ ] jurisdiction
  const escaped = jurisdictionName.replace(/[.*+?^${}()|[\]\\\/]/g, '\\$&');
  const re = new RegExp(`\\[ \\](\\s*\\*?\\*?${escaped})`, 'gi');
  return md.replace(re, `[x]$1`);
}

// --- Core logic ---
function getRequiredTemplates(config, matrix) {
  const required = new Set();
  for (const jur of config.jurisdictions) {
    for (const [tplNum, jurisdictions] of Object.entries(matrix.templateRequirements)) {
      if (jurisdictions[jur]) {
        required.add(tplNum);
      }
    }
  }
  return [...required].sort();
}

function getRelevantDeadlines(config, deadlines) {
  return deadlines.filter(d => {
    return config.jurisdictions.includes(d.jurisdiction) ||
           config.jurisdictions.some(j => d.jurisdiction.startsWith(j));
  }).sort((a, b) => a.date.localeCompare(b.date));
}

function calcAlertDate(dateStr, daysBefore = 90) {
  const d = new Date(dateStr);
  d.setDate(d.getDate() - daysBefore);
  return d.toISOString().split('T')[0];
}

function today() {
  return new Date().toISOString().split('T')[0];
}

// --- Fill a single template ---
function fillTemplate(templatePath, config, matrix, deadlines) {
  let md = fs.readFileSync(templatePath, 'utf8');
  const filename = path.basename(templatePath);
  const tplNum = filename.split('-')[0];

  // --- A. Metadata fields (all templates) ---
  md = fillTableField(md, 'AI System Name', config.system.name || '');
  md = fillTableField(md, 'AI System / Model Name', config.system.name || '');
  md = fillTableField(md, 'AI System / Decision Name', config.system.name || '');
  md = fillTableField(md, 'Organization', config.organization.name || '');
  md = fillTableField(md, 'Document owner', config.organization.documentOwner || '');
  md = fillTableField(md, 'Session/GitHub ref', config.organization.sessionRef || '');
  md = fillTableField(md, 'Date created', today());
  md = fillTableField(md, 'Author', 'Auto-filled by compliance tooling (review and add human author)');
  md = fillTableField(md, 'Model version', config.system.version || '');
  md = fillTableField(md, 'Version / Release', config.system.version || '');

  // --- B. System details ---
  if (config.system.modelType) md = fillTableField(md, 'Model type', config.system.modelType);
  if (config.system.foundationModel) md = fillTableField(md, 'Foundation model (if any)', config.system.foundationModel);
  if (config.system.inputTypes?.length) md = fillTableField(md, 'Input types', config.system.inputTypes.join(', '));
  if (config.system.outputTypes?.length) md = fillTableField(md, 'Output types', config.system.outputTypes.join(', '));
  if (config.system.deploymentEnvironment) md = fillTableField(md, 'Deployment environment', config.system.deploymentEnvironment);
  if (config.system.description) {
    md = fillTableField(md, 'What the system does', config.system.description);
    md = fillTableField(md, 'System purpose', config.system.description);
  }
  if (config.system.intendedUsers?.length) md = fillTableField(md, 'Intended users', config.system.intendedUsers.join(', '));

  // Jurisdictions
  const jurNames = config.jurisdictions.map(j => {
    const info = matrix.jurisdictions[j];
    return info ? info.name : j;
  });
  if (jurNames.length) {
    md = fillTableField(md, 'Target jurisdictions', jurNames.join(', '));
    md = fillTableField(md, 'Deployment jurisdictions', jurNames.join(', '));
    md = fillTableField(md, 'Jurisdictions covered', jurNames.join(', '));
    md = fillTableField(md, 'Jurisdictions', jurNames.join(', '));
  }

  // Sectors
  if (config.system.sector?.length) {
    md = fillTableField(md, 'Sector(s)', config.system.sector.join(', '));
    md = fillTableField(md, 'Decision domain', config.system.sector.join(', '));
  }

  // --- C. Risk classification (if set) ---
  const rc = config.riskClassification || {};
  if (rc.euAiAct) {
    md = fillTableField(md, 'Assigned risk level', rc.euAiAct);
    md = fillTableField(md, 'Risk classification assigned', rc.euAiAct);
    md = fillTableField(md, 'Classification', rc.euAiAct);
  }

  // --- D. Jurisdiction selector (template 21) ---
  if (tplNum === '21') {
    for (const jur of config.jurisdictions) {
      const info = matrix.jurisdictions[jur];
      if (info) {
        md = fillJurisdictionCheckbox(md, info.name);
      }
    }

    // Build required template list
    const required = getRequiredTemplates(config, matrix);
    const rows = required.map((num, i) => {
      const name = matrix.templateNames[num] || `Template ${num}`;
      const templateJurs = Object.keys(matrix.templateRequirements[num] || {})
        .filter(j => config.jurisdictions.includes(j));
      return `| ${i + 1} | ${num} — ${name} | ${templateJurs.join(', ')} | [ ] |`;
    }).join('\n');

    md = md.replace(
      /\| Priority \| Template \| Deadline \| Status \|\n\|----------|---------|---------|:---:|\n\| +\| +\| +\| \[ \] \|\n\| +\| +\| +\| \[ \] \|\n\| +\| +\| +\| \[ \] \|/,
      `| Priority | Template | Jurisdictions | Status |\n|----------|---------|--------------|:---:|\n${rows}`
    );
  }

  // --- E. Deadline tracker (template 22) ---
  if (tplNum === '22') {
    const relevant = getRelevantDeadlines(config, deadlines);
    // Mark relevant deadlines with status
    for (const dl of relevant) {
      // Check compliance status checkboxes based on dates
      if (dl.status === 'in-force') {
        // Mark the N/A or In progress checkbox — leave for human
      }
    }

    // Fill project-specific calendar if target launch exists
    if (config.dates?.targetLaunch) {
      const launch = config.dates.targetLaunch;
      const urgentDeadlines = relevant.filter(d => d.date <= launch && d.status !== 'in-force');
      if (urgentDeadlines.length > 0) {
        const warning = `\n\n> **WARNING:** ${urgentDeadlines.length} deadline(s) fall before your target launch date (${launch}):\n` +
          urgentDeadlines.map(d => `> - **${d.date}** — ${d.jurisdiction}: ${d.law}`).join('\n') + '\n';
        md = md.replace('## 4. Project-Specific Deadline Calendar', warning + '\n## 4. Project-Specific Deadline Calendar');
      }
    }
  }

  // --- F. Cross-references from interactive tool results ---
  const itr = config.interactiveToolResults || {};

  if (itr.riskClassification && tplNum === '17') {
    const rc = itr.riskClassification;
    if (rc.euAiAct) md = fillTableField(md, 'EU AI Act', `[x] ${rc.euAiAct}`);
    if (rc.coloradoSB24205) md = fillTableField(md, 'Colorado SB 24-205', `[x] ${rc.coloradoSB24205}`);
  }

  if (itr.humanOversight && tplNum === '01') {
    md = fillTableField(md, 'Oversight model', itr.humanOversight.model || '');
  }

  // --- G. Evidence checklist cross-references ---
  const ct = config.completedTemplates || {};
  if (ct['17'] && tplNum === '06') {
    md = fillCheckbox(md, 'Risk classification completed', true);
  }
  if (ct['07'] && tplNum === '19') {
    md = fillCheckbox(md, 'PIA/DPIA completed', true);
  }
  if (ct['18'] && tplNum === '09') {
    md = fillCheckbox(md, 'Competency training completed and recorded', true);
  }
  if (ct['15'] && tplNum === '19') {
    md = fillCheckbox(md, 'Cybersecurity measures implemented', true);
  }
  if (ct['09'] && tplNum === '19') {
    md = fillCheckbox(md, 'Human oversight measures designed into system', true);
  }

  return md;
}

// --- Generate manifest ---
function generateManifest(config, matrix, deadlines) {
  const required = getRequiredTemplates(config, matrix);
  const relevant = getRelevantDeadlines(config, deadlines);
  const jurNames = config.jurisdictions.map(j => matrix.jurisdictions[j]?.name || j);

  let md = `# Compliance Evidence Manifest\n\n`;
  md += `**Generated:** ${today()}\n`;
  md += `**Organization:** ${config.organization.name || '(not set)'}\n`;
  md += `**AI System:** ${config.system.name || '(not set)'}\n`;
  md += `**Jurisdictions:** ${jurNames.join(', ') || '(none selected)'}\n\n`;
  md += `---\n\n`;

  md += `## Required Templates (${required.length})\n\n`;
  md += `| # | Template | Required By |\n`;
  md += `|---|---------|-------------|\n`;
  for (const num of required) {
    const name = matrix.templateNames[num] || `Template ${num}`;
    const jurs = Object.keys(matrix.templateRequirements[num] || {})
      .filter(j => config.jurisdictions.includes(j));
    md += `| ${num} | ${name} | ${jurs.join(', ')} |\n`;
  }

  md += `\n## Relevant Deadlines\n\n`;
  md += `| Date | Jurisdiction | Law | Alert Date (90 days) |\n`;
  md += `|------|-------------|-----|---------------------|\n`;
  for (const dl of relevant) {
    const alert = dl.date !== 'now' ? calcAlertDate(dl.date) : 'NOW';
    md += `| ${dl.date} | ${dl.jurisdiction} | ${dl.law} | ${alert} |\n`;
  }

  if (config.dates?.targetLaunch) {
    const urgent = relevant.filter(d => d.date <= config.dates.targetLaunch && d.status === 'upcoming');
    if (urgent.length > 0) {
      md += `\n## ⚠ Deadlines Before Launch (${config.dates.targetLaunch})\n\n`;
      for (const dl of urgent) {
        md += `- **${dl.date}** — ${dl.jurisdiction}: ${dl.law}\n`;
      }
    }
  }

  md += `\n---\n\n*Generated by AI Compliance Evidence Collection Kit autofill tool.*\n`;
  return md;
}

// --- Main ---
function main() {
  const args = process.argv.slice(2);
  let configPath = path.join(TOOLS_DIR, 'compliance-config.json');
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--config' && args[i + 1]) {
      configPath = path.resolve(args[i + 1]);
    }
  }

  console.log(`Loading config from: ${configPath}`);
  const config = loadConfig(configPath);
  const matrix = loadJSON(path.join(DATA_DIR, 'jurisdiction-matrix.json'));
  const deadlines = loadJSON(path.join(DATA_DIR, 'deadline-data.json'));

  // Ensure output directory
  if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  // Process each template
  const templateFiles = fs.readdirSync(TEMPLATES_DIR)
    .filter(f => f.endsWith('.md') && f !== '00-Evidence-Collection-Kit-README.md')
    .sort();

  let filled = 0;
  for (const file of templateFiles) {
    const templatePath = path.join(TEMPLATES_DIR, file);
    const result = fillTemplate(templatePath, config, matrix, deadlines);
    const outputPath = path.join(OUTPUT_DIR, file);
    fs.writeFileSync(outputPath, result, 'utf8');
    filled++;
    console.log(`  ✓ ${file}`);
  }

  // Copy README
  const readmeSrc = path.join(TEMPLATES_DIR, '00-Evidence-Collection-Kit-README.md');
  if (fs.existsSync(readmeSrc)) {
    fs.copyFileSync(readmeSrc, path.join(OUTPUT_DIR, '00-Evidence-Collection-Kit-README.md'));
    console.log('  ✓ 00-Evidence-Collection-Kit-README.md (copied)');
  }

  // Generate manifest
  const manifest = generateManifest(config, matrix, deadlines);
  fs.writeFileSync(path.join(OUTPUT_DIR, 'MANIFEST.md'), manifest, 'utf8');
  console.log('  ✓ MANIFEST.md (generated)');

  // Save config snapshot
  const snapshot = { ...config, _generatedAt: today(), _generatedBy: 'autofill.js' };
  fs.writeFileSync(
    path.join(OUTPUT_DIR, 'compliance-config-snapshot.json'),
    JSON.stringify(snapshot, null, 2),
    'utf8'
  );
  console.log('  ✓ compliance-config-snapshot.json');

  console.log(`\nDone! ${filled} templates filled → ${OUTPUT_DIR}`);

  const required = getRequiredTemplates(config, matrix);
  if (required.length > 0) {
    console.log(`\nRequired templates for your jurisdictions: ${required.join(', ')}`);
  } else if (config.jurisdictions.length === 0) {
    console.log('\nNote: No jurisdictions selected in config. Select jurisdictions to see required templates.');
  }
}

main();
