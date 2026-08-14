'use client';

import { useRouter } from "next/navigation";
import { Play, Download } from "lucide-react";

interface HeroCtaProps {
  movie: {
    id: number;
    title: string;
    type: string;
    year: number;
    imdb: number;
    duration: string;
    image: string;
    description: string;
    country: { id: number; title: string }[];
    genres?: { id: number; title: string }[];
    sources?: { id: number; quality: string; type: string; url: string }[];
    cover?: string;
  };
}

export function HeroCta({ movie }: HeroCtaProps) {
  const router = useRouter();

  const handleClick = () => {
    localStorage.setItem(
      movie.type === 'serie' ? 'selectedSerie' : 'selectedMovie',
      JSON.stringify(movie)
    );
    router.push(movie.type === 'serie' ? `/serie/${movie.id}` : '/movie');
  };

  return (
    <button
      onClick={handleClick}
      className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/30 transition-all duration-300 hover:scale-105 hover:bg-accent hover:shadow-accent/30"
    >
      <Play className="h-4 w-4 fill-current" />
      مشاهده و دانلود
    </button>
  );
}