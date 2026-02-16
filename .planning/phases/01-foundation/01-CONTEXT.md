# Phase 1: Foundation & Core Rendering

## Goal

A working VS Code extension that opens a webview panel on the right side and renders Markdown files with sanitised HTML, under strict CSP with zero network access. This is the skeleton everything else builds on.

## Key Architectural Decisions

### Panel Strategy
- **One WebviewPanel** in `ViewColumn.Beside` (right of active editor)
- Panel manages its own internal tabs (NOT VS Code editor tabs)
- Single panel persists -- opening new files adds tabs within it
- Panel title shows active tab filename

### Rendering Pipeline
```
Source File (.md)
  → Read raw text (extension host)
  → Send to webview via postMessage
  → markdown-it parses to HTML
  → DOMPurify sanitises output
  → Inject into #content div
  → CSS styles applied
```

### Security Model
- CSP: `default-src 'none'; style-src ${webview.cspSource} 'unsafe-inline'; script-src 'nonce-${nonce}'; img-src ${webview.cspSource} vscode-resource:;`
- No `eval()`, no inline scripts from content
- DOMPurify strips all script tags, event handlers, and dangerous attributes
- `localResourceRoots` restricted to extension's media/ directory

### Build Tooling
- **esbuild** for both extension host and webview bundles (fast, VS Code standard)
- Two entry points: `src/extension.ts` (Node context) and `src/webview/app.ts` (browser context)
- npm as package manager (vsce compatibility)

## Dependencies (All Must Be Actively Maintained)

| Package | Purpose | Bundle Target |
|---------|---------|---------------|
| markdown-it | MD → HTML conversion | webview |
| markdown-it-gfm | GFM tables, task lists, strikethrough | webview |
| dompurify | HTML sanitisation | webview |
| @vscode/webview-ui-toolkit | (evaluate) VS Code native look | webview |

## Research Completed

From conversation context:
- VS Code webview API supports strict CSP via `Webview.cspSource`
- `localResourceRoots` controls what files the webview can load
- markdown-it has better plugin ecosystem than marked.js for our needs
- DOMPurify is the industry standard, actively maintained
