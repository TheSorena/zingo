'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Download, ExternalLink, Pause, Play, Volume2, VolumeX } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { Skeleton } from '../../components/ui/skeleton';

interface ExploreItem {
  type: 'video' | 'image';
  src: string;
  description: string;
  link: string;
}

interface ExploreContentProps {
  content: ExploreItem[];
}

export function ExploreContent({ content }: ExploreContentProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  const activeItem = content[activeIndex];
  
  const handleNext = () => {
    setActiveIndex((prev) => (prev + 1) % content.length);
  };

  const handlePrev = () => {
    setActiveIndex((prev) => (prev - 1 + content.length) % content.length);
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

  useEffect(() => {
    // Reset video state when activeIndex changes
    setIsPlaying(false);
    setIsLoading(true);
    
    // Auto-play video when it's a video item
    if (activeItem?.type === 'video' && videoRef.current) {
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

  // If no content is available
  if (!content || content.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-lg text-muted-foreground">محتوایی برای نمایش وجود ندارد</p>
      </div>
    );
  }

  return (
    <div className="relative mx-auto max-w-4xl">
      {/* Main Content */}
      <Card className="rounded-xl overflow-hidden bg-black/5 backdrop-blur-sm border-2 border-white/10">
        <div className="relative aspect-[9/16] md:aspect-video w-full">
          <AnimatePresence mode="wait">
            {activeItem.type === 'video' ? (
              <motion.div
                key={`video-${activeIndex}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
                className="h-full w-full"
              >
                {isLoading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                    <Skeleton className="h-full w-full absolute" />
                  </div>
                )}
                <video
                  ref={videoRef}
                  src={activeItem.src}
                  className="h-full w-full object-contain"
                  playsInline
                  muted={isMuted}
                  loop
                  onPlay={() => handleVideoStateChange()}
                  onPause={() => handleVideoStateChange()}
                  onLoadedData={() => setIsLoading(false)}
                />
              </motion.div>
            ) : (
              <motion.div
                key={`image-${activeIndex}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
                className="relative h-full w-full"
              >
                {isLoading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                    <Skeleton className="h-full w-full absolute" />
                  </div>
                )}
                <Image
                  src={activeItem.src}
                  alt={activeItem.description}
                  fill
                  sizes="(max-width: 768px) 100vw, 800px"
                  className="object-contain"
                  onLoad={() => setIsLoading(false)}
                  priority
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Video Controls */}
          {activeItem.type === 'video' && (
            <div className="absolute bottom-4 left-4 flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                className="h-10 w-10 rounded-full bg-black/50 backdrop-blur-sm border-white/20 text-white hover:bg-black/70 hover:text-white"
                onClick={togglePlay}
              >
                {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-10 w-10 rounded-full bg-black/50 backdrop-blur-sm border-white/20 text-white hover:bg-black/70 hover:text-white"
                onClick={toggleMute}
              >
                {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
              </Button>
            </div>
          )}

          {/* Navigation Arrows */}
          <Button
            variant="outline"
            size="icon"
            className="absolute left-2 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full bg-black/50 backdrop-blur-sm border-white/20 text-white hover:bg-black/70 hover:text-white z-10"
            onClick={handlePrev}
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>
          
          <Button
            variant="outline"
            size="icon" 
            className="absolute right-2 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full bg-black/50 backdrop-blur-sm border-white/20 text-white hover:bg-black/70 hover:text-white z-10"
            onClick={handleNext}
          >
            <ChevronRight className="h-6 w-6" />
          </Button>

          {/* Download Button */}
          <Button
            variant="outline"
            size="icon"
            className="absolute top-4 left-4 h-10 w-10 rounded-full bg-black/50 backdrop-blur-sm border-white/20 text-white hover:bg-black/70 hover:text-white"
            onClick={handleDownload}
          >
            <Download className="h-5 w-5" />
          </Button>
          
          {/* Link Button */}
          <Link href={activeItem.link} target="_blank" rel="noopener noreferrer">
            <Button
              variant="outline"
              size="icon"
              className="absolute top-4 right-4 h-10 w-10 rounded-full bg-black/50 backdrop-blur-sm border-white/20 text-white hover:bg-black/70 hover:text-white"
            >
              <ExternalLink className="h-5 w-5" />
            </Button>
          </Link>

          {/* Description */}
          <div className="absolute bottom-0 inset-x-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
            <p className="text-white text-shadow-sm whitespace-pre-line">
              {activeItem.description}
            </p>
          </div>
        </div>
      </Card>

      {/* Thumbnails */}
      <div className="mt-4 flex gap-2 overflow-x-auto pb-2 snap-x">
        {content.map((item, index) => (
          <button
            key={index}
            className={`flex-shrink-0 w-20 h-20 snap-start rounded-md overflow-hidden border-2 transition-all ${
              index === activeIndex
                ? 'border-primary ring-2 ring-primary/50'
                : 'border-transparent opacity-70 hover:opacity-100'
            }`}
            onClick={() => setActiveIndex(index)}
          >
            {item.type === 'video' ? (
              <div className="relative h-full w-full">
                <video
                  src={item.src}
                  className="h-full w-full object-cover"
                  muted
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                  <Play className="h-6 w-6 text-white" />
                </div>
              </div>
            ) : (
              <div className="relative h-full w-full">
                <Image
                  src={item.src}
                  alt={item.description}
                  fill
                  sizes="80px"
                  className="object-cover"
                />
              </div>
            )}
          </button>
        ))}
      </div>

      {/* Progress Indicator */}
      <div className="mt-4 flex justify-center gap-1.5">
        {content.map((_, index) => (
          <button
            key={index}
            className={`w-2 h-2 rounded-full transition-all ${
              index === activeIndex ? 'bg-primary w-4' : 'bg-gray-400/50'
            }`}
            onClick={() => setActiveIndex(index)}
          />
        ))}
      </div>
    </div>
  );
} 