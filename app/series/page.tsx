import { Serie } from "../../types";
import { Card } from "../../components/ui/card";
import Image from "next/image";
import { Command, Star } from "lucide-react";
import { MobileNav } from "../../components/mobile-nav";
import { ThemeToggle } from "../../components/theme-toggle";
import { NavItems } from "../../components/nav-items-client";
import { SearchInput } from "../../components/search-input";
import { SerieCard } from "./serie-card";
import { apiUrl } from '../../lib/config';
import Link from "next/link";
import type { Metadata } from 'next';

async function getSeries() {
  try {
    const response = await fetch(
      `${apiUrl}/api/serie/by/filtres/0/created/0/4F5A9C3D9A86FA54EACEDDD635185/`,
      { next: { revalidate: 3600 } }
    );
    if (!response.ok) throw new Error("خطا در دریافت اطلاعات");
    const data = await response.json();
    return { data, error: null };
  } catch (error) {
    console.error("Error fetching series:", error);
    return { data: [], error: "Failed to fetch series data" };
  }
}

export const metadata: Metadata = {
  title: 'سریال‌ها | Cinema Plus | سریال‌ها | سینما پلاس',
  description: 'Watch your favorite TV series | تماشای سریال‌های مورد علاقه شما',
  openGraph: {
    title: 'سریال‌ها | Cinema Plus | سریال‌ها | سینما پلاس',
    description: 'Watch your favorite TV series | تماشای سریال‌های مورد علاقه شما',
    images: [
      {
        url: '/series.png',
        width: 1200,
        height: 630,
        alt: 'Cinema Plus - Modern Movie Application | سینما پلاس - اپلیکیشن مدرن فیلم و سریال',
      },
    ],
  },
  twitter: {
    title: 'سریال‌ها | Cinema Plus | سریال‌ها | سینما پلاس',
    description: 'Watch your favorite TV series | تماشای سریال‌های مورد علاقه شما',
    images: ['/series.png']
  },
};

export default async function SeriesPage() {
  const { data: series, error } = await getSeries();

  if (error || !series || series.length === 0) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-4">
            {error ? "خطای شبکه" : "خطا در بارگذاری سریال‌ها"}
          </h2>
          <p className="text-muted-foreground mb-6">
            {error 
              ? "اتصال ناموفق بود. لطفاً اتصال اینترنت خود را بررسی کنید"
              : "لطفاً دوباره تلاش کنید"
            }
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            تلاش مجدد
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background">
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
            <SearchInput placeholder="جستجو..." />
            <ThemeToggle />
          </div>
        </div>
      </header>

      <div className="container py-8 pb-24 md:pb-8 px-4 md:px-6 lg:px-8">
        {/* Help Image for Mobile/Tablet */}
        <div className="lg:hidden mb-6">
          <Image
            src="/help.jpg"
            alt="راهنمای استفاده"
            width={1200}
            height={300}
            className="w-full rounded-xl object-cover"
            priority
          />
        </div>

        <div className="flex items-center justify-between mb-8">
          <h2 className="text-xl md:text-2xl font-semibold">سریال‌های جدید</h2>
          <div className="md:hidden relative">
            <SearchInput placeholder="جستجو..." className="w-48" />
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 md:gap-5">
          {series.map((serie: Serie) => (
            <SerieCard key={serie.id} serie={serie} />
          ))}
        </div>
      </div>

      <MobileNav />
    </main>
  );
} 