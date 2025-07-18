'use client';

import { LoadingLink } from './loading-link';
import { Button } from './ui/button';
import { useLoading } from './loading-provider';

export function LoadingDemo() {
  const { setIsLoading } = useLoading();

  const handleManualLoading = () => {
    setIsLoading(true);
    // Simulate loading for 2 seconds
    setTimeout(() => {
      setIsLoading(false);
    }, 2000);
  };

  return (
    <div className="p-6 border rounded-lg bg-card">
      <h3 className="text-lg font-semibold mb-4">Loading System Demo</h3>
      <div className="space-y-4">
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            Click any navigation link to see the loading overlay:
          </p>
          <div className="flex flex-wrap gap-2">
            <LoadingLink href="/" className="inline-block">
              <Button variant="outline" size="sm">Home</Button>
            </LoadingLink>
            <LoadingLink href="/search" className="inline-block">
              <Button variant="outline" size="sm">Search</Button>
            </LoadingLink>
            <LoadingLink href="/favorites" className="inline-block">
              <Button variant="outline" size="sm">Favorites</Button>
            </LoadingLink>
            <LoadingLink href="/settings" className="inline-block">
              <Button variant="outline" size="sm">Settings</Button>
            </LoadingLink>
          </div>
        </div>
        
        <div className="border-t pt-4">
          <p className="text-sm text-muted-foreground mb-2">
            Or manually trigger loading:
          </p>
          <Button onClick={handleManualLoading} variant="default" size="sm">
            Show Loading (2s)
          </Button>
        </div>
      </div>
    </div>
  );
} 