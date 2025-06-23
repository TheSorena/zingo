'use client';

import { useState, useEffect } from 'react';
import { Command, Sparkles, Trash2, AlertCircle, XCircle, Heart } from 'lucide-react';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { MobileNav } from '../../components/mobile-nav';
import { ThemeToggle } from '../../components/theme-toggle';
import { NavItems } from '../../components/nav-items-client';
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../../components/ui/alert-dialog";
import { SearchInput } from '@/components/search-input';

interface FavoriteItem {
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

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const loadFavorites = () => {
      try {
        const storedFavorites = localStorage.getItem('favorites');
        if (storedFavorites) {
          // Sort by newest first (assuming the most recently added items are at the end of the array)
          const parsedFavorites = JSON.parse(storedFavorites);
          setFavorites(parsedFavorites.reverse());
        }
      } catch (error) {
        console.error('Error loading favorites:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadFavorites();
  }, []);

  const handleItemClick = (item: FavoriteItem) => {
    localStorage.setItem(
      item.type === 'serie' ? 'selectedSerie' : 'selectedMovie',
      JSON.stringify(item)
    );
    router.push(item.type === 'serie' ? `/serie/${item.id}` : '/movie');
  };

  const removeFavorite = (id: number) => {
    const updatedFavorites = favorites.filter(item => item.id !== id);
    setFavorites(updatedFavorites);
    localStorage.setItem('favorites', JSON.stringify(updatedFavorites.slice().reverse()));
  };

  const removeAllFavorites = () => {
    setFavorites([]);
    localStorage.removeItem('favorites');
  };

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
            <img src="https://uploadkon.ir/uploads/59e123_25logo.png" alt="logo" className="h-9 w-9 text-primary transition-transform group-hover:rotate-12" />
            <h1 className="text-2xl md:hidden lg:block md:text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent">
              سینما پلاس
            </h1>
          </Link>
          <div className="md:hidden flex items-center">
            <Link href="/search">
              <Button variant="ghost" size="icon" aria-label="Search">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-search"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
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

      <div className="container max-w-[2000px] mx-auto py-8 md:py-12 px-4 mb-20 md:mb-0">
        <div className="space-y-8 md:space-y-12">
          {/* Favorites Header */}
          <div className="text-center space-y-4 max-w-2xl mx-auto">
            <div className="flex items-center justify-center gap-2 text-primary">
              <Heart className="h-8 w-8 text-red-500 animate-pulse" />
              <h2 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent">
                علاقه‌مندی‌های شما
              </h2>
            </div>
            <p className="text-lg text-muted-foreground">
              فیلم‌ها و سریال‌های مورد علاقه شما در یک نگاه
            </p>
          </div>

          {/* Favorites Management */}
          {favorites.length > 0 && (
            <div className="flex justify-end">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button 
                    variant="destructive"
                    className="flex items-center gap-2"
                  >
                    <Trash2 className="h-4 w-4" />
                    حذف همه
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>حذف همه علاقه‌مندی‌ها</AlertDialogTitle>
                    <AlertDialogDescription>
                      آیا مطمئن هستید که می‌خواهید تمام علاقه‌مندی‌های خود را حذف کنید؟ این عمل قابل برگشت نیست.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter className="flex-row-reverse sm:flex-row justify-between">
                    <AlertDialogCancel className="sm:ml-2">انصراف</AlertDialogCancel>
                    <AlertDialogAction 
                      onClick={removeAllFavorites}
                      className="bg-destructive hover:bg-destructive/90 text-white"
                    >
                      حذف همه
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          )}

          {/* Favorites Content */}
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : favorites.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8 gap-4 md:gap-6">
              {favorites.map((item) => (
                <Card 
                  key={item.id}
                  className="group relative overflow-hidden border-0 bg-transparent"
                >
                  <div 
                    className="aspect-[2/3] overflow-hidden rounded-lg shadow-md transition-shadow duration-300 group-hover:shadow-xl cursor-pointer"
                    onClick={() => handleItemClick(item)}
                  >
                    <div className="relative h-full w-full">
                      <Image
                        src={item.image}
                        alt={item.title}
                        fill
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                        className="object-cover transition-transform duration-300 group-hover:scale-110"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                      {item.imdb > 0 && (
                        <div className="absolute bottom-2 left-2 flex items-center gap-1 rounded-full bg-black/60 px-2 py-1 text-xs text-yellow-400 backdrop-blur-sm">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                            className="w-3 h-3"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z"
                              clipRule="evenodd"
                            />
                          </svg>
                          <span>{item.imdb}</span>
                        </div>
                      )}
                      <div className="absolute top-2 right-2 px-2 py-1 rounded-full bg-black/60 text-xs text-white backdrop-blur-sm">
                        {item.type === 'serie' ? 'سریال' : 'فیلم'}
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 space-y-1">
                    <h3 className="font-semibold line-clamp-1 group-hover:text-primary transition-colors text-center">
                      {item.title}
                    </h3>
                    <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                      <span>{item.year}</span>
                      {item.duration && (
                        <>
                          <span className="w-1 h-1 rounded-full bg-muted-foreground/50" />
                          <span>{item.duration}</span>
                        </>
                      )}
                      {item.country?.[0] && (
                        <>
                          <span className="w-1 h-1 rounded-full bg-muted-foreground/50" />
                          <span>{item.country[0].title}</span>
                        </>
                      )}
                    </div>
                  </div>
                  
                  {/* Remove Button */}
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-2 left-2 p-1 h-8 w-8 rounded-full bg-black/60 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm"
                      >
                        <XCircle className="h-5 w-5" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>حذف از علاقه‌مندی‌ها</AlertDialogTitle>
                        <AlertDialogDescription>
                          آیا مطمئن هستید که می‌خواهید "{item.title}" را از لیست علاقه‌مندی‌های خود حذف کنید؟
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter className="flex-row-reverse sm:flex-row justify-between">
                        <AlertDialogCancel className="sm:ml-2">انصراف</AlertDialogCancel>
                        <AlertDialogAction 
                          onClick={() => removeFavorite(item.id)}
                          className="bg-destructive hover:bg-destructive/90 text-white"
                        >
                          حذف کردن
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 md:py-16 space-y-4">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary mb-4">
                <Heart className="h-8 w-8" />
              </div>
              <p className="text-2xl font-semibold text-muted-foreground">هیچ علاقه‌مندی ثبت نشده است</p>
              <p className="text-muted-foreground max-w-md mx-auto">
                شما هنوز هیچ فیلم یا سریالی را به علاقه‌مندی‌های خود اضافه نکرده‌اید. برای افزودن به این لیست، آیکن قلب را در صفحه فیلم یا سریال انتخاب کنید.
              </p>
              <Link href="/">
                <Button 
                  className="mt-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
                >
                  مشاهده فیلم‌ها و سریال‌ها
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>

      <MobileNav />
    </main>
  );
} 