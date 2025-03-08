"use client";

import { Card, CardContent } from "@/components/ui/card";
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
  };
}

export function MovieCard({ movie }: MovieCardProps) {
  const router = useRouter();

  const handleClick = () => {
    localStorage.setItem("selectedMovie", JSON.stringify(movie));
    router.push("/movie");
  };

  return (
    <Card 
      className="group cursor-pointer overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-xl bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/50"
      onClick={handleClick}
    >
      <CardContent className="p-0 relative">
        <div className="aspect-[2/3] relative overflow-hidden">
          <Image
            src={movie.image}
            alt={movie.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-110"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-4 transform translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
          <h3 className="text-white font-bold mb-2 line-clamp-2">{movie.title}</h3>
          <div className="flex items-center gap-2 text-sm text-gray-200 mb-2">
            <span>{movie.year}</span>
            <span>•</span>
            <div className="flex items-center">
              <Star className="w-4 h-4 text-yellow-400 inline mr-1" />
              <span>{movie.imdb}</span>
            </div>
          </div>
          <div className="flex flex-wrap gap-1">
            {movie.genres.slice(0, 2).map((genre, index) => (
              <span 
                key={index}
                className="text-xs bg-white/20 text-white px-2 py-0.5 rounded-full backdrop-blur-sm"
              >
                {genre.title}
              </span>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}