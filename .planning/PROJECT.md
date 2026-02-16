# Ark Lens -- VS Code Markdown & HTML Viewer Extension

## Vision

A secure, offline-first VS Code extension that renders Markdown and HTML files with rich visual fidelity -- Mermaid diagrams, interactive charts, media embeds -- all within a locked-down webview with zero network access and zero code execution.

Born from a practical need: the Commander works primarily in terminals running Claude Code, generating volumes of Markdown output daily. Existing viewers (Markdown Preview Enhanced) carry critical security vulnerabilities (CVE-2022-45025, CVE-2022-45026 -- both 9.8/10 CVSS), deprecated dependencies, and abandoned maintenance. VS Code's built-in preview is safe but featureless. Wave Terminal was evaluated and rejected for this use case.

Ark Lens fills the gap: a viewer that is simultaneously rich in rendering and paranoid about security. Every dependency is bundled offline. Every input is sanitised. The webview runs under strict CSP. No file content ever executes as code. No byte ever leaves the machine.

This is a daily-driver tool -- it must be fast to open, pleasant to read, and invisible when not needed.

## Problem

Working with Claude Code generates significant Markdown output -- field reports, plans, analysis, documentation. Currently there is no safe, feature-rich way to visualise these files alongside the terminal workflow:

- **VS Code built-in preview** is safe but limited -- no Mermaid, no charts, no theming control, no directory browsing.
- **Markdown Preview Enhanced** has two unpatched CRITICAL CVEs, a deprecated dependency (`request`), no security policy, 1,400+ open issues, and 15+ months without a release. It is not fit for use.
- **Wave Terminal** was evaluated (v0.14.0, Feb 2026) -- promising but overkill for this need, and carries its own security concerns.
- **Standalone Electron app** was considered but adds an entire build/maintain burden when VS Code already provides the Chromium webview.

The result: files pile up unread, or get scanned in raw Markdown in the terminal. Visual comprehension suffers. Diagrams are imagined rather than seen. Charts are numbers rather than shapes.

## Success Criteria

How we know this worked:

- [ ] Extension installs from VSIX on Windows without errors
- [ ] Opens and renders any well-formed Markdown file with correct formatting
- [ ] Opens and renders standalone HTML files in the webview
- [ ] Mermaid diagram code blocks render as visual diagrams
- [ ] Chart.js/D3 code blocks render as interactive charts
- [ ] Images and video embeds display correctly from local paths
- [ ] Dark/light theme toggle works and persists across sessions
- [ ] Font size, font family, and content width controls work
- [ ] Table of contents sidebar generates from headings and navigates on click
- [ ] Multiple files open as closable tabs within the viewer
- [ ] Directory watch mode detects new/changed MD files and offers to open them
- [ ] Zero network requests made by the extension under any circumstance
- [ ] No file content is ever executed as code
- [ ] Strict CSP enforced on the webview -- no inline scripts from content
- [ ] Extension passes `vsce` packaging without warnings
- [ ] Cold-open time for a typical MD file is under 500ms

## Scope

### Building

- VS Code extension using the Webview API
- Markdown rendering (CommonMark spec) with GFM extensions (tables, task lists, strikethrough)
- HTML rendering within Markdown blocks (sanitised)
- Standalone .html file viewing in the webview
- Mermaid diagram rendering (bundled offline)
- Chart.js chart rendering from code blocks (bundled offline)
- Syntax-highlighted code blocks (bundled highlighter)
- Image display (local paths, relative and absolute)
- Video/audio embed support (local files)
- Dark/light theme with toggle command
- Font size adjustment (command or UI control)
- Font family selection
- Content width control (narrow/medium/wide)
- Table of contents sidebar from headings
- Tabbed multi-file interface within the webview panel
- Manual file open via command palette and right-click context menu
- Directory watch mode (configurable watched folder)
- Auto-refresh on file change (for currently open files)
- VS Code settings integration for persisting preferences

### Not Building

- No code execution from file content (code chunks, script blocks, shell commands -- never)
- No network requests (no CDN, no telemetry, no update checks, no external rendering services)
- No file modification (read-only viewer -- never writes back to source files)
- No `@import` or file inclusion system (attack vector, see CVE-2022-45025)
- No LaTeX/KaTeX rendering (scope control -- add later if needed)
- No PlantUML (requires external Java process -- violates offline constraint)
- No PDF export (not in v1 -- viewing only)
- No collaborative/sharing features
- No AI integration

## Context

- **Greenfield project** -- nothing exists yet
- **Prior evaluation:** Markdown Preview Enhanced rejected (security), Wave Terminal evaluated and rejected (overkill), Electron standalone considered and rejected (maintenance burden)
- **Target environment:** VS Code on Windows 11, used alongside Claude Code CLI in the integrated terminal
- **Daily use pattern:** Commander runs Claude Code, generates MD files, needs to quickly view rendered output in a side panel
- **Security posture:** Extension will be used on a machine handling sensitive business data -- security is not optional

## Constraints

- **Security (non-negotiable):** Strict CSP, no code execution, no network access, sanitised HTML rendering
- **Offline (non-negotiable):** All rendering libraries bundled. Extension must work on air-gapped machines.
- **VS Code API:** Must use official Webview API, not deprecated HTML preview. Follow Electron security best practices.
- **Windows primary:** Must work on Windows 11. Cross-platform (macOS/Linux) is a bonus, not a requirement.
- **Bundle size:** Keep reasonable -- Mermaid + Chart.js + highlighter will add weight, but should target <10MB total.
- **No deprecated deps:** Every dependency must be actively maintained. No `request`, no abandoned packages.

## Decisions Made

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Platform | VS Code extension | Already have Chromium webview, no new app to build/maintain |
| Rendering engine | marked.js or markdown-it | Both well-maintained, CommonMark compliant, no code execution |
| Diagrams | Mermaid (bundled) | Most popular, good coverage, can bundle offline |
| Charts | Chart.js (bundled) | Lightweight, no dependencies, renders to canvas |
| Syntax highlighting | Shiki or Prism (bundled) | Both offline-capable, good language coverage |
| HTML sanitisation | DOMPurify (bundled) | Industry standard, actively maintained, prevents XSS |
| Network policy | Zero network | Eliminates entire category of risks |
| Distribution | Local VSIX first | No marketplace overhead during development, publish when stable |

## Open Questions

- [ ] Extension name: "Ark Lens" working title -- confirm or rename before marketplace publish
- [ ] markdown-it vs marked.js: Which has better plugin ecosystem for our needs?
- [ ] Chart rendering trigger: How to distinguish chart code blocks from regular code? (e.g., `chart-js` language tag?)
- [ ] Directory watch UX: Notification toast vs auto-open vs sidebar list when new files detected?
- [ ] Theme system: Use VS Code's colour theme tokens or independent theme?
- [ ] Tab limit: Maximum number of open tabs before oldest auto-closes? Or unlimited?

---
*Initialized: 2026-02-13*
