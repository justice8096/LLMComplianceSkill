# Supply Chain Security Audit Report

**Project:** LLMComplianceSkill
**Audit Date:** 2026-03-29
**Auditor:** Claude Opus 4.6 (automated)
**Branch:** evidence-collection-pipeline
**Scope:** Full supply chain security assessment including dependency analysis, CI/CD pipeline, SBOM, SLSA, and framework compliance

---

## 1. Dependency Analysis

### 1.1 Package Manifest

| Item | Status |
|------|--------|
| `package.json` | **Not present** |
| `package-lock.json` | **Not present** |
| `yarn.lock` | **Not present** |
| `pnpm-lock.yaml` | **Not present** |
| Third-party npm dependencies | **None (zero-dependency project)** |

**Finding: PASS** -- The project maintains a strict zero-dependency policy. No package manager manifest exists, eliminating entire classes of supply chain risk (typosquatting, dependency confusion, transitive vulnerability inheritance).

### 1.2 Built-in Module Usage by Extractor

| File | `fs` | `path` | `child_process` | External Deps |
|------|------|--------|-----------------|---------------|
| `sast-dast-evidence.js` (new) | Yes | Yes | **No** | **None** |
| `git-evidence.js` | Yes | Yes | `execSync` | None |
| `package-evidence.js` | Yes | Yes | `execSync` | None |
| `ci-evidence.js` | Yes | Yes | **No** | None |
| `extract-evidence.js` (runner) | Yes | Yes | `execFileSync` | None |

**Finding: PASS** -- The new SAST/DAST extractor (`sast-dast-evidence.js`) uses only `fs` and `path` built-ins. It does not use `child_process` at all -- it is a file-parsing-only extractor, which is the most restrictive module profile of all extractors. This aligns with the zero-dependency convention documented in CLAUDE.md.

### 1.3 Dependency Risk Score

| Risk Category | Score | Notes |
|---------------|-------|-------|
| Direct dependencies | 0 | No package.json |
| Transitive dependencies | 0 | No dependency tree |
| Known vulnerabilities | 0 | No dependencies to audit |
| Dependency freshness | N/A | No dependencies |
| License compliance | Clean | Project code only; Node.js built-ins under MIT |
| **Overall Dependency Risk** | **Negligible** | |

---

## 2. CI/CD Pipeline Assessment

### 2.1 Pipeline Configuration

| Item | Status |
|------|--------|
| `.github/workflows/` | **Not present** |
| `.gitlab-ci.yml` | **Not present** |
| `Jenkinsfile` | **Not present** |
| `.circleci/config.yml` | **Not present** |
| Azure DevOps pipelines | **Not present** |

**Finding: GAP** -- No CI/CD pipeline is configured. Builds are local-only. This limits provenance guarantees and prevents automated security scanning, testing, and artifact signing.

### 2.2 Secret Handling

| Item | Status |
|------|--------|
| `.env` in `.gitignore` | Yes |
| Hardcoded secrets in source | Not detected |
| Secret scanning (GitHub Advanced Security) | Not configured |
| `.claude/` in `.gitignore` | Yes (protects local AI config) |

**Finding: PARTIAL PASS** -- `.gitignore` excludes `.env` and `.claude/`, which is appropriate. However, there is no automated secret scanning in CI.

---

## 3. SBOM Status

| Item | Status |
|------|--------|
| CycloneDX BOM | **Not present** |
| SPDX document | **Not present** |
| Generated SBOM from CI | **Not present** |
| SBOM generation tooling | **Not configured** |

**Finding: GAP** -- No Software Bill of Materials exists. For a zero-dependency project, the SBOM would primarily document the Node.js runtime and built-in modules used. While the risk is lower than for projects with dependencies, an SBOM is required for EU AI Act Art. 25 supply chain transparency.

**Note:** The project includes a `package-evidence.js` extractor that can generate dependency inventories for *target* repositories being audited. The project itself, however, lacks its own SBOM.

---

## 4. Code Signing and Provenance

### 4.1 Commit Signing

