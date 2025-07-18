'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { LoadingOverlay } from './loading-overlay';

interface LoadingContextType {
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export const useLoading = () => {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error('useLoading must be used within a LoadingProvider');
  }
  return context;
};

interface LoadingProviderProps {
  children: ReactNode;
}

export function LoadingProvider({ children }: LoadingProviderProps) {
  const [isLoading, setIsLoading] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const handleStart = () => {
      // Add a small delay to prevent flickering on fast navigations
      timeoutId = setTimeout(() => {
        setIsLoading(true);
      }, 150);
    };

    const handleComplete = () => {
      clearTimeout(timeoutId);
      setIsLoading(false);
    };

    // Listen for navigation events
    const originalPush = router.push;
    const originalReplace = router.replace;

    router.push = (...args) => {
      handleStart();
      return originalPush.apply(router, args);
    };

    router.replace = (...args) => {
      handleStart();
      return originalReplace.apply(router, args);
    };

    // Handle browser back/forward
    const handlePopState = () => {
      handleStart();
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('popstate', handlePopState);
      router.push = originalPush;
      router.replace = originalReplace;
    };
  }, [router]);

  // Clear loading when pathname changes
  useEffect(() => {
    setIsLoading(false);
  }, [pathname]);

  return (
    <LoadingContext.Provider value={{ isLoading, setIsLoading }}>
      {children}
      <LoadingOverlay isVisible={isLoading} />
    </LoadingContext.Provider>
  );
} 