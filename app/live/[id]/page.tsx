'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { 
  ChevronLeft, 
  Volume2, 
  VolumeX, 
  Maximize2, 
  Minimize2,
  Radio,
  Loader2
} from 'lucide-react';
import Hls from 'hls.js';
import { motion, AnimatePresence } from 'framer-motion';

interface Channel {
  nanoid: string;
  name: string;
  iptv_urls: string[];
  youtube_urls: string[];
  language: string;
  country: string;
  isGeoBlocked: boolean;
}

export default function LivePage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const selectedCountry = searchParams.get('c') || 'ir';
  const router = useRouter();
  const [channel, setChannel] = useState<Channel | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [currentQuality, setCurrentQuality] = useState('auto');
  const [isBuffering, setIsBuffering] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout>();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchChannel = async () => {
      try {
        const response = await fetch(`https://raw.githubusercontent.com/TVGarden/tv-garden-channel-list/refs/heads/main/channels/raw/countries/${selectedCountry}.json`);
        if (!response.ok) {
          throw new Error('Failed to fetch channels');
        }
        const data = await response.json();
        const foundChannel = data.find((ch: Channel) => ch.nanoid === params.id);
        
        if (foundChannel) {
          setChannel(foundChannel);
        } else {
          router.push('/tv');
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading channel:', error);
        setIsLoading(false);
      }
    };

    fetchChannel();
  }, [params.id, router, selectedCountry]);

  useEffect(() => {
    if (!channel || !videoRef.current) return;

    const video = videoRef.current;
    const streamUrl = channel.iptv_urls[0];

    // Validate stream URL before attempting to load
    if (!streamUrl) {
      setError('آدرس پخش زنده در دسترس نیست');
      setIsLoading(false);
      return;
    }

    if (Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90
      });

      hlsRef.current = hls;

      try {
        hls.loadSource(streamUrl);
        hls.attachMedia(video);
        
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          video.play().catch(error => {
            console.log("Auto-play was prevented:", error);
            setError('خطا در پخش خودکار ویدیو');
          });
        });

        hls.on(Hls.Events.ERROR, (event, data) => {
          if (data.fatal) {
            console.error('Fatal HLS error:', data);
            setError('خطا در بارگذاری پخش زنده');
            setIsLoading(false);
          }
        });

        hls.on(Hls.Events.BUFFER_APPENDING, () => {
          setIsBuffering(true);
        });

        hls.on(Hls.Events.FRAG_BUFFERED, () => {
          setIsBuffering(false);
        });
      } catch (error) {
        console.error('Error initializing HLS:', error);
        setError('خطا در راه‌اندازی پخش زنده');
        setIsLoading(false);
      }

      return () => {
        hls.destroy();
      };
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = streamUrl;
      video.play().catch(error => {
        console.log("Auto-play was prevented:", error);
        setError('خطا در پخش خودکار ویدیو');
      });
    }
  }, [channel]);

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;

    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(err => {
        console.log(`Error attempting to enable fullscreen: ${err.message}`);
      });
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = setTimeout(() => {
      setShowControls(false);
    }, 3000);
  };

  if (error) {
    return (
      <main className="fixed inset-0 bg-background flex flex-col items-center justify-center">
        <div className="text-center">
          <p className="text-2xl mb-4 text-destructive">خطا در پخش</p>
          <p className="text-muted-foreground mb-6">{error}</p>
          <div className="flex gap-4 justify-center">
            <Button 
              variant="outline" 
              onClick={() => {
                setError(null);
                setIsLoading(true);
                if (hlsRef.current) {
                  hlsRef.current.destroy();
                }
                if (videoRef.current) {
                  videoRef.current.src = '';
                }
                router.refresh();
              }}
            >
              تلاش مجدد
            </Button>
            <Link href={`/tv?c=${selectedCountry}`}>
              <Button variant="default">
                بازگشت به لیست کانال‌ها
              </Button>
            </Link>
          </div>
        </div>
      </main>
    );
  }

  if (isLoading) {
    return (
      <main className="fixed inset-0 bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Radio className="w-12 h-12 text-primary animate-pulse" />
          <p className="text-xl font-medium">در حال اتصال به پخش زنده...</p>
        </div>
      </main>
    );
  }

  if (!channel) {
    return (
      <main className="fixed inset-0 bg-background flex flex-col items-center justify-center">
        <p className="text-2xl mb-4">کانال یافت نشد</p>
        <Link href={`/tv?c=${selectedCountry}`}>
          <Button variant="default">
            بازگشت به لیست کانال‌ها
          </Button>
        </Link>
      </main>
    );
  }

  return (
    <main 
      ref={containerRef}
      className="fixed inset-0 bg-black"
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setShowControls(false)}
    >
      {/* Video Player */}
      <div className="absolute inset-0 flex items-center justify-center bg-black">
        <video
          ref={videoRef}
          className="w-full h-full"
          playsInline
          muted={isMuted}
          controls={false}
        />

        {/* Buffering Indicator */}
        <AnimatePresence>
          {isBuffering && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex items-center justify-center bg-black/50"
            >
              <Loader2 className="w-12 h-12 text-primary animate-spin" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Controls Overlay */}
        <AnimatePresence>
          {showControls && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/80"
            >
              {/* Top Controls */}
              <div className="absolute top-0 inset-x-0 p-4 flex justify-between items-center">
                <Link href={`/tv?c=${selectedCountry}`}>
                  <Button variant="ghost" className="text-white hover:bg-white/10">
                    <ChevronLeft className="h-5 w-5 ml-2" />
                    بازگشت
                  </Button>
                </Link>
                
                <h1 className="text-2xl font-bold text-white">
                  {channel.name}
                </h1>
              </div>

              {/* Bottom Controls */}
              <div className="absolute bottom-0 inset-x-0 p-6 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-12 w-12 rounded-full bg-black/40 backdrop-blur-sm border-white/10 text-white hover:bg-primary/80"
                    onClick={toggleMute}
                    title={isMuted ? "فعال کردن صدا" : "قطع صدا"}
                  >
                    {isMuted ? <VolumeX className="h-6 w-6" /> : <Volume2 className="h-6 w-6" />}
                  </Button>
                </div>

                <Button
                  variant="outline"
                  size="icon"
                  className="h-12 w-12 rounded-full bg-black/40 backdrop-blur-sm border-white/10 text-white hover:bg-primary/80"
                  onClick={toggleFullscreen}
                  title={isFullscreen ? "خروج از تمام صفحه" : "نمایش تمام صفحه"}
                >
                  {isFullscreen ? (
                    <Minimize2 className="h-6 w-6" />
                  ) : (
                    <Maximize2 className="h-6 w-6" />
                  )}
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
} 