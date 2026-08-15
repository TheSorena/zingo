import { NextRequest, NextResponse } from 'next/server';
import { createAdminToken, adminCookieName } from '../../../../lib/admin';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const passcode = body?.passcode;

  if (!passcode || !process.env.ADMIN_PASSCODE) {
    return NextResponse.json({ error: 'رمز عبور نامعتبر است' }, { status: 401 });
  }

  if (passcode !== process.env.ADMIN_PASSCODE) {
    return NextResponse.json({ error: 'رمز عبور اشتباه است' }, { status: 401 });
  }

  const token = await createAdminToken();
  const isLocal =
    request.headers.get('host')?.includes('localhost') ||
    request.headers.get('host')?.startsWith('127.');

  const response = NextResponse.json({ ok: true });
  response.cookies.set(adminCookieName, token, {
    httpOnly: true,
    sameSite: 'strict',
    secure: !isLocal,
    path: '/',
    maxAge: 7 * 24 * 60 * 60,
  });
  return response;
}