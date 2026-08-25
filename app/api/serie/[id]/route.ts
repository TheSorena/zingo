import { NextRequest, NextResponse } from 'next/server';
import { apiUrl } from '../../../../lib/config';
import { fetchUpstreamJson } from '../../../../lib/upstream';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const data = await fetchUpstreamJson(
      `${apiUrl}/api/serie/${params.id}/4F5A9C3D9A86FA54EACEDDD635185`,
      3600
    );
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching serie:', error);
    return NextResponse.json(
      { error: 'خطا در دریافت اطلاعات' },
      { status: 500 }
    );
  }
}