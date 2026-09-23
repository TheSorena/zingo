import { NextRequest, NextResponse } from 'next/server';
import { apiUrl } from '../../../../lib/config';
import { redis } from '../../../../lib/redis';
import { fetchUpstreamJson, upstreamErrorStatus } from '../../../../lib/upstream';

const KEY = '4F5A9C3D9A86FA54EACEDDD635185';
const serieCacheKey = (id: string) => `zingo:serie:${id}`;

const LIST_PATTERNS: Array<(page: number) => string> = [
  (p) => `${apiUrl}/api/serie/by/filtres/0/created/${p}/${KEY}/`,
  (p) => `${apiUrl}/api/poster/by/filtres/27/0/created/${p}/${KEY}/`,
  (p) => `${apiUrl}/api/poster/by/filtres/27/0/imdb/${p}/${KEY}/`,
  (p) => `${apiUrl}/api/poster/by/filtres/31/0/created/${p}/${KEY}/`,
];

function normalizeItems(data: unknown): any[] {
  if (Array.isArray(data)) return data;
  if (data && typeof data === 'object' && Array.isArray((data as any).data)) {
    return (data as any).data;
  }
  return [];
}

async function findInLists(id: string): Promise<any | null> {
  for (const pattern of LIST_PATTERNS) {
    for (let page = 0; page <= 2; page++) {
      try {
        const items = normalizeItems(await fetchUpstreamJson(pattern(page)));
        const found = items.find((item) => String(item?.id) === id);
        if (found) return found;
      } catch {
        // keep scanning
      }
    }
  }
  return null;
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!/^\d+$/.test(params.id)) {
    return NextResponse.json({ error: 'شناسه سریال نامعتبر است' }, { status: 400 });
  }

  try {
    if (redis) {
      try {
        const cached = await redis.get<any>(serieCacheKey(params.id));
        if (cached) {
          const parsed = typeof cached === 'string' ? JSON.parse(cached) : cached;
          if (parsed && parsed.id) return NextResponse.json(parsed);
        }
      } catch {
        // fall through
      }
    }

    try {
      const data = await fetchUpstreamJson<any>(
        `${apiUrl}/api/serie/${params.id}/${KEY}`,
        3600
      );
      if (data && !data.error && (data.id || Array.isArray(data))) {
        if (redis && data.id) {
          try {
            await redis.set(serieCacheKey(params.id), data as any, { ex: 7 * 24 * 3600 });
          } catch {
            // ignore cache write failures
          }
        }
        return NextResponse.json(data);
      }
    } catch (error) {
      const status = upstreamErrorStatus(error);
      if (status && status !== 404 && status !== 400) {
        return NextResponse.json(
          { error: 'خطا در دریافت اطلاعات' },
          { status }
        );
      }
    }

    const fromLists = await findInLists(params.id);
    if (fromLists) {
      if (redis) {
        try {
          await redis.set(serieCacheKey(params.id), fromLists as any, { ex: 7 * 24 * 3600 });
        } catch {
          // ignore
        }
      }
      return NextResponse.json(fromLists);
    }

    return NextResponse.json({ error: 'سریال یافت نشد' }, { status: 404 });
  } catch (error) {
    console.error('Error fetching serie:', error);
    return NextResponse.json({ error: 'خطا در دریافت اطلاعات' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!/^\d+$/.test(params.id)) {
    return NextResponse.json({ error: 'شناسه سریال نامعتبر است' }, { status: 400 });
  }
  if (!redis) {
    return NextResponse.json({ ok: false }, { status: 200 });
  }

  try {
    const body = await request.json();
    if (!body || String(body.id) !== params.id) {
      return NextResponse.json({ error: 'بدنه نامعتبر است' }, { status: 400 });
    }
    await redis.set(serieCacheKey(params.id), body as any, { ex: 7 * 24 * 3600 });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'ذخیره‌سازی ناموفق بود' }, { status: 500 });
  }
}
