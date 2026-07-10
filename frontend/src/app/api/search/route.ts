import { NextRequest, NextResponse } from 'next/server';

const API_BASE = process.env.API_BASE_URL || 'https://hostinnegar.com';
const API_KEY = process.env.HOSTINNEGAR_API_KEY || '4F5A9C3D9A86FA54EACEDDD635185';

function transformItem(item: any) {
  const genres = (item.genres || []).map((g: any) => ({
    genre: { id: g.id, name: g.title || g.name, slug: (g.title || g.name || '').toLowerCase().trim().replace(/\s+/g, '-') }
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
    type: item.type === 'serie' || item.type === 'serial' ? 'series' : 'movie',
  };
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    if (!query || query.trim().length === 0) {
      return NextResponse.json({ success: true, data: { movies: [], series: [], all: [] } });
    }

    const response = await fetch(
      `${API_BASE}/api/search/${encodeURIComponent(query.trim())}/${API_KEY}/`,
      {
        headers: { Accept: 'application/json' },
        next: { revalidate: 3600 },
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    const posters = Array.isArray(data.posters) ? data.posters : [];

    const all = posters.map(transformItem);
    const movies = all.filter((item: any) => item.type === 'movie');
    const series = all.filter((item: any) => item.type === 'series');

    return NextResponse.json({ success: true, data: { movies, series, all } });
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json(
      { success: false, message: 'خطا در جستجو', data: { movies: [], series: [], all: [] } },
      { status: 500 }
    );
  }
}
