/** Human-readable labels for enum / URL filter values */

export function capitalizeWords(value: string): string {
  return value
    .split(/[\s_-]+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

/** e.g. full-time → Full-Time, pending → Pending */
export function formatEnumLabel(value: string): string {
  if (!value.trim()) return '';
  return capitalizeWords(value.replace(/-/g, ' '));
}
