import { MovieApiService } from '@/services/movieApi';
import { Movie } from '@/types/movie';
import { useCallback, useEffect, useState } from 'react';

export function useMovies() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [hasMorePages, setHasMorePages] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchMovies = useCallback(async (page: number, append: boolean = false) => {
    try {
      if (!append) {
        setLoading(true);
      }
      setError(null);

      const newMovies = await MovieApiService.getMovies(page);
      
      if (newMovies.length === 0) {
        setHasMorePages(false);
        return;
      }

      setMovies(prev => append ? [...prev, ...newMovies] : newMovies);
      setCurrentPage(page);
      
      // If we got fewer movies than expected, we might be at the end
      if (newMovies.length < 10) {
        setHasMorePages(false);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch movies');
      console.error('Error fetching movies:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const loadInitialMovies = useCallback(() => {
    setCurrentPage(0);
    setHasMorePages(true);
    fetchMovies(0, false);
  }, [fetchMovies]);

  const loadMoreMovies = useCallback(() => {
    if (!loading && hasMorePages) {
      fetchMovies(currentPage + 1, true);
    }
  }, [loading, hasMorePages, currentPage, fetchMovies]);

  const refreshMovies = useCallback(async () => {
    setRefreshing(true);
    setCurrentPage(0);
    setHasMorePages(true);
    await fetchMovies(0, false);
  }, [fetchMovies]);

  useEffect(() => {
    loadInitialMovies();
  }, []);

  return {
    movies,
    loading,
    error,
    refreshing,
    hasMorePages,
    loadMoreMovies,
    refreshMovies,
    retry: loadInitialMovies,
  };
} 