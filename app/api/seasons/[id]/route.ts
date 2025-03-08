import { NextResponse } from 'next/server';
import { apiUrl } from '../../../../lib/config';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const response = await fetch(
      `${apiUrl}/api/season/by/serie/${params.id}/4F5A9C3D9A86FA54EACEDDD63518/`,
      { next: { revalidate: 3600 } }
    );

    if (!response.ok) {
      throw new Error("خطا در دریافت اطلاعات");
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching seasons:", error);
    return NextResponse.json([], { status: 500 });
  }
} 