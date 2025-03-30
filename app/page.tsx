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

async function getNewMovies() {
  try {
    const response = await fetch(
      `${apiUrl}/api/movie/by/filtres/0/created/0/4F5A9C3D9A86FA54EACEDDD635185`,
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
      `${apiUrl}/api/movie/by/filtres/0/imdb/0/4F5A9C3D9A86FA54EACEDDD635185`,
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
      `${apiUrl}/api/serie/by/filtres/0/created/0/4F5A9C3D9A86FA54EACEDDD635185/`,
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
      `${apiUrl}/api/poster/by/filtres/27/0/created/0/4F5A9C3D9A86FA54EACEDDD635185/`,
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
      `${apiUrl}/api/poster/by/filtres/31/0/created/0/4F5A9C3D9A86FA54EACEDDD635185/`,
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
      `${apiUrl}/api/poster/by/filtres/27/0/imdb/0/4F5A9C3D9A86FA54EACEDDD635185/`,
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
            <Command className="h-8 w-8 text-primary transition-transform group-hover:rotate-12" />
            <h1 className="text-2xl md:hidden lg:block md:text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent">
              Cinema Plus
            </h1>
          </Link>
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
            <MovieSlider title="30 سینمایی جدید اضافه شده" movies={newMovies} />
          ) : (
            <ErrorState />
          )}

          <hr />

          {/* Donation Banner */}
          <div className="my-6">
            <Link href="https://daramet.com/cinemaplus" target="_blank" rel="noopener noreferrer" className="block transition-transform hover:scale-[1.01]">
              <div className="md:max-w-[60%] lg:max-w-[50%] mx-auto">
                <Image
                  src="/donate.png"
                  alt="حمایت مالی"
                  width={1200}
                  height={300}
                  className="w-full rounded-xl object-cover"
                  priority
                />
              </div>
            </Link>
          </div>

          <hr />

          {topRatedMovies ? (
            <MovieSlider title="30 سینمایی برتر (بر اساس IMDB)" movies={topRatedMovies} />
          ) : (
            <ErrorState />
          )}

          <hr />

          {updateSerie ? (
            <SerieSlider title="30 سریال آپدیت شده" series={updateSerie} />
          ) : (
            <ErrorState />
          )}

          <hr />

          {newSeries ? (
            <SerieSlider title="30 سریال جدید اضافه شده" series={newSeries} />
          ) : (
            <ErrorState />
          )}

          <hr />

          {bestSeries ? (
            <SerieSlider title="30 سریال برتر" series={bestSeries} />
          ) : (
            <ErrorState />
          )}

          <hr />

          {/* Donation Banner */}
          <div className="my-6">
            <Link href="https://daramet.com/cinemaplus" target="_blank" rel="noopener noreferrer" className="block transition-transform hover:scale-[1.01]">
              <div className="md:max-w-[60%] lg:max-w-[50%] mx-auto">
                <Image
                  src="/donate.png"
                  alt="حمایت مالی"
                  width={1200}
                  height={300}
                  className="w-full rounded-xl object-cover"
                  priority
                />
              </div>
            </Link>
          </div>

          <hr />

          {topRatedSeries ? (
            <SerieSlider title="30 سریال برتر (بر اساس IMDB)" series={topRatedSeries} />
          ) : (
            <ErrorState />
          )}
        </div>
      </div>
      <MobileNav />
    </main>
  );
}