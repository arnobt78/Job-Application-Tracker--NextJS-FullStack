/** Hydration-safe job date — fixed locale + UTC so SSR and client match */
export function formatJobDate(value: Date | string): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(value));
}
