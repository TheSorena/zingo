import { NextRequest, NextResponse } from 'next/server';
import { clearNotice, getNotice, setNotice } from '../../../../lib/users';

export const runtime = 'nodejs';

// NOTE: protected by middleware (admin cookie) for all non-OPTIONS methods.

export async function GET() {
  try {
    const notice = await getNotice();
    return NextResponse.json({ notice });
  } catch (error) {
    console.error('admin notice error:', error);
    return NextResponse.json({ error: 'خطا در دریافت' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);
    const text = body?.text;
    const days = Number(body?.days ?? 7);
    if (typeof text !== 'string' || !text.trim()) {
      return NextResponse.json({ error: 'متن اطلاعیه لازم است' }, { status: 400 });
    }
    const notice = await setNotice(text, days);
    if (!notice) {
      return NextResponse.json({ error: 'ذخیره نشد' }, { status: 503 });
    }
    return NextResponse.json({ notice });
  } catch (error) {
    console.error('admin notice post error:', error);
    return NextResponse.json({ error: 'خطا در ذخیره‌سازی' }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    await clearNotice();
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('admin notice delete error:', error);
    return NextResponse.json({ error: 'خطا در حذف' }, { status: 500 });
  }
}
