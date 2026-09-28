import { NextRequest, NextResponse } from 'next/server';
import { listUserComments } from '../../../../lib/comments';
import { userCookieName, verifySessionToken } from '../../../../lib/users';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get(userCookieName)?.value;
    const uid = await verifySessionToken(token).catch(() => null);
    if (!uid) {
      return NextResponse.json({ error: 'وارد نشده‌اید' }, { status: 401 });
    }
    const comments = await listUserComments(uid, 5);
    return NextResponse.json({ comments });
  } catch (error) {
    console.error('my comments error:', error);
    return NextResponse.json({ error: 'خطا در دریافت' }, { status: 500 });
  }
}
