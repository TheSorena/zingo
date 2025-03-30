'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface ClientRedirectProps {
  type: 'movie' | 'serie';
  content: any;
}

export function ClientRedirect({ type, content }: ClientRedirectProps) {
  const router = useRouter();

  useEffect(() => {
    try {
      console.log('ClientRedirect: Saving content to localStorage', { type, contentId: content?.id });
      
      if (!content) {
        console.error('No content provided');
        router.push('/');
        return;
      }

      // Store the content in localStorage
      if (type === 'movie') {
        localStorage.setItem('selectedMovie', JSON.stringify(content));
        console.log('Stored movie in localStorage, redirecting to /movie');
        router.push('/movie');
      } else {
        localStorage.setItem('selectedSerie', JSON.stringify(content));
        console.log('Stored serie in localStorage, redirecting to /serie/' + content.id);
        router.push(`/serie/${content.id}`);
      }
    } catch (error) {
      console.error('Error in ClientRedirect:', error);
      router.push('/');
    }
  }, [type, content, router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-pulse text-lg">در حال انتقال...</div>
    </div>
  );
} 