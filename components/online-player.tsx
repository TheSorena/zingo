'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { Play, Loader2, AlertTriangle, RefreshCw } from 'lucide-react';

interface PlayerSource {
  id?: number;
  quality: string | null;
  type: string;
  url: string;
}

interface OnlinePlayerProps {
  title: string;
  poster?: string;
  sources: PlayerSource[];
  storageKey: string;
}

const proxyUrl = (url: string) =>
  `https://http-video.liara.run/?url=${encodeURIComponent(url)}`;

export function OnlinePlayer({ title, poster, sources, storageKey }: OnlinePlayerProps) {
  const playable = sources.filter(
    (s) => s.url && /\.(mp4|mkv|webm|mov|m3u8)(\?|$)/i.test(s.url) &&
      !(s.quality || '').includes('تیزر')
  );

  const pickDefault = (): PlayerSource | null => {
    if (!playable.length) return null;
    const mp4 = playable.find((s) => s.type?.toLowerCase().includes('mp4') || /\.mp4(\?|$)/i.test(s.url));
    if (mp4) return mp4;
    const q720 = playable.find((s) => (s.quality || '').includes('720'));
    return q720 || playable[0];
  };

  const [active, setActive] = useState<PlayerSource | null>(() => pickDefault());
  const [useProxy, setUseProxy] = useState(false);
  const [failed, setFailed] = useState(false);
  const [buffering, setBuffering] = useState(false);
  const [started, setStarted] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const lastSavedRef = useRef(0);
  const resumeAtRef = useRef(0);

  // Reset when switching content
  useEffect(() => {
    setActive(pickDefault());
    setUseProxy(false);
    setFailed(false);
    setStarted(false);
    try {
      const saved = parseFloat(localStorage.getItem(`zingo-pos:${storageKey}`) || '0');
      resumeAtRef.current = saved > 30 ? saved : 0;
    } catch {
      resumeAtRef.current = 0;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storageKey]);

  const src = active ? (useProxy ? proxyUrl(active.url) : ensureHttps(active.url)) : '';

  const handleError = useCallback(() => {
    if (active && !useProxy) {
      setUseProxy(true);
      setBuffering(true);
    } else {
      setFailed(true);
      setBuffering(false);
    }
  }, [active, useProxy]);

  const switchQuality = (s: PlayerSource) => {
    let t = 0;
    try {
      if (videoRef.current) t = videoRef.current.currentTime;
    } catch {}
    setActive(s);
    setFailed(false);
    setBuffering(true);
    requestAnimationFrame(() => {
      if (t > 0 && videoRef.current) {
        const seek = () => {
          videoRef.current!.currentTime = t;
          videoRef.current!.removeEventListener('loadedmetadata', seek);
        };
        videoRef.current.addEventListener('loadedmetadata', seek);
      }
    });
  };

  const onLoadedMetadata = () => {
    if (resumeAtRef.current > 0 && videoRef.current) {
      const d = videoRef.current.duration;
      if (!isNaN(d) && resumeAtRef.current < d - 20) {
        videoRef.current.currentTime = resumeAtRef.current;
      } else {
        try { localStorage.removeItem(`zingo-pos:${storageKey}`); } catch {}
      }
      resumeAtRef.current = 0;
    }
  };

  const onTimeUpdate = () => {
    const v = videoRef.current;
    if (!v) return;
    const now = Date.now();
    if (now - lastSavedRef.current > 5000 && v.currentTime > 10) {
      lastSavedRef.current = now;
      try { localStorage.setItem(`zingo-pos:${storageKey}`, String(v.currentTime)); } catch {}
    }
  };

  const onEnded = () => {
    try { localStorage.removeItem(`zingo-pos:${storageKey}`); } catch {}
  };

  if (!playable.length) {
    return null;
  }

  return (
    <div className="glass rounded-3xl border border-border/60 overflow-hidden relative">
      <div className="absolute -top-10 -left-10 h-32 w-32 rounded-full bg-primary/10 blur-2xl pointer-events-none z-0" />
      <div className="relative p-4 md:p-5">
        <h2 className="relative pr-4 text-lg font-bold mb-4 text-foreground before:absolute before:right-0 before:top-1/2 before:-translate-y-1/2 before:h-5 before:w-1.5 before:rounded-full before:bg-gradient-to-b before:from-amber-400 before:to-rose-500 flex items-center gap-2">
          پخش آنلاین
          <span className="text-[10px] font-medium bg-gradient-to-l from-amber-500/15 to-rose-500/15 ring-1 ring-primary/25 text-amber-400 rounded-full px-2 py-0.5">زینگو استریم</span>
        </h2>

        {/* Quality Chips */}
        <div className="flex flex-wrap items-center gap-2 mb-3">
          {playable.map((s) => (
            <button
              key={s.id ?? s.url}
              onClick={() => switchQuality(s)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all duration-300 ring-1 ${
                active?.url === s.url
                  ? 'bg-gradient-to-l from-amber-500 to-rose-500 text-white shadow-lg shadow-primary/30 ring-transparent'
                  : 'bg-secondary/50 text-muted-foreground hover:bg-secondary/80 hover:text-foreground ring-border/50'
              }`}
            >
              {(s.quality || 'کیفیت').replace('کیفیت', '').trim() || 'پخش'}
            </button>
          ))}
        </div>

        <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-black/70 ring-1 ring-border/40 group">
          {!started && !failed && (
            <button
              onClick={() => {
                setStarted(true);
                setBuffering(true);
              }}
              className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-4 bg-gradient-to-b from-black/60 via-black/40 to-black/70"
            >
              {poster && (
                <img
                  src={poster}
                  alt={title}
                  className="absolute inset-0 w-full h-full object-cover opacity-40"
                />
              )}
              <span className="relative flex h-20 w-20 items-center justify-center">
                <span className="absolute inset-0 rounded-full bg-gradient-to-l from-amber-400 to-rose-500 opacity-30 blur-md animate-pulse" />
                <span className="relative h-16 w-16 rounded-full bg-gradient-to-l from-amber-500 to-rose-500 flex items-center justify-center shadow-2xl shadow-primary/40 transition-transform duration-300 group-hover:scale-105">
                  <Play className="h-7 w-7 fill-current text-white mr-1" />
                </span>
              </span>
              <span className="relative text-sm font-bold text-white drop-shadow">پخش {title}</span>
            </button>
          )}

          {started && !failed && (
            <>
              <video
                ref={videoRef}
                key={src}
                src={src}
                poster={poster}
                controls
                controlsList="nodownload"
                disablePictureInPicture={false}
                playsInline
                preload="metadata"
                className="w-full h-full"
                onLoadedMetadata={onLoadedMetadata}
                onTimeUpdate={onTimeUpdate}
                onEnded={onEnded}
                onWaiting={() => setBuffering(true)}
                onPlaying={() => setBuffering(false)}
                onCanPlay={() => setBuffering(false)}
                onError={handleError}
              />
              {buffering && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <Loader2 className="h-12 w-12 text-amber-400 animate-spin drop-shadow-lg" />
                </div>
              )}
            </>
          )}

          {failed && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-center px-6 bg-black/60">
              <AlertTriangle className="h-10 w-10 text-amber-400" />
              <p className="text-sm text-white font-bold">پخش این کیفیت ممکن نیست</p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                کیفیت دیگری را امتحان کنید یا فیلم را دانلود کنید
              </p>
              <button
                onClick={() => {
                  setFailed(false);
                  setStarted(false);
                  setUseProxy(false);
                  setActive(pickDefault());
                }}
                className="inline-flex items-center gap-1.5 mt-1 px-4 py-2 rounded-full bg-secondary/60 hover:bg-secondary text-xs font-bold text-foreground ring-1 ring-border/50 transition-colors"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                تلاش مجدد
              </button>
            </div>
          )}
        </div>

        <p className="text-[11px] text-muted-foreground mt-3 leading-relaxed">
          در صورت بافر شدن، چند لحظه صبر کنید یا کیفیت پایینتر را انتخاب کنید. محل تماشای شما بهصورت خودکار ذخیره میشود.
        </p>
      </div>
    </div>
  );
}

function ensureHttps(url: string): string {
  return url.startsWith('http://') ? url.replace('http://', 'https://') : url;
}