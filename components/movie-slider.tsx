'use client';

import { useEffect, useState } from "react";
import { MovieCard } from "./movie-card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi
} from "./ui/carousel";
import { cn } from "@/lib/utils";
import { SearchResultCard } from "./search-result-card";
import { ChevronRight } from "lucide-react";
import Link from "next/link";

interface MovieSliderProps {
  title: string;
  movies: any[];
  className?: string;
}

export function MovieSlider({ title, movies, className }: MovieSliderProps) {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!api) return;

    setCount(api.scrollSnapList().length);
    
    const onSelect = () => {
      setCurrent(api.selectedScrollSnap());
    };
    
    api.on("select", onSelect);
    
    // Initialize
    onSelect();
    
    return () => {
      api.off("select", onSelect);
    };
  }, [api]);

  if (!movies || movies.length === 0) return null;

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex justify-between items-center">
        <h2 className="text-xl md:text-2xl font-semibold">{title}</h2>
      </div>
      
      <div className="relative px-4">
        <Carousel
          opts={{
            align: "start",
            loop: false,
            dragFree: true,
            direction: "rtl",
          }}
          className="w-full"
          setApi={setApi}
        >
          <CarouselContent>
            {movies.map((movie) => (
              <CarouselItem key={movie.id} className="pr-1 basis-[calc(50%-16px)] sm:basis-[calc(33.333%-16px)] md:basis-[calc(25%-16px)] lg:basis-[calc(20%-16px)] xl:basis-[calc(16.666%-16px)]">
                <div className="overflow-hidden rounded-lg transition-all duration-200 hover:scale-[1.02] hover:shadow-lg">
                  {/* <MovieCard movie={movie} /> */}
                  <SearchResultCard key={movie.id} result={movie} />
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <div className="absolute inset-y-0 left-0 w-16 z-10" />
          <div className="absolute inset-y-0 right-0 w-16 z-10" />
          {current > 0 && (
            <CarouselPrevious className="absolute left-2 w-9 bg-background/90 hover:bg-background border-primary/20 z-20" />
          )}
          {current < count - 1 && (
            <CarouselNext className="absolute right-2 w-9 bg-background/90 hover:bg-background border-primary/20 z-20" />
          )}
        </Carousel>
      </div>
    </div>
  );
} 