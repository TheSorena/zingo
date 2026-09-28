import { NextRequest, NextResponse } from 'next/server';
import { getRating, setRating } from '../../../lib/ratings';
import { userCookieName, verifySessionToken } from '../../../lib/users';

export const runtime = 'nodejs';

function target(request: NextRequest, body?: any) {
  const { searchParams } = new URL(request.url);
  const type = body?.type ?? searchParams.get('type');
  const id = Number(body?.id ?? searchParams.get('id'));
  return { type, id };
}

export async function GET(request: NextRequest) {
  try {
    const { type, id } = target(request);
    if ((type !== 'movie' && type !== 'serie') || !Number.isInteger(id) || id <= 0) {
      return NextResponse.json({ error: 'مشخصات نامعتبر است' }, { status: 400 });
    }
    const token = request.cookies.get(userCookieName)?.value;
    const uid = await verifySessionToken(token).catch(() => null);
    const summary = await getRating(type, id, uid);
    return NextResponse.json(summary);
  } catch (error) {
    console.error('ratings get error:', error);
    return NextResponse.json({ error: 'خطا در دریافت امتیاز' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get(userCookieName)?.value;
    const uid = await verifySessionToken(token).catch(() => null);
    if (!uid) {
      return NextResponse.json({ error: 'برای امتیاز دادن وارد شوید' }, { status: 401 });
    }
    const body = await request.json().catch(() => null);
    const { type, id } = target(request, body);
    const score = Number(body?.score);
    if ((type !== 'movie' && type !== 'serie') || !Number.isInteger(id) || id <= 0) {
      return NextResponse.json({ error: 'مشخصات نامعتبر است' }, { status: 400 });
    }
    if (!Number.isFinite(score) || score < 1 || score > 10) {
      return NextResponse.json({ error: 'امتیاز باید بین ۱ تا ۱۰ باشد' }, { status: 400 });
    }
    const summary = await setRating(uid, type, id, score);
    return NextResponse.json(summary);
  } catch (error) {
    console.error('ratings post error:', error);
    return NextResponse.json({ error: 'خطا در ثبت امتیاز' }, { status: 500 });
  }
}
