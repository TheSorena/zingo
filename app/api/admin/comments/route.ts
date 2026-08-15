import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminToken, adminCookieName } from '../../../../lib/admin';
import { listAllComments, deleteComment, countComments, addReply } from '../../../../lib/comments';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  const token = request.cookies.get(adminCookieName)?.value;
  const isAdmin = await verifyAdminToken(token);
  if (!isAdmin) {
    return NextResponse.json({ error: 'دسترسی غیرمجاز' }, { status: 401 });
  }

  const [comments, total] = await Promise.all([listAllComments(), countComments()]);
  return NextResponse.json({ comments, total });
}

export async function POST(request: NextRequest) {
  const token = request.cookies.get(adminCookieName)?.value;
  const isAdmin = await verifyAdminToken(token);
  if (!isAdmin) {
    return NextResponse.json({ error: 'دسترسی غیرمجاز' }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const id = body?.id;
  const reply = body?.reply?.trim();

  if (!id || !reply) {
    return NextResponse.json({ error: 'شناسه و متن پاسخ لازم است' }, { status: 400 });
  }
  if (reply.length > 600) {
    return NextResponse.json({ error: 'متن پاسخ حداکثر ۶۰۰ حرف است' }, { status: 400 });
  }

  const ok = await addReply(id, reply);
  if (!ok) {
    return NextResponse.json({ error: 'کامنت یافت نشد' }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}

export async function DELETE(request: NextRequest) {
  const token = request.cookies.get(adminCookieName)?.value;
  const isAdmin = await verifyAdminToken(token);
  if (!isAdmin) {
    return NextResponse.json({ error: 'دسترسی غیرمجاز' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  if (!id) {
    return NextResponse.json({ error: 'شناسه کامنت لازم است' }, { status: 400 });
  }

  const deleted = await deleteComment(id);
  if (!deleted) {
    return NextResponse.json({ error: 'کامنت یافت نشد' }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}