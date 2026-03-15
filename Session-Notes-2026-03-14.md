# LLMComplianceSkill Session Notes - 2026-03-14

**Session:** Evidence Collection Pipeline - PR Creation & Wizard Rendering Fix
**Branch:** `evidence-collection-pipeline`
**PR:** https://github.com/justice8096/LLMComplianceSkill/pull/1
**Author:** Justin + Claude Opus 4.6

---

## What Was Accomplished

### 1. PR Created (PR #1)
- Pushed branch `evidence-collection-pipeline` to remote
- Created PR with 18 files changed, 8,183 insertions
- Commit: `Add evidence collection pipeline: checker, 13 interactive tools, and plugin structure`

**Files in PR:**
- `tools/evidence-checker.js` - Validates all 22 templates with severity-based findings (CRITICAL/HIGH/MEDIUM), 20 template-specific checker functions, cross-reference validation, CLI flags: `--config`, `--output`, `--template NN`, `--verbose`, `--json`
- 13 new interactive HTML tools completing the full set of 19
- `tools/autofill.js` - Extended Section F with 94 lines for 14 interactive tool result integrations
- `.claude-plugin/plugin.json` - Plugin manifest for Claude Code
- `skills/ai-compliance/SKILL.md` - Skill definition with trigger phrases
- `skills/ai-compliance/references/jurisdiction-quick-ref.md` - Quick reference for jurisdictions

### 2. Fixed Auto-Refresh Bug in Interactive Tools

**Problem:** All 19 interactive HTML tools used a `render()` function that called `document.body.textContent = ''` - wiping the entire page DOM on every toggle click, model selection, or add/remove action. This destroyed in-progress text inputs, reset scroll position, and lost focus. Users experienced data loss while filling in forms.

**Root Cause:** The rendering pattern rebuilt the entire page (title, toolbar, progress dots, step content, navigation) every time any state change occurred. A single toggle click would:
1. Clear all DOM elements
2. Rebuild the h1, toolbar, progress dots
3. Rebuild the current step content
4. Rebuild the navigation
5. Reset scroll to top

**Solution: `createWizard()` Framework**

Added to `shared.js` a `createWizard()` function that:
- Builds page chrome (title, toolbar, progress dots, navigation) **once** via `buildChrome()`
- Only rebuilds the **step content container** (`#step-container`) on state changes via `refreshStep()`
- Preserves scroll position using `requestAnimationFrame` after content refresh
- Manages step navigation (prev/next) internally
- Provides a clean API: `wizard.render()`, `wizard.refreshStep()`, `wizard.getCurrentStep()`, `wizard.setStep(n)`

**Conversion Pattern:**

Before (old pattern):
```javascript
function render() {
  document.body.textContent = '';  // DESTROYS everything
  // rebuild h1, toolbar, progress, step dispatch, nav
}
function renderStep1() {
  var s = el('div', { className: 'section' });
  // ... build content ...
  document.body.appendChild(s);
}
render();
```

After (wizard pattern):
```javascript
var wizard = createWizard({
  title: 'Tool Name',
  subtitle: 'Template NN',
  totalSteps: N,
  stepLabels: [...],
  renderStep: function(step, container) {
    if (step === 0) renderStep1(container);
    // ...
  },
  onLoad: function() {
    loadConfigFromFile(function(c) { config = c; loadState(); wizard.refreshStep(); });
  },
  onSave: doSave,
  onExport: doExport
});
function renderStep1(container) {
  var s = el('div', { className: 'section' });
  // ... build content (unchanged) ...
  container.appendChild(s);  // appends to container, NOT document.body
}
wizard.render();
```

**Key Conversion Rules:**
1. Delete the old `render()` function (the one with `document.body.textContent = ''`)
2. Delete `renderProgress()` and `renderNav()` (wizard handles these)
3. Each `renderStepN()` accepts a `container` parameter, appends to it instead of `document.body`
4. All `render()` calls inside step functions become `wizard.refreshStep()`
5. Toggles that don't reveal/hide fields no longer trigger any re-render
6. Final `render()` call becomes `wizard.render()`

**Conversion Progress (at time of writing):**
- 8 of 19 tools converted: human-oversight, governance-framework, incident-management, training-data-disclosure, automated-decision-logic, consent-design, security-assessment, transparency-documentation
- 11 tools in progress via background agents

---

## Architecture Decisions

### Why `createWizard()` Instead of Other Approaches

**Considered alternatives:**
1. **Debouncing renders** - Wouldn't fix the core problem of DOM destruction
2. **Save/restore focus and scroll** - Band-aid that doesn't prevent the visual flash
3. **Virtual DOM / diffing** - Overkill for vanilla JS tools, adds complexity
4. **Pre-render all steps as hidden** - Memory waste for 7+ step wizards with dynamic content

**Why wizard framework won:**
- Minimal changes to business logic (only rendering plumbing changes)
- Step content still fully rebuilds on `refreshStep()` - no stale DOM bugs
- Toolbar, progress, and nav are stable - no flicker
- Scroll position preserved via `requestAnimationFrame`
- Clean separation: wizard handles chrome, tool handles step content
- Add/remove dynamic items (roles, systems, data sources) still work via `refreshStep()`

### Render Call Categories

| Category | Action | Old Behavior | New Behavior |
|----------|--------|-------------|--------------|
| Step navigation | Prev/Next | `render()` | Wizard handles internally |
| Config load | Load Config | `render()` | `wizard.refreshStep()` |
| Toggle (reveals fields) | Yes/No | `render()` | `wizard.refreshStep()` |
| Toggle (state only) | Yes/No | `render()` | No re-render needed |
| Add/remove items | + Add / Remove | `render()` | `wizard.refreshStep()` |
| Initial load | Page load | `render()` | `wizard.render()` |

---

## Files Modified This Session

| File | Change |
|------|--------|
| `tools/interactive/shared.js` | Added `createWizard()` framework (~83 lines) |
| `tools/interactive/human-oversight.html` | Converted to wizard pattern (reference implementation) |
| `tools/interactive/governance-framework.html` | Converted to wizard pattern |
| `tools/interactive/incident-management.html` | Converted to wizard pattern |
| `tools/interactive/training-data-disclosure.html` | Converted to wizard pattern |
| `tools/interactive/automated-decision-logic.html` | Converted to wizard pattern |
| `tools/interactive/consent-design.html` | Converted to wizard pattern |
| `tools/interactive/security-assessment.html` | Converted to wizard pattern |
| `tools/interactive/transparency-documentation.html` | Converted to wizard pattern |

---

## Pipeline Reminder

Full evidence collection workflow:
1. Edit `tools/compliance-config.json` with system/org details
2. Open interactive HTML tools in browser -> fill human-judgment fields -> save back to config
3. `node tools/autofill.js --config tools/compliance-config.json --output output/`
4. `node tools/evidence-checker.js --config tools/compliance-config.json --output output/`
5. Hand `output/` folder to legal/compliance for review

---

## Pending / Next Steps

- [ ] Complete wizard conversion for remaining 11 interactive tools (agents in progress)
- [ ] Commit the wizard refactor changes
- [ ] Test all 19 tools in browser after conversion
- [ ] Consider: further optimize by avoiding `refreshStep()` for toggles that only show/hide adjacent elements (use targeted DOM manipulation instead)
