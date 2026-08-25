import { NextResponse } from 'next/server';
import { apiUrl } from '../../../../lib/config';
import { fetchUpstreamJson } from '../../../../lib/upstream';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const data = await fetchUpstreamJson(
      `${apiUrl}/api/season/by/serie/${params.id}/4F5A9C3D9A86FA54EACEDDD63518/`,
      3600
    );
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching seasons:", error);
    return NextResponse.json([], { status: 500 });
  }
}