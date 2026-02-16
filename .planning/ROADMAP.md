# Roadmap: Ark Lens

## Overview

Build a secure, offline-first VS Code extension in four phases: scaffold the extension with strict security foundations, add rich rendering capabilities (Mermaid, charts, media, HTML), build the viewer UX (tabs, themes, readability controls), then wire up file integration and package for distribution.

## Domain Expertise

None -- no specific VS Code extension domain skill exists. Relevant workspace skills for reference:
- `ark-typescript-master` -- TypeScript patterns
- `ark-security-reviewer` -- CSP and sanitisation review
- `ark-test-master` -- Extension testing patterns

## Phases

- [x] **Phase 1: Foundation & Core Rendering** - Extension scaffold, webview with strict CSP, Markdown rendering, HTML sanitisation
- [x] **Phase 2: Rich Content** - Mermaid diagrams, Chart.js charts, syntax highlighting, standalone HTML viewing, media embeds
- [x] **Phase 3: Viewer Experience** - Tabbed multi-file interface, dark/light themes, font/width controls, TOC sidebar
- [x] **Phase 4: File Integration & Packaging** - Command palette, context menus, directory watching, auto-refresh, settings, VSIX build

## Phase Details

### Phase 1: Foundation & Core Rendering
**Goal**: A working VS Code extension that opens a webview panel and renders Markdown files with sanitised HTML, under strict CSP with zero network access.
**Depends on**: Nothing (first phase)

Plans:
- [x] 01-01: Extension scaffold, package.json, activation, basic webview panel with strict CSP
- [x] 01-02: Markdown rendering pipeline (markdown-it + DOMPurify), GFM support, basic stylesheet

### Phase 2: Rich Content
**Goal**: Extension renders Mermaid diagrams, Chart.js charts, syntax-highlighted code, standalone HTML files, and embedded images/video/audio -- all from bundled offline libraries.
**Depends on**: Phase 1

Plans:
- [x] 02-01: Mermaid diagram rendering (bundled offline), chart code block convention and Chart.js rendering
- [x] 02-02: Syntax highlighting (Prism.js bundled), standalone HTML file viewing, media embeds (images, video, audio)

### Phase 3: Viewer Experience
**Goal**: Multi-file tabbed interface with closable tabs, dark/light theme toggle, font size/family controls, content width adjustment, and a table-of-contents sidebar for heading navigation.
**Depends on**: Phase 2

Plans:
- [x] 03-01: Tabbed multi-file interface with closable tabs, tab state management
- [x] 03-02: Theme system (dark/light toggle), font controls, content width, TOC sidebar

### Phase 4: File Integration & Packaging
**Goal**: Full VS Code integration -- command palette commands, right-click context menus, directory watch mode, auto-refresh on file change, persistent settings, and clean VSIX packaging.
**Depends on**: Phase 3

Plans:
- [x] 04-01: Command palette commands, right-click context menus, VS Code settings integration
- [x] 04-02: Directory watch mode, auto-refresh on file change, VSIX packaging and validation

## Progress

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation & Core Rendering | 2/2 | Complete | 2026-02-13 |
| 2. Rich Content | 2/2 | Complete | 2026-02-13 |
| 3. Viewer Experience | 2/2 | Complete | 2026-02-13 |
| 4. File Integration & Packaging | 2/2 | Complete | 2026-02-13 |
