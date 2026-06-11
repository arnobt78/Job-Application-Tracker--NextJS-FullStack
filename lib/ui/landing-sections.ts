/** Landing page section anchors — used by navbar smooth scroll */
export const LANDING_SECTIONS = [
  { id: 'hero', label: 'Home' },
  { id: 'highlights', label: 'Highlights' },
  { id: 'features', label: 'Features' },
  { id: 'about', label: 'About' },
] as const;

export type LandingSectionId = (typeof LANDING_SECTIONS)[number]['id'];
