import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

const chartInstances = new Map<string, Chart>();

const ALLOWED_CHART_TYPES = new Set([
  'bar', 'line', 'pie', 'doughnut', 'radar', 'polarArea', 'bubble', 'scatter',
]);

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
      const raw = JSON.parse(rawConfig);

      if (!raw.type || !raw.data) {
        throw new Error('Chart config must have "type" and "data" properties');
      }

      if (!ALLOWED_CHART_TYPES.has(raw.type)) {
        throw new Error(`Unsupported chart type: ${raw.type}`);
      }

      // Destroy existing
      if (chartInstances.has(id)) {
        chartInstances.get(id)!.destroy();
      }

      // Safe DOM creation (no innerHTML with user-derived id)
      const canvas = document.createElement('canvas');
      canvas.id = id;
      canvas.style.maxHeight = '400px';
      block.textContent = '';
      block.appendChild(canvas);

      // Build safe config -- whitelist allowed options only
      const safeConfig = {
        type: raw.type,
        data: raw.data,
        options: {
          responsive: true,
          maintainAspectRatio: true,
          animation: { duration: 300 },
          color: undefined as string | undefined,
          scales: raw.options?.scales || {},
          plugins: {
            legend: raw.options?.plugins?.legend || {},
            title: raw.options?.plugins?.title || {},
          },
          indexAxis: raw.options?.indexAxis,
        },
      };

      if (isDark) {
        safeConfig.options.color = '#c9d1d9';
        applyDarkScales(safeConfig.options.scales);
      }

      const chart = new Chart(canvas, safeConfig as any);
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
