/**
 * Chart wiring.
 *
 * Four small time series, each a single measure on its own axis. No chart here
 * carries two scales: population and vocabulary size are different magnitudes
 * and get their own panels rather than a second y-axis.
 *
 * Colours come from the validated categorical slots and are read from CSS
 * custom properties, so the light/dark palettes swap in one place.
 */

import {
  Chart,
  Filler,
  Legend,
  LineController,
  LineElement,
  LinearScale,
  PointElement,
  Tooltip,
} from 'chart.js';

Chart.register(
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  Filler,
  Legend,
  Tooltip,
);

function token(name: string): string {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

export interface SeriesSpec {
  label: string;
  colorToken: string;
  /** Renders as a dashed reference line rather than a data series. */
  reference?: boolean;
}

export interface ChartHandle {
  push(values: number[], x: number): void;
  destroy(): void;
  retheme(): void;
}

interface ChartOptionsInput {
  canvas: HTMLCanvasElement;
  series: SeriesSpec[];
  /** Fixed y-axis bounds; omit to let the scale follow the data. */
  min?: number;
  max?: number;
  /** Formats the tooltip and tick values. */
  format?: (value: number) => string;
  maxPoints?: number;
}

/** Creates a line chart and returns a handle for streaming points into it. */
export function createTimeSeries(options: ChartOptionsInput): ChartHandle {
  const { canvas, series, min, max, maxPoints = 180 } = options;
  const format = options.format ?? ((value: number) => value.toFixed(1));

  const chart = new Chart(canvas, {
    type: 'line',
    data: {
      labels: [],
      datasets: series.map((spec) => ({
        label: spec.label,
        data: [] as number[],
        borderColor: token(spec.colorToken),
        backgroundColor: 'transparent',
        borderWidth: 2,
        borderDash: spec.reference ? [4, 4] : undefined,
        pointRadius: 0,
        // Hit targets larger than the mark, per the interaction rules.
        pointHitRadius: 12,
        pointHoverRadius: 4,
        tension: 0.25,
        fill: false,
      })),
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: false,
      // Crosshair-style read-out: hovering anywhere in the column reports every
      // series at that x.
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: { display: false },
        tooltip: {
          displayColors: series.length > 1,
          callbacks: {
            title: (items) => `${Number(items[0].label).toFixed(0)} sn`,
            label: (item) => `${item.dataset.label}: ${format(item.parsed.y ?? 0)}`,
          },
        },
      },
      scales: {
        x: {
          type: 'linear',
          grid: { display: false },
          border: { color: token('--axis') },
          ticks: {
            color: token('--text-muted'),
            maxTicksLimit: 5,
            callback: (value) => `${Number(value).toFixed(0)}s`,
          },
        },
        y: {
          min,
          max,
          grid: { color: token('--grid') },
          border: { display: false },
          ticks: {
            color: token('--text-muted'),
            maxTicksLimit: 5,
            callback: (value) => format(Number(value)),
          },
        },
      },
    },
  });

  return {
    push(values, x) {
      const labels = chart.data.labels as number[];
      labels.push(x);
      chart.data.datasets.forEach((dataset, index) => {
        (dataset.data as number[]).push(values[index] ?? 0);
      });
      if (labels.length > maxPoints) {
        labels.shift();
        chart.data.datasets.forEach((dataset) => (dataset.data as number[]).shift());
      }
      chart.update('none');
    },
    retheme() {
      chart.data.datasets.forEach((dataset, index) => {
        dataset.borderColor = token(series[index].colorToken);
      });
      const scales = chart.options.scales as Record<string, Record<string, unknown>>;
      (scales.y.grid as { color: string }).color = token('--grid');
      (scales.y.ticks as { color: string }).color = token('--text-muted');
      (scales.x.ticks as { color: string }).color = token('--text-muted');
      chart.update('none');
    },
    destroy() {
      chart.destroy();
    },
  };
}
