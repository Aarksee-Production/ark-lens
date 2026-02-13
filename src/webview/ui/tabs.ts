export interface Tab {
  id: string;
  filePath: string;
  fileName: string;
  fileType: 'md' | 'html';
  content: string;
  renderedHtml: string;
  scrollTop: number;
  isActive: boolean;
  isDirty: boolean;
  lastActivated: number;
}

export class TabManager {
  private tabs: Tab[] = [];
  private maxTabs: number;
  private activeTabId: string | null = null;

  constructor(maxTabs: number = 10) {
    this.maxTabs = maxTabs;
  }

  setMaxTabs(max: number) {
    this.maxTabs = max;
  }

  openTab(filePath: string, fileName: string, fileType: 'md' | 'html', content: string): Tab {
    // Check if already open
    const existing = this.tabs.find((t) => t.filePath === filePath);
    if (existing) {
      this.activateTab(existing.id);
      existing.content = content;
      existing.isDirty = true;
      return existing;
    }

    // Evict if at max
    if (this.tabs.length >= this.maxTabs) {
      this.evictOldest();
    }

    const tab: Tab = {
      id: hashString(filePath),
      filePath,
      fileName,
      fileType,
      content,
      renderedHtml: '',
      scrollTop: 0,
      isActive: false,
      isDirty: true,
      lastActivated: Date.now(),
    };

    this.tabs.push(tab);
    this.activateTab(tab.id);
    return tab;
  }

  closeTab(id: string): void {
    const idx = this.tabs.findIndex((t) => t.id === id);
    if (idx === -1) return;

    const wasActive = this.tabs[idx].id === this.activeTabId;
    this.tabs.splice(idx, 1);

    if (wasActive && this.tabs.length > 0) {
      // Activate adjacent tab (prefer left, fallback right)
      const newIdx = Math.min(idx, this.tabs.length - 1);
      this.activateTab(this.tabs[newIdx].id);
    } else if (this.tabs.length === 0) {
      this.activeTabId = null;
    }
  }

  activateTab(id: string): void {
    this.tabs.forEach((t) => {
      t.isActive = t.id === id;
      if (t.isActive) {
        t.lastActivated = Date.now();
      }
    });
    this.activeTabId = id;
  }

  getActiveTab(): Tab | null {
    return this.tabs.find((t) => t.id === this.activeTabId) || null;
  }

  getAllTabs(): Tab[] {
    return [...this.tabs];
  }

  updateTabContent(filePath: string, content: string): void {
    const tab = this.tabs.find((t) => t.filePath === filePath);
    if (tab) {
      tab.content = content;
      tab.isDirty = true;
    }
  }

  private evictOldest(): void {
    // Find least-recently-activated non-active tab
    let oldest: Tab | null = null;
    for (const tab of this.tabs) {
      if (tab.id === this.activeTabId) continue;
      if (!oldest || tab.lastActivated < oldest.lastActivated) {
        oldest = tab;
      }
    }
    if (oldest) {
      this.closeTab(oldest.id);
    }
  }
}

function hashString(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash + char) | 0;
  }
  return 'tab-' + Math.abs(hash).toString(36);
}
