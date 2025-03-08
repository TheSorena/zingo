import { Search, Command, Sparkles, Film, Tv2 } from 'lucide-react';
import { Card } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { MobileNav } from '../../components/mobile-nav';
import { ThemeToggle } from '../../components/theme-toggle';
import { NavItems } from '../../components/nav-items-client';
import { SearchResultCard } from "../../components/search-result-card";
import Link from "next/link";
import { apiUrl } from '../../lib/config';
import type { Metadata } from 'next';

interface SearchResult {
  id: number;
  title: string;
  type: string;
  year: number;
  imdb: number;
  duration: string;
  image: string;
  description: string;
  country: { id: number; title: string }[];
}

async function getSearchResults(query: string) {
  if (!query) return [];

  try {
    const response = await fetch(
      `${apiUrl}/api/search/${encodeURIComponent(query)}/4F5A9C3D9A86FA54EACEDDD635185`,
      { next: { revalidate: 3600 } }
    );
    const data = await response.json();
    return data.posters || [];
  } catch (error) {
    console.error('Error fetching search results:', error);
    return [];
  }
}

interface SearchPageProps {
  searchParams: { q?: string };
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q: query = '' } = searchParams;
  const results = await getSearchResults(query);

  return (
    <main className="min-h-screen bg-background overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-grid-white/10 bg-[size:50px_50px] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_50%,#000_20%,transparent_120%)]" />
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-blue-500/5" />
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-purple-500/20 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-blue-500/20 blur-3xl" />
      </div>

      {/* Header */}
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
            <ThemeToggle />
          </div>
        </div>
      </header>

      <div className="container max-w-6xl mx-auto py-8 md:py-12 px-4 mb-20 md:mb-0">
        <div className="space-y-8 md:space-y-12">
          {/* Search Header */}
          <div className="text-center space-y-4 max-w-2xl mx-auto">
            <div className="flex items-center justify-center gap-2 text-primary">
              <Sparkles className="h-8 w-8 animate-pulse" />
              <h2 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent">
                جستجوی هوشمند
              </h2>
            </div>
            <p className="text-lg text-muted-foreground">
              بهترین فیلم‌ها و سریال‌های دنیا را در یک جستجو پیدا کنید
            </p>
          </div>

          {/* Search Form */}
          <form action="/search" className="max-w-3xl mx-auto">
            <div className="group relative">
              {/* Glowing Effect */}
              <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-300" />

              <div className="relative flex flex-col sm:flex-row items-center gap-2">
                <Input
                  type="text"
                  name="q"
                  defaultValue={query}
                  placeholder="نام فیلم، سریال، بازیگر یا کارگردان را وارد کنید..."
                  className="w-full pl-4 sm:pl-32 pr-6 h-12 sm:h-16 text-base sm:text-lg bg-background/80 backdrop-blur rounded-lg border-2 border-primary/20 focus:border-primary/50 transition-all duration-300 placeholder:text-muted-foreground/50"
                  autoComplete="off"
                  autoFocus
                />
                <Button
                  type="submit"
                  size="lg"
                  className="w-full sm:w-28 sm:absolute sm:left-2 sm:top-1/2 sm:-translate-y-1/2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white h-12 sm:h-[52px] rounded-md transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-primary/20 flex items-center justify-center gap-2"
                >
                  <Search className="h-5 w-5" />
                  جستجو
                </Button>
              </div>
            </div>
          </form>

          {/* Results */}
          {results.length > 0 ? (
            <div className="space-y-6 md:space-y-8">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold flex items-center gap-2">
                  نتایج جستجو برای "{query}"
                  <span className="text-sm text-muted-foreground">({results.length} مورد)</span>
                </h3>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
                {results.map((result: SearchResult) => (
                  <SearchResultCard key={result.id} result={result} />
                ))}
              </div>
            </div>
          ) : query ? (
            <div className="text-center py-12 md:py-16 space-y-4">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary mb-4">
                <Search className="h-8 w-8" />
              </div>
              <p className="text-2xl font-semibold text-muted-foreground">نتیجه‌ای یافت نشد</p>
              <p className="text-muted-foreground max-w-md mx-auto">
                متأسفانه نتیجه‌ای برای جستجوی شما پیدا نشد. لطفاً با کلمات کلیدی دیگری جستجو کنید
              </p>
            </div>
          ) : null}
        </div>
      </div>

      <MobileNav />
    </main>
  );
}

export const metadata: Metadata = {
  title: 'جستجو | Cinema Plus | جستجو | سینما پلاس',
  description: 'Search for movies and series | جستجوی فیلم‌ها و سریال‌ها',
  openGraph: {
    title: 'جستجو | Cinema Plus | جستجو | سینما پلاس',
    description: 'Search for movies and series | جستجوی فیلم‌ها و سریال‌ها',
  },
  twitter: {
    title: 'جستجو | Cinema Plus | جستجو | سینما پلاس',
    description: 'Search for movies and series | جستجوی فیلم‌ها و سریال‌ها',
  },
}; 