import { redirect } from 'next/navigation';
import { apiUrl } from '../../lib/config';
import { decodeShareTitle } from '../../lib/utils';
import { ClientRedirect } from './client-redirect';

interface SearchResult {
  id: number;
  title: string;
  type: string;
  year: number;
  imdb: number;
  duration: string;
  image: string;
  description: string;
  country: { id: number; title: string }[];
}

async function searchContent(title: string, targetId: string) {
  try {
    const searchQuery = decodeShareTitle(title);
    
    const response = await fetch(
      `${apiUrl}/api/search/${encodeURIComponent(searchQuery)}/4F5A9C3D9A86FA54EACEDDD635185`,
      { 
        cache: 'no-store'
      }
    );
    
    if (!response.ok) {
      return null;
    }
    
    const data = await response.json();
    
    if (data.posters && data.posters.length > 0) {
      return data.posters.find((item: SearchResult) => item.id.toString() === targetId);
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