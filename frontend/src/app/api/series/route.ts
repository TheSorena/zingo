import { NextRequest, NextResponse } from 'next/server';

const API_BASE = process.env.API_BASE_URL || 'https://hostinnegar.com';
const API_KEY = process.env.HOSTINNEGAR_API_KEY || '4F5A9C3D9A86FA54EACEDDD635185';

function transformItem(item: any) {
  const genres = (item.genres || []).map((g: any) => ({
    genre: { id: g.id, name: g.title || g.name, slug: (g.title || g.name || '').toLowerCase().trim().replace(/[\s\W-]+/g, '-') || 'genre' }
  }));
  const countries = Array.isArray(item.country) ? item.country.map((c: any) => c.title || c).join(', ') : null;
  const downloadLinks: Record<string, string> = {};
  if (item.sources && Array.isArray(item.sources)) {
    for (const src of item.sources) {
      if (src.url) downloadLinks[src.quality || `server${src.id}`] = src.url;
    }
  }
  if (item.downloadas && typeof item.downloadas === 'string' && item.downloadas.startsWith('http')) {
    if (!downloadLinks.server1) downloadLinks.server1 = item.downloadas;
  }
  return {
    id: item.id, title: item.title || 'Untitled',
    slug: (item.title || `item-${item.id}`).toLowerCase().trim().replace(/[\s\W-]+/g, '-').replace(/^-+|-+$/g, '') || 'item',
    posterUrl: item.image || '', backdropUrl: item.cover || null,
    description: item.description || '', releaseYear: item.year || null,
    duration: item.duration ? parseInt(item.duration) : null, imdbRating: item.imdb || null,
    country: countries, cast: [], screenshots: item.cover ? [item.cover] : [],
    downloadLinks, source: 'hostinnegar', status: 'PUBLISHED', views: 0,
    genres, _count: { favorites: 0, comments: 0 },
    seasons: [], network: null,
  };
}

async function fetchFromApi(path: string): Promise<any[]> {
  try {
    const url = `${API_BASE}${path}${path.endsWith('/') ? '' : '/'}${API_KEY}/`;
    const res = await fetch(url, { headers: { Accept: 'application/json' }, next: { revalidate: 3600 } });
    if (!res.ok) return [];
    const data = await res.json();
    if (Array.isArray(data)) return data;
    if (data?.data && Array.isArray(data.data)) return data.data;
    const posters = Array.isArray(data.posters) ? data.posters : [];
    return posters;
  } catch { return []; }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = searchParams.get('page') || '0';
    const search = searchParams.get('search');
    const sort = searchParams.get('sort') || 'createdAt';

    let items: any[];
    if (search) {
      const res = await fetchFromApi(`/api/search/${encodeURIComponent(search)}`);
      items = res.filter((item: any) => item.type === 'serie' || item.type === 'serial');
    } else if (sort === 'rating' || sort === 'imdb') {
      items = await fetchFromApi(`/api/serie/by/filtres/0/imdb/${page}`);
    } else if (sort === 'views') {
      items = await fetchFromApi(`/api/serie/by/filtres/0/updated/${page}`);
    } else {
      items = await fetchFromApi(`/api/serie/by/filtres/0/created/${page}`);
    }

    const series = items.map(transformItem);
    return NextResponse.json({
      success: true,
      data: { series, pagination: { page: parseInt(page), limit: 30, total: series.length, totalPages: 999 } }
    });
  } catch (error) {
    console.error('Series proxy error:', error);
    return NextResponse.json({ success: false, message: 'خطا در دریافت سریال‌ها', data: { series: [] } }, { status: 500 });
  }
}
