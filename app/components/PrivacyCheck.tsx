'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

export default function PrivacyCheck() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Always allow access to privacy page
    if (pathname === '/privacy') return;

    try {
      const hasAccepted = localStorage.getItem('privacy-accepted') === 'true';
      // Only redirect to privacy page if user hasn't accepted and is not already on privacy page
      if (!hasAccepted) {
        router.push('/privacy');
      }
    } catch (error) {
      console.error('Error checking privacy acceptance:', error);
      router.push('/privacy');
    }
  }, [pathname, router]);

  return null;
} 