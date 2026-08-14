import { MobileNav } from "../components/mobile-nav";
import { FilmIcon, TrendingUp, Clock, Star } from "lucide-react";
import { ThemeToggle } from "../components/theme-toggle";
import { ErrorState } from "../components/error-state";
import { NavItems } from "../components/nav-items-client";
import { LoadingLink } from "../components/loading-link";
import { SearchInput } from "../components/search-input";
import { apiUrl } from '../lib/config';
import Image from "next/image";
import { MovieSlider } from "../components/movie-slider";
import { SerieSlider } from "../components/serie-slider";
import { PaginatedMovieSlider } from "../components/paginated-movie-slider";
import { PaginatedSerieSlider } from "../components/paginated-serie-slider";
import { Button } from "../components/ui/button";
import { HeroCta } from "../components/hero-cta";
import { headers } from "next/headers";

// Get the base URL for internal API calls (works in dev, prod and Vercel previews)
const getBaseUrl = () => {
  try {
    const host = headers().get('host');
    if (host) {
      const protocol = host.includes('localhost') || host.startsWith('127.') ? 'http' : 'https';
      return `${protocol}://${host}`;
    }
  } catch {}
  return process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
};

async function getNewMovies() {
  try {
    const response = await fetch(
      `${getBaseUrl()}/api/movies/new`,
      {
        headers: {
          'Accept': 'application/json'
        },
        cache: 'no-store'
      }
    );

    if (!response.ok) {
      throw new Error('خطا در دریافت اطلاعات از سرور');
    }

    return response.json();
  } catch (error) {
    console.error('Error fetching new movies:', error);
    return null;
  }
}

async function getTopRatedMovies() {
  try {
    const response = await fetch(
      `${getBaseUrl()}/api/movies/top-rated`,
      {
        headers: {
          'Accept': 'application/json'
        },
        cache: 'no-store'
      }
    );

    if (!response.ok) {
      throw new Error('خطا در دریافت اطلاعات از سرور');
    }

    return response.json();
  } catch (error) {
    console.error('Error fetching top rated movies:', error);
    return null;
  }
}

async function getNewSeries() {
  try {
    const result = await fetch(
      `${getBaseUrl()}/api/series/new`,
      {
        headers: {
          'Accept': 'application/json'
        },
        cache: 'no-store'
      }
    );
    if (!result.ok) {
      throw new Error('خطا در دریافت اطلاعات از سرور')
    }

    return result.json();
  } catch (error) {
    console.error('Error fetching series:', error);
    return null;
  }
}

async function getBestSeries() {
  try {
    const result = await fetch(
      `${getBaseUrl()}/api/series/best`,
      {
        headers: {
          'Accept': 'application/json'
        },
        cache: 'no-store'
      }
    );
    if (!result.ok) {
      throw new Error('خطا در دریافت اطلاعات از سرور')
    }

    return result.json();
  } catch (error) {
    console.error('Error fetching top rated series:', error);
    return null;
  }
}

async function getUpdateSeries() {
  try {
    const result = await fetch(
      `${getBaseUrl()}/api/series/updated`,
      {
        headers: {
          'Accept': 'application/json'
        },
        cache: 'no-store'
      }
    );
    if (!result.ok) {
      throw new Error('خطا در دریافت اطلاعات از سرور')
    }

    return result.json();
  } catch (error) {
    console.error('Error fetching top rated series:', error);
    return null;
  }
}

async function getTopRatedSeries() {
  try {
    const result = await fetch(
      `${getBaseUrl()}/api/series/top-rated`,
      {
        headers: {
          'Accept': 'application/json'
        },
        cache: 'no-store'
      }
    );
    if (!result.ok) {
      throw new Error('خطا در دریافت اطلاعات از سرور')
    }

    return result.json();
  } catch (error) {
    console.error('Error fetching top rated series:', error);
    return null;
  }
}

