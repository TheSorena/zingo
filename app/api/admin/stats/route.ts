import { NextResponse } from 'next/server';
import { getUserCount, listUsers } from '../../../../lib/users';
import { countComments } from '../../../../lib/comments';

export const runtime = 'nodejs';

// NOTE: protected by middleware (admin cookie) for all non-OPTIONS methods.

export async function GET() {
  try {
    const [userTotal, users, commentTotal] = await Promise.all([
      getUserCount(),
      listUsers(500),
      countComments(),
    ]);
    const vipTotal = users.filter((u) => u.vip).length;
    return NextResponse.json({
      users: userTotal || users.length,
      vip: vipTotal,
      comments: commentTotal,
    });
  } catch (error) {
    console.error('admin stats error:', error);
    return NextResponse.json({ error: 'خطا در دریافت آمار' }, { status: 500 });
  }
}
