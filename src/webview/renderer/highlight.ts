import Prism from 'prismjs';

// Import commonly used languages
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-bash';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-yaml';
import 'prismjs/components/prism-markdown';
import 'prismjs/components/prism-go';
import 'prismjs/components/prism-rust';
import 'prismjs/components/prism-sql';
import 'prismjs/components/prism-toml';
import 'prismjs/components/prism-docker';
import 'prismjs/components/prism-diff';
import 'prismjs/components/prism-powershell';
import 'prismjs/components/prism-jsx';
import 'prismjs/components/prism-tsx';
import 'prismjs/components/prism-scss';
import 'prismjs/components/prism-css';
import 'prismjs/components/prism-graphql';
import 'prismjs/components/prism-regex';
import 'prismjs/components/prism-java';

export function highlightCodeBlocks(): void {
  const blocks = document.querySelectorAll('pre > code[class*="language-"]');
  blocks.forEach((block) => {
    if (block.classList.contains('ark-highlighted')) return;
    const parent = block.parentElement;
    if (parent?.classList.contains('ark-mermaid')) return;
    if (parent?.classList.contains('ark-chart')) return;

    try {
      Prism.highlightElement(block);
    } catch {
      // Unsupported language, leave as-is
    }
    block.classList.add('ark-highlighted');
  });
}
