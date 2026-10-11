const { test } = require('node:test');
const assert = require('node:assert');
const { spawnSync } = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const TOOLS = path.join(__dirname, '..', 'tools');

function makeConfig(dir, models) {
  const cfg = JSON.parse(fs.readFileSync(path.join(TOOLS, 'compliance-config.example.json'), 'utf8'));
  cfg.organization.name = 'Regression Org';
  cfg.system.name = 'Regression System';
  cfg.jurisdictions = ['US-CA', 'US-NY', 'US-CO'];
  cfg.interactiveToolResults.llmSelector.selectedModels = models;
  const p = path.join(dir, 'config.json');
  fs.writeFileSync(p, '\uFEFF' + JSON.stringify(cfg, null, 2), 'utf8');
  return p;
}

function runAutofill(cfg, out) {
  return spawnSync(process.execPath, [path.join(TOOLS, 'autofill.js'), '--config', cfg, '--output', out], { encoding: 'utf8' });
}

test('autofill completes all templates with no LLM models (no ReferenceError)', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'llmc-reg-'));
  const out = path.join(dir, 'out');
  const r = runAutofill(makeConfig(dir, []), out);
  assert.strictEqual(r.status, 0, r.stderr);
  assert.ok(!/ReferenceError/.test(r.stderr), r.stderr);
  assert.ok(fs.existsSync(path.join(out, '23-Supply-Chain-Risk.md')), 'template 23 written');
  assert.ok(fs.existsSync(path.join(out, '24-SAST-DAST-Scan.md')), 'template 24 written');
  assert.ok(fs.existsSync(path.join(out, 'MANIFEST.md')), 'manifest written');
});

test('autofill fills template 23 component inventory when an LLM model is selected', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'llmc-reg-'));
  const out = path.join(dir, 'out');
  const r = runAutofill(makeConfig(dir, ['openai-gpt-4o']), out);
  assert.strictEqual(r.status, 0, r.stderr);
  const t23 = fs.readFileSync(path.join(out, '23-Supply-Chain-Risk.md'), 'utf8');
  assert.ok(/gpt-4o/i.test(t23), 'template 23 lists the selected model');
});

test('evidence-checker accepts template label variants and skips undefined metadata rows', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'llmc-reg-'));
  const cfg = makeConfig(dir, []);
  const out = path.join(dir, 'out');
  assert.strictEqual(runAutofill(cfg, out).status, 0);
  const r = spawnSync(process.execPath, [path.join(TOOLS, 'evidence-checker.js'), '--config', cfg, '--output', out, '--json'], { encoding: 'utf8' });
  const json = JSON.parse(r.stdout);
  for (const tn of ['04', '05', '12', '21', '22']) {
    const meta = (json.templates[tn].deepCheck.findings || []).filter(f => f.section === 'Metadata');
    assert.deepStrictEqual(meta, [], 'template ' + tn + ' should have no metadata findings');
  }
});