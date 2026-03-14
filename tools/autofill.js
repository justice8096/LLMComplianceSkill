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

  // Template 17: Risk Classification
  if (itr.riskClassification && tplNum === '17') {
    const rc = itr.riskClassification;
    if (rc.euAiAct) md = fillTableField(md, 'EU AI Act', `[x] ${rc.euAiAct}`);
    if (rc.coloradoSB24205) md = fillTableField(md, 'Colorado SB 24-205', `[x] ${rc.coloradoSB24205}`);
    if (rc.overallRisk) md = fillTableField(md, 'Assigned risk level', rc.overallRisk);
    if (rc.justification) md = fillTableField(md, 'Classification justification', rc.justification);
  }

  // Template 01: Transparency — from humanOversight and transparencyDocumentation
  if (itr.humanOversight && tplNum === '01') {
    md = fillTableField(md, 'Oversight model', itr.humanOversight.model || '');
  }
  if (itr.transparencyDocumentation && tplNum === '01') {
    const td = itr.transparencyDocumentation;
    if (td.explainabilityMethod) md = fillTableField(md, 'Explainability method', td.explainabilityMethod);
    if (td.notificationMethod) md = fillTableField(md, 'AI notification method', td.notificationMethod);
  }

  // Template 06: Impact/Risk — from impactRiskScoring
  if (itr.impactRiskScoring && tplNum === '06') {
    const irs = itr.impactRiskScoring;
    if (irs.overallRiskLevel) md = fillTableField(md, 'Overall risk level', irs.overallRiskLevel);
    if (irs.riskClassification) md = fillTableField(md, 'Risk classification', irs.riskClassification);
  }

  // Template 07: PIA — from piaAssessment
  if (itr.piaAssessment && tplNum === '07') {
    const pia = itr.piaAssessment;
    if (pia.overallRiskLevel) md = fillTableField(md, 'Overall risk level after mitigation', pia.overallRiskLevel);
    if (pia.decision) md = fillTableField(md, 'Decision', pia.decision);
  }

  // Template 08: Bias — from biasTesting
  if (itr.biasTesting && tplNum === '08') {
    const bt = itr.biasTesting;
    if (bt.testingMethodology) md = fillTableField(md, 'Testing methodology', bt.testingMethodology);
    if (bt.testDate) md = fillTableField(md, 'Last test date', bt.testDate);
  }

  // Template 09: Human Oversight — from humanOversight
  if (itr.humanOversight && tplNum === '09') {
    const ho = itr.humanOversight;
    if (ho.model) md = fillTableField(md, 'Oversight model', ho.model);
    if (ho.overrideMethod) md = fillTableField(md, 'Override mechanism', ho.overrideMethod);
    if (ho.escalationPath) md = fillTableField(md, 'Escalation path', ho.escalationPath);
  }

  // Template 10: Consent — from consentDesign
  if (itr.consentDesign && tplNum === '10') {
    const cd = itr.consentDesign;
    if (cd.consentLanguage) md = fillTableField(md, 'Consent language', cd.consentLanguage);
    if (cd.granularity) md = fillTableField(md, 'Granularity', cd.granularity);
    if (cd.withdrawalMethod) md = fillTableField(md, 'Withdrawal method(s)', cd.withdrawalMethod);
  }

  // Template 11: DSR — from dsrRightsImplementation
  if (itr.dsrRightsImplementation && tplNum === '11') {
    const dsr = itr.dsrRightsImplementation;
    if (dsr.responseTime) md = fillTableField(md, 'Standard response time', dsr.responseTime);
    if (dsr.requestMethod) md = fillTableField(md, 'Request submission method', dsr.requestMethod);
  }

  // Template 15: Security — from securityAssessment
  if (itr.securityAssessment && tplNum === '15') {
    const sa = itr.securityAssessment;
    if (sa.lastAssessmentDate) md = fillTableField(md, 'Last assessment date', sa.lastAssessmentDate);
    if (sa.overallSecurityLevel) md = fillTableField(md, 'Security posture', sa.overallSecurityLevel);
  }

  // Template 02: Disclosure — from disclosureToolkit
  if (itr.disclosureToolkit && tplNum === '02') {
    const dt = itr.disclosureToolkit;
    if (dt.disclosureLanguage) md = fillTableField(md, 'Disclosure language', dt.disclosureLanguage);
    if (dt.disclosurePlacement) md = fillTableField(md, 'Disclosure placement', dt.disclosurePlacement);
  }

  // Template 03: Content Labeling — from contentLabeling
  if (itr.contentLabeling && tplNum === '03') {
    const cl = itr.contentLabeling;
    if (cl.labelingMethod) md = fillTableField(md, 'Labeling method', cl.labelingMethod);
    if (cl.watermarkMethod) md = fillTableField(md, 'Watermark method', cl.watermarkMethod);
  }

  // Template 05: Training Data — from trainingDataDisclosure
  if (itr.trainingDataDisclosure && tplNum === '05') {
    const tdd = itr.trainingDataDisclosure;
    if (tdd.dataGovernanceMethod) md = fillTableField(md, 'Data governance method', tdd.dataGovernanceMethod);
  }

  // Template 12: Governance — from governanceFramework
  if (itr.governanceFramework && tplNum === '12') {
    const gf = itr.governanceFramework;
    if (gf.governanceStructure) md = fillTableField(md, 'Governance structure', gf.governanceStructure);
    if (gf.reviewCycle) md = fillTableField(md, 'Review cycle', gf.reviewCycle);
  }

  // Template 13: Incident Management — from incidentManagement
  if (itr.incidentManagement && tplNum === '13') {
    const im = itr.incidentManagement;
    if (im.escalationContact) md = fillTableField(md, 'Primary escalation contact', im.escalationContact);
    if (im.responseTimeTarget) md = fillTableField(md, 'Response time target', im.responseTimeTarget);
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
