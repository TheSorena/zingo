import { MobileNav } from "../components/mobile-nav";
import { MovieCard } from "../components/movie-card";
import { Command, Search } from "lucide-react";
import { ThemeToggle } from "../components/theme-toggle";
import { ErrorState } from "../components/error-state";
import { NavItems } from "../components/nav-items-client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SearchInput } from "../components/search-input";
import { apiUrl } from '../lib/config';
import Image from "next/image";

async function getMovies() {
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
      throw new Error('خطا در دریافت اطلاعات');
    }
    
    return response.json();
  } catch (error) {
    console.error('Error fetching movies:', error);
    return null;
  }
}

export default async function Home() {
  const movies = await getMovies();

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

      <div className="container py-8 pb-24 md:pb-8 px-4 md:px-6 lg:px-8">
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

        <div className="flex items-center justify-between mb-8">
          <h2 className="text-xl md:text-2xl font-semibold">فیلم‌های جدید</h2>
          <div className="md:hidden relative">
            <SearchInput placeholder="جستجو..." className="w-48" />
          </div>
        </div>
        
        {movies ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 md:gap-5">
            {movies.map((movie: any) => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </div>
        ) : (
          <ErrorState />
        )}
      </div>

      <MobileNav />
    </main>
  );
}