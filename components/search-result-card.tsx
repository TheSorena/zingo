'use client';

import { Card } from "./ui/card";
import Image from "next/image";
import { Star } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Serie {
  id: number;
  title: string;
  type: string;
  description: string;
  year: number;
  rating: number;
  imdb: number;
  comment: boolean;
  duration: string;
  downloadas: string | null;
  classification: string | null;
  image: string;
  cover: string;
  genres: { id: number; title: string }[];
  country: { id: number; title: string }[];
}

interface SearchResultCardProps {
  result: {
    id: number;
    title: string;
    type: string;
    year: number;
    imdb: number;
    duration: string;
    image: string;
    description: string;
  };
}

export function SearchResultCard({ result }: SearchResultCardProps) {
  const router = useRouter();

  if (result.type === 'serie') {
    const handleSerieClick = () => {
      localStorage.setItem('selectedSerie', JSON.stringify(result));
      router.push(`/serie/${result.id}`);
    };

    return (
      <Card 
        className="group relative overflow-hidden border-0 bg-transparent cursor-pointer" 
        onClick={handleSerieClick}
      >
        <div className="aspect-[2/3] overflow-hidden rounded-lg shadow-md transition-shadow duration-300 group-hover:shadow-xl">
          <div className="relative h-full w-full">
            <Image
              src={result.image}
              alt={result.title}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
              className="object-cover transition-transform duration-300 group-hover:scale-110"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            {result.imdb > 0 && (
              <div className="absolute bottom-2 left-2 flex items-center gap-1 rounded-full bg-black/60 px-2 py-1 text-xs text-yellow-400 backdrop-blur-sm">
                <Star className="h-3 w-3 fill-current" />
                <span>{result.imdb}</span>
              </div>
            )}
            <div className="absolute top-2 right-2 px-2 py-1 rounded-full bg-black/60 text-xs text-white backdrop-blur-sm">
              سریال
            </div>
          </div>
        </div>
        <div className="mt-3 space-y-1">
          <h3 className="font-semibold line-clamp-1 group-hover:text-primary transition-colors">
            {result.title}
          </h3>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>{result.year}</span>
            {result.duration && (
              <>
                <span className="w-1 h-1 rounded-full bg-muted-foreground/50" />
                <span>{result.duration}</span>
              </>
            )}
          </div>
        </div>
      </Card>
    );
  }

  // For movies, keep the existing behavior
  const handleMovieClick = (e: React.MouseEvent) => {
    e.preventDefault();
    localStorage.setItem('selectedMovie', JSON.stringify(result));
    router.push('/movie');
  };

  return (
    <Card 
      className="group relative overflow-hidden border-0 bg-transparent cursor-pointer" 
      onClick={handleMovieClick}
    >
      <div className="aspect-[2/3] overflow-hidden rounded-lg shadow-md transition-shadow duration-300 group-hover:shadow-xl">
        <div className="relative h-full w-full">
          <Image
            src={result.image}
            alt={result.title}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
            className="object-cover transition-transform duration-300 group-hover:scale-110"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          {result.imdb > 0 && (
            <div className="absolute bottom-2 left-2 flex items-center gap-1 rounded-full bg-black/60 px-2 py-1 text-xs text-yellow-400 backdrop-blur-sm">
              <Star className="h-3 w-3 fill-current" />
              <span>{result.imdb}</span>
            </div>
          )}
          <div className="absolute top-2 right-2 px-2 py-1 rounded-full bg-black/60 text-xs text-white backdrop-blur-sm">
            فیلم
          </div>
        </div>
      </div>
      <div className="mt-3 space-y-1">
        <h3 className="font-semibold line-clamp-1 group-hover:text-primary transition-colors">
          {result.title}
        </h3>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>{result.year}</span>
          {result.duration && (
            <>
              <span className="w-1 h-1 rounded-full bg-muted-foreground/50" />
              <span>{result.duration}</span>
            </>
          )}
        </div>
      </div>
    </Card>
  );
} 