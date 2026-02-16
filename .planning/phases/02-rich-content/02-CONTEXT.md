# Phase 2: Rich Content

## Goal

Extension renders Mermaid diagrams, Chart.js charts, syntax-highlighted code blocks, standalone HTML files, and embedded images/video/audio -- all from bundled offline libraries. No network requests.

## Key Architectural Decisions

### Code Block Convention
Fenced code blocks with specific language tags trigger rich rendering:
- ` ```mermaid ` → Mermaid diagram
- ` ```chart ` or ` ```chartjs ` → Chart.js chart (JSON config as content)
- ` ```html-preview ` → Rendered HTML preview within MD (optional, distinct from inline HTML)
- All other ` ```lang ` → Syntax highlighted code block

### Mermaid Integration
- Bundle mermaid.min.js (~2MB) with webview assets
- Initialize once on webview load, render diagram nodes on content update
- Mermaid renders to SVG inline -- no external resources needed
- Dark/light theme passed to Mermaid's `theme` config

### Chart.js Integration
- Bundle chart.min.js (~200KB) with webview assets
- Chart code blocks contain JSON config: `{ type: "bar", data: {...}, options: {...} }`
- Parse JSON, create `<canvas>`, instantiate Chart
- Charts are read-only (no interaction needed for v1)

### Syntax Highlighting
- Bundle Prism.js with common language grammars (~150KB with 40 languages)
- Prism is pure JS, no WASM, simple to bundle
- Apply highlighting after markdown-it renders code blocks
- Theme follows viewer dark/light mode

### Standalone HTML Viewing
- Detect `.html` file extension in open command
- Read raw HTML → DOMPurify sanitise → inject into webview
- Same CSP applies -- no inline scripts execute
- User sees rendered HTML layout without any script functionality

### Media Handling
- Images: Resolve local paths to `vscode-resource:` URIs via `webview.asWebviewUri()`
- Video/Audio: Use native `<video>` / `<audio>` tags with `vscode-resource:` src
- `localResourceRoots` expanded to include the file's parent directory

## Dependencies

| Package | Purpose | Size (approx) |
|---------|---------|----------------|
| mermaid | Diagram rendering | ~2MB |
| chart.js | Chart rendering | ~200KB |
| prismjs | Syntax highlighting | ~150KB |
| (already have) markdown-it, dompurify | From Phase 1 | - |

## Total Bundle Estimate
~2.5MB additional for rich content libraries. Well within 10MB target.
