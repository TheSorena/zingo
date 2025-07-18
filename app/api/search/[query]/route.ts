import { NextRequest, NextResponse } from 'next/server';
import { apiUrl } from '../../../../lib/config';

export async function GET(
  request: NextRequest,
  { params }: { params: { query: string } }
) {
  try {
    const { query } = params;
    
    if (!query) {
      return NextResponse.json({ error: 'Search query is required' }, { status: 400 });
    }

    const response = await fetch(
      `${apiUrl}/api/search/${encodeURIComponent(query)}/4F5A9C3D9A86FA54EACEDDD635185`,
      {
        headers: {
          'Accept': 'application/json'
        },
        next: { revalidate: 3600 }
      }
    );

    if (!response.ok) {
      throw new Error('خطا در دریافت نتایج جستجو از سرور');
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching search results:', error);
    return NextResponse.json(
      { error: 'خطا در دریافت نتایج جستجو از سرور' },
      { status: 500 }
    );
  }
} 