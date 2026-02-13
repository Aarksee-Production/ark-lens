import mermaid from 'mermaid';
import DOMPurify from 'dompurify';

const svgPurifyConfig = {
  USE_PROFILES: { svg: true, svgFilters: true },
  FORBID_TAGS: ['script', 'iframe', 'object', 'embed', 'foreignObject'],
  FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover', 'onfocus', 'onblur', 'style'],
};

let initialized = false;

export function initMermaid(isDark: boolean): void {
  mermaid.initialize({
    startOnLoad: false,
    theme: isDark ? 'dark' : 'default',
    securityLevel: 'strict',
    fontFamily: 'inherit',
    logLevel: 'error' as any,
  });
  initialized = true;
}

export async function renderMermaidBlocks(): Promise<void> {
  const isDark = document.body.classList.contains('dark');
  if (!initialized) initMermaid(isDark);

  const blocks = document.querySelectorAll('.ark-mermaid:not(.ark-mermaid-rendered):not(.ark-mermaid-error)');
  if (blocks.length === 0) return;

  // Re-init with current theme
  initMermaid(isDark);

  for (const block of blocks) {
    const id = block.getAttribute('data-mermaid-id') || `mermaid-${Date.now()}`;
    const definition = block.textContent || '';

    if (!definition.trim()) {
      block.classList.add('ark-mermaid-rendered');
      continue;
    }

    try {
      const { svg } = await mermaid.render(id, definition.trim());
      block.innerHTML = DOMPurify.sanitize(svg, svgPurifyConfig) as string;
      block.classList.add('ark-mermaid-rendered');
    } catch (err: any) {
      block.innerHTML = `<div class="ark-render-error">Mermaid: ${escapeHtml(err.message || String(err))}</div>`;
      block.classList.add('ark-mermaid-error');
    }
  }
}

function escapeHtml(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