export default async function Home() {
  const newMovies = await getNewMovies();
  const topRatedMovies = await getTopRatedMovies();
  const newSeries = await getNewSeries();
  const topRatedSeries = await getTopRatedSeries();
  const bestSeries = await getBestSeries();
  const updateSerie = await getUpdateSeries();

  const heroMovie = newMovies?.[0] || topRatedMovies?.[0];

  return (
    <main className="min-h-screen bg-background">
      {/* Ambient Glow Background */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-48 right-1/4 h-96 w-96 rounded-full bg-primary/10 blur-3xl animate-glow-pulse" />
        <div className="absolute top-1/3 -left-40 h-96 w-96 rounded-full bg-accent/10 blur-3xl" />
      </div>

      <header className="sticky top-0 z-40 w-full border-b border-border/50 glass">
        <div className="container flex h-16 items-center justify-between px-4 md:px-6 lg:px-8">
          <LoadingLink href="/" className="flex items-center gap-2.5 group">
            <span className="relative">
              <img src="/zingo-logo.png" alt="زینگو" className="h-10 w-10 rounded-2xl object-cover shadow-lg shadow-primary/30 ring-1 ring-primary/40 transition-transform duration-300 group-hover:rotate-6 group-hover:scale-105" />
              <span className="absolute -inset-1 -z-10 rounded-2xl bg-primary/30 blur-md opacity-0 transition-opacity group-hover:opacity-100" />
            </span>
            <span className="text-2xl md:hidden lg:block md:text-3xl font-extrabold tracking-tight text-gradient-zingo">
              زینگو
            </span>
          </LoadingLink>
          <div className="md:hidden flex items-center">
            <LoadingLink href="/search">
              <Button variant="ghost" size="icon" aria-label="Search" className="rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-search"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
              </Button>
            </LoadingLink>
          </div>
          <div className="hidden md:flex items-center gap-3">
            <NavItems />
            <SearchInput placeholder="جستجو..." />
            <ThemeToggle />
          </div>
        </div>
      </header>

      <div className="container py-6 pb-24 md:pb-8 px-4 md:px-6 lg:px-8 max-w-[2000px] mx-auto">
        {/* Hero Section */}
        {heroMovie && (
          <section className="relative mb-12 overflow-hidden rounded-[2rem] ring-1 ring-border/60 shadow-2xl shadow-primary/10 animate-scale-in">
            <div className="relative h-[420px] md:h-[520px] w-full">
              <Image
                src={heroMovie.cover || heroMovie.image}
                alt={heroMovie.title}
                fill
                priority
                sizes="100vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-background/10" />
              <div className="absolute inset-0 bg-gradient-to-l from-transparent via-transparent to-background/85 hidden md:block" />

              {/* floating glow orbs */}
              <div className="pointer-events-none absolute -bottom-10 -right-10 h-56 w-56 rounded-full bg-primary/20 blur-3xl animate-glow-pulse" />
              <div className="pointer-events-none absolute top-10 left-10 h-40 w-40 rounded-full bg-rose-500/20 blur-3xl animate-float" />

              <div className="absolute bottom-0 right-0 left-0 p-6 md:p-10 max-w-3xl">
                <div className="mb-3 flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-primary px-3.5 py-1.5 text-xs font-bold text-primary-foreground shadow-lg shadow-primary/40 glow-amber">
                    <TrendingUp className="h-3.5 w-3.5" />
                    جدیدترین اضافه شده
                  </span>
                </div>
                <h2 className="mb-4 text-3xl md:text-5xl font-extrabold leading-[1.15] tracking-tight drop-shadow-lg">
                  <span className="text-gradient-warm">{heroMovie.title}</span>
                </h2>
                <div className="mb-6 flex flex-wrap items-center gap-2 text-sm">
                  <span className="inline-flex items-center gap-1.5 rounded-full glass px-3 py-1.5 font-medium">
                    <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
                    {heroMovie.imdb}
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-full glass px-3 py-1.5 font-medium">
                    <Clock className="h-4 w-4" />
                    {heroMovie.year}
                  </span>
                  {heroMovie.duration && (
                    <span className="inline-flex items-center gap-1.5 rounded-full glass px-3 py-1.5 font-medium">
                      <FilmIcon className="h-4 w-4" />
                      {heroMovie.duration}
                    </span>
                  )}
                  {heroMovie.country?.[0] && (
                    <span className="inline-flex items-center gap-1.5 rounded-full glass px-3 py-1.5 font-medium">
                      {heroMovie.country[0].title}
                    </span>
                  )}
                </div>
                <HeroCta movie={heroMovie} />
              </div>
            </div>
          </section>
        )}

        {/* Help Image for Mobile/Tablet */}
        <div className="lg:hidden mb-6">
          <LoadingLink href="/help" className="block transition-transform hover:scale-[1.01]">
            <Image
              src="/help.jpg"
              alt="راهنمای استفاده"
              width={1200}
              height={300}
              className="w-full rounded-2xl object-cover ring-1 ring-border/50"
              priority
            />
          </LoadingLink>
        </div>

        {/* Mobile Search */}
        <div className="md:hidden mb-8 relative">
          <SearchInput placeholder="جستجو..." className="w-full" />
        </div>

        {/* Content Sliders */}
        <div className="space-y-12 md:space-y-16">
          {newMovies ? (
            <PaginatedMovieSlider
              title="سینمایی جدید اضافه شده"
              initialMovies={newMovies}
              apiEndpoint="/api/movies/new"
            />
          ) : (
            <ErrorState />
          )}

          <div className="h-px w-full bg-gradient-to-l from-transparent via-border to-transparent" />

          {topRatedMovies ? (
            <PaginatedMovieSlider
              title="سینمایی برتر (بر اساس IMDB)"
              initialMovies={topRatedMovies}
              apiEndpoint="/api/movies/top-rated"
            />
          ) : (
            <ErrorState />
          )}

          <div className="h-px w-full bg-gradient-to-l from-transparent via-border to-transparent" />

          {updateSerie ? (
            <PaginatedSerieSlider
              title="سریال آپدیت شده"
              initialSeries={updateSerie}
              apiEndpoint="/api/series/updated"
            />
          ) : (
            <ErrorState />
          )}

          <div className="h-px w-full bg-gradient-to-l from-transparent via-border to-transparent" />

          {newSeries ? (
            <PaginatedSerieSlider
              title="سریال جدید اضافه شده"
              initialSeries={newSeries}
              apiEndpoint="/api/series/new"
            />
          ) : (
            <ErrorState />
          )}

          <div className="h-px w-full bg-gradient-to-l from-transparent via-border to-transparent" />

          {bestSeries ? (
            <PaginatedSerieSlider
              title="سریال برتر"
              initialSeries={bestSeries}
              apiEndpoint="/api/series/best"
            />
          ) : (
            <ErrorState />
          )}

          {topRatedSeries ? (
            <PaginatedSerieSlider
              title="سریال برتر (بر اساس IMDB)"
              initialSeries={topRatedSeries}
              apiEndpoint="/api/series/top-rated"
            />
          ) : (
            <ErrorState />
          )}
        </div>
      </div>
      <MobileNav />
    </main>
  );
}
