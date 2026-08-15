import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminToken, adminCookieName } from '../../../../lib/admin';
import { listAllComments, deleteComment, countComments } from '../../../../lib/comments';

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