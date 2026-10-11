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
- **No network access by the Node tools and wizards** — they run offline, with two documented exceptions: `package-evidence.js` calls `npm audit` (and `pip-audit` when installed), which contacts the public registry advisory endpoint, and `AI-Regulations-World-Map.html` loads D3 and TopoJSON from cdnjs.cloudflare.com and the world atlas from cdn.jsdelivr.net when opened in a browser (it is a visualization, not a compliance tool).
- **No server component** — all interactive tools run in the browser with `localStorage`/`sessionStorage`. No backend, no authentication surface.
- **No shell, argv arrays only** — every extractor starts `git`, `npm` and `pip-audit` with `execFileSync` and an explicit argv array; values derived from repository content (commit hashes, ref names, file paths) are validated or passed after `--` so they can never become options (CWE-88). Tools are resolved to absolute paths from the operator's PATH before any directory change, never from the scanned repository (CWE-427).
- **Scanned repositories are data, not configuration** — `npm audit` runs from a private temporary copy of `package.json` and the lockfile with empty user and global npm config, so a repository's `.npmrc` cannot redirect, proxy or disable TLS on the request (CWE-918); every `git` call disables repository-local hooks, `core.fsmonitor` and external diff drivers (CWE-426).
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

- The `extract-evidence.js` tool invokes `git`, `npm` and `pip-audit` from the host PATH. Ensure those binaries are trusted and untampered.
- Point `--repo` at a fresh clone, not an unpacked archive: a tarball can carry its own `.git/config`, and while the extractors neutralize the known program-executing keys, git grows new ones. Treat any repository you did not author as untrusted input.
- `pip-audit` audits the Python environment it is installed in, not the scanned repository's requirements; its counts are indicative only.
- Compliance config JSON is read from disk without schema validation — malformed config may cause autofill to emit incomplete templates. Run `evidence-checker.js` to detect gaps.
- The LLM registry and jurisdiction data files are static snapshots. Regulations change; always verify current enforcement status with qualified legal counsel.
