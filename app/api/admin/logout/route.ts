import { NextRequest, NextResponse } from 'next/server';
import { adminCookieName } from '../../../../lib/admin';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  const response = NextResponse.json({ ok: true });
  response.cookies.set(adminCookieName, '', { maxAge: 0, path: '/' });
  return response;
}