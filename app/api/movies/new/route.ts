import { NextRequest, NextResponse } from 'next/server';
import { apiUrl } from '../../../../lib/config';
import { filterContent } from '../../../../lib/filter-content';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '0');
    const limit = parseInt(searchParams.get('limit') || '30');
    
    // If requesting a specific page, return just that page
    if (page > 0) {
      const response = await fetch(
        `${apiUrl}/api/movie/by/filtres/0/created/${page}/4F5A9C3D9A86FA54EACEDDD635185/`,
        {
          headers: {
            'Accept': 'application/json'
          },
          cache: 'no-store'
        }
      );

      if (!response.ok) {
        throw new Error('خطا در دریافت اطلاعات از سرور');
      }

      const data = await response.json();
      return NextResponse.json(filterContent(data));
    }

    // For the main page, fetch multiple pages to get 30 items
    const allMovies = [];
    let currentPage = 0;
    
    while (allMovies.length < limit) {
      const response = await fetch(
        `${apiUrl}/api/movie/by/filtres/0/created/${currentPage}/4F5A9C3D9A86FA54EACEDDD635185/`,
        {
          headers: {
            'Accept': 'application/json'
          },
          cache: 'no-store'
        }
      );

      if (!response.ok) {
        if (currentPage === 0) {
          throw new Error('خطا در دریافت اطلاعات از سرور');
        }
        break; // Stop if we can't fetch more pages
      }

      const pageData = await response.json();
      
      // Check if the response has the expected structure
      if (pageData && Array.isArray(pageData)) {
        allMovies.push(...filterContent(pageData));
      } else if (pageData && pageData.data && Array.isArray(pageData.data)) {
        allMovies.push(...filterContent(pageData.data));
      } else {
        break; // Stop if unexpected response structure
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