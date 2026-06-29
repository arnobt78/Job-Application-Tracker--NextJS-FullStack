/**
 * GET /api/extension/token — generate (or retrieve) the user's extension token.
 *
 * Requires NextAuth session. Returns { token } for use in browser extension.
 * Token is stored in UserProfile.extensionToken (@unique).
 */

import { auth } from '@/auth';
import { NextResponse } from 'next/server';
import prisma from '@/utils/db';

export const dynamic = 'force-dynamic';

export async function GET(): Promise<NextResponse> {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = session.user.id;

  try {
    // Return existing token if already generated
    const existing = await prisma.userProfile.findUnique({
      where: { userId },
      select: { extensionToken: true },
    });

    if (existing?.extensionToken) {
      return NextResponse.json({ token: existing.extensionToken });
    }

    // Generate a new random token
    const token = crypto.randomUUID();

    await prisma.userProfile.upsert({
      where: { userId },
      create: {
        userId,
        skills: [],
        targetRoles: [],
        experienceLevel: null,
        extensionToken: token,
      },
      update: { extensionToken: token },
    });

    return NextResponse.json({ token });
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
