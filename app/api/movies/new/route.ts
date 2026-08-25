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
        `${apiUrl}/api/movie/by/filtres/0/created/${page}/4F5A9C3D9A86FA54EACEDDD635185/`
      );
      return NextResponse.json(filterContent(data as any[]));
    }

    // For the main page, fetch multiple pages to get 30 items
    const allMovies = [];
    let currentPage = 0;

    while (allMovies.length < limit) {
      try {
        const pageData = await fetchUpstreamJson<any>(
          `${apiUrl}/api/movie/by/filtres/0/created/${currentPage}/4F5A9C3D9A86FA54EACEDDD635185/`
        );

        if (Array.isArray(pageData)) {
          allMovies.push(...filterContent(pageData));
        } else if (pageData && pageData.data && Array.isArray(pageData.data)) {
          allMovies.push(...filterContent(pageData.data));
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
    const limitedMovies = allMovies.slice(0, limit);
    
    return NextResponse.json(limitedMovies);
  } catch (error) {
    console.error('Error fetching new movies:', error);
    return NextResponse.json(
      { error: 'خطا در دریافت اطلاعات از سرور' },
      { status: 500 }
    );
  }
} 