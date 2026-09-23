'use client';

import { createContext, useContext, useEffect, useRef, useState, ReactNode, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import { Toaster } from 'sonner';
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
  const [isLoading, setIsLoadingState] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pathname = usePathname();

  const clearTimer = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const forceCloseLoading = useCallback(() => {
    clearTimer();
    setIsLoadingState(false);
  }, [clearTimer]);

  const startLoading = useCallback(() => {
    clearTimer();
    setIsLoadingState(true);
    timeoutRef.current = setTimeout(() => {
      timeoutRef.current = null;
      setIsLoadingState(false);
    }, 4000);
  }, [clearTimer]);

  const enhancedSetIsLoading = useCallback(
    (loading: boolean) => {
      if (loading) {
        startLoading();
      } else {
        forceCloseLoading();
      }
    },
    [startLoading, forceCloseLoading]
  );

  useEffect(() => {
    forceCloseLoading();
  }, [pathname, forceCloseLoading]);

  useEffect(() => {
    const handlePopState = () => {
      startLoading();
    };
    const handleBeforeUnload = () => {
      forceCloseLoading();
    };
    const handleVisibilityChange = () => {
      if (document.hidden) forceCloseLoading();
    };

    window.addEventListener('popstate', handlePopState);
    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      clearTimer();
    };
  }, [startLoading, forceCloseLoading, clearTimer]);

  return (
    <LoadingContext.Provider value={{ isLoading, setIsLoading: enhancedSetIsLoading }}>
      {children}
      <LoadingOverlay isVisible={isLoading} />
      <Toaster richColors closeButton position="top-center" />
    </LoadingContext.Provider>
  );
}
