'use client';

import Image from "next/image";
import { useRouter } from "next/navigation";
import { Star } from "lucide-react";

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
      <div className="aspect-[2/3] overflow-hidden rounded-2xl shadow-md ring-1 ring-border/60 transition-all duration-300 group-hover:shadow-xl group-hover:shadow-primary/10 group-hover:ring-primary/50">
        <div className="relative h-full w-full">
          <Image
            src={movie.image}
            alt={movie.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-110"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
          {movie.imdb > 0 && (
            <div className="absolute bottom-2 left-2 flex items-center gap-1 rounded-full bg-primary px-2 py-1 text-xs font-bold text-primary-foreground shadow-lg">
              <Star className="h-3 w-3 fill-current" />
              <span>{movie.imdb}</span>
            </div>
          )}
          <div className="absolute top-2 right-2 rounded-full bg-black/60 px-2 py-1 text-xs text-white backdrop-blur-sm">
            فیلم
          </div>
        </div>
      </div>
      <div className="mt-3 space-y-1">
        <h3 className="font-bold line-clamp-1 text-center transition-colors group-hover:text-primary">
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