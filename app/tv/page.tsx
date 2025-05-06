'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Search, Tv2, Home } from 'lucide-react';
import { motion } from 'framer-motion';

interface Channel {
  nanoid: string;
  name: string;
  iptv_urls: string[];
  youtube_urls: string[];
  language: string;
  country: string;
  isGeoBlocked: boolean;
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

export default function TVPage() {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchChannels = async () => {
      try {
        const response = await fetch('https://raw.githubusercontent.com/TVGarden/tv-garden-channel-list/refs/heads/main/channels/raw/countries/ir.json');
        if (!response.ok) {
          throw new Error('Failed to fetch channels');
        }
        const data = await response.json();
        setChannels(data);
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading channels:', error);
        setIsLoading(false);
      }
    };

    fetchChannels();
  }, []);

  const filteredChannels = channels.filter(channel =>
    channel.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <main className="min-h-screen bg-background p-6">
        <div className="container mx-auto max-w-7xl">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-video bg-muted rounded-lg mb-3"></div>
                <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-purple-900 via-blue-900 to-purple-900">
        <div className="container mx-auto max-w-7xl px-6 py-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            تلویزیون زنده
          </h1>
          <p className="text-white/80 text-lg mb-8">
            بیش از {channels.length} کانال تلویزیونی زنده از سراسر ایران
          </p>
          
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="secondary" size="lg" className="flex items-center gap-2">
                <Home className="w-4 h-4" />
                بازگشت به خانه
              </Button>
            </Link>
            <div className="relative w-full md:w-96">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
              <Input
                type="search"
                placeholder="جستجوی کانال..."
                className="w-full pl-4 pr-12 py-6 bg-white/10 border-white/20 text-white placeholder:text-white/60"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Channels Grid */}
      <div className="container mx-auto max-w-7xl p-6">
        <motion.div 
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4"
        >
          {filteredChannels.map((channel) => (
            <motion.div key={channel.nanoid} variants={item}>
              <Link href={`/live/${channel.nanoid}`}>
                <div className="group relative bg-card hover:bg-accent rounded-xl p-4 transition-all duration-300 cursor-pointer border border-border hover:border-primary hover:shadow-lg hover:shadow-primary/5">
                  <div className="aspect-video bg-gradient-to-br from-purple-500/10 to-blue-500/10 rounded-lg flex items-center justify-center mb-3 group-hover:from-purple-500/20 group-hover:to-blue-500/20 transition-all">
                    <div className="text-4xl font-bold text-primary/40 group-hover:text-primary transition-colors">
                      {channel.name.charAt(0)}
                    </div>
                  </div>
                  <h3 className="font-semibold text-lg mb-1 truncate group-hover:text-primary transition-colors">
                    {channel.name}
                  </h3>
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-500"></span>
                    {channel.language === 'fas' ? 'فارسی' : 
                     channel.language === 'eng' ? 'انگلیسی' : 
                     channel.language === 'ara' ? 'عربی' : 'نامشخص'}
                  </p>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>

        {filteredChannels.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 text-muted-foreground">
              <Tv2 className="w-full h-full" />
            </div>
            <p className="text-xl text-muted-foreground">کانالی یافت نشد</p>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={() => setSearchQuery('')}
            >
              پاک کردن جستجو
            </Button>
          </div>
        )}
      </div>
    </main>
  );
}