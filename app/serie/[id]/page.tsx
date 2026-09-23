'use client';

import { Serie, SerieSeason } from "../../../types";
import { Star, Calendar, Clock, Globe2 } from "lucide-react";
import Image from "next/image";
import { Button } from "../../../components/ui/button";
import { WatchButton } from "../../../components/watch-button";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../components/ui/tabs";
import { ShareButton } from "../../../components/share-button";
import { FavoriteButton } from "../../../components/favorite-button";
import { CommentSection } from "../../../components/comment-section";
import { SeasonEpisodes } from "../../../components/season-episodes";

async function getSerieSeasons(id: string) {
  try {
    const response = await fetch(`/api/seasons/${id}`);
    if (!response.ok) return [];
    return response.json();
  } catch (error) {
    console.error("Error fetching seasons:", error);
    return [];
  }
}

async function getSerieById(id: string) {
  try {
    const response = await fetch(`/api/serie/${id}`);
    if (!response.ok) return null;
    return response.json();
  } catch (error) {
    console.error("Error fetching serie:", error);
    return null;
  }
}

export default function SerieDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const [serie, setSerie] = useState<Serie | null>(null);
  const [seasons, setSeasons] = useState<SerieSeason[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        let serieData: any = null;

        try {
          const storedSerie = localStorage.getItem('selectedSerie');
          if (storedSerie) {
            const parsed = JSON.parse(storedSerie);
            if (parsed && String(parsed.id) === params.id) {
              serieData = parsed;
            }
          }
        } catch {
          // ignore corrupted localStorage
        }

        if (!serieData) {
          serieData = await getSerieById(params.id);
        }

        if (!serieData || serieData.error) {
          setError('سریال یافت نشد');
          return;
        }

        setSerie(serieData);
        const seasonsData = await getSerieSeasons(params.id);
        setSeasons(Array.isArray(seasonsData) ? seasonsData : []);
      } catch (err) {
        setError('خطا در دریافت اطلاعات');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="relative h-16 w-16">
            <div className="absolute inset-0 rounded-full bg-gradient-to-l from-amber-400 via-orange-500 to-rose-500 opacity-25 blur-md animate-pulse" />
            <span
              dir="ltr"
              className="flex h-full w-full items-center justify-center rounded-full bg-gradient-to-br from-amber-500 to-rose-500 text-3xl font-extrabold text-white ring-1 ring-primary/30 animate-pulse"
              style={{ fontFamily: "'Segoe UI', Tahoma, sans-serif" }}
            >
              z
            </span>
          </div>
          <p className="text-sm text-muted-foreground animate-pulse">در حال بارگذاری...</p>
        </div>
      </div>
    );
  }

  if (error || !serie) {
    return (
      <div className="min-h-screen flex items-center justify-center flex-col gap-4">
        <div className="text-lg text-red-500">{error}</div>
        <Button onClick={() => router.push('/')}>
          بازگشت به صفحه اصلی
        </Button>
      </div>
    );
  }

  return (
    <main className="min-h-screen pb-20 md:pb-0">
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
        {serie && (
          <ShareButton
            title={serie.title}
            type="serie"
            id={serie.id}
          />
        )}
      </div>

      {/* Hero Section */}
      <div className="relative h-[55vh] md:h-[65vh] w-full overflow-hidden">
        <Image
          src={serie.cover || serie.image}
          alt={serie.title}
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-background/10" />
        <div className="absolute inset-0 bg-gradient-to-l from-transparent via-transparent to-background/60 hidden md:block" />
        
        {/* Serie Info Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10">
          <div className="flex items-start gap-4 md:gap-6">
            {/* Serie Poster */}
            <div className="w-28 h-40 md:w-36 md:h-52 rounded-2xl overflow-hidden flex-shrink-0 shadow-2xl shadow-black/50 ring-1 ring-border/60 relative">
              <Image
                src={serie.image}
                alt={serie.title}
                fill
                className="object-cover"
              />
              {/* Favorite Button */}
              <div className="absolute top-1 left-1">
                <FavoriteButton 
                  item={serie}
                  variant="ghost"
                  size="icon"
                  className="bg-black/50 rounded-full hover:bg-black/70 w-8 h-8 p-0 backdrop-blur-sm"
                />
              </div>
            </div>
            <div className="flex-1">
              <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight drop-shadow-lg">
                <span className="text-gradient-warm">{serie.title}</span>
              </h1>
              
              <div className="flex flex-wrap items-center gap-3 text-foreground/90 dark:text-white/80 mt-3">
                {serie.imdb > 0 && (
                  <div className="flex items-center gap-1.5 rounded-full bg-amber-400 px-3 py-1 text-amber-950 shadow-lg shadow-amber-400/30">
                    <Star className="w-3.5 h-3.5 fill-current" />
                    <span className="text-sm font-extrabold">{serie.imdb}</span>
                  </div>
                )}
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-amber-400" />
                  <span className="text-sm">{serie.year}</span>
                </div>
                {serie.duration && (
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-amber-400" />
                    <span className="text-sm">{serie.duration}</span>
                  </div>
                )}
                {serie.country?.[0] && (
                  <div className="flex items-center gap-1.5">
                    <Globe2 className="w-3.5 h-3.5 text-amber-400" />
                    <span className="text-sm">{serie.country[0].title}</span>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap gap-1.5 mt-3">
                {serie.genres?.map((genre: { id: number; title: string }) => (
                  <span
                    key={genre.id}
                    className="glass text-foreground dark:text-white px-2.5 py-0.5 rounded-full text-xs ring-1 ring-border/50"
                  >
                    {genre.title}
                  </span>
                ))}
              </div>

              <div className="mt-4">
                <WatchButton />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container max-w-7xl mx-auto px-4 mt-8">
        <div className="glass p-5 md:p-6 rounded-3xl border border-border/60 relative overflow-hidden mb-8">
          <div className="absolute -top-10 -left-10 h-32 w-32 rounded-full bg-primary/10 blur-2xl pointer-events-none" />
          <p className="text-sm text-muted-foreground whitespace-pre-line leading-relaxed">
            {serie.description}
          </p>
        </div>

        <div id="episodes" className="scroll-mt-8">
          {seasons.length === 0 ? (
            <div className="glass rounded-3xl border border-border/60 p-10 text-center">
              <p className="text-muted-foreground font-medium">فصلی برای این سریال یافت نشد</p>
              <p className="text-sm text-muted-foreground/60 mt-1">بعداً دوباره تلاش کنید</p>
            </div>
          ) : (
          <Tabs defaultValue={seasons[0]?.id.toString()} className="w-full">
            <TabsList className="w-full flex flex-wrap h-auto gap-2 bg-background/50 backdrop-blur p-2 rounded-2xl ring-1 ring-border/40">
              {seasons.map((season) => (
                <TabsTrigger
                  key={season.id}
                  value={season.id.toString()}
                  className="data-[state=active]:bg-gradient-to-l data-[state=active]:from-amber-500 data-[state=active]:to-rose-500 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-primary/25 rounded-full px-4"
                  onClick={() => {
                    const downloadSection = document.getElementById('episodes');
                    if (downloadSection) {
                      downloadSection.scrollIntoView({ behavior: 'smooth' });
                    }
                  }}
                >
                  {season.title}
                </TabsTrigger>
              ))}
            </TabsList>
            {seasons.map((season) => (
              <TabsContent key={season.id} value={season.id.toString()}>
                <SeasonEpisodes
                  season={season}
                  serieId={serie.id}
                  serieTitle={serie.title}
                  poster={serie.image || serie.cover}
                  snapshot={serie}
                />
              </TabsContent>
            ))}
          </Tabs>
          )}
        </div>

        <CommentSection type="serie" targetId={serie.id} />
      </div>
    </main>
  );
} 