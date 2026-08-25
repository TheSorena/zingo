"use client";

import { useEffect, useState } from "react";
import { MobileNav } from "../../components/mobile-nav";
import Image from "next/image";
import { Button } from "../../components/ui/button";
import { Play, Download, Star, Clock, Calendar, Copy, Video, Eye, Globe2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../../components/ui/alert-dialog";
import { toast } from "sonner";
import { Toaster } from "sonner";
import { isChromeBrowser, getDownloadMessage } from "../../lib/utils";
import ReactPlayer from "react-player";
import { ShareButton } from "../../components/share-button";
import { FavoriteButton } from "../../components/favorite-button";
import { CommentSection } from "../../components/comment-section";
import { OnlinePlayer } from "../../components/online-player";

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
  const [showVlcGuide, setShowVlcGuide] = useState(false);
  const [showTrailer, setShowTrailer] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showAlert, setShowAlert] = useState(false);
  const [currentUrl, setCurrentUrl] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);
  const router = useRouter();

  const ensureHttps = (url: string) => {
    if (url.startsWith('http://')) {
      return url.replace('http://', 'https://');
    }
    return url;
  };

  const handleDownload = (e: React.MouseEvent, url: string) => {
    e.preventDefault();
    
    if (isChromeBrowser()) {
      setCurrentUrl(url);
      setShowAlert(true);
      return;
    }

    const link = document.createElement('a');
    link.href = url;
    link.download = ''; // Forces download
    link.rel = 'noopener noreferrer';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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

  const getProxyUrl = (url: string) => {
    if (!url) return "";
    return `https://http-video.liara.run/?url=${encodeURIComponent(url)}`;
  };

  useEffect(() => {
    const movieData = localStorage.getItem("selectedMovie");
    if (movieData) {
      const parsedMovie = JSON.parse(movieData);
      // Find trailer URL from sources
      const trailerSource = parsedMovie.sources?.find(
        (source: { quality?: string }) => !source.quality || source.quality.includes("تیزر")
      );
      if (trailerSource) {
        parsedMovie.trailer_url = trailerSource.url;
      }
      setMovie(parsedMovie);
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

            {/* Download/Watch Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-8">
              {movie.sources?.map((source) => (
                <div key={source.id} className="flex flex-col gap-2.5">
                  <Link href={source.url} onClick={(e) => handleDownload(e, source.url)} className="block">
                    <Button
                      className="group relative w-full overflow-hidden rounded-full bg-gradient-to-l from-amber-500 to-rose-500 py-6 text-white shadow-xl shadow-primary/25 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:shadow-primary/40 text-sm font-bold"
                      variant="ghost"
                    >
                      <span className="absolute inset-0 overflow-hidden rounded-full">
                        <span className="absolute inset-y-0 w-1/3 -left-1/3 bg-white/25 blur-md -skew-x-12 translate-x-0 transition-transform duration-700 group-hover:translate-x-[400%]" />
                      </span>
                      {!source.quality || source.quality.includes("تیزر") ? (
                        <>
                          <Play className="ml-2 w-4 h-4 fill-current" />
                          دانلود تریلر
                        </>
                      ) : (
                        <>
                          <Download className="ml-2 w-4 h-4" />
                          دانلود {source.quality}
                        </>
                      )}
                    </Button>
                  </Link>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => copyToClipboard(source.url)}
                      className="flex-1 rounded-full bg-muted/60 backdrop-blur-sm hover:bg-muted/80 text-muted-foreground text-sm ring-1 ring-border/50"
                      variant="ghost"
                    >
                      <Copy className="ml-2 w-4 h-4" />
                      کپی لینک
                    </Button>
                    {!source.quality?.includes("تیزر") && (
                      <Dialog open={showVlcGuide} onOpenChange={setShowVlcGuide}>
                        <DialogTrigger asChild>
                          <Button
                            className="flex-1 rounded-full bg-muted/60 backdrop-blur-sm hover:bg-muted/80 text-muted-foreground text-sm ring-1 ring-border/50"
                            variant="ghost"
                          >
                            <Video className="ml-2 w-4 h-4" />
                            پخش با VLC
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle className="text-right mt-5">راهنمای پخش با VLC</DialogTitle>
                            <DialogDescription className="space-y-4 text-right">
                              <p>برای پخش فیلم با VLC:</p>
                              <ol className="list-decimal list-inside space-y-2 text-right">
                                <li>ابتدا VLC را از سایت رسمی دانلود و نصب کنید</li>
                                <li>لینک زیر را کپی کنید</li>
                                <li>VLC را باز کنید</li>
                                <li>از منوی Media گزینه Open Network Stream را انتخاب کنید</li>
                                <li>لینک کپی شده را در قسمت URL وارد کنید</li>
                                <li>روی دکمه Play کلیک کنید</li>
                                <p className="text-blue-500 mt-2">
                                  توجه !!
                                  دکمه‌ی تماشا با VLC ممکن است به خوبی کار نکند !
                                </p>
                              </ol>
                              <div className="flex gap-2 mt-4">
                                <Button
                                  onClick={() => copyToClipboard(source.url)}
                                  className="flex-1"
                                >
                                  <Copy className="ml-2 w-4 h-4" />
                                  کپی لینک
                                </Button>

                                <Button className="flex-1">
                                  <Eye className="ml-2 w-4 h-4" />
                                  <a href={'vlc://' + source.url}>
                                  تماشا با VLC
                                  </a>
                                </Button>

                                <Button
                                  onClick={() => window.open("https://www.videolan.org/vlc/", "_blank")}
                                  className="flex-1"
                                  variant="outline"
                                >
                                  دانلود VLC
                                </Button>
                              </div>
                            </DialogDescription>
                          </DialogHeader>
                        </DialogContent>
                      </Dialog>
                    )}
                  </div>
                </div>
              ))}
            </div>

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
      <Toaster richColors closeButton position="top-center" />

      <AlertDialog open={showAlert} onOpenChange={setShowAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-right">دانلود در مرورگر کروم</AlertDialogTitle>
            <AlertDialogDescription className="text-right whitespace-pre-line mt-4 leading-relaxed">
              {getDownloadMessage()}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="sm:justify-start">
            <AlertDialogAction 
              onClick={() => {
                copyToClipboard(currentUrl);
                setShowAlert(false);
              }}
              className="w-full sm:w-auto"
            >
              کپی لینک دانلود
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
