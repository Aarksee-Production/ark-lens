# Project State

## Project Summary

**Building:** Ark Lens -- a secure, offline-first VS Code extension that renders Markdown and HTML files with rich visual fidelity (Mermaid, charts, media) in a locked-down webview with zero network access and zero code execution.

**Core requirements:**
- Render MD files with Mermaid diagrams, Chart.js charts, media embeds, and sanitised HTML
- View standalone HTML files in the webview
- Tabbed multi-file interface with dark/light themes, font controls, content width, TOC sidebar
- Zero network requests, zero code execution, strict CSP

**Constraints:**
- Security non-negotiable: strict CSP, DOMPurify sanitisation, no code execution
- Fully offline: all rendering libraries bundled, no CDN, no telemetry
- Windows 11 primary target, cross-platform as bonus

## Current Position

Phase: 4 of 4 (Complete)
Plan: All 8 plans complete
Status: VSIX packaged and installed
Last activity: 2026-02-13 - All phases built, security-hardened, VSIX packaged

Progress: xxxxxxxxxx 100%

## Build Artifacts

- VSIX: `ark-lens/ark-lens-0.1.0.vsix` (932 KB)
- Production bundle: `dist/webview.js` (3.1 MB minified), `dist/webview.css` (10 KB), `dist/extension.js` (5 KB)
- TypeScript: Zero type errors (`tsc --noEmit` clean)
- npm audit: 8 moderate (all transitive via mermaid's lodash-es + esbuild dev-only)

## Security Audit Summary

Full audit completed 2026-02-13. Findings addressed:
- Mermaid SVG output now sanitised through DOMPurify (was raw innerHTML)
- `<style>` and `<base>` added to FORBID_TAGS in DOMPurify config
- Message handler settings whitelisted (prevents arbitrary config writes)
- Explicit `connect-src 'none'` added to CSP
- No eval(), no new Function(), no unsanitised innerHTML
- Nonce-based script CSP, all dependencies current

## Performance Metrics

**Velocity:**
- Total plans completed: 8
- All 4 phases executed in single session
- Total execution time: ~1 session

**By Phase:**

| Phase | Plans | Status |
|-------|-------|--------|
| 1. Foundation | 2/2 | Complete |
| 2. Rich Content | 2/2 | Complete |
| 3. Viewer Experience | 2/2 | Complete |
| 4. File Integration | 2/2 | Complete |

## Accumulated Context

### Decisions Made

| Phase | Decision | Rationale |
|-------|----------|-----------|
| Init | VS Code extension over standalone Electron | Already have Chromium webview, no new app |
| Init | Rejected Markdown Preview Enhanced | Two 9.8 CVEs, abandoned maintenance |
| Init | Rejected Wave Terminal | Overkill for MD viewing, own security concerns |
| Init | Zero network policy | Eliminates entire risk category |
| Init | Local VSIX first, marketplace later | No overhead during development |
| P1 | markdown-it over marked.js | Better plugin ecosystem, GFM built-in |
| P1 | esbuild over webpack | Faster build, dual-bundle config simpler |
| P1 | DOMPurify two-config approach | Stricter for MD, slightly permissive for HTML |
| P2 | Prism.js over Shiki | Smaller bundle, DOM-based (no WASM) |
| P2 | Mermaid securityLevel:'strict' | Prevents XSS in diagram definitions |
| P2 | Chart.js JSON-only config | No function execution, data-only |
| P3 | Internal tabs over VS Code editor tabs | Single panel, multiple files, LRU eviction |
| P3 | CSS custom properties for theming | Independent of VS Code theme, fast toggle |
| P4 | moduleResolution:'bundler' in tsconfig | Correct for esbuild, fixes ESM type issues |

### Deferred Issues

- `'unsafe-inline'` in CSP style-src (needed by Chart.js/Mermaid inline styles, documented as known limitation)
- PNG icon for marketplace (SVG not allowed in VSIX, deferred until marketplace publish)
- Directory watch mode (fileWatcher.ts) not yet implemented -- auto-refresh on edit works via onDidChangeTextDocument
- README.md, LICENSE, CHANGELOG.md not yet created (needed for marketplace)

### Blockers/Concerns Carried Forward

None.

## Project Alignment

Last checked: 2026-02-13
Status: ALIGNED
Assessment: All core features implemented. Extension builds, type-checks, packages, and installs cleanly.
Drift notes: Directory watch mode deferred (auto-refresh covers primary use case).

## Session Continuity

Last session: 2026-02-13
Stopped at: Extension installed, ready for manual testing
Resume file: None