Unable to verify GPG signature status via shell commands (shell access restricted during this audit). Based on project configuration:

| Item | Status |
|------|--------|
| GPG-signed commits | **Unknown** (could not verify) |
| Signed tags | **Unknown** |
| `.gitsign` config | Not present |
| Sigstore integration | Not configured |

**Finding: INCONCLUSIVE** -- Manual verification needed. Run `git log --show-signature -5` to confirm.

### 4.2 Artifact Provenance

| Item | Status |
|------|--------|
| SLSA provenance attestations | **Not present** |
| Container image signatures | N/A (no containers) |
| Release signatures | **Not present** |

---

## 5. SLSA Level Assessment

| SLSA v1.0 Requirement | Status | Details |
|------------------------|--------|---------|
| **L0: No guarantees** | | |
| Source exists in version control | Yes | Git repository |
| **L1: Provenance exists** | | |
| Build process documented | Partial | CLAUDE.md documents workflow; no formal build script |
| Provenance generated automatically | **No** | No CI/CD pipeline |
| **L2: Hosted build** | | |
| Build runs on hosted service | **No** | Local builds only |
| Provenance signed by build service | **No** | |
| **L3: Hardened builds** | | |
| Hermetic, reproducible builds | **No** | |
| Isolated build environment | **No** | |
| **L4: Dependencies complete** | | |
| All dependencies have SLSA L3+ | N/A | Zero dependencies |

**SLSA Assessment: L0** -- The project has source control but lacks automated build provenance. The zero-dependency nature means L4 dependency requirements are trivially satisfied, but L1-L3 build requirements are not met due to absence of CI/CD.

---

## 6. Pre-commit Hooks and Code Quality Gates

| Item | Status |
|------|--------|
| `.husky/` directory | **Not present** |
| `.pre-commit-config.yaml` | **Not present** |
| Git hooks in `.git/hooks/` | **Unknown** (not inspectable) |
| Security pre-commit hook (per CLAUDE.md) | **Documented** but implementation not verified |

**Finding: PARTIAL** -- CLAUDE.md references a security pre-commit hook that flags unsafe shell patterns. The hook implementation location could not be verified during this audit. No Husky or pre-commit framework is installed.

---

## 7. AI Code Assistant Controls

| Control | Status | Details |
|---------|--------|---------|
| `CLAUDE.md` | **Present** | Comprehensive project conventions, security rules, technical constraints |
| `.cursorrules` | Not present | |
| `.github/copilot-instructions.md` | Not present | |
| AI attribution in commits | **Documented** | CLAUDE.md convention for Co-Authored-By headers |
| AI-generated code boundaries | **Documented** | Security conventions: `execFileSync` with arrays, no string interpolation |

**Finding: PASS** -- CLAUDE.md provides strong guardrails for AI-assisted development including explicit security conventions (no shell string interpolation, no innerHTML, argument arrays for subprocess calls). The new extractor complies with all documented conventions.

---

## 8. Risk Matrix

| Risk | Likelihood | Impact | Severity | Mitigation Status |
|------|-----------|--------|----------|-------------------|
| Dependency compromise (typosquatting, hijack) | **None** | N/A | **None** | Fully mitigated (zero deps) |
| CI/CD pipeline tampering | **None** | N/A | **None** | No pipeline exists (also means no CI security) |
| Unsigned commits / code injection | Medium | High | **High** | No verified signing detected |
| Missing SBOM for regulatory compliance | Medium | Medium | **Medium** | No SBOM generated |
| Stale Node.js runtime vulnerabilities | Medium | Medium | **Medium** | No runtime version pinning or scanning |
| Unauthorized code changes | Low | High | **Medium** | Git-based, but no branch protection verified |
| AI-generated code with vulnerabilities | Low | Medium | **Low** | CLAUDE.md guardrails in place |
| Pre-commit hook bypass | Low | Medium | **Low** | Hook existence documented but not framework-managed |

---

## 9. Framework Compliance Table

### NIST SP 800-218A (Secure Software Development Framework)

