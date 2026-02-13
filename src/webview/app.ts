interface VsCodeApi {
  postMessage(message: unknown): void;
  getState(): unknown;
  setState(state: unknown): void;
}

declare function acquireVsCodeApi(): VsCodeApi;
const vscode = acquireVsCodeApi();

import { renderMarkdown, sanitizeHtml } from './renderer/markdown';
import { initMermaid, renderMermaidBlocks } from './renderer/mermaid';
import { renderChartBlocks, destroyAllCharts } from './renderer/charts';
import { highlightCodeBlocks } from './renderer/highlight';
import { TabManager, Tab } from './ui/tabs';
import { ThemeManager } from './ui/theme';
import { ControlsManager } from './ui/controls';
import { TocManager } from './ui/toc';
import './styles/inject';

// --- Globals ---
const tabManager = new TabManager(10);
const themeManager = new ThemeManager(vscode);
const controlsManager = new ControlsManager(vscode);
const tocManager = new TocManager(vscode);

let basePath = '';
let hasOpenedFile = false;

// --- Rendering ---
async function renderContent(text: string, fileType: string): Promise<string> {
  let html: string;
  if (fileType === 'html') {
    html = sanitizeHtml(extractBody(text));
  } else {
    html = renderMarkdown(text);
  }

  // Resolve local paths in images/media
  if (basePath) {
    html = resolveLocalPaths(html, basePath);
  }

  return html;
}

function extractBody(html: string): string {
  const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  return bodyMatch ? bodyMatch[1] : html;
}

