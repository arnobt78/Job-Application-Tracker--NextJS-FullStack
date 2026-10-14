import type { MetadataRoute } from 'next';
import { PROTECTED_PREFIXES } from '@/lib/auth/protected-routes';
import { SITE_URL } from '@/lib/site-metadata';

/** AI training/answer-engine crawlers — no access (Vercel AI Bots = Deny backs this at the edge) */
const AI_CRAWLERS = [
  'GPTBot',
  'ChatGPT-User',
  'CCBot',
  'anthropic-ai',
  'Claude-Web',
  'ClaudeBot',
  'Google-Extended',
  'PerplexityBot',
  'Bytespider',
  'Amazonbot',
  'meta-externalagent',
  'Applebot-Extended',
];

/**
 * Single robots source (no public/robots.txt). Authenticated routes are
 * derived from PROTECTED_PREFIXES so crawl scope can't drift from the proxy.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/_next/', '/api/', ...PROTECTED_PREFIXES],
      },
      {
        userAgent: AI_CRAWLERS,
        disallow: '/',
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
