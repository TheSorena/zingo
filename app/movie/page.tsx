"use client";

import { useEffect, useState } from "react";
import { MobileNav } from "../../components/mobile-nav";
import Image from "next/image";
import { Button } from "../../components/ui/button";
import { Play, Download, Star, Clock, Calendar, Copy, Video, Eye } from "lucide-react";
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

const isFirefoxMobile = () => {
  if (typeof window === 'undefined') return false;
  const userAgent = window.navigator.userAgent;
  return userAgent.includes('Firefox') && userAgent.includes('Mobile');
};

interface MovieDetails {
  id: number;
  title: string;
  description: string;
  year: number;
  imdb: number;
  duration: string;
  image: string;
  cover: string;
  genres: Array<{ id: number; title: string }>;
  sources: Array<{ id: number; quality: string; type: string; url: string }>;
  country: Array<{ id: number; title: string; image: string }>;
}

export default function MoviePage() {
  const [movie, setMovie] = useState<MovieDetails | null>(null);
  const [showVlcGuide, setShowVlcGuide] = useState(false);
  const [showTrailer, setShowTrailer] = useState(false);
  const [trailerUrl, setTrailerUrl] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [showAlert, setShowAlert] = useState(false);
  const [currentUrl, setCurrentUrl] = useState("");
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

  useEffect(() => {
    const movieData = localStorage.getItem("selectedMovie");
    if (movieData) {
      const parsedMovie = JSON.parse(movieData);
      setMovie(parsedMovie);
      // Find trailer URL if available
      const trailerSource = parsedMovie.sources?.find(
        (source: { quality: string }) => source.quality?.includes("تیزر")
      );
      if (trailerSource) {
        setTrailerUrl(trailerSource.url);
      }
    }
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-lg">در حال بارگذاری...</div>
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
            onClick={() => router.push('/')}
            className="fixed top-4 right-4 z-50 bg-background/80 backdrop-blur-sm p-2 rounded-full hover:bg-background/90 transition-colors"
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

          {/* Hero Section */}
          <div className="relative h-[50vh] w-full overflow-hidden">
            <Image
              src={movie.cover || movie.image}
              alt={movie.title}
              fill
              className="object-cover"
              priority
              sizes="100vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
            
            {/* Movie Info Overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-6">
              <div className="flex items-start gap-4">
                {/* Movie Poster */}
                <div className="w-24 h-36 rounded-lg overflow-hidden flex-shrink-0 shadow-lg">
                  <Image
                    src={movie.image}
                    alt={movie.title}
                    width={96}
                    height={144}
                    className="object-cover"
                  />
                </div>
                <div className="flex-1">
                  <h1 className="text-2xl font-bold text-foreground dark:text-white">{movie.title}</h1>
                  
                  <div className="flex flex-wrap items-center gap-3 text-foreground/90 dark:text-white/80 mt-2">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-foreground dark:text-white" />
                      <span className="text-sm">{movie.year}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-foreground dark:text-white" />
                      <span className="text-sm">{movie.duration}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Star className="w-3.5 h-3.5 text-yellow-400" />
                      <span className="text-sm">{movie.imdb}</span>
                    </div>
                  </div>

                  {/* Country Slider */}
                  {movie.country && movie.country.length > 0 && (
                    <div className="flex items-center gap-2 mt-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-primary/20 scrollbar-track-transparent">
                      {movie.country.map((country) => (
                        <div
                          key={country.id}
                          className="flex items-center gap-2 bg-muted/50 backdrop-blur-sm px-3 py-1.5 rounded-full flex-shrink-0"
                        >
                          <div className="relative w-5 h-5 rounded-full overflow-hidden">
                            <Image
                              src={country.image}
                              alt={country.title}
                              fill
                              className="object-cover"
                              sizes="20px"
                            />
                          </div>
                          <span className="text-sm text-foreground/90 whitespace-nowrap">
                            {country.title}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {movie.genres.map((genre) => (
                      <span
                        key={genre.id}
                        className="bg-muted dark:bg-white/10 backdrop-blur-sm text-foreground dark:text-white px-2.5 py-0.5 rounded-full text-xs"
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
            {/* Trailer Video Player for Firefox Mobile */}
            {isFirefoxMobile() && trailerUrl && (
              <div className="mb-6">
                <h2 className="text-xl font-bold mb-3 text-foreground">تریلر فیلم</h2>
                <div className="relative aspect-video rounded-lg overflow-hidden">
                  <video
                    controls
                    className="w-full h-full"
                    poster={movie.cover || movie.image}
                  >
                    <source src={trailerUrl} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                </div>
              </div>
            )}

            {/* Download/Watch Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 mb-6">
              {movie.sources?.map((source) => (
                <div key={source.id} className="flex flex-col gap-2">
                  <Link href={source.url} onClick={(e) => handleDownload(e, source.url)} className="block">
                    <Button
                      className="w-full bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 text-sm"
                      variant="ghost"
                    >
                      {!source.quality || source.quality.includes("تیزر") ? (
                        <>
                          <Play className="ml-2 w-4 h-4" />
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
                      className="flex-1 bg-muted hover:bg-muted/80 text-muted-foreground text-sm"
                      variant="ghost"
                    >
                      <Copy className="ml-2 w-4 h-4" />
                      کپی لینک
                    </Button>
                    {!source.quality?.includes("تیزر") && (
                      <Dialog open={showVlcGuide} onOpenChange={setShowVlcGuide}>
                        <DialogTrigger asChild>
                          <Button
                            className="flex-1 bg-muted hover:bg-muted/80 text-muted-foreground text-sm"
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
                                توجه !!
                                دکمه‌ی تماشا با VLC ممکن است به خوبی کار نکند !
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
            <div className="bg-card/50 dark:bg-card/50 backdrop-blur p-4 rounded-xl border border-border/50">
              <h2 className="text-xl font-bold mb-3 text-foreground">درباره فیلم</h2>
              <div className="prose prose-invert max-w-none">
                <p className="text-sm text-muted-foreground dark:text-muted-foreground whitespace-pre-line leading-relaxed">
                  {movie.description}
                </p>
              </div>
            </div>
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
