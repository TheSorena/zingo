import { NextRequest, NextResponse } from 'next/server';
import { getUserCount, listUsers, setUserVip } from '../../../../lib/users';

export const runtime = 'nodejs';

// NOTE: protected by middleware (admin cookie) for all non-OPTIONS methods.

export async function GET() {
  try {
    const [users, counted] = await Promise.all([listUsers(200), getUserCount()]);
    const vip = users.filter((u) => u.vip).length;
    // counter started after launch — fall back to list length for older installs
    return NextResponse.json({ users, total: counted || users.length, vip });
  } catch (error) {
    console.error('admin users error:', error);
    return NextResponse.json({ error: 'خطا در دریافت کاربران' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);
    const id = body?.id;
    const vip = body?.vip;
    if (typeof id !== 'string' || !id || typeof vip !== 'boolean') {
      return NextResponse.json({ error: 'شناسه و وضعیت لازم است' }, { status: 400 });
    }
    const user = await setUserVip(id, vip);
    if (!user) {
      return NextResponse.json({ error: 'کاربر یافت نشد' }, { status: 404 });
    }
    return NextResponse.json({ user });
  } catch (error) {
    console.error('admin set-vip error:', error);
    return NextResponse.json({ error: 'خطا در به‌روزرسانی' }, { status: 500 });
  }
}
