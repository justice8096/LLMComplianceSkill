/**
 * Shared utilities for compliance interactive tools
 */

// --- i18n (browser-side) ---
var _i18nLocale = 'en';
var _i18nData = {};
var _i18nEn = {};
var _i18nReady = false;

/**
 * Translate a dot-path key. Falls back to English, then to the raw key.
 * @param {string} key  e.g. 'tools.securityAssessment.step1' or 'ui.btn.next'
 * @param {string} [fallback]  Optional fallback string
 * @returns {string}
 */
function t(key, fallback) {
  var val = _i18nResolve(_i18nData, key);
  if (val !== undefined) return val;
  var enVal = _i18nResolve(_i18nEn, key);
  if (enVal !== undefined) return enVal;
  return fallback !== undefined ? fallback : key;
}

function _i18nResolve(obj, key) {
  var parts = key.split('.');
  var val = obj;
  for (var i = 0; i < parts.length; i++) {
    if (val == null || typeof val !== 'object') return undefined;
    // Try joining remaining parts as a single dotted key (handles flat keys like "severity.critical")
    var rest = parts.slice(i).join('.');
    if (typeof val[rest] === 'string') return val[rest];
    val = val[parts[i]];
  }
  return typeof val === 'string' ? val : undefined;
}

/**
 * Load a locale file asynchronously from ../i18n/locales/<code>.json
 * Falls back to 'en' if the requested locale is not found.
 * @param {string} code  BCP-47 locale code, e.g. 'zh-CN', 'ko', 'en'
 * @param {Function} [callback]  Called when loading is complete
 */
function i18nLoad(code, callback) {
  var basePath = '../i18n/locales/';

  function loadJson(url, cb) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.onload = function() {
      if (xhr.status === 200) {
        try { cb(null, JSON.parse(xhr.responseText)); } catch(e) { cb(e); }
      } else {
        cb(new Error('HTTP ' + xhr.status));
      }
    };
    xhr.onerror = function() { cb(new Error('Network error')); };
    xhr.send();
  }

  // Always load English first as fallback
  loadJson(basePath + 'en.json', function(err, enData) {
    if (err) {
      console.warn('[i18n] Failed to load en.json:', err);
      _i18nReady = true;
      if (callback) callback();
      return;
    }
    _i18nEn = enData;

    if (!code || code === 'en') {
      _i18nData = enData;
      _i18nLocale = 'en';
      _i18nReady = true;
      if (callback) callback();
      return;
    }

    loadJson(basePath + code + '.json', function(err2, locData) {
      if (err2) {
        console.warn('[i18n] Locale "' + code + '" not found, using en');
        _i18nData = enData;
        _i18nLocale = 'en';
      } else {
        _i18nData = locData;
        _i18nLocale = code;
      }
      _i18nReady = true;
      if (callback) callback();
    });
  });
}

/**
 * Get the current locale code.
 * @returns {string}
 */
function i18nCurrentLocale() {
  return _i18nLocale;
}

/**
 * Create a locale switcher dropdown. Calls onChange(code) when user picks a locale.
 * @param {Function} onChange  callback(localeCode)
 * @returns {HTMLElement}
 */
