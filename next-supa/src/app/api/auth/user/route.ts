// src/app/api/auth/user/route.ts
import { auth0 } from '@/lib/auth0';
import { NextResponse } from 'next/server';

export const GET = auth0.withApiAuthRequired(async () => {
  const session = await auth0.getSession();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 });
  }
  return NextResponse.json({
    email: session.user.email ?? '',
    name: session.user.name ?? session.user.nickname ?? '',
    avatar: session.user.picture ?? '',
  });
});