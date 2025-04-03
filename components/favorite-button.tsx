'use client';

import { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import { Button } from './ui/button';
import { toast } from 'sonner';

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

interface FavoriteButtonProps {
  item: FavoriteItem;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
}

export function FavoriteButton({ 
  item, 
  variant = 'ghost',
  size = 'icon',
  className = '',
}: FavoriteButtonProps) {
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    const checkFavorite = () => {
      try {
        const favorites = localStorage.getItem('favorites');
        if (favorites) {
          const favoritesList = JSON.parse(favorites) as FavoriteItem[];
          setIsFavorite(favoritesList.some(fav => fav.id === item.id && fav.type === item.type));
        }
      } catch (error) {
        console.error('Error checking favorite status:', error);
      }
    };

    checkFavorite();
  }, [item.id, item.type]);

  const toggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering parent click events
    
    try {
      let favorites: FavoriteItem[] = [];
      const storedFavorites = localStorage.getItem('favorites');
      
      if (storedFavorites) {
        favorites = JSON.parse(storedFavorites);
      }

      if (isFavorite) {
        // Remove from favorites
        favorites = favorites.filter(fav => !(fav.id === item.id && fav.type === item.type));
        setIsFavorite(false);
        toast.success('از علاقه‌مندی‌ها حذف شد', {
          position: 'top-center',
          duration: 3000,
        });
      } else {
        // Add to favorites
        favorites.push(item);
        setIsFavorite(true);
        toast.success('به علاقه‌مندی‌ها اضافه شد', {
          position: 'top-center',
          duration: 3000,
        });
      }

      localStorage.setItem('favorites', JSON.stringify(favorites));
    } catch (error) {
      console.error('Error updating favorites:', error);
      toast.error('خطا در بروزرسانی علاقه‌مندی‌ها', {
        position: 'top-center',
        duration: 3000,
      });
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      className={`${className} group`}
      onClick={toggleFavorite}
      aria-label={isFavorite ? 'حذف از علاقه‌مندی‌ها' : 'افزودن به علاقه‌مندی‌ها'}
    >
      <Heart 
        className={`h-5 w-5 transition-all duration-300 ${
          isFavorite 
            ? 'text-red-500 fill-red-500' 
            : 'text-foreground group-hover:text-red-500 text-white'
        }`} 
      />
    </Button>
  );
} 