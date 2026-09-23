import { NextRequest, NextResponse } from 'next/server';
import {
  authenticate,
  createSessionToken,
  sessionCookie,
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
    if (typeof body?.name !== 'string' || typeof body?.password !== 'string') {
      return NextResponse.json({ error: 'نام کاربری و رمز لازم است' }, { status: 400 });
    }

    const result = await authenticate(body.name, body.password);
    if ('error' in result) {
      return NextResponse.json({ error: result.error }, { status: 401 });
    }

    const token = await createSessionToken(result.user.id);
    const c = sessionCookie(token, request.headers.get('host'));
    const res = NextResponse.json({ user: result.user });
    res.cookies.set(c.name, c.value, c.opts);
    return res;
  } catch (error) {
    console.error('login error:', error);
    return NextResponse.json({ error: 'خطا در ورود' }, { status: 500 });
  }
}
