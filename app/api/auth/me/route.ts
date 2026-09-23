import { NextRequest, NextResponse } from 'next/server';
import {
  getUserById,
  setUserColor,
  userCookieName,
  verifySessionToken,
} from '../../../../lib/users';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get(userCookieName)?.value;
    const id = await verifySessionToken(token);
    if (!id) return NextResponse.json({ user: null });
    const user = await getUserById(id);
    return NextResponse.json({ user });
  } catch (error) {
    console.error('me error:', error);
    return NextResponse.json({ user: null });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const token = request.cookies.get(userCookieName)?.value;
    const id = await verifySessionToken(token);
    if (!id) {
      return NextResponse.json({ error: 'وارد نشده‌اید' }, { status: 401 });
    }
    const body = await request.json().catch(() => null);
    const color = Number(body?.color);
    if (!Number.isFinite(color)) {
      return NextResponse.json({ error: 'رنگ نامعتبر است' }, { status: 400 });
    }
    const user = await setUserColor(id, color);
    if (!user) {
      return NextResponse.json({ error: 'کاربر یافت نشد' }, { status: 404 });
    }
    return NextResponse.json({ user });
  } catch (error) {
    console.error('me update error:', error);
    return NextResponse.json({ error: 'خطا در به‌روزرسانی' }, { status: 500 });
  }
}
