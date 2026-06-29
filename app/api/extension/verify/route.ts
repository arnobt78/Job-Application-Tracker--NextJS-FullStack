/**
 * GET /api/extension/verify — validate browser extension token.
 *
 * Extension sends X-Extension-Token header; returns {valid, userId, name}.
 * Used by extension popup to confirm it is still connected to a valid account.
 */

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/utils/db';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest): Promise<NextResponse> {
  const token = request.headers.get('X-Extension-Token');
  if (!token) {
    return NextResponse.json({ valid: false }, { status: 401 });
  }

  try {
    const profile = await prisma.userProfile.findUnique({
      where: { extensionToken: token },
      select: { userId: true },
    });

    if (!profile) {
      return NextResponse.json({ valid: false }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: profile.userId },
      select: { name: true, email: true },
    });

    return NextResponse.json({
      valid: true,
      userId: profile.userId,
      name: user?.name ?? user?.email ?? 'User',
    });
  } catch {
    return NextResponse.json({ valid: false, error: 'Server error' }, { status: 500 });
  }
}
