/**
 * Next.js Proxy — route protection via Clerk (Next.js 16+)
 * Lightweight auth gate before page render; authoritative checks live in server actions.
 *
 * Redirects:
 *   /add-job → /dashboard  (legacy route removed; Add Job is now a dialog)
 *   /jobs/*  → /dashboard  (route renamed to /dashboard)
 */
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/discover(.*)',
  '/stats',
  '/user-profile(.*)',
]);

export default clerkMiddleware(async (auth, req) => {
  const { pathname } = req.nextUrl;

  // Redirect legacy /add-job to /dashboard
  if (pathname === '/add-job') {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  // Redirect legacy /jobs routes to /dashboard
  if (pathname.startsWith('/jobs')) {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  if (isProtectedRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)'],
};
