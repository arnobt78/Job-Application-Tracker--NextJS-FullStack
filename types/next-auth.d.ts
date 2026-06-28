/**
 * NextAuth v5 type augmentation — extends the default Session type to expose
 * user.id, which is stored in the JWT via the jwt() callback in auth.ts.
 *
 * Without this, TypeScript would not know that session.user.id exists.
 */
import type { DefaultSession } from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
    } & DefaultSession['user'];
  }
}
