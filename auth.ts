/**
 * NextAuth v5 — full server-side auth instance.
 * Extends the edge-safe config (lib/auth/config.ts) with:
 *   - PrismaAdapter (DB sessions for OAuth accounts)
 *   - Credentials provider (email + bcrypt password for registered users)
 *   - JWT session strategy (edge-compatible for middleware cookie reads)
 *   - JWT + session callbacks to expose user.id in session
 *
 * Import { auth, signIn, signOut } from '@/auth' in server components + server actions.
 * Import { handlers } only in app/api/auth/[...nextauth]/route.ts.
 */
import NextAuth from 'next-auth';
import { PrismaAdapter } from '@auth/prisma-adapter';
import Credentials from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import prisma from '@/utils/db';
import { authConfig } from '@/lib/auth/config';

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  ...authConfig,
  // Credentials provider added here — uses bcrypt + Prisma (Node.js only, not edge)
  providers: [
    ...authConfig.providers,
    Credentials({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        });

        // OAuth-only accounts have null password — deny credential login
        if (!user?.password) return null;

        const valid = await bcrypt.compare(credentials.password as string, user.password);
        return valid ? user : null;
      },
    }),
  ],
  // JWT strategy so middleware can verify session without DB on every request
  session: { strategy: 'jwt' },
  callbacks: {
    // Store user.id in JWT token at sign-in so it survives across requests
    jwt({ token, user }) {
      if (user) token.id = user.id;
      return token;
    },
    // Expose token.id as session.user.id (augmented type in types/next-auth.d.ts)
    session({ session, token }) {
      if (token?.id) session.user.id = token.id as string;
      return session;
    },
  },
});
