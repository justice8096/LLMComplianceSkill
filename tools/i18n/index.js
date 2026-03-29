/**
 * i18n module for LLMComplianceSkill
 * Node.js locale loading, lookup, and reverse-lookup for autofill and template generator.
 *
 * API:
 *   i18n.load('zh-CN')               — load a locale (falls back to 'en' for missing keys)
 *   i18n.t('fields.ai-system-name')  — translate a dot-path key
 *   i18n.fieldName('ai-system-name') — get translated field display name
 *   i18n.fieldKey('AI System Name')  — reverse-lookup: display name → key
 *   i18n.checkboxKey('SAST scan completed') — reverse-lookup: checkbox label → key
 *   i18n.listLocales()               — list all available locale codes
 *   i18n.currentLocale()             — current locale code
 */

var fs = require('fs');
var path = require('path');

var LOCALES_DIR = path.join(__dirname, 'locales');

var _locale = 'en';
var _data = {};
var _en = {};

// Reverse-lookup caches (built lazily after load)
var _fieldKeyCache = null;    // display name → dot-path key (en values)
var _checkboxKeyCache = null; // checkbox label → dot-path key (en values)

function loadLocaleFile(code) {
  var filePath = path.join(LOCALES_DIR, code + '.json');
  try {
    var raw = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(raw);
  } catch (e) {
    return null;
  }
}

/**
 * Load a locale. Falls back to 'en' for any missing keys.
 * @param {string} code  BCP-47 locale code, e.g. 'zh-CN', 'ko', 'en'
 */
function load(code) {
  if (!code || code === 'en') {
    var enData = loadLocaleFile('en');
    if (!enData) throw new Error('[i18n] Could not load en.json from ' + LOCALES_DIR);
    _en = enData;
    _data = enData;
    _locale = 'en';
    _fieldKeyCache = null;
    _checkboxKeyCache = null;
    return;
  }

  if (!_en.locale) {
    var enBase = loadLocaleFile('en');
    if (!enBase) throw new Error('[i18n] Could not load en.json from ' + LOCALES_DIR);
    _en = enBase;
  }

  var localeData = loadLocaleFile(code);
  if (!localeData) {
    process.stderr.write('[i18n] Warning: locale "' + code + '" not found, falling back to en\n');
    _data = _en;
    _locale = 'en';
  } else {
    _data = localeData;
    _locale = code;
  }
  _fieldKeyCache = null;
  _checkboxKeyCache = null;
}

/**
 * Resolve a dot-path key in a data object.
 * Handles dotted flat keys (e.g., "severity.critical" as a key under "common").
 * Tries naive split first, then progressively joins remaining parts with dots.
 * @param {Object} obj
 * @param {string} key  e.g. 'fields.ai-system-name' or 'tools.securityAssessment.threat.promptInjectionDirect'
 * @returns {string|undefined}
 */
function resolvePath(obj, key) {
  var parts = key.split('.');
  // Try greedy: walk as deep as possible, then join remaining parts as a flat key
  var val = obj;
  for (var i = 0; i < parts.length; i++) {
    if (val == null || typeof val !== 'object') return undefined;
    // Try joining remaining parts as a single dotted key
    var rest = parts.slice(i).join('.');
    if (typeof val[rest] === 'string') return val[rest];
    val = val[parts[i]];
  }
  return typeof val === 'string' ? val : undefined;
}

/**
 * Translate a dot-path key. Falls back to en.json value, then to the key itself.
 * @param {string} key       e.g. 'fields.ai-system-name'
 * @param {string} [fallback]  Optional explicit fallback string
 * @returns {string}
 */
function t(key, fallback) {
  var val = resolvePath(_data, key);
  if (val !== undefined) return val;
  // Fall back to English
  var enVal = resolvePath(_en, key);
  if (enVal !== undefined) return enVal;
  return fallback !== undefined ? fallback : key;
}

/**
 * Get translated display name for a field key (shorthand for t('fields.' + key)).
 * @param {string} key  e.g. 'ai-system-name'
 * @returns {string}
 */
function fieldName(key) {
  return t('fields.' + key, key);
}

/**
 * Build the reverse field-key lookup cache from en.json (English display names → keys).
 * Cache is keyed on English display name so lookups work regardless of current locale.
 */
function buildFieldKeyCache() {
  if (_fieldKeyCache) return;
  _fieldKeyCache = {};
  var fields = _en.fields || {};
  var keys = Object.keys(fields);
  for (var i = 0; i < keys.length; i++) {
    _fieldKeyCache[fields[keys[i]]] = keys[i];
  }
}

/**
 * Reverse-lookup: English display name → field key.
 * Used by autofill.js to find the key for a given template table header.
 * @param {string} displayName  e.g. 'AI System Name'
 * @returns {string|null}  e.g. 'ai-system-name', or null if not found
 */
function fieldKey(displayName) {
  buildFieldKeyCache();
  return _fieldKeyCache[displayName] || null;
}

/**
 * Build the reverse checkbox-key lookup cache from en.json.
 */
function buildCheckboxKeyCache() {
  if (_checkboxKeyCache) return;
  _checkboxKeyCache = {};
  var checkboxes = _en.checkboxes || {};
  var keys = Object.keys(checkboxes);
  for (var i = 0; i < keys.length; i++) {
    _checkboxKeyCache[checkboxes[keys[i]]] = keys[i];
  }
}

/**
 * Reverse-lookup: English checkbox label → checkbox key.
 * @param {string} label  e.g. 'SAST scan completed'
 * @returns {string|null}  e.g. 'cb.sast-scan-completed', or null if not found
 */
function checkboxKey(label) {
  buildCheckboxKeyCache();
  return _checkboxKeyCache[label] || null;
}

/**
 * List all available locale codes (by scanning the locales directory).
 * @returns {string[]}
 */
function listLocales() {
  try {
    var files = fs.readdirSync(LOCALES_DIR);
    return files
      .filter(function(f) { return f.endsWith('.json'); })
      .map(function(f) { return f.slice(0, -5); })
      .sort();
  } catch (e) {
    return ['en'];
  }
}

/**
 * Return the currently loaded locale code.
 * @returns {string}
 */
function currentLocale() {
  return _locale;
}

// Auto-load English on require so the module is usable without an explicit load() call.
(function() {
  var enData = loadLocaleFile('en');
  if (enData) {
    _en = enData;
    _data = enData;
  }
})();

module.exports = {
  load: load,
  t: t,
  fieldName: fieldName,
  fieldKey: fieldKey,
  checkboxKey: checkboxKey,
  listLocales: listLocales,
  currentLocale: currentLocale
};
