// @ai-generated — Claude Sonnet 4.6 (Anthropic)
/**
 * Tests for tools/extractors/*
 * Smoke tests: verify modules load without errors and handle edge cases gracefully.
 * Full integration tests require a live git repo and are skipped when unavailable.
 */

'use strict';

var test = require('node:test');
var assert = require('node:assert/strict');
var path = require('path');
var fs = require('fs');
var os = require('os');
var { execFileSync } = require('child_process');

var EXTRACTORS_DIR = path.join(__dirname, '..', 'tools', 'extractors');

// ── Module loading ────────────────────────────────────────────────────────────

test('git-evidence.js loads without syntax errors', function() {
  var filePath = path.join(EXTRACTORS_DIR, 'git-evidence.js');
  assert.ok(fs.existsSync(filePath), 'git-evidence.js not found');
  // node --check validates syntax without executing
  execFileSync(process.execPath, ['--check', filePath]);
});

test('package-evidence.js loads without syntax errors', function() {
  var filePath = path.join(EXTRACTORS_DIR, 'package-evidence.js');
  assert.ok(fs.existsSync(filePath), 'package-evidence.js not found');
  execFileSync(process.execPath, ['--check', filePath]);
});

test('ci-evidence.js loads without syntax errors', function() {
  var filePath = path.join(EXTRACTORS_DIR, 'ci-evidence.js');
  assert.ok(fs.existsSync(filePath), 'ci-evidence.js not found');
  execFileSync(process.execPath, ['--check', filePath]);
});

test('sast-dast-evidence.js loads without syntax errors', function() {
  var filePath = path.join(EXTRACTORS_DIR, 'sast-dast-evidence.js');
  assert.ok(fs.existsSync(filePath), 'sast-dast-evidence.js not found');
  execFileSync(process.execPath, ['--check', filePath]);
});

// ── Runner ────────────────────────────────────────────────────────────────────

test('extract-evidence.js loads without syntax errors', function() {
  var filePath = path.join(__dirname, '..', 'tools', 'extract-evidence.js');
  assert.ok(fs.existsSync(filePath), 'extract-evidence.js not found');
  execFileSync(process.execPath, ['--check', filePath]);
});

// ── autofill.js ───────────────────────────────────────────────────────────────

test('autofill.js loads without syntax errors', function() {
  var filePath = path.join(__dirname, '..', 'tools', 'autofill.js');
  assert.ok(fs.existsSync(filePath), 'autofill.js not found');
  execFileSync(process.execPath, ['--check', filePath]);
});

// ── git-evidence integration: run against this repo ──────────────────────────

test('git-evidence.js produces valid JSON output for current repo', function() {
  var repoRoot = path.join(__dirname, '..');
  var scriptPath = path.join(EXTRACTORS_DIR, 'git-evidence.js');
  var result = execFileSync(
    process.execPath,
    [scriptPath, '--repo', repoRoot],
    { encoding: 'utf8', timeout: 30000 }
  );
  var parsed = JSON.parse(result);
  assert.ok(parsed, 'output should be valid JSON');
  // Basic shape assertions
  assert.ok(typeof parsed === 'object', 'output should be an object');
});

test('git-evidence.js output has expected top-level keys', function() {
  var repoRoot = path.join(__dirname, '..');
  var scriptPath = path.join(EXTRACTORS_DIR, 'git-evidence.js');
  var result = execFileSync(
    process.execPath,
    [scriptPath, '--repo', repoRoot],
    { encoding: 'utf8', timeout: 30000 }
  );
  var parsed = JSON.parse(result);
  var expectedKeys = ['codeReview', 'changeManagement', 'aiCodeGeneration', 'securityPractices', 'autoFillFields'];
  expectedKeys.forEach(function(k) {
    assert.ok(k in parsed, 'git-evidence output missing key: ' + k);
  });
  // Nested structure checks
  assert.ok(typeof parsed.codeReview.totalCommits === 'number', 'codeReview.totalCommits should be a number');
  assert.ok(Array.isArray(parsed.autoFillFields) || typeof parsed.autoFillFields === 'object', 'autoFillFields should exist');
});

// ── package-evidence integration: run against this repo ──────────────────────

test('package-evidence.js produces valid JSON for current repo', function() {
  var repoRoot = path.join(__dirname, '..');
  var scriptPath = path.join(EXTRACTORS_DIR, 'package-evidence.js');
  var result = execFileSync(
    process.execPath,
    [scriptPath, '--repo', repoRoot],
    { encoding: 'utf8', timeout: 30000 }
  );
  var parsed = JSON.parse(result);
  assert.ok(typeof parsed === 'object', 'output should be an object');
});

// ── i18n generate-templates ───────────────────────────────────────────────────

test('generate-templates.js loads without syntax errors', function() {
  var filePath = path.join(__dirname, '..', 'tools', 'i18n', 'generate-templates.js');
  assert.ok(fs.existsSync(filePath), 'generate-templates.js not found');
  execFileSync(process.execPath, ['--check', filePath]);
});
