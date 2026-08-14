'use client';

import { useEffect, useState, useImperativeHandle, forwardRef } from "react";
import { SerieCard } from "../app/series/serie-card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi
} from "./ui/carousel";
import { cn } from "@/lib/utils";
import { ChevronRight } from "lucide-react";
import Link from "next/link";

interface SerieSliderProps {
  title: string;
  series: any[];
  className?: string;
}

export interface SerieSliderRef {
  scrollToFirst: () => void;
}

export const SerieSlider = forwardRef<SerieSliderRef, SerieSliderProps>(
  ({ title, series, className }, ref) => {
    const [api, setApi] = useState<CarouselApi>();
    const [current, setCurrent] = useState(0);
    const [count, setCount] = useState(0);

    useImperativeHandle(ref, () => ({
      scrollToFirst: () => {
        if (api) {
          api.scrollTo(0);
        }
      },
    }));

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

  if (!series || series.length === 0) return null;

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex justify-between items-center">
        <h2 className="relative pr-4 text-lg sm:text-xl md:text-2xl font-bold line-clamp-2 before:absolute before:right-0 before:top-1/2 before:-translate-y-1/2 before:h-6 before:w-1.5 before:rounded-full before:bg-gradient-to-b before:from-amber-400 before:to-rose-500">{title}</h2>
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
            {series.map((serie) => (
              <CarouselItem key={serie.id} className="pr-1 basis-[calc(50%-16px)] sm:basis-[calc(33.333%-16px)] md:basis-[calc(25%-16px)] lg:basis-[calc(20%-16px)] xl:basis-[calc(16.666%-16px)]">
                <SerieCard serie={serie} />
              </CarouselItem>
            ))}
          </CarouselContent>
          <div className="absolute inset-y-0 left-0 w-16 z-10 bg-gradient-to-l from-transparent to-background/60 pointer-events-none" />
          <div className="absolute inset-y-0 right-0 w-16 z-10 bg-gradient-to-r from-transparent to-background/60 pointer-events-none" />
          {current > 0 && (
            <CarouselPrevious className="absolute left-2 w-10 h-10 rounded-full glass border-primary/25 text-amber-400 shadow-lg shadow-primary/10 hover:bg-primary hover:text-primary-foreground hover:border-primary z-20 transition-all duration-300 hover:scale-105" />
          )}
          {current < count - 1 && (
            <CarouselNext className="absolute right-2 w-10 h-10 rounded-full glass border-primary/25 text-amber-400 shadow-lg shadow-primary/10 hover:bg-primary hover:text-primary-foreground hover:border-primary z-20 transition-all duration-300 hover:scale-105" />
          )}
        </Carousel>
      </div>
    </div>
  );
});

SerieSlider.displayName = "SerieSlider"; 