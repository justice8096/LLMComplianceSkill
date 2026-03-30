#!/usr/bin/env node
// @ai-generated — Claude Sonnet 4.6 (Anthropic)
/**
 * i18n Template Generator
 * Reads English templates from ../templates/, translates field names, checkbox labels,
 * section headers, and common terms using a locale file, writes translated templates
 * to ../output/<locale>/
 *
 * Usage:
 *   node generate-templates.js --locale zh-CN
 *   node generate-templates.js --locale es --output ../output/es
 *   node generate-templates.js --list               (list available locales)
 */

var fs = require('fs');
var path = require('path');
var i18n = require('./index');

var TOOLS_DIR = path.join(__dirname, '..');
var TEMPLATES_DIR = path.join(TOOLS_DIR, '..', 'templates');
var OUTPUT_BASE = path.join(TOOLS_DIR, '..', 'output');

// --- CLI parsing ---
function parseArgs() {
  var args = process.argv.slice(2);
  var opts = { locale: null, output: null, list: false };
  for (var i = 0; i < args.length; i++) {
    if (args[i] === '--locale' && args[i + 1]) {
      opts.locale = args[i + 1];
      i++;
    } else if (args[i] === '--output' && args[i + 1]) {
      opts.output = path.resolve(args[i + 1]);
      i++;
    } else if (args[i] === '--list') {
      opts.list = true;
    }
  }
  return opts;
}

// --- Build translation maps from loaded locale ---

/**
 * Build a map of English field display names → translated display names.
 * Only includes keys where the translation differs from English.
 */
function buildFieldMap(enData, localeData) {
  var map = {};
  var enFields = enData.fields || {};
  var locFields = localeData.fields || {};
  var keys = Object.keys(enFields);
  for (var i = 0; i < keys.length; i++) {
    var k = keys[i];
    if (locFields[k] && locFields[k] !== enFields[k]) {
      map[enFields[k]] = locFields[k];
    }
  }
  return map;
}

/**
 * Build a map of English checkbox labels → translated labels.
 */
function buildCheckboxMap(enData, localeData) {
  var map = {};
  var enCb = enData.checkboxes || {};
  var locCb = localeData.checkboxes || {};
  var keys = Object.keys(enCb);
  for (var i = 0; i < keys.length; i++) {
    var k = keys[i];
    if (locCb[k] && locCb[k] !== enCb[k]) {
      map[enCb[k]] = locCb[k];
    }
  }
  return map;
}

/**
 * Build a map of English template names → translated names.
 */
function buildTemplateNameMap(enData, localeData) {
  var map = {};
  var enNames = enData.templateNames || {};
  var locNames = localeData.templateNames || {};
  var keys = Object.keys(enNames);
  for (var i = 0; i < keys.length; i++) {
    var k = keys[i];
    if (locNames[k] && locNames[k] !== enNames[k]) {
      map[enNames[k]] = locNames[k];
    }
  }
  return map;
}

/**
 * Build a map of English common terms → translated terms.
 */
function buildCommonMap(enData, localeData) {
  var map = {};
  var enCommon = enData.common || {};
  var locCommon = localeData.common || {};
  var keys = Object.keys(enCommon);
  for (var i = 0; i < keys.length; i++) {
    var k = keys[i];
    if (locCommon[k] && locCommon[k] !== enCommon[k]) {
      map[enCommon[k]] = locCommon[k];
    }
  }
  return map;
}

/**
 * Build jurisdiction name map.
 */
function buildJurisdictionMap(enData, localeData) {
  var map = {};
  var enJur = enData.jurisdictions || {};
  var locJur = localeData.jurisdictions || {};
  var keys = Object.keys(enJur);
  for (var i = 0; i < keys.length; i++) {
    var k = keys[i];
    if (locJur[k] && locJur[k] !== enJur[k]) {
      map[enJur[k]] = locJur[k];
    }
  }
  return map;
}

// --- Translation engine ---

/**
 * Translate table field names in markdown.
 * Matches: | Field Name | value |  →  | Translated Name | value |
 */
function translateTableFields(md, fieldMap) {
  var entries = Object.keys(fieldMap);
  // Sort by length descending to avoid partial matches
  entries.sort(function(a, b) { return b.length - a.length; });

  for (var i = 0; i < entries.length; i++) {
    var en = entries[i];
    var loc = fieldMap[en];
    var escaped = en.replace(/[.*+?^${}()|[\]\\\/]/g, '\\$&');
    // Match field name as first cell in a table row
    var re = new RegExp('(\\|\\s*)' + escaped + '(\\s*\\|)', 'g');
    md = md.replace(re, '$1' + loc + '$2');
  }
  return md;
}

/**
 * Translate checkbox labels in markdown.
 * Matches: [ ] Label  or  [x] Label
 */
function translateCheckboxes(md, cbMap) {
  var entries = Object.keys(cbMap);
  entries.sort(function(a, b) { return b.length - a.length; });

  for (var i = 0; i < entries.length; i++) {
    var en = entries[i];
    var loc = cbMap[en];
    var escaped = en.replace(/[.*+?^${}()|[\]\\\/]/g, '\\$&');
    var re = new RegExp('(\\[[ x]\\]\\s*)' + escaped, 'g');
    md = md.replace(re, '$1' + loc);
  }
  return md;
}

/**
 * Translate the template title (first H1 line).
 */
