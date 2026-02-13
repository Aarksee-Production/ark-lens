# Changelog

## [0.1.0] - 2026-02-13

### Added
- Markdown rendering with markdown-it (GFM, tables, task lists, footnotes)
- HTML file viewing with DOMPurify sanitisation
- Mermaid diagram rendering (offline, strict security)
- Chart.js chart rendering from JSON code blocks
- Syntax highlighting with Prism.js (20 languages)
- Tabbed multi-file interface with LRU eviction
- Dark/light theme toggle (auto-follows VS Code theme)
- Font size controls (12-24px)
- Font family switching (sans/serif/mono)
- Content width presets (narrow/medium/wide)
- Table of contents sidebar with scroll tracking
- Keyboard shortcut: `Ctrl+Shift+L` to open preview
- Context menu integration (editor title, editor context, explorer)
- Auto-refresh on document changes (300ms debounce)
- Persistent settings via VS Code configuration API

### Security
- Strict Content Security Policy (nonce-based scripts, no inline scripts)
- DOMPurify sanitisation on all rendered content
- Mermaid SVG output sanitised through DOMPurify
- Zero network requests (`connect-src 'none'`)
- No `eval()`, no `new Function()`, no code execution
- Settings message handler whitelisted

### Performance
- VSIX package: 932 KB (compressed)
- Production bundle: 3.1 MB (mermaid + chart.js + prism + markdown-it + dompurify)
- Extension host: 5 KB
- Zero startup delay (lazy activation on language)

## Charts Demo

```chart
{
  "type": "doughnut",
  "data": {
    "labels": ["Mermaid", "Chart.js", "Prism", "markdown-it", "DOMPurify", "Extension"],
    "datasets": [{
      "data": [2200, 800, 150, 100, 50, 5],
      "backgroundColor": ["#f38ba8", "#fab387", "#f9e2af", "#a6e3a1", "#89b4fa", "#cba6f7"]
    }]
  },
  "options": {
    "plugins": {
      "title": { "display": true, "text": "Bundle Size (KB)" }
    }
  }
}
```
