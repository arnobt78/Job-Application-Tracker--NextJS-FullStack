import { withSentryConfig } from '@sentry/nextjs/config';
import type { NextConfig } from 'next';

const securityHeaders = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-XSS-Protection', value: '1; mode=block' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), geolocation=()' },
];

const nextConfig: NextConfig = {
  experimental: {
    // Reuse visited dynamic pages for 30s on client navigation (instant revisit, zero server calls).
    // Safe with CRUD: mutations call revalidatePath (clears this cache) and HydrationBoundary never
    // overwrites newer TanStack data with an older payload.
    staleTimes: { dynamic: 30 },
  },
  images: {
    // 31 days — avatar URLs change when the image changes, so a long TTL is safe
    // and stops bots from re-triggering Image Optimization transforms.
    minimumCacheTTL: 2678400,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'robohash.org',
        pathname: '/**',
      },
      {
        // OAuth avatars: Google (active) + GitHub (login removed; kept for avatars already stored)
        protocol: 'https',
        hostname: '*.googleusercontent.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
        pathname: '/**',
      },
    ],
  },
  async headers() {
    const routes: { source: string; headers: { key: string; value: string }[] }[] =
      [
        {
          source: '/:path*',
          headers: securityHeaders,
        },
      ];

    // Immutable static cache — production only (avoids Next dev warning)
    if (process.env.NODE_ENV === 'production') {
      routes.push({
        source: '/_next/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      });
    }

    return routes;
  },
};

export default withSentryConfig(nextConfig, {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  // Vercel sets CI=1, so `silent: !process.env.CI` produced noisy build logs
  silent: true,
  telemetry: false,
  widenClientFileUpload: true,
  sourcemaps: {
    // Maps go to Sentry only — never served from public build artifacts
    deleteSourcemapsAfterUpload: true,
  },
  // Strip SDK debug logger statements from the browser bundle
  bundleSizeOptimizations: {
    excludeDebugStatements: true,
  },
  // tunnelRoute omitted — /api/monitoring owned in app/api/monitoring/route.ts
});
