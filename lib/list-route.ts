import { NextRequest, NextResponse } from 'next/server';
import { filterContent } from './filter-content';
import { fetchUpstreamJson } from './upstream';

function normalizeItems(data: unknown): any[] {
  if (Array.isArray(data)) return data;
  if (data && typeof data === 'object' && Array.isArray((data as any).data)) {
    return (data as any).data;
  }
  return [];
}

/**
 * Shared handler for the six homepage list endpoints.
 * - `page > 0`: one upstream page, normalized + filtered.
 * - `page = 0`: batched parallel upstream fetches until `limit` filtered
 *   items are collected (bounded to upstream pages 0..10).
 */
export async function handleListRoute(
  request: NextRequest,
  pageUrl: (page: number) => string,
  errorLabel: string
): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const pageParsed = Number.parseInt(searchParams.get('page') ?? '0', 10);
    const limitParsed = Number.parseInt(searchParams.get('limit') ?? '30', 10);
    const page = Number.isFinite(pageParsed) && pageParsed >= 0 ? pageParsed : 0;
    const limit =
      Number.isFinite(limitParsed) && limitParsed > 0 && limitParsed <= 100
        ? limitParsed
        : 30;

    if (page > 0) {
      const data = await fetchUpstreamJson(pageUrl(page));
      return NextResponse.json(filterContent(normalizeItems(data)));
    }

    const collected: any[] = [];
    let batchStart = 0;
    const BATCH = 4;
    const MAX_PAGE = 10;

    while (collected.length < limit && batchStart <= MAX_PAGE) {
      const batch: number[] = [];
      for (let p = batchStart; p < batchStart + BATCH && p <= MAX_PAGE; p++) {
        batch.push(p);
      }

      const results = await Promise.all(
        batch.map((p) =>
          fetchUpstreamJson(pageUrl(p))
            .then(normalizeItems)
            .catch((err) => {
              if (p === 0) throw err;
              return null;
            })
        )
      );

      for (const items of results) {
        if (items) collected.push(...filterContent(items));
      }
      if (results.every((r) => r === null)) break;
      batchStart = batch[batch.length - 1] + 1;
    }

    return NextResponse.json(collected.slice(0, limit));
  } catch (error) {
    console.error(errorLabel, error);
    return NextResponse.json(
      { error: 'خطا در دریافت اطلاعات از سرور' },
      { status: 500 }
    );
  }
}