| Practice | Requirement | Status | Gap |
|----------|------------|--------|-----|
| PO.1 | Define security requirements | Partial | CLAUDE.md documents security conventions; no formal security requirements doc |
| PS.1 | Protect all forms of code | Partial | Git VCS in use; no branch protection or signed commits verified |
| PS.2 | Verify third-party components | **N/A** | Zero dependencies -- requirement trivially satisfied |
| PS.3 | Configure build processes | **Gap** | No CI/CD; no reproducible build |
| PW.4 | Review and analyze code for vulnerabilities | Partial | SAST/DAST extractor exists for evidence collection; no automated scanning of this project |
| PW.6 | Test executable code for vulnerabilities | **Gap** | No automated test suite or security tests |
| PW.7 | Manage vulnerabilities in released code | Partial | CWE mapping extractor available; no formal vulnerability management process |
| RV.1 | Identify and confirm vulnerabilities | Partial | Extractor tooling exists; not run against self |

### SLSA v1.0

| Level | Requirement | Status |
|-------|-------------|--------|
| L0 | Source in VCS | **Met** |
| L1 | Build provenance | **Not met** -- no CI/CD |
| L2 | Hosted, signed provenance | **Not met** |
| L3 | Hardened, hermetic build | **Not met** |
| L4 | All deps at L3+ | **Trivially met** (zero deps) |

### EU AI Act Article 25 (Obligations of Distributors)

| Requirement | Status | Evidence |
|-------------|--------|----------|
| Supply chain transparency | **Partial** | Zero-dep architecture eliminates third-party risk; no formal SBOM |
| Component traceability | **Partial** | LLM registry tracks 66 models with provenance metadata |
| Security assessment of components | **Partial** | SAST/DAST extractor and supply chain risk template (T23) exist |
| Risk documentation | **Present** | Templates 06, 15, 17, 23, 24 cover risk and security assessment |
| Conformity assessment support | **Present** | Template 19 (Conformity Assessment) available |

---

## 10. Summary of Findings

### Strengths

1. **Zero-dependency architecture** eliminates the most common supply chain attack vectors (dependency confusion, typosquatting, transitive vulnerabilities)
2. **New SAST/DAST extractor** uses the most restrictive module profile (`fs` + `path` only, no `child_process`)
3. **CLAUDE.md guardrails** enforce security conventions for AI-assisted development
4. **Comprehensive template coverage** with 25 compliance evidence templates including supply chain risk (T23) and SAST/DAST (T24)
5. **LLM registry** with provenance metadata for 66 models across 6 chunked files

### Gaps

1. **No CI/CD pipeline** -- prevents automated testing, SBOM generation, provenance attestation, and limits SLSA to L0
2. **No SBOM** -- EU AI Act Art. 25 supply chain transparency not formally documented
3. **No commit signing** verified -- code integrity relies solely on Git history
4. **No lockfile** -- while correct for zero-dep, a `package.json` with `"dependencies": {}` and lockfile would explicitly document the zero-dep stance
5. **Pre-commit hooks** documented but not managed by a framework (Husky/pre-commit)

### Recommendations

| Priority | Action | Effort | Impact |
|----------|--------|--------|--------|
| P1 | Add GitHub Actions CI with Node.js test matrix | Medium | Enables SLSA L1, automated security scanning |
| P1 | Generate minimal SBOM (CycloneDX) documenting Node.js runtime | Low | EU AI Act Art. 25 compliance |
| P2 | Enable GPG commit signing | Low | Code integrity assurance |
| P2 | Add `package.json` with empty deps and lockfile | Low | Explicit zero-dep documentation |
| P3 | Install Husky for managed pre-commit hooks | Low | Consistent hook enforcement |
| P3 | Add SLSA provenance generator to CI | Medium | Achieves SLSA L2 |

---

**Disclaimer:** This is an automated security audit, not legal advice. Findings should be reviewed by a security engineer and compliance specialist. SLSA and framework compliance assessments are based on observable project artifacts and may not reflect controls implemented outside this repository.
