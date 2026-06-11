/**
 * Optimistic chart cache patches — mirrors getCachedCharts grouping (MMM YY buckets).
 */
import dayjs from 'dayjs';
import type { ChartPoint } from '@/lib/jobs/queries';

export type ChartsCache = ChartPoint[] | undefined;

/** Increment or decrement the monthly application count in the charts cache */
export function bumpChartMonth(
  charts: ChartsCache,
  date: Date,
  delta: number
): ChartsCache {
  if (!charts || delta === 0) return charts;

  const dateKey = dayjs(date).format('MMM YY');
  const existing = charts.find((c) => c.date === dateKey);

  if (existing) {
    const nextCount = Math.max(0, existing.count + delta);
    if (nextCount === 0) {
      return charts.filter((c) => c.date !== dateKey);
    }
    return charts.map((c) =>
      c.date === dateKey ? { ...c, count: nextCount } : c
    );
  }

  if (delta > 0) {
    return [...charts, { date: dateKey, count: delta }];
  }

  return charts;
}
