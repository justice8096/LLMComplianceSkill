# Security Policy

## Scope

This project includes:

- **JavaScript/Node.js tools** (`tools/autofill.js`, `tools/evidence-checker.js`, `tools/extract-evidence.js`, `tools/extractors/*.js`)
- **Browser-based interactive HTML tools** (`tools/interactive/*.html`, `tools/interactive/shared.js`)
- **Markdown templates and regulation research files**
- **JSON data files** (LLM registry, jurisdiction matrix, deadline data)

Security issues in these components are in scope.

Out of scope: the regulation research content itself (legal accuracy is not a security issue).

## Design Principles

- **Zero external dependencies** — all Node.js tools use built-in modules only (`fs`, `path`, `child_process`). No `npm install` required. No supply-chain risk from third-party packages.
- **No network access** — tools run entirely offline. No HTTP calls, no external APIs.
- **No server component** — all interactive tools run in the browser with `localStorage`/`sessionStorage`. No backend, no authentication surface.
- **Argument-array shell invocation** — `extract-evidence.js` uses `execFileSync` with explicit argument arrays, not shell string interpolation, to prevent command injection.
- **No `innerHTML` assignment** — interactive HTML tools use DOM APIs (`textContent`, `createElement`, `setAttribute`) exclusively. No XSS injection points from dynamic HTML construction.

## Reporting a Vulnerability

1. **Do not open a public GitHub issue** for security vulnerabilities.
2. Email the maintainer directly at the address in the git commit history, or use [GitHub private vulnerability reporting](https://github.com/justice8096/LLMComplianceSkill/security/advisories/new).
3. Include:
   - Description of the vulnerability and affected component
   - Steps to reproduce
   - Potential impact
4. Expect an acknowledgement within 48 hours and a fix or mitigation plan within 14 days.

## Known Limitations

- The `extract-evidence.js` tool invokes `git`, `node`, and package manager CLIs from the host PATH. Ensure those binaries are trusted and untampered.
- Compliance config JSON is read from disk without schema validation — malformed config may cause autofill to emit incomplete templates. Run `evidence-checker.js` to detect gaps.
- The LLM registry and jurisdiction data files are static snapshots. Regulations change; always verify current enforcement status with qualified legal counsel.