function createLocaleSwitcher(onChange) {
  var locales = [
    { code: 'en', name: 'English' },
    { code: 'zh-CN', name: '中文（简体）' },
    { code: 'ko', name: '한국어' },
    { code: 'ja', name: '日本語' },
    { code: 'pt-BR', name: 'Português (BR)' },
    { code: 'es', name: 'Español' },
    { code: 'fr', name: 'Français' }
  ];

  var row = el('div', { className: 'field-row' });
  // F-009 (WCAG 4.1.2): The locale switcher needs an accessible name. The
  // visible label exists, but aria-label gives screen readers the cleanest
  // announcement regardless of label-for plumbing.
  var localeLabel = t('ui.locale.label', 'Language');
  row.appendChild(el('label', { className: 'field-label' }, [localeLabel]));
  var select = el('select', { className: 'field-select', 'aria-label': localeLabel });
  // F-018 (WCAG 1.4.1): Each locale option shows its native-script name AND
  // its Latin BCP-47 code (e.g., "한국어 (ko)"). A user who can't read the
  // native script still has an identifier they can recognize / search for /
  // describe verbally — color/script alone is no longer the sole means of
  // distinguishing the current locale.
  for (var i = 0; i < locales.length; i++) {
    var displayLabel = locales[i].name + ' (' + locales[i].code + ')';
    var opt = el('option', { value: locales[i].code, textContent: displayLabel });
    if (locales[i].code === _i18nLocale) opt.selected = true;
    select.appendChild(opt);
  }
  select.addEventListener('change', function() {
    var code = select.value;
    i18nLoad(code, function() {
      try { sessionStorage.setItem('wizard_locale', code); } catch(e) {}
      if (onChange) onChange(code);
    });
  });
  row.appendChild(select);
  return row;
}

/**
 * Get the saved locale from sessionStorage, or detect from browser language.
 * @returns {string}
 */
function i18nDetectLocale() {
  try {
    var saved = sessionStorage.getItem('wizard_locale');
    if (saved) return saved;
  } catch(e) {}
  var lang = (navigator.language || 'en').toLowerCase();
  if (lang.indexOf('zh') === 0) return 'zh-CN';
  if (lang.indexOf('ko') === 0) return 'ko';
  if (lang.indexOf('ja') === 0) return 'ja';
  if (lang.indexOf('pt') === 0) return 'pt-BR';
  if (lang.indexOf('es') === 0) return 'es';
  if (lang.indexOf('fr') === 0) return 'fr';
  return 'en';
}

// --- Config load/save ---
function loadConfigFromFile(callback) {
  // F-013 (WCAG 1.3.1): The file input is created in-memory and click()ed
  // immediately, so the OS file picker is what the user actually interacts
  // with. The aria-label makes the input itself accessible if any AT inspects
  // the DOM (some screen-reader modes describe the file picker invocation).
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json';
  input.setAttribute('aria-label', t('ui.loadConfig.fileLabel', 'Load configuration JSON file'));
  input.onchange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const config = JSON.parse(ev.target.result);
        callback(config);
      } catch (err) {
        alert('Invalid JSON file: ' + err.message);
      }
    };
    reader.readAsText(file);
  };
  input.click();
}

function saveConfigToFile(config) {
  config.dates = config.dates || {};
  config.dates.configLastUpdated = new Date().toISOString().split('T')[0];
  const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'compliance-config.json';
  a.click();
  URL.revokeObjectURL(url);
}

