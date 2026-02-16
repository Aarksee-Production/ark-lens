# Phase 3: Viewer Experience

## Goal

Multi-file tabbed interface with closable tabs, dark/light theme toggle, font size/family controls, content width adjustment, and a table-of-contents sidebar. This turns the raw renderer into a pleasant daily-driver tool.

## Key Architectural Decisions

### Internal Tab System
```
┌─────────────────────────────────────────────────┐
│ [README.md ×] [REPORT.md ×] [plan.html ×]      │  ← Tab bar
├────────┬────────────────────────────────────────┤
│ # Head │                                        │
│  ## Sub│   Rendered content area                │  ← Main view
│  ## Sub│                                        │
│  ### De│                                        │
├────────┴────────────────────────────────────────┤
│ 🔆 Dark/Light  |  Font: 14px  |  Width: Medium │  ← Status/control bar
└─────────────────────────────────────────────────┘
```

### Tab Management
- Tabs stored as array: `{ id, filePath, fileName, content, scrollPosition }`
- Active tab highlighted, inactive tabs show filename only
- Close button (x) on each tab, middle-click to close
- Tab overflow: horizontal scroll with arrow buttons
- Clicking already-open file switches to its tab (no duplicates)
- Max tabs configurable (default: 10), oldest auto-closes on overflow

### TOC Sidebar
- Parse rendered HTML for h1-h6 elements
- Generate nested list with indent by heading level
- Click → smooth scroll to heading
- Highlight current heading based on scroll position
- Collapsible (toggle button) -- remembers state
- Width: ~200px, resizable via drag

### Theme System
- Use CSS custom properties (variables) throughout
- Two built-in themes: light and dark
- Toggle via command palette OR toolbar button in viewer
- Persist choice in VS Code settings (`arkLens.theme`)
- Mermaid and Chart.js themes sync with viewer theme

### Controls
- **Font size**: Slider or +/- buttons (12px to 24px, default 16px)
- **Font family**: Dropdown -- system sans, system serif, system mono, Inter, JetBrains Mono
- **Content width**: Three presets -- Narrow (600px), Medium (800px), Wide (100%)
- All persisted in VS Code settings
- Controls in a collapsible toolbar at bottom or top of viewer

### Responsive Behaviour
- TOC sidebar auto-hides when panel width < 500px
- Controls collapse to icon buttons at narrow widths
- Content reflows naturally via CSS

## No External Dependencies
This phase is pure HTML/CSS/JS in the webview. No new npm packages. All styling via CSS custom properties and vanilla DOM manipulation.
