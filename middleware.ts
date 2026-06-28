/**
 * Next.js middleware — route protection via NextAuth v5 (Next.js 16+).
 * Uses the edge-safe authConfig (no PrismaAdapter, no bcrypt) so the JWT
 * cookie is verified without a Node.js DB call on every request.
 *
 * Redirects:
 *   /add-job → /dashboard  (legacy route removed; Add Job is now a dialog)
 *   /jobs/*  → /dashboard  (route renamed to /dashboard)
 */
import NextAuth from 'next-auth';
import { authConfig } from '@/lib/auth/config';
import { NextResponse } from 'next/server';

// Lightweight NextAuth instance — no PrismaAdapter, edge-safe
const { auth } = NextAuth(authConfig);

const PROTECTED_PREFIXES = [
  '/dashboard',
  '/discover',
  '/stats',
  '/timeline',
  '/profile',
];

export default auth((req) => {
  const { pathname } = req.nextUrl;

  // Redirect legacy /add-job to /dashboard
  if (pathname === '/add-job') {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  // Redirect legacy /jobs routes to /dashboard
  if (pathname.startsWith('/jobs')) {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  const isProtected = PROTECTED_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(p + '/')
  );

  // req.auth is the NextAuth session object — null when unauthenticated
  if (isProtected && !req.auth) {
    return NextResponse.redirect(new URL('/sign-in', req.url));
  }
});

export const config = {
  // Exclude static files, _next internals, and the NextAuth API routes themselves
  matcher: ['/((?!.*\\..*|_next|api/auth).*)', '/', '/(api|trpc)(.*)'],
};
