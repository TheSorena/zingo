import { redirect } from 'next/navigation';
import { apiUrl } from '../../lib/config';
import { decodeShareTitle } from '../../lib/utils';
import { fetchUpstreamJson } from '../../lib/upstream';
import { ClientRedirect } from './client-redirect';

interface BaseSearchResult {
  id: number;
  title: string;
  year: number;
  imdb: number;
  duration: string;
  image: string;
  description: string;
}

interface MovieSearchResult extends BaseSearchResult {
  type: 'movie';
  country: { id: number; title: string; image: string }[];
}

interface SerieSearchResult extends BaseSearchResult {
  type: 'serie';
  country: { id: number; title: string }[];
}

type SearchResult = MovieSearchResult | SerieSearchResult;

async function searchContent(title: string, targetId: string) {
  try {
    const searchQuery = decodeShareTitle(title);

    const data = await fetchUpstreamJson<any>(
      `${apiUrl}/api/search/${encodeURIComponent(searchQuery)}/4F5A9C3D9A86FA54EACEDDD635185`,
      3600
    );

    if (data && Array.isArray(data.posters) && data.posters.length > 0) {
      return data.posters.find((item: SearchResult) => item.id.toString() === targetId);
    }
    if (Array.isArray(data)) {
      return data.find((item: SearchResult) => item.id.toString() === targetId);
    }
    return null;
  } catch (error) {
    console.error('Share error:', error);
    return null;
  }
}

interface SharePageProps {
  searchParams: { 
    type?: string;
    id?: string;
    t?: string;
  }
}

export default async function SharePage({ searchParams }: SharePageProps) {
  const { type, id, t: encodedTitle } = searchParams;


  if (!type || !id || !encodedTitle) {
    redirect('/');
  }

  try {
    const contentType = type.toLowerCase();

    if (contentType !== 'movie' && contentType !== 'serie') {
      redirect('/');
    }

    const contentDetails = await searchContent(encodedTitle, id);
    
    if (contentDetails) {
      return (
        <ClientRedirect 
          type={contentType}
          content={contentDetails}
        />
      );
    }
  } catch (err) {
    console.error('Share error:', err);
  }

  redirect('/');
} 