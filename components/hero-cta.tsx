'use client';

import { useRouter } from "next/navigation";
import { Play } from "lucide-react";

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
      className="group relative inline-flex items-center gap-2.5 overflow-hidden rounded-full bg-gradient-to-l from-amber-500 to-rose-500 px-7 py-3.5 text-sm font-bold text-white shadow-xl shadow-primary/30 transition-all duration-300 hover:scale-[1.04] hover:shadow-2xl hover:shadow-primary/40 active:scale-95"
    >
      <span className="absolute inset-0 overflow-hidden rounded-full">
        <span className="absolute inset-y-0 w-1/3 -left-1/3 bg-white/30 blur-md -skew-x-12 translate-x-0 transition-transform duration-700 group-hover:translate-x-[400%]" />
      </span>
      <Play className="h-4 w-4 fill-current" />
      مشاهده و دانلود
    </button>
  );
}