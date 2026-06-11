import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/site-metadata';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/_next/',
          '/api/',
          '/add-job',
          '/jobs',
          '/stats',
          '/user-profile',
        ],
      },
      {
        userAgent: [
          'GPTBot',
          'ChatGPT-User',
          'CCBot',
          'anthropic-ai',
          'Claude-Web',
        ],
        disallow: '/',
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
