/**
 * Next.js Proxy — route protection via Clerk (Next.js 16+)
 * Lightweight auth gate before page render; authoritative checks live in server actions.
 */
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

const isProtectedRoute = createRouteMatcher([
  '/add-job',
  '/jobs(.*)',
  '/stats',
  '/user-profile(.*)',
]);

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)'],
};
