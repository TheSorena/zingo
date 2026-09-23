import { NextRequest, NextResponse } from 'next/server';
import {
  addFavorite,
  listFavorites,
  removeFavorite,
  userCookieName,
  validateFavItem,
  verifySessionToken,
} from '../../../lib/users';

export const runtime = 'nodejs';

async function authedId(request: NextRequest): Promise<string | null> {
  const token = request.cookies.get(userCookieName)?.value;
  return verifySessionToken(token);
}

export async function GET(request: NextRequest) {
  try {
    const id = await authedId(request);
    if (!id) {
      return NextResponse.json({ error: 'وارد نشده‌اید' }, { status: 401 });
    }
    const items = await listFavorites(id);
    return NextResponse.json({ items });
  } catch (error) {
    console.error('favorites get error:', error);
    return NextResponse.json({ error: 'خطا در دریافت' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const id = await authedId(request);
    if (!id) {
      return NextResponse.json({ error: 'وارد نشده‌اید' }, { status: 401 });
    }
    const body = await request.json().catch(() => null);
    const err = validateFavItem(body?.item);
    if (err) return NextResponse.json({ error: err }, { status: 400 });
    const items = await addFavorite(id, body.item);
    return NextResponse.json({ items });
  } catch (error) {
    console.error('favorites add error:', error);
    return NextResponse.json({ error: 'خطا در ذخیره‌سازی' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const id = await authedId(request);
    if (!id) {
      return NextResponse.json({ error: 'وارد نشده‌اید' }, { status: 401 });
    }
    const { searchParams } = new URL(request.url);
    const itemId = Number(searchParams.get('id'));
    const type = searchParams.get('type');
    if (!Number.isInteger(itemId) || itemId <= 0 || (type !== 'movie' && type !== 'serie')) {
      return NextResponse.json({ error: 'شناسه نامعتبر است' }, { status: 400 });
    }
    const items = await removeFavorite(id, itemId, type);
    return NextResponse.json({ items });
  } catch (error) {
    console.error('favorites delete error:', error);
    return NextResponse.json({ error: 'خطا در حذف' }, { status: 500 });
  }
}
