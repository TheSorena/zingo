import { NextRequest, NextResponse } from 'next/server';
import { getMyRatings } from '../../../../lib/ratings';
import { userCookieName, verifySessionToken } from '../../../../lib/users';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get(userCookieName)?.value;
    const uid = await verifySessionToken(token).catch(() => null);
    if (!uid) {
      return NextResponse.json({ error: 'وارد نشده‌اید' }, { status: 401 });
    }
    const items = await getMyRatings(uid);
    return NextResponse.json({ items });
  } catch (error) {
    console.error('my ratings error:', error);
    return NextResponse.json({ error: 'خطا در دریافت' }, { status: 500 });
  }
}
