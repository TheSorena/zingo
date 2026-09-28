import { NextResponse } from 'next/server';
import { getNotice } from '../../../lib/users';

export const runtime = 'nodejs';

export async function GET() {
  try {
    const notice = await getNotice();
    return NextResponse.json({ notice });
  } catch {
    return NextResponse.json({ notice: null });
  }
}
