import { NextRequest, NextResponse } from 'next/server';
import { createAdminToken, adminCookieName, safeEqual } from '../../../../lib/admin';
import { redis } from '../../../../lib/redis';

export const runtime = 'nodejs';

function getClientIp(request: NextRequest): string {
  const fwd = request.headers.get('x-forwarded-for');
  if (fwd) return fwd.split(',')[0].trim();
  return request.headers.get('x-real-ip') || 'unknown';
}

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request);
    if (redis) {
      try {
        const key = `rl:login:${ip}`;
        const allowed = await redis.incr(key);
        if (allowed === 1) {
          await redis.expire(key, 60);
        }
        if (allowed > 5) {
          return NextResponse.json(
            { error: 'تلاش‌های زیاد؛ لطفاً یک دقیقه صبر کنید' },
            { status: 429 }
          );
        }
      } catch {
        // rate limit must never block login
      }
    }

    const body = await request.json().catch(() => null);
    const passcode = body?.passcode;

    if (!passcode || !process.env.ADMIN_PASSCODE) {
      return NextResponse.json({ error: 'رمز عبور نامعتبر است' }, { status: 401 });
    }

    if (!safeEqual(String(passcode), process.env.ADMIN_PASSCODE)) {
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
  } catch (error) {
    console.error('Admin login error:', error);
    return NextResponse.json({ error: 'خطا در ورود' }, { status: 500 });
  }
}
