interface ViewerSettings {
  fontSize: number;
  fontFamily: string;
  contentWidth: string;
}

const FONT_MAP: Record<string, string> = {
  system: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, sans-serif",
  serif: "Georgia, 'Times New Roman', serif",
  mono: "var(--vscode-editor-font-family, Consolas, 'Courier New', monospace)",
};

const WIDTH_MAP: Record<string, string> = {
  narrow: '600px',
  medium: '800px',
  wide: '100%',
};

export class ControlsManager {
  private settings: ViewerSettings = { fontSize: 16, fontFamily: 'system', contentWidth: 'medium' };
  private vscode: any;

  constructor(vscode: any) {
    this.vscode = vscode;
  }

  initialize(settings: Partial<ViewerSettings>): void {
    if (settings.fontSize) this.settings.fontSize = settings.fontSize;
    if (settings.fontFamily) this.settings.fontFamily = settings.fontFamily;
    if (settings.contentWidth) this.settings.contentWidth = settings.contentWidth;
    this.applyAll();
    this.updateControlBarState();
  }

  renderControlBar(): void {
    const bar = document.getElementById('control-bar')!;
    bar.innerHTML = `
      <button id="theme-toggle" title="Toggle theme (auto/light/dark)">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/>
          <line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/>
          <line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
        </svg>
      </button>
      <span class="control-separator"></span>
      <button id="font-decrease" title="Decrease font size">A-</button>
      <span id="font-size-display">${this.settings.fontSize}px</span>
      <button id="font-increase" title="Increase font size">A+</button>
      <span class="control-separator"></span>
      <select id="font-family" title="Font family">
        <option value="system" ${this.settings.fontFamily === 'system' ? 'selected' : ''}>Sans</option>
        <option value="serif" ${this.settings.fontFamily === 'serif' ? 'selected' : ''}>Serif</option>
        <option value="mono" ${this.settings.fontFamily === 'mono' ? 'selected' : ''}>Mono</option>
      </select>
      <span class="control-separator"></span>
      <button data-width="narrow" title="Narrow (600px)" class="width-btn ${this.settings.contentWidth === 'narrow' ? 'active' : ''}">|||</button>
      <button data-width="medium" title="Medium (800px)" class="width-btn ${this.settings.contentWidth === 'medium' ? 'active' : ''}">| |</button>
      <button data-width="wide" title="Wide (full)" class="width-btn ${this.settings.contentWidth === 'wide' ? 'active' : ''}">|&nbsp;&nbsp;|</button>
      <span class="control-separator"></span>
      <button id="toc-toggle" title="Toggle table of contents">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/>
          <line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/>
          <line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>
        </svg>
      </button>
    `;

    // Event listeners
    bar.querySelector('#theme-toggle')!.addEventListener('click', () => {
      window.dispatchEvent(new CustomEvent('ark-toggle-theme'));
    });

    bar.querySelector('#font-decrease')!.addEventListener('click', () => {
      this.setFontSize(this.settings.fontSize - 1);
    });

    bar.querySelector('#font-increase')!.addEventListener('click', () => {
      this.setFontSize(this.settings.fontSize + 1);
    });

    bar.querySelector('#font-family')!.addEventListener('change', (e) => {
      this.setFontFamily((e.target as HTMLSelectElement).value);
    });

    bar.querySelectorAll('.width-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        this.setContentWidth((btn as HTMLElement).getAttribute('data-width')!);
      });
    });

    bar.querySelector('#toc-toggle')!.addEventListener('click', () => {
      window.dispatchEvent(new CustomEvent('ark-toggle-toc'));
    });
  }

  private setFontSize(size: number): void {
    this.settings.fontSize = Math.max(12, Math.min(24, size));
    const content = document.getElementById('content');
    if (content) content.style.fontSize = `${this.settings.fontSize}px`;
    const display = document.getElementById('font-size-display');
    if (display) display.textContent = `${this.settings.fontSize}px`;
    this.persist('fontSize', this.settings.fontSize);
  }

  private setFontFamily(family: string): void {
    this.settings.fontFamily = family;
    const content = document.getElementById('content');
    if (content) content.style.fontFamily = FONT_MAP[family] || FONT_MAP.system;
    this.persist('fontFamily', family);
  }

  private setContentWidth(width: string): void {
    this.settings.contentWidth = width;
    const content = document.getElementById('content');
    if (content) content.style.maxWidth = WIDTH_MAP[width] || '800px';
    this.updateWidthButtons();
    this.persist('contentWidth', width);
  }

  private applyAll(): void {
    const content = document.getElementById('content');
    if (!content) return;
    content.style.fontSize = `${this.settings.fontSize}px`;
    content.style.fontFamily = FONT_MAP[this.settings.fontFamily] || FONT_MAP.system;
    content.style.maxWidth = WIDTH_MAP[this.settings.contentWidth] || '800px';
  }

  private updateControlBarState(): void {
    const display = document.getElementById('font-size-display');
    if (display) display.textContent = `${this.settings.fontSize}px`;
    const select = document.getElementById('font-family') as HTMLSelectElement;
    if (select) select.value = this.settings.fontFamily;
    this.updateWidthButtons();
  }

  private updateWidthButtons(): void {
    document.querySelectorAll('.width-btn').forEach((btn) => {
      btn.classList.toggle('active', (btn as HTMLElement).getAttribute('data-width') === this.settings.contentWidth);
    });
  }

  private persist(key: string, value: unknown): void {
    this.vscode.postMessage({ type: 'settingChanged', key, value });
  }
}
