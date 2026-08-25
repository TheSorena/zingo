import { NextRequest, NextResponse } from 'next/server';
import { apiUrl } from '../../../../lib/config';
import { filterContent } from '../../../../lib/filter-content';
import { fetchUpstreamJson } from '../../../../lib/upstream';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '0');
    const limit = parseInt(searchParams.get('limit') || '30');
    
    // If requesting a specific page, return just that page
    if (page > 0) {
      const data = await fetchUpstreamJson(
        `${apiUrl}/api/poster/by/filtres/27/0/created/${page}/4F5A9C3D9A86FA54EACEDDD635185/`
      );
      return NextResponse.json(filterContent(data as any[]));
    }

    // For the main page, fetch multiple pages to get 30 items
    const allSeries = [];
    let currentPage = 0;
    
    while (allSeries.length < limit) {
      try {
        const pageData = await fetchUpstreamJson<any>(
          `${apiUrl}/api/poster/by/filtres/27/0/created/${currentPage}/4F5A9C3D9A86FA54EACEDDD635185/`
        );

        if (Array.isArray(pageData)) {
          allSeries.push(...filterContent(pageData));
        } else if (pageData && pageData.data && Array.isArray(pageData.data)) {
          allSeries.push(...filterContent(pageData.data));
        } else {
          break; // Stop if unexpected response structure
        }
      } catch (err) {
        if (currentPage === 0) {
          throw err;
        }
        break; // Stop if we can't fetch more pages
      }

      currentPage++;

      // Safety check to prevent infinite loops
      if (currentPage > 10) {
        break;
      }
    }

    // Return only the requested number of items
    const limitedSeries = allSeries.slice(0, limit);
    
    return NextResponse.json(limitedSeries);
  } catch (error) {
    console.error('Error fetching best series:', error);
    return NextResponse.json(
      { error: 'خطا در دریافت اطلاعات از سرور' },
      { status: 500 }
    );
  }
} 