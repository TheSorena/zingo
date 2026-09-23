import { NextRequest, NextResponse } from 'next/server';
import { userCookieName } from '../../../../lib/users';

export const runtime = 'nodejs';

export async function POST(_request: NextRequest) {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(userCookieName, '', { path: '/', maxAge: 0 });
  return res;
}
