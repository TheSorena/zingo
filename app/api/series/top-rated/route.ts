import { NextRequest, NextResponse } from 'next/server';
import { apiUrl } from '../../../../lib/config';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '0');
    const limit = parseInt(searchParams.get('limit') || '30');
    
    // If requesting a specific page, return just that page
    if (page > 0) {
      const response = await fetch(
        `${apiUrl}/api/poster/by/filtres/27/0/imdb/${page}/4F5A9C3D9A86FA54EACEDDD635185/`,
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
      return NextResponse.json(data);
    }

    // For the main page, fetch multiple pages to get 30 items
    const allSeries = [];
    let currentPage = 0;
    
    while (allSeries.length < limit) {
      const response = await fetch(
        `${apiUrl}/api/poster/by/filtres/27/0/imdb/${currentPage}/4F5A9C3D9A86FA54EACEDDD635185/`,
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
        allSeries.push(...pageData);
      } else if (pageData && pageData.data && Array.isArray(pageData.data)) {
        allSeries.push(...pageData.data);
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
    const limitedSeries = allSeries.slice(0, limit);
    
    return NextResponse.json(limitedSeries);
  } catch (error) {
    console.error('Error fetching top-rated series:', error);
    return NextResponse.json(
      { error: 'خطا در دریافت اطلاعات از سرور' },
      { status: 500 }
    );
  }
} 