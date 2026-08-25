import { NextRequest, NextResponse } from 'next/server';
import { apiUrl } from '../../../../lib/config';
import { filterContent } from '../../../../lib/filter-content';
import { fetchUpstreamJson } from '../../../../lib/upstream';

export async function GET(
  request: NextRequest,
  { params }: { params: { query: string } }
) {
  try {
    const { query } = params;

    if (!query) {
      return NextResponse.json({ error: 'Search query is required' }, { status: 400 });
    }

    const data = await fetchUpstreamJson<any>(
      `${apiUrl}/api/search/${encodeURIComponent(query)}/4F5A9C3D9A86FA54EACEDDD635185`,
      3600
    );

    const posters = Array.isArray(data) ? data : (data.posters || []);
    return NextResponse.json({ ...data, posters: filterContent(posters) });
  } catch (error) {
    console.error('Error fetching search results:', error);
    return NextResponse.json(
      { error: 'خطا در دریافت نتایج جستجو از سرور' },
      { status: 500 }
    );
  }
}