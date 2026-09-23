"use client";

import { useEffect, useState } from "react";
import { MobileNav } from "../../components/mobile-nav";
import Image from "next/image";
import { Button } from "../../components/ui/button";
import { Star, Clock, Calendar, Globe2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { ShareButton } from "../../components/share-button";
import { FavoriteButton } from "../../components/favorite-button";
import { CommentSection } from "../../components/comment-section";
import { OnlinePlayer } from "../../components/online-player";
import { SourceRow } from "../../components/source-row";

interface MovieDetails {
  id: number;
  title: string;
  description: string;
  year: number;
  imdb: number;
  duration: string;
  image: string;
  cover: string;
  type: string;
  genres: Array<{ id: number; title: string }>;
  sources: Array<{ id: number; quality: string; type: string; url: string }>;
  country: Array<{ id: number; title: string; image: string }>;
  trailer_url?: string;
}

export default function MoviePage() {
  const [movie, setMovie] = useState<MovieDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    try {
      const movieData = localStorage.getItem("selectedMovie");
      if (movieData) {
        const parsedMovie = JSON.parse(movieData);
        const trailerSource = parsedMovie.sources?.find(
          (source: { quality?: string }) => !source.quality || source.quality.includes("تیزر")
        );
        if (trailerSource) {
          parsedMovie.trailer_url = trailerSource.url;
        }
        setMovie(parsedMovie);
      }
    } catch {
      setMovie(null);
    }
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="relative h-16 w-16">
            <div className="absolute inset-0 rounded-full bg-gradient-to-l from-amber-400 via-orange-500 to-rose-500 opacity-25 blur-md animate-pulse" />
            <img
              src="/zingo-logo.png"
              alt="زینگو"
              className="h-full w-full rounded-full object-cover ring-1 ring-primary/30 animate-pulse"
            />
          </div>
          <p className="text-sm text-muted-foreground animate-pulse">در حال بارگذاری...</p>
        </div>
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-4">فیلم یافت نشد</h2>
          <p className="text-muted-foreground mb-6">
            لطفاً از صفحه اصلی یک فیلم را انتخاب کنید
          </p>
          <Button onClick={() => router.push("/")}>بازگشت به صفحه اصلی</Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <main className="min-h-screen pb-20 md:pb-0 bg-background">
        <div className="relative">
          {/* Back Button */}
          <button
            onClick={() => {
              if (window.history.length > 1) {
                router.back();
              } else {
                router.push('/');
              }
            }}
            className="fixed top-4 right-4 z-50 glass p-2 rounded-full ring-1 ring-border/60 hover:bg-background/90 transition-all duration-300 hover:scale-110"
          >
            <svg
              className="w-6 h-6 rotate-180"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>

          {/* Share Button */}
          <div className="fixed top-4 left-4 z-50">
            {movie && (
              <ShareButton
                title={movie.title}
                type="movie"
                id={movie.id}
              />
            )}
          </div>

          {/* Hero Section */}
          <div className="relative h-[55vh] md:h-[65vh] w-full overflow-hidden">
            <Image
              src={movie.cover || movie.image}
              alt={movie.title}
              fill
              className="object-cover"
              priority
              sizes="100vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-background/10" />
            <div className="absolute inset-0 bg-gradient-to-l from-transparent via-transparent to-background/60 hidden md:block" />
            
            {/* Movie Info Overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10">
              <div className="flex items-start gap-4 md:gap-6">
                {/* Movie Poster */}
                <div className="w-28 h-40 md:w-36 md:h-52 rounded-2xl overflow-hidden flex-shrink-0 shadow-2xl shadow-black/50 ring-1 ring-border/60 relative">
                  <Image
                    src={movie.image}
                    alt={movie.title}
                    fill
                    className="object-cover"
                  />
                  {/* Favorite Button */}
                  <div className="absolute top-1 left-1">
                    <FavoriteButton 
                      item={movie}
                      variant="ghost"
                      size="icon"
                      className="bg-black/50 rounded-full hover:bg-black/70 w-8 h-8 p-0 backdrop-blur-sm"
                    />
                  </div>
                </div>
                <div className="flex-1">
                  <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight drop-shadow-lg">
                    <span className="text-gradient-warm">{movie.title}</span>
                  </h1>
                  
                  <div className="flex flex-wrap items-center gap-3 text-foreground/90 dark:text-white/80 mt-3">
                    <div className="flex items-center gap-1.5 rounded-full bg-amber-400 px-3 py-1 text-amber-950 shadow-lg shadow-amber-400/30">
                      <Star className="w-3.5 h-3.5 fill-current" />
                      <span className="text-sm font-extrabold">{movie.imdb}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-amber-400" />
                      <span className="text-sm">{movie.year}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-amber-400" />
                      <span className="text-sm">{movie.duration}</span>
                    </div>
                  </div>

                  {movie.country && movie.country.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {movie.country.map((country) => (
                        <span
                          key={country.id}
                          className="glass text-foreground dark:text-white px-2.5 py-0.5 rounded-full text-xs flex items-center gap-1 ring-1 ring-border/50"
                        >
                          <Globe2 className="w-3 h-3" />
                          {country.title}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {movie.genres.map((genre) => (
                      <span
                        key={genre.id}
                        className="glass text-foreground dark:text-white px-2.5 py-0.5 rounded-full text-xs ring-1 ring-border/50"
                      >
                        {genre.title}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Content Section */}
          <div className="container max-w-6xl mx-auto px-4 py-6">
            {/* Online Player */}
            {movie.sources && movie.sources.length > 0 && (
              <div className="mb-8">
                <OnlinePlayer
                  title={movie.title}
                  poster={movie.image}
                  sources={movie.sources}
                  storageKey={`movie-${movie.id}`}
                />
              </div>
            )}

            {/* Download Box */}
            {movie.sources && movie.sources.length > 0 && (
              <div className="glass rounded-3xl border border-border/60 p-4 md:p-5 mb-8 relative overflow-hidden">
                <div className="absolute -top-10 -left-10 h-32 w-32 rounded-full bg-primary/10 blur-2xl pointer-events-none" />
                <div className="flex items-center justify-between mb-4">
                  <h2 className="relative pr-4 text-xl font-bold text-foreground before:absolute before:right-0 before:top-1/2 before:-translate-y-1/2 before:h-5 before:w-1.5 before:rounded-full before:bg-gradient-to-b before:from-amber-400 before:to-rose-500">
                    باکس دانلود
                  </h2>
                  <span className="text-[11px] font-bold bg-secondary/60 ring-1 ring-border/50 rounded-full px-2.5 py-1 text-muted-foreground">
                    {movie.sources.length} کیفیت
                  </span>
                </div>
                <div className="grid gap-2">
                  {movie.sources.map((source) => (
                    <SourceRow key={source.id} source={source} />
                  ))}
                </div>
              </div>
            )}

            {/* Description */}
            <div className="glass p-5 md:p-6 rounded-3xl border border-border/60 relative overflow-hidden">
              <div className="absolute -top-10 -left-10 h-32 w-32 rounded-full bg-primary/10 blur-2xl pointer-events-none" />
              <h2 className="relative pr-4 text-xl font-bold mb-3 text-foreground before:absolute before:right-0 before:top-1/2 before:-translate-y-1/2 before:h-5 before:w-1.5 before:rounded-full before:bg-gradient-to-b before:from-amber-400 before:to-rose-500">
                درباره فیلم
              </h2>
              <div className="prose prose-invert max-w-none">
                <p className="text-sm text-muted-foreground dark:text-muted-foreground whitespace-pre-line leading-relaxed">
                  {movie.description}
                </p>
              </div>
            </div>

            <CommentSection type="movie" targetId={movie.id} />
          </div>
        </div>
      </main>

      <MobileNav />
    </>
  );
}
