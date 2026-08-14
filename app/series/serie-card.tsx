'use client';

import { Serie } from "../../types";
import Image from "next/image";
import { Star } from "lucide-react";
import { useRouter } from "next/navigation";

interface SerieCardProps {
  serie: Serie;
}

export function SerieCard({ serie }: SerieCardProps) {
  const router = useRouter();

  const handleSerieClick = () => {
    localStorage.setItem('selectedSerie', JSON.stringify(serie));
    router.push(`/serie/${serie.id}`);
  };

  return (
    <div
      className="group relative cursor-pointer"
      onClick={handleSerieClick}
    >
      <div className="aspect-[2/3] overflow-hidden rounded-2xl shadow-md ring-1 ring-border/60 transition-all duration-300 group-hover:shadow-xl group-hover:shadow-primary/10 group-hover:ring-primary/50">
        <div className="relative h-full w-full">
          <Image
            src={serie.image}
            alt={serie.title}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
            className="object-cover transition-transform duration-500 group-hover:scale-110"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
          {serie.imdb > 0 && (
            <div className="absolute bottom-2 left-2 flex items-center gap-1 rounded-full bg-primary px-2 py-1 text-xs font-bold text-primary-foreground shadow-lg">
              <Star className="h-3 w-3 fill-current" />
              <span>{serie.imdb}</span>
            </div>
          )}
          <div className="absolute top-2 right-2 rounded-full bg-black/60 px-2 py-1 text-xs text-white backdrop-blur-sm">
            سریال
          </div>
        </div>
      </div>
      <div className="mt-3 space-y-1">
        <h3 className="font-bold line-clamp-1 text-center transition-colors group-hover:text-primary">
          {serie.title}
        </h3>
        <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <span>{serie.year}</span>
          {serie.duration && (
            <>
              <span className="h-1 w-1 rounded-full bg-muted-foreground/50" />
              <span>{serie.duration}</span>
            </>
          )}
          {serie.country?.[0] && (
            <>
              <span className="h-1 w-1 rounded-full bg-muted-foreground/50" />
              <span>{serie.country[0].title}</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}