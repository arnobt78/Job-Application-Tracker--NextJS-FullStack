/**
 * NextAuth v5 route handler — handles all /api/auth/* endpoints:
 *   GET  /api/auth/session
 *   POST /api/auth/signin
 *   POST /api/auth/signout
 *   GET  /api/auth/callback/:provider  (Google, GitHub OAuth callbacks)
 *   GET  /api/auth/csrf
 */
import { handlers } from '@/auth';

export const { GET, POST } = handlers;
