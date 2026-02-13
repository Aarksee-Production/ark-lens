import MarkdownIt from 'markdown-it';
import DOMPurify, { Config as PurifyConfig } from 'dompurify';

const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
  breaks: true,
});

// Custom fence renderer for mermaid and chart blocks
const defaultFence = md.renderer.rules.fence;
md.renderer.rules.fence = (tokens, idx, options, env, self) => {
  const token = tokens[idx];
  const lang = token.info.trim().toLowerCase();
  const content = token.content;

  if (lang === 'mermaid') {
    const id = `mermaid-${idx}-${Date.now()}`;
    return `<div class="ark-mermaid" data-mermaid-id="${id}">${escapeHtml(content)}</div>`;
  }

  if (lang === 'chart' || lang === 'chartjs' || lang === 'chart-js') {
    const id = `chart-${idx}-${Date.now()}`;
    return `<div class="ark-chart" data-chart-id="${id}"><pre class="ark-chart-config" style="display:none">${escapeHtml(content)}</pre></div>`;
  }

  if (defaultFence) {
    return defaultFence(tokens, idx, options, env, self);
  }

  const escaped = escapeHtml(content);
  return `<pre><code class="language-${escapeHtml(lang)}">${escaped}</code></pre>`;
};

// DOMPurify configuration
const markdownPurifyConfig: PurifyConfig = {
  ALLOWED_TAGS: [
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'br', 'hr', 'div', 'span', 'section', 'article',
    'strong', 'em', 'b', 'i', 'u', 's', 'del', 'ins', 'mark', 'sub', 'sup', 'small',
    'ul', 'ol', 'li', 'dl', 'dt', 'dd',
    'table', 'thead', 'tbody', 'tfoot', 'tr', 'th', 'td', 'caption', 'colgroup', 'col',
    'pre', 'code', 'kbd', 'samp', 'var',
    'img', 'video', 'audio', 'source', 'picture', 'figure', 'figcaption',
    'a',
    'blockquote', 'details', 'summary',
    'input',
    'svg', 'path', 'circle', 'rect', 'line', 'polyline', 'polygon', 'text', 'g', 'defs',
    'marker', 'use', 'clipPath', 'desc', 'title', 'tspan',
    'header', 'footer', 'nav', 'main', 'aside', 'abbr', 'address', 'cite', 'time',
  ],
  ALLOWED_ATTR: [
    'href', 'src', 'alt', 'title', 'class', 'id', 'width', 'height',
    'colspan', 'rowspan', 'align', 'valign',
    'type', 'checked', 'disabled',
    'controls', 'autoplay', 'loop', 'muted', 'poster',
    'open', 'start', 'reversed',
    'data-mermaid-id', 'data-chart-id', 'data-line',
    // SVG attributes
    'viewBox', 'xmlns', 'fill', 'stroke', 'stroke-width', 'stroke-linecap',
    'stroke-linejoin', 'd', 'cx', 'cy', 'r', 'x', 'y', 'x1', 'y1', 'x2', 'y2',
    'points', 'transform', 'text-anchor', 'dominant-baseline', 'font-size',
    'font-family', 'font-weight', 'opacity', 'rx', 'ry',
    'marker-end', 'marker-start', 'clip-path', 'mask',
    'role', 'aria-label', 'aria-hidden',
  ],
  FORBID_TAGS: ['script', 'iframe', 'object', 'embed', 'form', 'button', 'select', 'textarea', 'link', 'meta', 'style', 'base', 'foreignObject', 'canvas'],
  FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover', 'onfocus', 'onblur', 'onsubmit', 'onchange', 'style'],
  ALLOW_DATA_ATTR: false,
};

const htmlPurifyConfig: PurifyConfig = {
  ...markdownPurifyConfig,
  ALLOW_DATA_ATTR: false,
  ALLOWED_TAGS: [
    ...(markdownPurifyConfig.ALLOWED_TAGS as string[]),
    'ruby', 'rt', 'rp', 'bdi', 'bdo', 'wbr', 'map', 'area',
  ],
  ALLOWED_ATTR: [
    ...(markdownPurifyConfig.ALLOWED_ATTR as string[]),
    'lang', 'dir', 'tabindex', 'headers', 'scope', 'datetime',
  ],
};

export function renderMarkdown(source: string): string {
  const rawHtml = md.render(source);
  return DOMPurify.sanitize(rawHtml, markdownPurifyConfig) as string;
}

export function sanitizeHtml(rawHtml: string): string {
  return DOMPurify.sanitize(rawHtml, htmlPurifyConfig) as string;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
