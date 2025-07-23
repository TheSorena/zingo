import { SeriesApiService } from '@/services/seriesApi';
import { Series } from '@/types/movie';
import { useCallback, useEffect, useState } from 'react';

export function useSeries() {
  const [series, setSeries] = useState<Series[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [hasMorePages, setHasMorePages] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchSeries = useCallback(async (page: number, append: boolean = false) => {
    try {
      if (!append) {
        setLoading(true);
      }
      setError(null);

      const newSeries = await SeriesApiService.getSeries(page);
      
      if (newSeries.length === 0) {
        setHasMorePages(false);
        return;
      }

      setSeries(prev => append ? [...prev, ...newSeries] : newSeries);
      setCurrentPage(page);
      
      // If we got fewer series than expected, we might be at the end
      if (newSeries.length < 10) {
        setHasMorePages(false);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch series');
      console.error('Error fetching series:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const loadInitialSeries = useCallback(() => {
    setCurrentPage(0);
    setHasMorePages(true);
    fetchSeries(0, false);
  }, [fetchSeries]);

  const loadMoreSeries = useCallback(() => {
    if (!loading && hasMorePages) {
      fetchSeries(currentPage + 1, true);
    }
  }, [loading, hasMorePages, currentPage, fetchSeries]);

  const refreshSeries = useCallback(async () => {
    setRefreshing(true);
    setCurrentPage(0);
    setHasMorePages(true);
    await fetchSeries(0, false);
  }, [fetchSeries]);

  const retry = useCallback(() => {
    loadInitialSeries();
  }, [loadInitialSeries]);

  useEffect(() => {
    loadInitialSeries();
  }, []);

  return {
    series,
    loading,
    error,
    refreshing,
    hasMorePages,
    loadMoreSeries,
    refreshSeries,
    retry,
  };
} 