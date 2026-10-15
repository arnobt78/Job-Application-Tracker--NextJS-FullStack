/** Shared plumbing for the read-only /api/postings routes. */
import { NextResponse } from 'next/server';
import type * as z from 'zod';
import { auth } from '@/auth';

const CACHE_HEADERS = { 'Cache-Control': 'private, max-age=60' };

/** 401 response when there is no session, otherwise null. */
export async function requireSession(): Promise<NextResponse | null> {
  const session = await auth();
  return session?.user?.id ? null : NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}

export function badRequest(error: z.ZodError): NextResponse {
  return NextResponse.json(
    { error: 'Invalid parameters', issues: error.issues.map((i) => ({ path: i.path.join('.'), message: i.message })) },
    { status: 400 }
  );
}

export function postingsJson(data: unknown): NextResponse {
  return NextResponse.json(data, { headers: CACHE_HEADERS });
}

export function notFound(): NextResponse {
  return NextResponse.json({ error: 'Posting not found' }, { status: 404 });
}

export function searchParamsObject(url: string): Record<string, string> {
  return Object.fromEntries(new URL(url).searchParams);
}
