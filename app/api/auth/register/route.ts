import { NextRequest, NextResponse } from 'next/server';
import {
  createUser,
  createSessionToken,
  sessionCookie,
  userCookieName,
  validateName,
  validatePassword,
} from '../../../../lib/users';
import { redis } from '../../../../lib/redis';

export const runtime = 'nodejs';

function ip(request: NextRequest): string {
  const fwd = request.headers.get('x-forwarded-for');
  if (fwd) return fwd.split(',')[0].trim();
  return request.headers.get('x-real-ip') || 'unknown';
}

export async function POST(request: NextRequest) {
  try {
    if (redis) {
      try {
        const key = `rl:auth:${ip(request)}`;
        const n = await redis.incr(key);
        if (n === 1) await redis.expire(key, 60);
        if (n > 20) {
          return NextResponse.json(
            { error: 'تلاش‌های زیاد؛ کمی صبر کنید' },
            { status: 429 }
          );
        }
      } catch {}
    }

    const body = await request.json().catch(() => null);
    const nameErr = validateName(body?.name);
    if (nameErr) return NextResponse.json({ error: nameErr }, { status: 400 });
    const passErr = validatePassword(body?.password);
    if (passErr) return NextResponse.json({ error: passErr }, { status: 400 });

    const created = await createUser(body.name, body.password);
    if ('error' in created) {
      const status = created.error.includes('گرفته شده') ? 409 : 503;
      return NextResponse.json({ error: created.error }, { status });
    }

    const token = await createSessionToken(created.user.id);
    const c = sessionCookie(token, request.headers.get('host'));
    const res = NextResponse.json({ user: created.user }, { status: 201 });
    res.cookies.set(c.name, c.value, c.opts);
    // clear any stale name (defensive)
    res.cookies.delete(userCookieName + '_legacy');
    return res;
  } catch (error) {
    console.error('register error:', error);
    return NextResponse.json({ error: 'خطا در ثبت‌نام' }, { status: 500 });
  }
}
