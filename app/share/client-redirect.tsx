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
      if (!content) {
        router.push('/');
        return;
      }

      // Store the content in localStorage
      if (type === 'movie') {
        localStorage.setItem('selectedMovie', JSON.stringify(content));
        router.push('/movie');
      } else {
        localStorage.setItem('selectedSerie', JSON.stringify(content));
        fetch(`/api/serie/${content.id}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(content),
          keepalive: true,
        }).catch(() => {});
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