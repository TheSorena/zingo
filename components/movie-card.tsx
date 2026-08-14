'use client';

import Image from "next/image";
import { useRouter } from "next/navigation";
import { Star, Play } from "lucide-react";

interface MovieCardProps {
  movie: {
    id: number;
    title: string;
    image: string;
    year: number;
    imdb: number;
    genres: { title: string }[];
    country: { id: number; title: string; image: string }[];
  };
}

export function MovieCard({ movie }: MovieCardProps) {
  const router = useRouter();

  const handleClick = () => {
    localStorage.setItem("selectedMovie", JSON.stringify(movie));
    router.push("/movie");
  };

  return (
    <div
      className="group relative cursor-pointer"
      onClick={handleClick}
    >
      <div className="aspect-[2/3] overflow-hidden rounded-2xl shadow-lg ring-1 ring-border/50 transition-all duration-300 group-hover:-translate-y-1.5 group-hover:shadow-2xl group-hover:shadow-primary/15 group-hover:ring-primary/40">
        <div className="relative h-full w-full">
          <Image
            src={movie.image}
            alt={movie.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-110"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/25 to-transparent" />

          {/* Play button on hover */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-all duration-300 group-hover:opacity-100">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/90 text-primary-foreground shadow-xl shadow-primary/40 backdrop-blur-sm transition-transform duration-300 group-hover:scale-110">
              <Play className="h-5 w-5 fill-current translate-x-[-1px]" />
            </span>
          </div>

          {movie.imdb > 0 && (
            <div className="absolute top-2.5 left-2.5 flex items-center gap-1 rounded-full bg-black/70 px-2.5 py-1 text-xs font-bold text-amber-300 ring-1 ring-amber-400/30 backdrop-blur-sm">
              <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
              <span>{movie.imdb}</span>
            </div>
          )}
          <div className="absolute top-2.5 right-2.5 rounded-full bg-black/60 px-2.5 py-1 text-xs font-medium text-white backdrop-blur-sm">
            فیلم
          </div>
        </div>
      </div>
      <div className="mt-3 space-y-1.5">
        <h3 className="font-bold line-clamp-1 text-center transition-colors duration-300 group-hover:text-amber-400">
          {movie.title}
        </h3>
        <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <span>{movie.year}</span>
          {movie.country?.[0] && (
            <>
              <span className="h-1 w-1 rounded-full bg-muted-foreground/50" />
              <span>{movie.country[0].title}</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}