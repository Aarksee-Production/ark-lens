import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

const chartInstances = new Map<string, Chart>();

export function renderChartBlocks(): void {
  const blocks = document.querySelectorAll('.ark-chart:not(.ark-chart-rendered):not(.ark-chart-error)');
  if (blocks.length === 0) return;

  const isDark = document.body.classList.contains('dark');

  for (const block of blocks) {
    const id = block.getAttribute('data-chart-id') || `chart-${Date.now()}`;
    const configEl = block.querySelector('.ark-chart-config');
    if (!configEl) continue;

    const rawConfig = configEl.textContent || '';
    if (!rawConfig.trim()) {
      block.classList.add('ark-chart-rendered');
      continue;
    }

    try {
      const config = JSON.parse(rawConfig);

      if (!config.type || !config.data) {
        throw new Error('Chart config must have "type" and "data" properties');
      }

      // Destroy existing
      if (chartInstances.has(id)) {
        chartInstances.get(id)!.destroy();
      }

      block.innerHTML = `<canvas id="${id}" style="max-height:400px;"></canvas>`;
      const canvas = document.getElementById(id) as HTMLCanvasElement;

      // Theme-aware defaults
      config.options = config.options || {};
      config.options.responsive = true;
      config.options.maintainAspectRatio = true;
      config.options.animation = { duration: 300 };

      if (isDark) {
        config.options.color = '#c9d1d9';
        config.options.scales = config.options.scales || {};
        applyDarkScales(config.options.scales);
      }

      const chart = new Chart(canvas, config);
      chartInstances.set(id, chart);
      block.classList.add('ark-chart-rendered');
    } catch (err: any) {
      block.innerHTML = `<div class="ark-render-error">Chart: ${escapeHtml(err.message || String(err))}</div>`;
      block.classList.add('ark-chart-error');
    }
  }
}

function applyDarkScales(scales: any) {
  for (const key of Object.keys(scales)) {
    scales[key].ticks = scales[key].ticks || {};
    scales[key].ticks.color = '#c9d1d9';
    scales[key].grid = scales[key].grid || {};
    scales[key].grid.color = '#30363d';
  }
  // Default x and y if not specified
  if (!scales.x) scales.x = { ticks: { color: '#c9d1d9' }, grid: { color: '#30363d' } };
  if (!scales.y) scales.y = { ticks: { color: '#c9d1d9' }, grid: { color: '#30363d' } };
}

export function destroyAllCharts(): void {
  chartInstances.forEach((chart) => chart.destroy());
  chartInstances.clear();
}

function escapeHtml(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
