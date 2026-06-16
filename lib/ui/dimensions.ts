/** Shared UI dimensions — keep skeletons aligned with loaded content (no layout flash) */
export const UI_DIMENSIONS = {
  logo: { width: 120, height: 37 },
  jobCard: { heightClass: 'h-48', roundedClass: 'rounded-[28px]' },
  statsCard: { heightClass: 'h-[120px]', roundedClass: 'rounded-[28px]' },
  formCard: { minHeightClass: 'min-h-[520px]' },
} as const;