/** Resolve relative src/href attributes to webview-relative URIs via DOM traversal. */
function resolveLocalPaths(html: string, base: string): string {
  // Parse into an inert <template> -- no scripts execute, no images load.
  const template = document.createElement('template');
  template.innerHTML = html;
  const doc = template.content;

  const SKIP_PATTERN = /^(https?:\/\/|data:|vscode-resource:|vscode-webview-resource:|\/|#)/;

  doc.querySelectorAll('[src],[href]').forEach((el) => {
    for (const attr of ['src', 'href'] as const) {
      const value = el.getAttribute(attr);
      if (!value || SKIP_PATTERN.test(value)) continue;

      // Block path traversal including URL-encoded variants
      try {
        const decoded = decodeURIComponent(value);
        if (/^\.\.[\\/]/.test(decoded) || /[/\\]\.\.([/\\]|$)/.test(decoded)) continue;
      } catch {
        continue; // Malformed URI encoding -- skip
      }

      const resolved = base.endsWith('/') ? base + value : base + '/' + value;
      el.setAttribute(attr, resolved);
    }
  });

  const wrapper = document.createElement('div');
  wrapper.appendChild(doc.cloneNode(true));
  return wrapper.innerHTML;
}

async function displayTab(tab: Tab) {
  const contentEl = document.getElementById('content')!;
  const emptyState = document.getElementById('empty-state')!;
  const app = document.getElementById('app')!;

  emptyState.style.display = 'none';
  app.style.display = 'flex';

  if (tab.renderedHtml && !tab.isDirty) {
    contentEl.innerHTML = tab.renderedHtml;
  } else {
    const rendered = await renderContent(tab.content, tab.fileType);
    tab.renderedHtml = rendered;
    tab.isDirty = false;
    contentEl.innerHTML = rendered;
  }

  // Post-processing
  highlightCodeBlocks();
  await renderMermaidBlocks();
  renderChartBlocks();

  // Restore scroll
  document.getElementById('content-area')!.scrollTop = tab.scrollTop;

  // Generate TOC
  tocManager.generate();

  // Update tab bar
  renderTabBar();

  // Notify extension host
  vscode.postMessage({ type: 'tabChanged', fileName: tab.fileName });
}

function showEmptyState() {
  const emptyState = document.getElementById('empty-state')!;
  const app = document.getElementById('app')!;
  emptyState.style.display = 'flex';
  app.style.display = 'none';
  // Only close the panel if we previously had files open (not on init)
  if (hasOpenedFile) {
    vscode.postMessage({ type: 'allTabsClosed' });
  }
}

function renderTabBar() {
  const container = document.getElementById('tab-scroll-container')!;
  const tabs = tabManager.getAllTabs();
  const activeId = tabManager.getActiveTab()?.id || null;

  if (tabs.length === 0) {
    container.innerHTML = '';
    return;
  }

  container.innerHTML = tabs
    .map(
      (tab) => `
    <div class="tab ${tab.id === activeId ? 'active' : ''}" data-tab-id="${tab.id}" title="${escapeHtml(tab.filePath)}">
      <span class="tab-icon">${tab.fileType === 'md' ? '\u2630' : '\u2671'}</span>
      <span class="tab-name">${escapeHtml(tab.fileName)}</span>
      <span class="close-btn" data-close-tab="${tab.id}">&times;</span>
    </div>
  `
    )
    .join('');
}

function escapeHtml(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// --- Event Handlers ---

// Tab bar clicks
document.getElementById('tab-bar')!.addEventListener('click', (e) => {
  const target = e.target as HTMLElement;

  // Close button
  const closeId = target.getAttribute('data-close-tab') || target.closest('[data-close-tab]')?.getAttribute('data-close-tab');
  if (closeId) {
    e.stopPropagation();
    const currentTab = tabManager.getActiveTab();
    if (currentTab) {
      currentTab.scrollTop = document.getElementById('content-area')!.scrollTop;
    }
    tabManager.closeTab(closeId);
    const newActive = tabManager.getActiveTab();
    if (newActive) {
      displayTab(newActive);
    } else {
      showEmptyState();
      renderTabBar();
    }
    return;
  }

  // Tab click
  const tabEl = target.closest('[data-tab-id]') as HTMLElement;
  if (tabEl) {
    const tabId = tabEl.getAttribute('data-tab-id')!;
    const currentTab = tabManager.getActiveTab();
    if (currentTab && currentTab.id !== tabId) {
      currentTab.scrollTop = document.getElementById('content-area')!.scrollTop;
    }
    tabManager.activateTab(tabId);
    const tab = tabManager.getActiveTab();
    if (tab) displayTab(tab);
  }
});

// Middle-click to close tab
document.getElementById('tab-bar')!.addEventListener('auxclick', (e) => {
  if (e.button === 1) {
    const tabEl = (e.target as HTMLElement).closest('[data-tab-id]') as HTMLElement;
    if (tabEl) {
      const tabId = tabEl.getAttribute('data-tab-id')!;
      tabManager.closeTab(tabId);
      const newActive = tabManager.getActiveTab();
      if (newActive) {
        displayTab(newActive);
      } else {
        showEmptyState();
        renderTabBar();
      }
    }
  }
});

// Messages from extension host
const KNOWN_MESSAGE_TYPES = new Set(['openFile', 'updateFile', 'closeFile', 'initSettings', 'toggleTheme']);

window.addEventListener('message', async (event) => {
  const message = event.data;
  if (!message || typeof message.type !== 'string' || !KNOWN_MESSAGE_TYPES.has(message.type)) return;
  switch (message.type) {
    case 'openFile': {
      hasOpenedFile = true;
      basePath = message.basePath || '';
      const tab = tabManager.openTab(
        message.filePath,
        message.fileName,
        message.fileType,
        message.content
      );
      await displayTab(tab);
      break;
    }
    case 'updateFile': {
      tabManager.updateTabContent(message.filePath, message.content);
      const activeTab = tabManager.getActiveTab();
      if (activeTab && activeTab.filePath === message.filePath) {
        activeTab.isDirty = true;
        await displayTab(activeTab);
      }
      break;
    }
    case 'closeFile': {
      const tabs = tabManager.getAllTabs();
      const target = tabs.find((t) => t.filePath === message.filePath);
      if (target) {
        tabManager.closeTab(target.id);
        const newActive = tabManager.getActiveTab();
        if (newActive) displayTab(newActive);
        else {
          showEmptyState();
          renderTabBar();
        }
      }
      break;
    }
    case 'initSettings': {
      const s = message.settings;
      themeManager.initialize(s.theme);
      controlsManager.initialize(s);
      tocManager.setVisible(s.tocVisible);
      tabManager.setMaxTabs(s.maxTabs);
      break;
    }
    case 'toggleTheme': {
      themeManager.toggle();
      // Re-render active tab for theme-dependent content
      const active = tabManager.getActiveTab();
      if (active) {
        active.isDirty = true;
        await displayTab(active);
      }
      break;
    }
  }
});

// Wire theme toggle from controls bar
window.addEventListener('ark-toggle-theme', () => {
  themeManager.toggle();
  const active = tabManager.getActiveTab();
  if (active) {
    active.isDirty = true;
    displayTab(active);
  }
});

// Init: show empty state and signal ready
showEmptyState();
initMermaid(false);
controlsManager.renderControlBar();
vscode.postMessage({ type: 'ready' });