function exportMarkdown(filename, content) {
  const blob = new Blob([content], { type: 'text/markdown' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// --- UI helpers ---
function el(tag, attrs, children) {
  attrs = attrs || {};
  children = children || [];
  const e = document.createElement(tag);
  for (const k of Object.keys(attrs)) {
    const v = attrs[k];
    if (k === 'className') e.className = v;
    else if (k === 'textContent') e.textContent = v;
    else if (k.startsWith('on')) e.addEventListener(k.slice(2).toLowerCase(), v);
    else e.setAttribute(k, v);
  }
  for (const child of children) {
    if (typeof child === 'string') e.appendChild(document.createTextNode(child));
    else if (child) e.appendChild(child);
  }
  return e;
}

// F-010 (WCAG 1.3.1): Heading-hierarchy convention.
// The framework uses h1 for the page title (in buildChrome()) and h2 inside
// each section. Step renderers should use h3 for sub-section headings —
// never h1 (would duplicate the page title) and never skip from h2 to h4.
// Following this convention keeps the document outline navigable for screen
// readers that announce headings as a tree.
function createSection(title, contentArray) {
  const section = el('div', { className: 'section' });
  section.appendChild(el('h2', {}, [title]));
  for (const item of contentArray) {
    if (item) section.appendChild(item);
  }
  return section;
}

// F-014 (WCAG 1.3.1): Helper for result-summary tables in review steps.
// Wizards previously rendered <table> tags by hand; this helper enforces
// <caption> for table purpose and scope="col" on <th> so screen readers
// announce column headers when navigating data cells. Adopt incrementally
// across wizards — old hand-written tables remain valid until migrated.
function createResultTable(caption, headers, rows) {
  const table = el('table', { className: 'result-table' });
  if (caption) {
    table.appendChild(el('caption', {}, [caption]));
  }
  if (headers && headers.length) {
    const thead = el('thead', {});
    const trHead = el('tr', {});
    for (const h of headers) {
      trHead.appendChild(el('th', { scope: 'col' }, [h]));
    }
    thead.appendChild(trHead);
    table.appendChild(thead);
  }
  const tbody = el('tbody', {});
  for (const row of (rows || [])) {
    const tr = el('tr', {});
    for (const cell of row) {
      tr.appendChild(el('td', {}, [cell == null ? '' : String(cell)]));
    }
    tbody.appendChild(tr);
  }
  table.appendChild(tbody);
  return table;
}

// F-015 (WCAG 1.3.1): Helper for status-badge pills. Wizards previously
// rendered <span class="badge enacted">Enacted</span> inline; this helper
// adds role="status" so assistive tech announces the badge as a state
// indicator rather than treating it as decorative text. Adopt incrementally.
function createBadge(type, text) {
  return el('span', { className: 'badge ' + type, role: 'status', textContent: text });
}

function createToggle(label, value, onChange) {
  // F-001 (WCAG 2.1.1, 4.1.2): Yes/No toggle pair is a role="group" with the
  // question text as aria-label. Each button carries aria-pressed for state.
  // Arrow keys move focus between the two; native button keyboard semantics
  // (Enter/Space) trigger onClick. type="button" prevents accidental form submit.
  const wrapper = el('div', { className: 'toggle-row' });
  wrapper.appendChild(el('label', { className: 'toggle-label' }, [label]));
  const group = el('div', {
    className: 'toggle-group',
    role: 'group',
    'aria-label': label
  });

  const yesBtn = el('button', {
    className: 'toggle-btn' + (value === true ? ' active yes' : ''),
    textContent: t('ui.toggle.yes', 'Yes'),
    type: 'button',
    'aria-pressed': value === true ? 'true' : 'false',
    onClick: function() { onChange(true); updateToggle(wrapper, true); }
  });
  const noBtn = el('button', {
    className: 'toggle-btn' + (value === false ? ' active no' : ''),
    textContent: t('ui.toggle.no', 'No'),
    type: 'button',
    'aria-pressed': value === false ? 'true' : 'false',
    onClick: function() { onChange(false); updateToggle(wrapper, false); }
  });

  function onGroupKeydown(e) {
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      noBtn.focus();
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      yesBtn.focus();
    }
  }
  yesBtn.addEventListener('keydown', onGroupKeydown);
  noBtn.addEventListener('keydown', onGroupKeydown);

  group.appendChild(yesBtn);
  group.appendChild(noBtn);
  wrapper.appendChild(group);
  return wrapper;
}

function updateToggle(wrapper, value) {
  const btns = wrapper.querySelectorAll('.toggle-btn');
  btns[0].className = 'toggle-btn' + (value === true ? ' active yes' : '');
  btns[1].className = 'toggle-btn' + (value === false ? ' active no' : '');
  // F-001: Keep aria-pressed in sync with visual state for assistive tech.
  btns[0].setAttribute('aria-pressed', value === true ? 'true' : 'false');
  btns[1].setAttribute('aria-pressed', value === false ? 'true' : 'false');
}

// F-008 (WCAG 1.3.1): Auto-incrementing id counter so every form control has
// a unique id wired to its label's `for=`. Without this, clicking the label
// doesn't focus the control and screen readers don't read the label when the
// control receives focus.
var _fieldIdCounter = 0;
function _nextFieldId(prefix) {
  return (prefix || 'field') + '-' + (++_fieldIdCounter);
}

function createSelect(label, options, value, onChange) {
  // F-008: id on the control, for= on the label
  const id = _nextFieldId('select');
  const select = el('select', { id: id, className: 'field-select' });
  for (const opt of options) {
    const option = el('option', { value: opt.value, textContent: opt.label });
    if (opt.value === value) option.selected = true;
    select.appendChild(option);
  }
  select.addEventListener('change', function() { onChange(select.value); });
  const row = el('div', { className: 'field-row' });
  row.appendChild(el('label', { className: 'field-label', 'for': id }, [label]));
  row.appendChild(select);
  return row;
}

function createTextInput(label, value, onChange, placeholder, autocomplete) {
  // F-008: id on the control, for= on the label.
  // F-016 (WCAG 1.3.5): Optional `autocomplete` parameter lets callers tag
  //   inputs with semantic intent (e.g., "name", "email", "organization").
  //   Browsers use this for autofill and password managers, AT can announce
  //   it, and forms become more efficient to complete. Default "off" keeps
  //   sensitive fields from accidental autofill until callers opt in.
  const id = _nextFieldId('input');
  const input = el('input', {
    id: id, type: 'text', className: 'field-input', value: value || '', placeholder: placeholder || '',
    autocomplete: autocomplete || 'off'
  });
  input.addEventListener('input', function() { onChange(input.value); });
  const row = el('div', { className: 'field-row' });
  row.appendChild(el('label', { className: 'field-label', 'for': id }, [label]));
  row.appendChild(input);
  return row;
}

function createTextArea(label, value, onChange, placeholder) {
  // F-008: id on the control, for= on the label
  const id = _nextFieldId('textarea');
  const ta = el('textarea', { id: id, className: 'field-textarea', placeholder: placeholder || '' });
  ta.value = value || '';
  ta.addEventListener('input', function() { onChange(ta.value); });
  const row = el('div', { className: 'field-row' });
  row.appendChild(el('label', { className: 'field-label', 'for': id }, [label]));
  row.appendChild(ta);
  return row;
}

function createAlert(type, text) {
  // F-007 (WCAG 1.4.1): Color is not the sole differentiator. Prefix the
  // alert text with a non-color symbol that conveys severity, and set
  // role="alert" for danger/warning (interrupts screen-reader output) or
  // role="status" for info/success (announces politely).
  var prefix = { danger: '⚠ ', warning: '⚠ ', success: '✓ ', info: 'ℹ ' }[type] || '';
  var role = (type === 'danger' || type === 'warning') ? 'alert' : 'status';
  return el('div', { className: 'alert ' + type, textContent: prefix + text, role: role });
}

// --- Common CSS ---
var SHARED_CSS = [
  // All wizard styling is scoped under #wizard-root. Pre-F-012 this leaked via
  // global `*`, `body`, `h1`, `h2`, `h3` selectors — fine when the wizard was
  // the entire page, but a cross-component regression now that F-012 preserves
  // non-wizard DOM. Anchoring to #wizard-root keeps the host page untouched.
  '#wizard-root, #wizard-root *, #wizard-root *::before, #wizard-root *::after { box-sizing: border-box; }',
  '#wizard-root * { margin: 0; padding: 0; }',
  '#wizard-root { font-family: "Segoe UI", system-ui, -apple-system, sans-serif; background: #0B1426; color: #F0EBE0; line-height: 1.6; max-width: 900px; margin: 0 auto; padding: 24px; }',
  '#wizard-root h1 { font-size: 1.8em; margin-bottom: 8px; color: #E8B96A; font-weight: 300; letter-spacing: 1px; }',
  '#wizard-root h2 { font-size: 1.2em; margin: 24px 0 12px; color: #9AACBA; font-weight: 400; border-bottom: 1px solid #1E2D3D; padding-bottom: 6px; }',
  '#wizard-root h3 { font-size: 1em; margin: 16px 0 8px; color: #6B7B8D; }',
  '.subtitle { color: #6B7B8D; font-size: 0.9em; margin-bottom: 24px; }',
  '.section { margin-bottom: 32px; }',
  '.toolbar { display: flex; gap: 12px; margin-bottom: 24px; flex-wrap: wrap; }',
  '.btn { padding: 8px 20px; border: 1px solid #3A4A5A; border-radius: 4px; background: #1E2D3D; color: #F0EBE0; cursor: pointer; font-size: 0.85em; transition: all 0.15s; }',
  '.btn:hover { background: #2A3D4D; border-color: #D4943A; }',
  '.btn.primary { background: #D4943A; border-color: #D4943A; color: #0B1426; font-weight: 600; }',
  '.btn.primary:hover { background: #E8B96A; }',
  '.btn.success { background: #2A7B7B; border-color: #2A7B7B; }',
  '.btn.success:hover { background: #3A9E9E; }',
  '.toggle-row { display: flex; align-items: center; justify-content: space-between; padding: 10px 16px; border: 1px solid #1E2D3D; border-radius: 4px; margin-bottom: 6px; background: #0D1830; }',
  '.toggle-label { flex: 1; font-size: 0.9em; padding-right: 16px; }',
  '.toggle-group { display: flex; gap: 4px; }',
  '.toggle-btn { padding: 4px 16px; border: 1px solid #3A4A5A; border-radius: 3px; background: transparent; color: #6B7B8D; cursor: pointer; font-size: 0.8em; }',
  '.toggle-btn.active.yes { background: #c0392b; border-color: #c0392b; color: white; }',
  '.toggle-btn.active.no { background: #2A7B7B; border-color: #2A7B7B; color: white; }',
  // F-007 (WCAG 1.4.1): A non-color visual indicator for the active state.
  // Checkmark prefix renders identically in dark/light/forced-colors themes
  // and remains visible to users who can't perceive the background change.
  '.toggle-btn.active::before { content: "\\2713\\00a0"; font-weight: bold; }',
  '.field-row { display: flex; align-items: center; gap: 12px; margin-bottom: 8px; }',
  '.field-label { min-width: 200px; font-size: 0.85em; color: #9AACBA; }',
  '.field-input, .field-select, .field-textarea { flex: 1; padding: 6px 10px; background: #0D1830; border: 1px solid #3A4A5A; border-radius: 3px; color: #F0EBE0; font-size: 0.85em; font-family: inherit; }',
  '.field-textarea { min-height: 60px; resize: vertical; }',
  // F-004 (WCAG 2.4.7): Visible keyboard focus indicator. We keep the
  // orange border-color highlight (improves perceived focus for all users)
  // but DON'T strip outline anymore — :focus-visible adds a high-contrast
  // ring for keyboard users only, while mouse-only focus stays minimal.
  '.field-input:focus, .field-select:focus, .field-textarea:focus { border-color: #D4943A; }',
  '.field-input:focus-visible, .field-select:focus-visible, .field-textarea:focus-visible, .btn:focus-visible, .toggle-btn:focus-visible, .skip-link:focus-visible { outline: 2px solid #E8B96A; outline-offset: 2px; }',
  '.badge { display: inline-block; padding: 2px 8px; border-radius: 3px; font-size: 0.7em; margin: 2px; }',
  '.badge.enacted { background: #D4943A33; color: #E8B96A; border: 1px solid #D4943A55; }',
  '.badge.active-sector { background: #2A7B7B33; color: #4DBFBF; border: 1px solid #2A7B7B55; }',
  '.alert { padding: 12px 16px; border-radius: 4px; margin: 12px 0; font-size: 0.9em; }',
  '.alert.danger { background: #c0392b22; border: 1px solid #c0392b55; color: #e74c3c; }',
  '.alert.success { background: #2A7B7B22; border: 1px solid #2A7B7B55; color: #4DBFBF; }',
  '.alert.warning { background: #D4943A22; border: 1px solid #D4943A55; color: #E8B96A; }',
  '.alert.info { background: #1E2D3D; border: 1px solid #3A4A5A; color: #9AACBA; }',
  '.result-table { width: 100%; border-collapse: collapse; margin: 12px 0; }',
  '.result-table th, .result-table td { padding: 8px 12px; text-align: left; border: 1px solid #1E2D3D; font-size: 0.85em; }',
  '.result-table th { background: #1E2D3D; color: #9AACBA; }',
  '.result-table td { background: #0D1830; }',
  '.step { display: none; }',
  '.step.active { display: block; }',
  '.step-nav { display: flex; justify-content: space-between; margin-top: 24px; }',
  '.progress { display: flex; gap: 8px; margin-bottom: 24px; }',
  '.progress-dot { width: 10px; height: 10px; border-radius: 50%; background: #3A4A5A; }',
  '.progress-dot.active { background: #D4943A; }',
  '.progress-dot.done { background: #2A7B7B; }',
  '.checklist-item { display: flex; align-items: center; gap: 8px; padding: 6px 0; }',
  '.checklist-item input[type="checkbox"] { accent-color: #D4943A; }',
  '.score-high { color: #e74c3c; font-weight: 600; }',
  '.score-med { color: #E8B96A; font-weight: 600; }',
  '.score-low { color: #4DBFBF; font-weight: 600; }',
  '.hidden { display: none; }',
  // F-003: Visually-hidden but available to screen readers — standard pattern
  // for aria-live regions and skip-nav links. WebAIM "sr-only" recipe.
  '.sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0,0,0,0); white-space: nowrap; border: 0; }',
  // F-005: Skip-nav link — off-screen by default, slides into view on focus.
  // Keyboard users see + activate it on first Tab; mouse/touch users never see it.
  '.skip-link { position: absolute; left: -9999px; top: 0; z-index: 999; padding: 8px 16px; background: #D4943A; color: #0B1426; font-weight: 600; text-decoration: none; border-radius: 0 0 4px 0; }',
  '.skip-link:focus { left: 0; }',
  // F-011 (WCAG 2.3.3): Honor prefers-reduced-motion. Users with vestibular
  // disorders or motion sensitivity can opt out of animations OS-wide; we
  // collapse all CSS transitions to near-zero duration so visual changes
  // are instant instead of animated. Scroll behavior also reverts to "auto"
  // (no smooth scroll).
  '@media (prefers-reduced-motion: reduce) {',
  '  #wizard-root, #wizard-root *, #wizard-root *::before, #wizard-root *::after { animation-duration: 0.01ms !important; animation-iteration-count: 1 !important; transition-duration: 0.01ms !important; scroll-behavior: auto !important; }',
  '}'
].join('\n');

function injectCSS() {
  var style = document.createElement('style');
  style.textContent = SHARED_CSS;
  document.head.appendChild(style);
}

// --- Session persistence ---
// Auto-saves form state to sessionStorage so browser reloads don't lose data.
function persistState(key, state) {
  try { sessionStorage.setItem('wizard_' + key, JSON.stringify(state)); } catch(e) {}
}
function restoreState(key) {
  try {
    var raw = sessionStorage.getItem('wizard_' + key);
    return raw ? JSON.parse(raw) : null;
  } catch(e) { return null; }
}
function persistStep(key, step) {
  try { sessionStorage.setItem('wizard_step_' + key, String(step)); } catch(e) {}
}
function restoreStep(key) {
  try {
    var raw = sessionStorage.getItem('wizard_step_' + key);
    return raw !== null ? parseInt(raw, 10) : 0;
  } catch(e) { return 0; }
}

// --- Wizard framework ---
// Renders page chrome (title, toolbar, progress, nav) once.
// Only the step content area is rebuilt on state changes.
// This prevents full-page DOM wipes that destroy in-progress input data.
// Optional: pass stateKey + getState + setState for auto-persist across reloads.
function createWizard(opts) {
  // opts: { title, subtitle, totalSteps, stepLabels, renderStep, onSave, onExport, onLoad,
  //         stateKey, getState, setState }
  var _currentStep = opts.stateKey ? restoreStep(opts.stateKey) : 0;
  if (_currentStep >= opts.totalSteps) _currentStep = 0;
  var _built = false;
  var _stepContainer = null;
  var _progressContainer = null;
  var _navContainer = null;
  // F-003: aria-live region for announcing step transitions to screen readers.
  var _announcer = null;

  function buildChrome() {
    // F-012 (WCAG 4.1.2): Targeted clear instead of `document.body.textContent = ''`.
    // The nuclear clear destroys any external content injected into body
    // (analytics scripts, third-party widgets, dev-tools overlays). We now
    // host all wizard chrome inside #wizard-root and only clear its children
    // on rebuild — anything outside the root survives untouched.
    var root = document.getElementById('wizard-root');
    if (root) {
      root.textContent = '';
    } else {
      root = el('div', { id: 'wizard-root' });
      document.body.appendChild(root);
    }

    // F-005 (WCAG 2.4.1): Skip-nav link — visually-hidden until focused,
    // then jumps to the main content. Lets keyboard users bypass the
    // load/save/export toolbar on every step transition.
    var skipLink = el('a', {
      href: '#step-container',
      className: 'skip-link',
      textContent: t('ui.skipNav', 'Skip to main content')
    });
    root.appendChild(skipLink);

    root.appendChild(el('h1', {}, [opts.title]));
    if (opts.subtitle) root.appendChild(el('p', { className: 'subtitle' }, [opts.subtitle]));

    // F-006 (WCAG 1.3.1): Toolbar is a navigation landmark — distinct
    // aria-label disambiguates it from the wizard-progress nav (F-002) and
    // the step nav at the bottom.
    var toolbar = el('nav', { className: 'toolbar', 'aria-label': t('ui.toolbar.label', 'Toolbar') });
    toolbar.appendChild(el('button', { className: 'btn', type: 'button', textContent: t('ui.btn.loadConfig', 'Load Config'), onClick: function() {
      if (opts.onLoad) opts.onLoad();
    }}));
    toolbar.appendChild(el('button', { className: 'btn', type: 'button', textContent: t('ui.btn.saveConfig', 'Save Config'), onClick: function() {
      if (opts.onSave) opts.onSave();
    }}));
    toolbar.appendChild(el('button', { className: 'btn primary', type: 'button', textContent: t('ui.btn.exportMarkdown', 'Export Markdown'), onClick: function() {
      if (opts.onExport) opts.onExport();
    }}));
    toolbar.appendChild(createLocaleSwitcher(function() { refreshStep(); }));
    root.appendChild(toolbar);

    _progressContainer = el('div', { className: 'progress' });
    root.appendChild(_progressContainer);

    // F-006: Step container is the main landmark. role="main" makes it
    // discoverable by assistive tech as "the primary content of this page."
    _stepContainer = el('main', { id: 'step-container' });
    if (opts.stateKey && opts.getState) {
      var _saveTimer = null;
      _stepContainer.addEventListener('input', function() {
        clearTimeout(_saveTimer);
        _saveTimer = setTimeout(function() {
          persistState(opts.stateKey, opts.getState());
        }, 300);
      });
    }
    root.appendChild(_stepContainer);

    // F-006: Prev/Next pagination is a navigation landmark, separate from
    // both the toolbar and the wizard progress nav.
    _navContainer = el('nav', { className: 'step-nav', 'aria-label': t('ui.stepNav.label', 'Step navigation') });
    root.appendChild(_navContainer);

    // F-003 (WCAG 4.1.3): Visually-hidden live region that announces step
    // transitions for screen readers. polite = wait for screen reader to
    // finish current utterance before announcing; atomic = read the whole
    // message as one chunk so partial updates don't fragment the announcement.
    _announcer = el('div', {
      'aria-live': 'polite',
      'aria-atomic': 'true',
      className: 'sr-only'
    });
    root.appendChild(_announcer);

    _built = true;
  }

  function updateProgress() {
    // F-002 (WCAG 1.3.1): Progress dots are decorative spans without semantic
    // meaning by default. Mark the container as navigation, label with current
    // step count, and give each dot role="img" with a descriptive label so
    // screen-reader users get the same status info sighted users see in color.
    _progressContainer.textContent = '';
    _progressContainer.setAttribute('role', 'navigation');
    _progressContainer.setAttribute(
      'aria-label',
      t('ui.progress.label', 'Wizard progress') + ' — ' +
      t('ui.progress.step', 'Step') + ' ' + (_currentStep + 1) + ' ' +
      t('ui.progress.of', 'of') + ' ' + opts.totalSteps
    );
    for (var i = 0; i < opts.totalSteps; i++) {
      var cls = 'progress-dot';
      var status = t('ui.progress.upcoming', 'upcoming');
      if (i === _currentStep) { cls += ' active'; status = t('ui.progress.current', 'current'); }
      else if (i < _currentStep) { cls += ' done'; status = t('ui.progress.complete', 'complete'); }
      var dotAttrs = {
        className: cls,
        title: opts.stepLabels[i],
        role: 'img',
        'aria-label': (i + 1) + ': ' + opts.stepLabels[i] + ' (' + status + ')'
      };
      if (i === _currentStep) dotAttrs['aria-current'] = 'step';
      _progressContainer.appendChild(el('span', dotAttrs));
    }
  }

  function updateNav() {
    _navContainer.textContent = '';
    if (_currentStep > 0) {
      _navContainer.appendChild(el('button', { className: 'btn', type: 'button', textContent: t('ui.btn.previous', 'Previous'), onClick: function() { _currentStep--; refreshStep(); } }));
    } else {
      _navContainer.appendChild(el('span'));
    }
    if (_currentStep < opts.totalSteps - 1) {
      _navContainer.appendChild(el('button', { className: 'btn primary', type: 'button', textContent: t('ui.btn.next', 'Next'), onClick: function() { _currentStep++; refreshStep(); } }));
    }
  }

  function refreshStep() {
    if (!_built) buildChrome();
    var scrollY = window.scrollY;
    _stepContainer.textContent = '';
    updateProgress();
    opts.renderStep(_currentStep, _stepContainer);
    updateNav();

    // F-003 (WCAG 4.1.3): Announce step transition to screen readers.
    // Setting textContent on the polite live region triggers the announcement.
    if (_announcer) {
      _announcer.textContent =
        t('ui.progress.step', 'Step') + ' ' + (_currentStep + 1) + ' ' +
        t('ui.progress.of', 'of') + ' ' + opts.totalSteps + ': ' +
        opts.stepLabels[_currentStep];
    }

    // F-017 (WCAG 2.4.2): Document title reflects current step. Helps users
    // who keep multiple wizards open in tabs identify which one they're
    // looking at, and gives screen readers / browser history meaningful
    // labels. Format: "Wizard Title — Step N: Step Label".
    document.title = opts.title + ' — ' +
      t('ui.progress.step', 'Step') + ' ' + (_currentStep + 1) + ': ' +
      opts.stepLabels[_currentStep];

    // F-003: Move keyboard focus to the new step content so keyboard users
    // don't get stranded on the Next/Prev button after navigation. tabindex=-1
    // makes the container programmatically focusable without adding it to the
    // tab order; the user can Tab from there to the first form control.
    _stepContainer.setAttribute('tabindex', '-1');
    _stepContainer.focus({ preventScroll: true });

    if (opts.stateKey) {
      persistStep(opts.stateKey, _currentStep);
      if (opts.getState) persistState(opts.stateKey, opts.getState());
    }
    requestAnimationFrame(function() { window.scrollTo(0, scrollY); });
  }

  return {
    render: function() {
      if (opts.stateKey && opts.setState) {
        var saved = restoreState(opts.stateKey);
        if (saved) opts.setState(saved);
      }
      buildChrome();
      refreshStep();
    },
    refreshStep: refreshStep,
    saveNow: function() {
      if (opts.stateKey && opts.getState) persistState(opts.stateKey, opts.getState());
    },
    getCurrentStep: function() { return _currentStep; },
    setStep: function(s) { _currentStep = s; refreshStep(); }
  };
}
