/**
 * UTC month helpers — align month filters with formatJobDate (UTC display).
 */

import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';

dayjs.extend(utc);

/** YYYY-MM bucket for a job createdAt in UTC */
export function monthYearKeyUtc(date: Date): string {
  return dayjs.utc(date).format('YYYY-MM');
}

/** UTC start/end of month for Prisma createdAt range filter */
export function monthRangeFromYearMonthUtc(
  monthYear: string
): { gte: Date; lte: Date } | null {
  if (!monthYear || monthYear === 'all') return null;
  if (!/^\d{4}-\d{2}$/.test(monthYear)) return null;
  const start = dayjs.utc(`${monthYear}-01`, 'YYYY-MM-DD', true);
  if (!start.isValid()) return null;
  return {
    gte: start.startOf('month').toDate(),
    lte: start.endOf('month').toDate(),
  };
}

/** Dropdown label for a YYYY-MM value — UTC-stable formatting */
export function formatMonthYearLabelUtc(monthYear: string): string {
  if (!/^\d{4}-\d{2}$/.test(monthYear)) return monthYear;
  const start = dayjs.utc(`${monthYear}-01`, 'YYYY-MM-DD', true);
  if (!start.isValid()) return monthYear;
  return start.format('MMM YYYY');
}
