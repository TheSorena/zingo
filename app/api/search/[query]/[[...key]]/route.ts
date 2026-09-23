import { NextRequest, NextResponse } from 'next/server';
import { apiUrl } from '../../../../../lib/config';
import { filterContent } from '../../../../../lib/filter-content';
import { fetchUpstreamJson, upstreamErrorStatus } from '../../../../../lib/upstream';

const KEY = '4F5A9C3D9A86FA54EACEDDD635185';

export async function GET(
  request: NextRequest,
  { params }: { params: { query: string; key?: string[] } }
) {
  try {
    const query = params.query;
    if (!query) {
      return NextResponse.json({ error: 'Search query is required' }, { status: 400 });
    }
    const key = params.key?.length ? params.key.join('/') : KEY;

    const data = await fetchUpstreamJson<any>(
      `${apiUrl}/api/search/${encodeURIComponent(query)}/${key}`,
      3600
    );

    const posters = Array.isArray(data) ? data : data?.posters || [];
    return NextResponse.json({ ...data, posters: filterContent(posters) });
  } catch (error) {
    console.error('Error fetching search results:', error);
    return NextResponse.json(
      { error: 'خطا در دریافت نتایج جستجو از سرور' },
      { status: upstreamErrorStatus(error) ?? 500 }
    );
  }
}
