# Changelog

## 0.1.0 (2026-02-13)

Initial release.

- Markdown rendering with GFM tables, task lists, footnotes, blockquotes
- Mermaid diagram rendering (flowcharts, sequence, gantt) -- fully offline
- Chart.js charts from JSON code blocks (bar, line, pie, doughnut, radar, scatter)
- Syntax highlighting for 20 languages via Prism.js
- Standalone HTML file viewing with DOMPurify sanitisation
- Tabbed multi-file interface with LRU eviction
- Dark/light themes (auto-follows VS Code, or manual toggle)
- Readability controls: font size, font family, content width
- Auto-generated table of contents sidebar with scroll tracking
- Auto-refresh on file save (300ms debounce)
- Zero network requests, strict Content Security Policy
- Nonce-based script loading, DOMPurify on all rendered content
