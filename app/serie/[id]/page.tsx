'use client';

import { Serie, SerieSeason } from "../../../types";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../../../components/ui/accordion";
import { Badge } from "../../../components/ui/badge";
import { Star, Calendar, Clock, Globe2, ArrowLeft, Play, Copy } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "../../../components/ui/button";
import { WatchButton } from "../../../components/watch-button";
import { DownloadLink } from "../../../components/download-link";
import { toast } from "sonner";
import { Toaster } from "sonner";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiUrl } from '../../../lib/config';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../components/ui/tabs";
import ReactPlayer from "react-player";
import { ShareButton } from "../../../components/share-button";
import { FavoriteButton } from "../../../components/favorite-button";

async function getSerieSeasons(id: string) {
  try {
    const response = await fetch(`/api/seasons/${id}`, {
      next: { revalidate: 3600 }
    });
    if (!response.ok) throw new Error("خطا در دریافت اطلاعات");
    return response.json();
  } catch (error) {
    console.error("Error fetching seasons:", error);
    return [];
  }
}

async function getSerieById(id: string) {
  try {
    const response = await fetch(
      `${apiUrl}/api/serie/${id}/4F5A9C3D9A86FA54EACEDDD635185`,
      { next: { revalidate: 3600 } }
    );
    if (!response.ok) throw new Error("خطا در دریافت اطلاعات");
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
  const [trailerUrl, setTrailerUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const getProxyUrl = (url: string) => {
    if (!url) return "";
    return `https://http-video.liara.run/?url=${encodeURIComponent(url)}`;
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        // Try to get serie data from localStorage first
        const storedSerie = localStorage.getItem('selectedSerie');
        let serieData = null;

        if (storedSerie) {
          const parsed = JSON.parse(storedSerie);
          if (parsed.id.toString() === params.id) {
            serieData = parsed;
          }
        }

        // If not in localStorage or ID doesn't match, fetch from API
        if (!serieData) {
          serieData = await getSerieById(params.id);
        }

        if (!serieData) {
          setError('سریال یافت نشد');
          return;
        }

        setSerie(serieData);
        const seasonsData = await getSerieSeasons(params.id);
        setSeasons(seasonsData);

        // Find trailer URL from episodes
        for (const season of seasonsData) {
          for (const episode of season.episodes) {
            if (!episode.title || episode.title.includes("تیزر")) {
              const trailerSource = episode.sources[0];
              if (trailerSource) {
                setTrailerUrl(trailerSource.url);
                break;
              }
            }
          }
          if (trailerUrl) break;
        }
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
        <div className="animate-pulse text-lg">در حال بارگذاری...</div>
      </div>
    );
  }

  if (error || !serie) {
    return (
      <div className="min-h-screen flex items-center justify-center flex-col gap-4">
        <div className="text-lg text-red-500">{error}</div>
        <Button onClick={() => router.push('/')}>
          بازگشت به صفحه اضلی
        </Button>
      </div>
    );
  }

  const copyToClipboard = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      toast.success("لینک با موفقیت کپی شد", {
        description: "لینک در کلیپ‌بورد شما ذخیره شد",
        duration: 3000,
        position: "top-center",
        className: "bg-green-500/10 border-green-500/20 text-green-500",
        icon: <Copy className="w-5 h-5" />,
      });
    } catch (err) {
      toast.error("خطا در کپی لینک", {
        description: "لطفاً دوباره تلاش کنید",
        duration: 3000,
        position: "top-center",
        className: "bg-red-500/10 border-red-500/20 text-red-500",
      });
    }
  };

  return (
    <main className="min-h-screen pb-20 md:pb-0">
      <Toaster richColors closeButton position="top-center" />
      {/* Back Button */}
      <Link
        href="/"
        className="fixed top-4 right-4 z-50 bg-background/80 backdrop-blur-sm p-2 rounded-full hover:bg-background/90 transition-all duration-300 hover:scale-110"
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
      </Link>

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
      <div className="relative h-[50vh] w-full overflow-hidden">
        <Image
          src={serie.cover || serie.image}
          alt={serie.title}
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
        
        {/* Serie Info Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <div className="flex items-start gap-4">
            {/* Serie Poster */}
            <div className="w-24 h-36 rounded-lg overflow-hidden flex-shrink-0 shadow-lg relative">
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
                  className="bg-black/50 rounded-full hover:bg-black/70 w-8 h-8 p-0"
                />
              </div>
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-foreground dark:text-white">{serie.title}</h1>
              
              <div className="flex flex-wrap items-center gap-3 text-foreground/90 dark:text-white/80 mt-2">
                {serie.imdb > 0 && (
                  <div className="flex items-center gap-1.5">
                    <Star className="w-3.5 h-3.5 text-yellow-400" />
                    <span className="text-sm">{serie.imdb}</span>
                  </div>
                )}
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-foreground dark:text-white" />
                  <span className="text-sm">{serie.year}</span>
                </div>
                {serie.duration && (
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-foreground dark:text-white" />
                    <span className="text-sm">{serie.duration}</span>
                  </div>
                )}
                {serie.country?.[0] && (
                  <div className="flex items-center gap-1.5">
                    <Globe2 className="w-3.5 h-3.5 text-foreground dark:text-white" />
                    <span className="text-sm">{serie.country[0].title}</span>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap gap-1.5 mt-2">
                {serie.genres?.map((genre: { id: number; title: string }) => (
                  <span
                    key={genre.id}
                    className="bg-muted dark:bg-white/10 backdrop-blur-sm text-foreground dark:text-white px-2.5 py-0.5 rounded-full text-xs"
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
        {/* Video Player Section */}
        {/* {trailerUrl && (
          <div className="mb-6">
            <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-black/50">
              <ReactPlayer
                url={getProxyUrl(trailerUrl)}
                width="100%"
                height="100%"
                playing={isPlaying}
                controls={true}
                playsinline={true}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                config={{
                  file: {
                    attributes: {
                      controlsList: "nodownload",
                      disablePictureInPicture: true,
                    },
                  },
                }}
                style={{ position: "absolute", top: 0, left: 0 }}
              />
            </div>
          </div>
        )} */}

        <p className="text-muted-foreground mb-8 whitespace-pre-line">
          {serie.description}
        </p>

        <div id="episodes" className="scroll-mt-8">
          <Tabs defaultValue={seasons[0]?.id.toString()} className="w-full">
            <TabsList className="w-full flex flex-wrap h-auto gap-2 bg-background/50 backdrop-blur p-2">
              {seasons.map((season) => (
                <TabsTrigger
                  key={season.id}
                  value={season.id.toString()}
                  className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
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
                <Card className="bg-card/50 backdrop-blur border-0">
                  <CardContent className="pt-6">
                    <Accordion type="single" collapsible className="w-full">
                      {season.episodes.map((episode) => (
                        <AccordionItem key={episode.id} value={episode.id.toString()}>
                          <AccordionTrigger className="text-right">
                            {episode.title}
                          </AccordionTrigger>
                          <AccordionContent>
                            <div className="grid gap-2">
                              {episode.sources.map((source) => (
                                <DownloadLink
                                  key={source.id}
                                  url={source.url}
                                  type={source.type}
                                  quality={source.quality}
                                />
                              ))}
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </CardContent>
                </Card>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </div>
    </main>
  );
} 