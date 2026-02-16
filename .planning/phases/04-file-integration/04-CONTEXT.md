# Phase 4: File Integration & Packaging

## Goal

Full VS Code integration -- command palette commands, right-click context menus, directory watch mode with notifications, auto-refresh on file change, persistent settings, and clean VSIX packaging ready for local install.

## Key Architectural Decisions

### Commands (package.json contributes.commands)
| Command ID | Title | Keybinding | Context |
|-----------|-------|------------|---------|
| `arkLens.openPreview` | Ark Lens: Open Preview | `Ctrl+Shift+L` | When MD/HTML file active |
| `arkLens.openPreviewToSide` | Ark Lens: Open Preview to Side | `Ctrl+K L` | When MD/HTML file active |
| `arkLens.toggleTheme` | Ark Lens: Toggle Theme | - | When viewer open |
| `arkLens.watchDirectory` | Ark Lens: Watch Directory | - | Always |
| `arkLens.stopWatching` | Ark Lens: Stop Watching | - | When watching |

### Context Menu Integration
- Right-click on .md/.html file in Explorer → "Open with Ark Lens"
- Right-click on editor tab for .md/.html → "Open Preview with Ark Lens"
- Context menu entries via `contributes.menus` in package.json

### File Activation
- Extension activates on: `onLanguage:markdown`, `onLanguage:html`, `onCommand:arkLens.*`
- Lazy activation -- no startup cost when not using MD/HTML files

### Directory Watch Mode
- User configures watched directory via command palette or settings
- FileSystemWatcher on `**/*.md` and `**/*.html` in watched directory
- On new file: Show VS Code notification "New file: filename.md" with "Open" button
- On file change: If file is open in a tab, auto-refresh content
- On file delete: Close tab if open, no action if not
- Watcher is opt-in, off by default

### Settings (contributes.configuration)
```json
{
  "arkLens.theme": "auto",           // "light" | "dark" | "auto" (follows VS Code)
  "arkLens.fontSize": 16,            // 12-24
  "arkLens.fontFamily": "system",    // "system" | "serif" | "mono" | "inter" | "jetbrains"
  "arkLens.contentWidth": "medium",  // "narrow" | "medium" | "wide"
  "arkLens.watchDirectory": "",      // Absolute path to watch, empty = disabled
  "arkLens.maxTabs": 10,             // 1-50
  "arkLens.tocVisible": true,        // TOC sidebar default state
  "arkLens.tocWidth": 200            // TOC sidebar width in pixels
}
```

### Auto-Refresh
- Watch open files for changes using `vscode.workspace.onDidChangeTextDocument`
- Debounce: 300ms after last change
- Only refresh active tab's content (not all tabs)
- Visual indicator: brief flash or subtle animation on refresh

### VSIX Packaging
- `vsce package` produces `.vsix` file
- Ensure all bundled assets (mermaid, chart.js, prism, styles) included
- Verify no dev dependencies leak into package
- Test install: `code --install-extension ark-lens-0.1.0.vsix`
- Validate: extension activates, CSP holds, all features functional

### Project Structure (Final)
```
ark-lens/
  .vscodeignore           # Exclude src/, node_modules/ from VSIX
  package.json            # Extension manifest
  tsconfig.json           # TypeScript config
  esbuild.config.mjs      # Build config (extension + webview)
  README.md               # Extension documentation
  CHANGELOG.md
  LICENSE
  src/
    extension.ts          # Activation, commands, file watcher
    providers/
      viewerProvider.ts   # WebviewPanel lifecycle, message handling
      fileWatcher.ts      # Directory watch mode
    webview/
      index.html          # Webview HTML template
      app.ts              # Main webview app (tabs, rendering, controls)
      renderer/
        markdown.ts       # markdown-it + plugins + DOMPurify
        mermaid.ts        # Mermaid init and render
        charts.ts         # Chart.js init and render
        highlight.ts      # Prism.js syntax highlighting
        html.ts           # Standalone HTML sanitiser
      ui/
        tabs.ts           # Tab bar management
        toc.ts            # Table of contents sidebar
        theme.ts          # Theme system
        controls.ts       # Font/width/settings controls
      styles/
        base.css          # Core layout
        themes/
          light.css       # Light theme variables
          dark.css        # Dark theme variables
        content.css       # Rendered content styles
        tabs.css          # Tab bar styles
        toc.css           # TOC sidebar styles
        controls.css      # Control bar styles
  media/
    icon.svg              # Extension icon
  dist/                   # Built output (gitignored)
    extension.js          # Bundled extension host
    webview.js            # Bundled webview app
    webview.css           # Bundled webview styles
```
