/** Marketing image paths — single source for hero/auth panels and accents */
export type MarketingPage = 'hero' | 'sign-in' | 'sign-up';

export type MarketingPageAssets = {
  panel: string;
  background: string;
  accent: string;
};

export const MARKETING_ASSETS = {
  hero: {
    panel: '/job-5.jpg',
    background: '/job-6.jpg',
    accent: '/job-1.svg',
  },
  'sign-in': {
    panel: '/job-6.jpg',
    background: '/job-7.jpg',
    accent: '/job-2.svg',
  },
  'sign-up': {
    panel: '/job-7.jpg',
    background: '/job-5.jpg',
    accent: '/job-3.svg',
  },
  accents: ['/job-1.svg', '/job-2.svg', '/job-3.svg', '/job-4.svg'],
} as const;

export function getMarketingAssets(page: MarketingPage): MarketingPageAssets {
  return MARKETING_ASSETS[page];
}
