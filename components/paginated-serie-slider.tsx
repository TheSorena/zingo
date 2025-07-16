'use client';

import { useState, useEffect } from "react";
import { SerieSlider } from "./serie-slider";
import { Button } from "./ui/button";
import { ChevronLeft, ChevronRight, Loader2, MoreHorizontal } from "lucide-react";

interface PaginatedSerieSliderProps {
  title: string;
  initialSeries: any[];
  apiEndpoint: string;
  className?: string;
}

export function PaginatedSerieSlider({ 
  title, 
  initialSeries, 
  apiEndpoint, 
  className 
}: PaginatedSerieSliderProps) {
  const [series, setSeries] = useState(initialSeries);
  const [currentPage, setCurrentPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasNextPage, setHasNextPage] = useState(true);
  const [maxPageReached, setMaxPageReached] = useState(0);

  const fetchPage = async (page: number) => {
    if (page === 0) {
      setSeries(initialSeries);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${apiEndpoint}?page=${page}`);
      if (!response.ok) {
        throw new Error('Failed to fetch data');
      }
      const data = await response.json();
      
      if (data && data.length > 0) {
        setSeries(data);
        setMaxPageReached(Math.max(maxPageReached, page));
        setHasNextPage(data.length === 30); // Assume full page means more pages exist
      } else {
        setHasNextPage(false);
      }
    } catch (error) {
      console.error('Error fetching page:', error);
      setHasNextPage(false);
    } finally {
      setLoading(false);
    }
  };

  const goToNextPage = () => {
    if (!loading && hasNextPage) {
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);
      fetchPage(nextPage);
    }
  };

  const goToPrevPage = () => {
    if (!loading && currentPage > 0) {
      const prevPage = currentPage - 1;
      setCurrentPage(prevPage);
      fetchPage(prevPage);
    }
  };

  const goToPage = (page: number) => {
    if (!loading && page >= 0 && page !== currentPage) {
      setCurrentPage(page);
      fetchPage(page);
    }
  };

  // Generate smart pagination numbers
  const generatePageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    const totalKnownPages = Math.max(maxPageReached + 1, currentPage + 1);
    
    if (totalKnownPages <= maxVisiblePages) {
      // Show all pages if we have few pages
      for (let i = 0; i < totalKnownPages; i++) {
        pages.push(i);
      }
      // Add potential next page if we think there are more
      if (hasNextPage && currentPage === totalKnownPages - 1) {
        pages.push(totalKnownPages);
      }
    } else {
      // More complex pagination logic
      pages.push(0); // Always show first page
      
      if (currentPage > 2) {
        pages.push(-1); // Ellipsis indicator
      }
      
      // Show pages around current page
      const start = Math.max(1, currentPage - 1);
      const end = Math.min(totalKnownPages - 1, currentPage + 1);
      
      for (let i = start; i <= end; i++) {
        if (i !== 0 && i !== totalKnownPages - 1) {
          pages.push(i);
        }
      }
      
      if (currentPage < totalKnownPages - 3) {
        pages.push(-1); // Ellipsis indicator
      }
      
      if (totalKnownPages > 1) {
        pages.push(totalKnownPages - 1); // Always show last known page
      }
      
      // Add potential next page if we think there are more
      if (hasNextPage && currentPage === totalKnownPages - 1) {
        pages.push(totalKnownPages);
      }
    }
    
    return pages;
  };

  const pageNumbers = generatePageNumbers();

  return (
    <div className={className}>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 gap-3">
        <h2 className="text-lg sm:text-xl md:text-2xl font-semibold line-clamp-2">{title}</h2>
        
        <div className="flex items-center gap-1 self-start sm:self-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={goToPrevPage}
            disabled={loading || currentPage === 0}
            className="h-9 w-9 p-0 hover:bg-primary/10 transition-colors"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          
          <div className="flex items-center gap-1 mx-2">
            {pageNumbers.map((page, index) => (
              <div key={index}>
                {page === -1 ? (
                  <div className="flex items-center justify-center h-9 w-9">
                    <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                  </div>
                ) : (
                  <Button
                    variant={currentPage === page ? "default" : "outline"}
                    size="sm"
                    onClick={() => goToPage(page)}
                    disabled={loading}
                    className={`h-9 w-9 p-0 text-sm font-medium transition-all duration-200 ${
                      currentPage === page
                        ? "bg-primary text-primary-foreground shadow-md"
                        : "hover:bg-primary/10 hover:border-primary/20"
                    }`}
                  >
                    {page + 1}
                  </Button>
                )}
              </div>
            ))}
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={goToNextPage}
            disabled={loading || !hasNextPage}
            className="h-9 w-9 p-0 hover:bg-primary/10 transition-colors"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
      
      <SerieSlider title="" series={series} />
      
      {loading && (
        <div className="flex justify-center items-center py-8">
          <div className="flex items-center gap-2 bg-background/80 backdrop-blur-sm rounded-lg px-4 py-2 shadow-lg">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
            <span className="text-sm font-medium">در حال بارگیری...</span>
          </div>
        </div>
      )}
    </div>
  );
} 