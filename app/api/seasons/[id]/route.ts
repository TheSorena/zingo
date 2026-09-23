import { NextResponse } from 'next/server';
import { apiUrl } from '../../../../lib/config';
import { fetchUpstreamJson, upstreamErrorStatus } from '../../../../lib/upstream';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  if (!/^\d+$/.test(params.id)) {
    return NextResponse.json({ error: 'شناسه فصل نامعتبر است' }, { status: 400 });
  }
  try {
    const data = await fetchUpstreamJson(
      `${apiUrl}/api/season/by/serie/${params.id}/4F5A9C3D9A86FA54EACEDDD635185/`,
      3600
    );
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching seasons:', error);
    return NextResponse.json(
      { error: 'خطا در دریافت فصل‌ها' },
      { status: upstreamErrorStatus(error) ?? 500 }
    );
  }
}
