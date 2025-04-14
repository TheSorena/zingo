'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Download, ExternalLink, Pause, Play, Volume2, VolumeX, Share2, ChevronDown } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';

interface ExploreItem {
  type: 'video' | 'image';
  src: string;
  description: string;
  link: string;
}

export default function ExplorePage() {
  const [exploreContent, setExploreContent] = useState<ExploreItem[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [dataLoading, setDataLoading] = useState(true);
  const [isFirefoxMobile, setIsFirefoxMobile] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<Array<HTMLDivElement | null>>([]);

  const activeItem = exploreContent[activeIndex];

  // Check if user is on Firefox Mobile
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const userAgent = window.navigator.userAgent.toLowerCase();
      setIsFirefoxMobile(
        userAgent.includes('android') && 
        userAgent.includes('firefox') && 
        userAgent.includes('mobile')
      );
    }
  }, []);

  // Load data from explore.json
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('https://code3-dev.github.io/c-explore/api.json');
        if (!response.ok) {
          throw new Error('Failed to fetch explore content');
        }
        const data = await response.json();
        setExploreContent(data);
        setDataLoading(false);
        // Initialize the refs array once we have the data
        itemRefs.current = Array(data.length).fill(null);
      } catch (error) {
        console.error('Error loading explore content:', error);
        setDataLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const handleNext = () => {
    if (exploreContent.length) {
      setActiveIndex((prev) => (prev + 1) % exploreContent.length);
    }
  };

  const handlePrev = () => {
    if (exploreContent.length) {
      setActiveIndex((prev) => (prev - 1 + exploreContent.length) % exploreContent.length);
    }
  };

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleVideoStateChange = () => {
    if (videoRef.current) {
      setIsPlaying(!videoRef.current.paused);
    }
  };

  const handleDownload = () => {
    if (activeItem) {
      const a = document.createElement('a');
      a.href = activeItem.src;
      a.download = `cinemaplus-${activeItem.type}-${activeIndex + 1}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  const scrollToItem = (index: number) => {
    if (itemRefs.current[index]) {
      // Pause current video if it's playing
      if (activeItem?.type === 'video' && videoRef.current) {
        videoRef.current.pause();
      }
      
      // Change active index before scrolling
      setActiveIndex(index);
      
      itemRefs.current[index]?.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  useEffect(() => {
    if (!exploreContent.length) return;
    
    // Setup intersection observer to detect when items are in view
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = parseInt(entry.target.getAttribute('data-index') || '0');
            setActiveIndex(index);
          }
        });
      },
      { threshold: 0.7 } // Trigger when 70% of item is visible
    );

    // Observe all item refs
    itemRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => {
      itemRefs.current.forEach((ref) => {
        if (ref) observer.unobserve(ref);
      });
    };
  }, [exploreContent]);

  useEffect(() => {
    if (!activeItem) return;
    
    // Pause any previously playing videos
    const videos = document.querySelectorAll('video');
    videos.forEach(video => {
      if (video !== videoRef.current) {
        video.pause();
      }
    });
    
    // Reset video state when activeIndex changes
    setIsPlaying(true); // Default to playing
    setIsLoading(true);
    
    // Auto-play video when it's a video item
    if (activeItem?.type === 'video' && videoRef.current) {
      videoRef.current.volume = 1.0; // Set volume to 100%
      videoRef.current.muted = false; // Ensure sound is on
      videoRef.current.load();
      
      // Try to autoplay
      const playPromise = videoRef.current.play();
      
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsPlaying(true);
          })
          .catch(() => {
            // Autoplay was prevented, keep the current state
            setIsPlaying(false);
          });
      }
    }
  }, [activeIndex, activeItem]);

  if (dataLoading) {
    return (
      <main className="fixed inset-0 bg-black flex items-center justify-center">
        <div className="w-16 h-16 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
        <p className="ml-4 text-white text-xl font-medium">در حال بارگذاری...</p>
      </main>
    );
  }

  if (!exploreContent.length) {
    return (
      <main className="fixed inset-0 bg-black flex flex-col items-center justify-center">
        <div className="text-white text-2xl">محتوایی برای نمایش وجود ندارد</div>
        <Link href="/" className="mt-6">
          <Button variant="outline" className="text-white border-white hover:bg-white/10">
            بازگشت به خانه
          </Button>
        </Link>
      </main>
    );
  }

  return (
    <main className="fixed inset-0 bg-black overflow-hidden">
      {/* Explore Header - Floating */}
      <div className="fixed top-0 inset-x-0 z-40 p-4 flex justify-between items-center bg-gradient-to-b from-black/80 to-transparent pointer-events-none">
        <Link href="/" className="pointer-events-auto">
          <Button variant="ghost" className="text-white hover:bg-white/10 rounded-full px-4">
            <ChevronDown className="h-5 w-5 mr-1" />
            خانه
          </Button>
        </Link>
        
        <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-500 to-blue-500 bg-clip-text text-transparent">
          اکسپلور
        </h2>
        
        <div className="w-20"></div>
      </div>

      {/* Vertical Scroll Container */}
      <div 
        ref={containerRef}
        className="h-full w-full overflow-y-auto snap-y snap-mandatory"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {exploreContent.map((item, index) => (
          <div
            key={index}
            ref={el => itemRefs.current[index] = el}
            data-index={index}
            className="h-screen w-full snap-start snap-always relative"
          >
            {/* Media Container */}
            <div className="absolute inset-0 bg-black flex items-center justify-center">
              {item.type === 'video' ? (
                <video
                  ref={index === activeIndex ? videoRef : undefined}
                  src={item.src}
                  className="h-full w-full object-contain"
                  playsInline
                  muted={isMuted}
                  loop
                  autoPlay
                  onClick={togglePlay}
                  onPlay={() => index === activeIndex && handleVideoStateChange()}
                  onPause={() => index === activeIndex && handleVideoStateChange()}
                  onLoadedData={() => index === activeIndex && setIsLoading(false)}
                />
              ) : (
                <Image
                  src={item.src}
                  alt={item.description}
                  fill
                  sizes="100vw"
                  className="object-contain"
                  onLoad={() => index === activeIndex && setIsLoading(false)}
                  priority={index === activeIndex}
                />
              )}

              {/* Loading Indicator */}
              {index === activeIndex && isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-10">
                  <div className="w-16 h-16 rounded-full border-4 border-primary border-t-transparent animate-spin" />
                </div>
              )}

              {/* Video Controls - Only show for active video */}
              {index === activeIndex && item.type === 'video' && (
                <div className="absolute bottom-24 left-4 md:left-8 flex items-center gap-2 z-20">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-12 w-12 rounded-full bg-black/40 backdrop-blur-sm border-white/10 text-white hover:bg-primary/80"
                    onClick={togglePlay}
                  >
                    {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-12 w-12 rounded-full bg-black/40 backdrop-blur-sm border-white/10 text-white hover:bg-primary/80"
                    onClick={toggleMute}
                  >
                    {isMuted ? <VolumeX className="h-6 w-6" /> : <Volume2 className="h-6 w-6" />}
                  </Button>
                </div>
              )}

              {/* Side Action Bar - TikTok/YouTube Shorts Style */}
              <div className="absolute bottom-32 right-4 md:right-6 flex flex-col items-center gap-6 z-20">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-14 w-14 rounded-full bg-black/40 backdrop-blur-sm border-white/10 text-white hover:bg-black/60 transition-all duration-300 mb-3"
                  onClick={handleDownload}
                >
                  <Download className="h-7 w-7" />
                  <span className="absolute -bottom-6 text-xs text-white">دانلود</span>
                </Button>
                
                <Link 
                  href={item.link} 
                  target={isFirefoxMobile ? "_self" : "_blank"} 
                  rel={isFirefoxMobile ? "" : "noopener noreferrer"}
                >
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-14 w-14 rounded-full bg-black/40 backdrop-blur-sm border-white/10 text-white hover:bg-primary/70 transition-all duration-300 mb-12"
                  >
                    <ExternalLink className="h-7 w-7" />
                    <span className="absolute -bottom-6 text-xs text-white">مشاهده</span>
                  </Button>
                </Link>
              </div>

              {/* Description */}
              <div className="absolute bottom-0 inset-x-0 p-6 bg-gradient-to-t from-black via-black/80 to-transparent pt-24 z-10">
                <div className="max-w-[80%]">
                  <p className="text-white text-xl font-bold mb-2 whitespace-pre-line">
                    {item.description}
                  </p>
                  <p className="text-white/70 text-sm">
                    برای مشاهده جزئیات بیشتر روی آیکون لینک کلیک کنید
                  </p>
                </div>
              </div>

              {/* Swipe Indicator - Show only for first item */}
              {index === 0 && (
                <div className="absolute bottom-20 left-1/2 -translate-x-1/2 text-white/80 flex flex-col items-center animate-bounce">
                  <ChevronDown className="h-6 w-6" />
                  <span className="text-xs mt-1">برای مشاهده بیشتر به پایین بکشید</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Progress Indicator - Only show if there are multiple items */}
      {exploreContent.length > 1 && (
        <div className="fixed top-16 right-4 z-30 flex flex-col gap-2 items-center">
          {exploreContent.map((_, index) => (
            <button
              key={index}
              className={`w-2 h-8 rounded-full transition-all ${
                index === activeIndex ? 'bg-primary' : 'bg-white/30'
              }`}
              onClick={() => scrollToItem(index)}
            />
          ))}
        </div>
      )}
    </main>
  );
} 