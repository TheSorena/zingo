'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

export default function PrivacyCheck() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Skip check if already on privacy page
    if (pathname === '/privacy') return;

    try {
      const hasAccepted = localStorage.getItem('privacy-accepted') === 'true';
      if (!hasAccepted) {
        router.replace('/privacy');
      }
    } catch (error) {
      console.error('Error checking privacy acceptance:', error);
      router.replace('/privacy');
    }
  }, [pathname, router]);

  return null;
} 