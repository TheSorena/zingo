'use client';

import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
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
  const [loadingTimeout, setLoadingTimeout] = useState<NodeJS.Timeout | null>(null);
  const pathname = usePathname();
  const router = useRouter();

  // Force close loading with cleanup
  const forceCloseLoading = useCallback(() => {
    setIsLoading(false);
    if (loadingTimeout) {
      clearTimeout(loadingTimeout);
      setLoadingTimeout(null);
    }
  }, [loadingTimeout]);

  // Start loading with safety timeout
  const startLoading = useCallback(() => {
    // Clear any existing timeout
    if (loadingTimeout) {
      clearTimeout(loadingTimeout);
    }

    setIsLoading(true);
    
    // Safety timeout to prevent stuck loading (5 seconds max)
    const timeout = setTimeout(() => {
      console.warn('Loading timeout reached, forcing close');
      forceCloseLoading();
    }, 5000);
    
    setLoadingTimeout(timeout);
  }, [loadingTimeout, forceCloseLoading]);

  // Enhanced setIsLoading with timeout management
  const enhancedSetIsLoading = useCallback((loading: boolean) => {
    if (loading) {
      startLoading();
    } else {
      forceCloseLoading();
    }
  }, [startLoading, forceCloseLoading]);

  // Handle pathname changes - always close loading
  useEffect(() => {
    forceCloseLoading();
  }, [pathname, forceCloseLoading]);

  // Enhanced router method override
  useEffect(() => {
    const originalPush = router.push;
    const originalReplace = router.replace;
    const originalBack = router.back;
    const originalForward = router.forward;

    // Override push method
    router.push = (href, options) => {
      // Only show loading if navigating to a different page
      const currentPath = window.location.pathname;
      const targetPath = typeof href === 'string' ? href : String(href);
      
      if (currentPath !== targetPath && targetPath) {
        startLoading();
      }
      
      return originalPush.call(router, href, options);
    };

    // Override replace method
    router.replace = (href, options) => {
      const currentPath = window.location.pathname;
      const targetPath = typeof href === 'string' ? href : String(href);
      
      if (currentPath !== targetPath && targetPath) {
        startLoading();
      }
      
      return originalReplace.call(router, href, options);
    };

    // Override back method
    router.back = () => {
      startLoading();
      return originalBack.call(router);
    };

    // Override forward method
    router.forward = () => {
      startLoading();
      return originalForward.call(router);
    };

    // Handle browser navigation events
    const handlePopState = () => {
      startLoading();
    };

    const handleBeforeUnload = () => {
      forceCloseLoading();
    };

    // Handle visibility change (tab switching)
    const handleVisibilityChange = () => {
      if (document.hidden) {
        forceCloseLoading();
      }
    };

    // Handle page focus/blur
    const handleFocus = () => {
      // Small delay to ensure page is fully loaded
      setTimeout(() => {
        forceCloseLoading();
      }, 100);
    };

    // Add event listeners
    window.addEventListener('popstate', handlePopState);
    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Cleanup function
    return () => {
      // Restore original methods
      router.push = originalPush;
      router.replace = originalReplace;
      router.back = originalBack;
      router.forward = originalForward;

      // Remove event listeners
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);

      // Clear any pending timeout
      if (loadingTimeout) {
        clearTimeout(loadingTimeout);
      }
    };
  }, [router, startLoading, forceCloseLoading, loadingTimeout]);

  // Handle page load complete
  useEffect(() => {
    // Ensure loading is closed when component mounts
    const handleLoad = () => {
      setTimeout(() => {
        forceCloseLoading();
      }, 100);
    };

    if (document.readyState === 'complete') {
      handleLoad();
    } else {
      window.addEventListener('load', handleLoad);
      return () => window.removeEventListener('load', handleLoad);
    }
  }, [forceCloseLoading]);

  // Emergency cleanup on unmount
  useEffect(() => {
    return () => {
      if (loadingTimeout) {
        clearTimeout(loadingTimeout);
      }
    };
  }, [loadingTimeout]);

  return (
    <LoadingContext.Provider value={{ isLoading, setIsLoading: enhancedSetIsLoading }}>
      {children}
      <LoadingOverlay isVisible={isLoading} />
    </LoadingContext.Provider>
  );
} 
