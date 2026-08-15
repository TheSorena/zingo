import { NextRequest, NextResponse } from 'next/server';
import { redis } from '../../../lib/redis';
import { addComment, listComments, validateComment } from '../../../lib/comments';

export const runtime = 'nodejs';

function getClientIp(request: NextRequest): string {
  const fwd = request.headers.get('x-forwarded-for');
  if (fwd) return fwd.split(',')[0].trim();
  return request.headers.get('x-real-ip') || 'unknown';
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type');
  const targetId = Number(searchParams.get('id'));

  if (type !== 'movie' && type !== 'serie') {
    return NextResponse.json({ error: 'نوع نامعتبر است' }, { status: 400 });
  }
  if (!Number.isInteger(targetId) || targetId <= 0) {
    return NextResponse.json({ error: 'شناسه نامعتبر است' }, { status: 400 });
  }

  const comments = await listComments(type, targetId);
  return NextResponse.json({ comments });
}

export async function POST(request: NextRequest) {
  if (!redis) {
    return NextResponse.json(
      { error: 'ذخیره‌سازی کامنت در دسترس نیست' },
      { status: 503 }
    );
  }

  const body = await request.json().catch(() => null);
  const type = body?.type;
  const targetId = Number(body?.targetId);
  const hasSpoiler = !!body?.hasSpoiler;

  if (type !== 'movie' && type !== 'serie') {
    return NextResponse.json({ error: 'نوع نامعتبر است' }, { status: 400 });
  }
  if (!Number.isInteger(targetId) || targetId <= 0) {
    return NextResponse.json({ error: 'شناسه نامعتبر است' }, { status: 400 });
  }

  const validationError = validateComment(body || {});
  if (validationError) {
    return NextResponse.json({ error: validationError }, { status: 400 });
  }

  const ip = getClientIp(request);
  const rateKey = `rl:${ip}`;
  const rateLimit = await redis.set(rateKey, '1', { nx: true, ex: 60 });
  if (rateLimit === null) {
    return NextResponse.json(
      { error: 'لطفاً یک دقیقه صبر کنید و دوباره تلاش کنید' },
      { status: 429 }
    );
  }

  const comment = await addComment({
    type,
    targetId,
    name: body.name.trim(),
    text: body.text.trim(),
    hasSpoiler,
  });

  return NextResponse.json({ comment }, { status: 201 });
}