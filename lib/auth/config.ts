/**
 * NextAuth v5 edge-safe configuration — used by both middleware and the full auth.ts.
 * No PrismaAdapter or bcrypt here; those are Node.js-only and live in auth.ts.
 * Credentials provider is added in auth.ts only (not edge-safe).
 */
import type { NextAuthConfig } from 'next-auth';
import Google from 'next-auth/providers/google';
import GitHub from 'next-auth/providers/github';

export const authConfig: NextAuthConfig = {
  providers: [
    Google,
    GitHub,
  ],
  pages: {
    signIn: '/sign-in',
    newUser: '/sign-up',
  },
  trustHost: true,
};
