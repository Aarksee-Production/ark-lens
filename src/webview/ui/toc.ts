interface TocEntry {
  id: string;
  text: string;
  level: number;
}

export class TocManager {
  private entries: TocEntry[] = [];
  private visible: boolean = true;
  private observer: IntersectionObserver | null = null;
  private vscode: any;

  constructor(vscode: any) {
    this.vscode = vscode;

    // Listen for toggle event from controls
    window.addEventListener('ark-toggle-toc', () => this.toggle());
  }

  setVisible(visible: boolean): void {
    this.visible = visible;
    const sidebar = document.getElementById('toc-sidebar');
    if (sidebar) sidebar.classList.toggle('hidden', !this.visible);
    this.updateToggleButton();
  }

  generate(): void {
    const headings = document.querySelectorAll('#content h1, #content h2, #content h3, #content h4, #content h5, #content h6');
    this.entries = [];

    headings.forEach((heading, index) => {
      if (!heading.id) {
        heading.id = `heading-${index}`;
      }
      this.entries.push({
        id: heading.id,
        text: heading.textContent || '',
        level: parseInt(heading.tagName[1]),
      });
    });

    this.render();
    this.observeHeadings();
  }

  toggle(): void {
    this.visible = !this.visible;
    const sidebar = document.getElementById('toc-sidebar');
    if (sidebar) sidebar.classList.toggle('hidden', !this.visible);
    this.updateToggleButton();
    this.vscode.postMessage({ type: 'settingChanged', key: 'tocVisible', value: this.visible });
  }

  private updateToggleButton(): void {
    const btn = document.getElementById('toc-toggle');
    if (btn) btn.classList.toggle('active', this.visible);
  }

  private render(): void {
    const sidebar = document.getElementById('toc-sidebar');
    if (!sidebar) return;

    if (this.entries.length === 0) {
      sidebar.innerHTML = '<p class="toc-empty">No headings</p>';
      return;
    }

    const minLevel = Math.min(...this.entries.map((e) => e.level));

    sidebar.textContent = '';

    const title = document.createElement('div');
    title.className = 'toc-title';
    title.textContent = 'Contents';
    sidebar.appendChild(title);

    const nav = document.createElement('nav');
    nav.className = 'toc-nav';

    for (const entry of this.entries) {
      const safeId = sanitizeId(entry.id);
      const a = document.createElement('a');
      a.className = `toc-entry toc-level-${entry.level - minLevel}`;
      a.href = `#${safeId}`;
      a.dataset.tocId = safeId;
      a.title = entry.text;
      a.textContent = entry.text;
      nav.appendChild(a);
    }

    sidebar.appendChild(nav);

    nav.querySelectorAll('.toc-entry').forEach((link) => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = (link as HTMLElement).dataset.tocId!;
        document.getElementById(targetId)?.scrollIntoView({ behavior: 'smooth' });
      });
    });
  }

  private observeHeadings(): void {
    if (this.observer) this.observer.disconnect();

    const contentArea = document.getElementById('content-area');
    if (!contentArea) return;

    this.observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            this.highlightTocEntry(entry.target.id);
            break;
          }
        }
      },
      { root: contentArea, rootMargin: '-10% 0px -80% 0px' }
    );

    this.entries.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) this.observer!.observe(el);
    });
  }

  private highlightTocEntry(id: string): void {
    document.querySelectorAll('.toc-entry').forEach((el) => {
      el.classList.toggle('active', (el as HTMLElement).dataset.tocId === id);
    });
  }
}

/** Strip characters unsafe for use as an HTML id / attribute value. */
function sanitizeId(id: string): string {
  return id.replace(/[^A-Za-z0-9._:-]/g, '');
}
