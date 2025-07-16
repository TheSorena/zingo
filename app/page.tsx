import { MobileNav } from "../components/mobile-nav";
import { Command, FilmIcon, TrendingUp, Clock, Star } from "lucide-react";
import { ThemeToggle } from "../components/theme-toggle";
import { ErrorState } from "../components/error-state";
import { NavItems } from "../components/nav-items-client";
import Link from "next/link";
import { SearchInput } from "../components/search-input";
import { apiUrl } from '../lib/config';
import Image from "next/image";
import { MovieSlider } from "../components/movie-slider";
import { SerieSlider } from "../components/serie-slider";
import { PaginatedMovieSlider } from "../components/paginated-movie-slider";
import { PaginatedSerieSlider } from "../components/paginated-serie-slider";
import { Button } from "../components/ui/button";

// Get the base URL for internal API calls
const getBaseUrl = () => {
  return 'https://cinemaplus-app.vercel.app';
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


  return (
    <main className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-4 md:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2 group">
            <img src="/59e123_25logo.png" alt="logo" className="h-9 w-9 text-primary transition-transform group-hover:rotate-12" />
            <h1 className="text-2xl md:hidden lg:block md:text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent">
              سینما پلاس
            </h1>
          </Link>
          <div className="md:hidden flex items-center">
            <Link href="/search">
              <Button variant="ghost" size="icon" aria-label="Search">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-search"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
              </Button>
            </Link>
          </div>
          <div className="hidden md:flex items-center space-x-4 space-x-reverse">
            <NavItems />
            <SearchInput placeholder="جستجو..." />
            <ThemeToggle />
          </div>
        </div>
      </header>

      <div className="container py-8 pb-24 md:pb-8 px-4 md:px-6 lg:px-8 max-w-[2000px] mx-auto">
        {/* Help Image for Mobile/Tablet */}
        <div className="lg:hidden mb-6">
          <Link href="/help" className="block transition-transform hover:scale-[1.01]">
            <Image
              src="/help.jpg"
              alt="راهنمای استفاده"
              width={1200}
              height={300}
              className="w-full rounded-xl object-cover"
              priority
            />
          </Link>
        </div>

        {/* Mobile Search */}
        <div className="md:hidden mb-8 relative">
          <SearchInput placeholder="جستجو..." className="w-full" />
        </div>

        {/* Content Sliders */}
        <div className="space-y-8 md:space-y-12">
          {newMovies ? (
            <PaginatedMovieSlider 
              title="سینمایی جدید اضافه شده" 
              initialMovies={newMovies} 
              apiEndpoint="/api/movies/new"
            />
          ) : (
            <ErrorState />
          )}

          <hr />

          {topRatedMovies ? (
            <PaginatedMovieSlider 
              title="سینمایی برتر (بر اساس IMDB)" 
              initialMovies={topRatedMovies} 
              apiEndpoint="/api/movies/top-rated"
            />
          ) : (
            <ErrorState />
          )}

          <hr />

          {updateSerie ? (
            <PaginatedSerieSlider 
              title="سریال آپدیت شده" 
              initialSeries={updateSerie} 
              apiEndpoint="/api/series/updated"
            />
          ) : (
            <ErrorState />
          )}

          <hr />

          {newSeries ? (
            <PaginatedSerieSlider 
              title="سریال جدید اضافه شده" 
              initialSeries={newSeries} 
              apiEndpoint="/api/series/new"
            />
          ) : (
            <ErrorState />
          )}

          <hr />

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