function translateTitle(md, templateNameMap) {
  var entries = Object.keys(templateNameMap);
  for (var i = 0; i < entries.length; i++) {
    var en = entries[i];
    var loc = templateNameMap[en];
    if (md.indexOf('# ' + en) !== -1) {
      md = md.replace('# ' + en, '# ' + loc);
      break;
    }
  }
  return md;
}

/**
 * Translate common severity/status terms when they appear as standalone values.
 * Only replace inside table cells to avoid false positives.
 */
function translateCommonTerms(md, commonMap) {
  var entries = Object.keys(commonMap);
  entries.sort(function(a, b) { return b.length - a.length; });

  for (var i = 0; i < entries.length; i++) {
    var en = entries[i];
    var loc = commonMap[en];
    var escaped = en.replace(/[.*+?^${}()|[\]\\\/]/g, '\\$&');
    // Only in table cells or bracketed placeholders
    var re = new RegExp('(\\|\\s*)' + escaped + '(\\s*\\|)', 'g');
    md = md.replace(re, '$1' + loc + '$2');
    // In bracket options: [Critical / High / Medium / Low]
    var re2 = new RegExp('(\\[(?:[^\\]]*\\s)??)' + escaped + '((?:\\s[^\\]]*)?\\])', 'g');
    md = md.replace(re2, '$1' + loc + '$2');
  }
  return md;
}

/**
 * Translate jurisdiction names in running text and table cells.
 */
function translateJurisdictions(md, jurMap) {
  var entries = Object.keys(jurMap);
  entries.sort(function(a, b) { return b.length - a.length; });

  for (var i = 0; i < entries.length; i++) {
    var en = entries[i];
    var loc = jurMap[en];
    // Replace in table cells and checkbox labels, not in law citations
    var escaped = en.replace(/[.*+?^${}()|[\]\\\/]/g, '\\$&');
    // In checkbox labels: [ ] **European Union**  →  [ ] **Unión Europea**
    var re = new RegExp('(\\*\\*?)' + escaped + '(\\*\\*?)', 'g');
    md = md.replace(re, '$1' + loc + '$2');
  }
  return md;
}

/**
 * Full translation pipeline for one template.
 */
function translateTemplate(md, maps) {
  md = translateTitle(md, maps.templateNames);
  md = translateTableFields(md, maps.fields);
  md = translateCheckboxes(md, maps.checkboxes);
  md = translateCommonTerms(md, maps.common);
  md = translateJurisdictions(md, maps.jurisdictions);
  return md;
}

// --- Main ---
function main() {
  var opts = parseArgs();

  if (opts.list) {
    var locales = i18n.listLocales();
    process.stdout.write('Available locales: ' + locales.join(', ') + '\n');
    return;
  }

  if (!opts.locale) {
    process.stderr.write('Usage: node generate-templates.js --locale <code>\n');
    process.stderr.write('       node generate-templates.js --list\n');
    process.exit(1);
  }

  if (opts.locale === 'en') {
    process.stderr.write('Locale "en" is the source language — nothing to translate.\n');
    process.exit(0);
  }

  // Load locale data
  var localesDir = path.join(__dirname, 'locales');
  var enPath = path.join(localesDir, 'en.json');
  var locPath = path.join(localesDir, opts.locale + '.json');

  if (!fs.existsSync(locPath)) {
    process.stderr.write('Locale file not found: ' + locPath + '\n');
    process.stderr.write('Available: ' + i18n.listLocales().join(', ') + '\n');
    process.exit(1);
  }

  var enData = JSON.parse(fs.readFileSync(enPath, 'utf8'));
  var localeData = JSON.parse(fs.readFileSync(locPath, 'utf8'));

  process.stderr.write('Generating ' + localeData.name + ' (' + opts.locale + ') templates...\n');

  // Build all translation maps
  var maps = {
    fields: buildFieldMap(enData, localeData),
    checkboxes: buildCheckboxMap(enData, localeData),
    templateNames: buildTemplateNameMap(enData, localeData),
    common: buildCommonMap(enData, localeData),
    jurisdictions: buildJurisdictionMap(enData, localeData)
  };

  var fieldCount = Object.keys(maps.fields).length;
  var cbCount = Object.keys(maps.checkboxes).length;
  process.stderr.write('  Translation maps: ' + fieldCount + ' fields, ' + cbCount + ' checkboxes\n');

  // Output directory
  var outputDir = opts.output || path.join(OUTPUT_BASE, opts.locale);
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

  // Process each template
  var templateFiles = fs.readdirSync(TEMPLATES_DIR)
    .filter(function(f) { return f.endsWith('.md'); })
    .sort();

  var translated = 0;
  for (var i = 0; i < templateFiles.length; i++) {
    var file = templateFiles[i];
    var templatePath = path.join(TEMPLATES_DIR, file);
    var md = fs.readFileSync(templatePath, 'utf8');

    if (file === '00-Evidence-Collection-Kit-README.md') {
      // Copy README as-is (or translate title only)
      fs.writeFileSync(path.join(outputDir, file), md, 'utf8');
      process.stderr.write('  - ' + file + ' (copied)\n');
      continue;
    }

    var result = translateTemplate(md, maps);
    fs.writeFileSync(path.join(outputDir, file), result, 'utf8');
    translated++;
    process.stderr.write('  + ' + file + '\n');
  }

  process.stderr.write('\nDone! ' + translated + ' templates translated to ' + outputDir + '\n');
}

main();
