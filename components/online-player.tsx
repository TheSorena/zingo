'use client';

import { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import {
  Play,
  Loader2,
  AlertTriangle,
  RefreshCw,
  Copy,
  Download,
  Clapperboard,
  ExternalLink,
  Info,
} from 'lucide-react';
import { Button } from './ui/button';
import {
  isWebView,
  getDeviceType,
  triggerDownload,
} from '../lib/utils';
import { needsExternalPlayer, copyText, describeSource } from './source-row';

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

type FailKind = 'network' | 'unsupported' | 'unknown';

const proxyUrl = (url: string) =>
  `https://http-video.liara.run/?url=${encodeURIComponent(url)}`;

function scoreSource(s: PlayerSource): number {
  const q = (s.quality || '').toLowerCase();
  const u = (s.url || '').toLowerCase();
  const t = (s.type || '').toLowerCase();
  let sc = 0;
  if (/\.mp4(\?|$)/.test(u) || t.includes('mp4')) sc += 4;
  if (/\.webm(\?|$)/.test(u)) sc += 2;
  if (/x265|hevc/.test(q + u)) sc -= 5;
  if (/\.mkv(\?|$)/.test(u) || t === 'mkv') sc -= 2;
  if (/720/.test(q)) sc += 2;
  else if (/480/.test(q)) sc += 1;
  if (/تیزر/.test(q)) sc -= 10;
  return sc;
}

function mxPlayerIntent(url: string, title: string): string {
  const m = /^(https?):\/\/(.*)$/i.exec(url);
  if (!m) return url;
  return `intent://${m[2]}#Intent;scheme=${m[1].toLowerCase()};package=com.mxtech.videoplayer.ad;S.title=${encodeURIComponent(title)};end`;
}

// NOTE: sources live on plain-http file servers; forcing https breaks them.
// Inside the Android WebView we enable mixed-content compatibility mode,
// so the original scheme must be preserved here.
export function OnlinePlayer({ title, poster, sources, storageKey }: OnlinePlayerProps) {
  const playable = useMemo(
    () =>
      (sources || [])
        .filter(
          (s) =>
            s.url &&
            /\.(mp4|mkv|webm|mov|m3u8)(\?|$)/i.test(s.url) &&
            !(s.quality || '').includes('تیزر')
        )
        .sort((a, b) => scoreSource(b) - scoreSource(a)),
    [sources]
  );

  const [active, setActive] = useState<PlayerSource | null>(() => playable[0] || null);
  const [useProxy, setUseProxy] = useState(false);
  const [failKind, setFailKind] = useState<FailKind | null>(null);
  const [buffering, setBuffering] = useState(false);
  const [started, setStarted] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const lastSavedRef = useRef(0);
  const resumeAtRef = useRef(0);

  // Reset when switching content
  useEffect(() => {
    setActive(playable[0] || null);
    setUseProxy(false);
    setFailKind(null);
    setStarted(false);
    try {
      const saved = parseFloat(localStorage.getItem(`zingo-pos:${storageKey}`) || '0');
      resumeAtRef.current = saved > 30 ? saved : 0;
    } catch {
      resumeAtRef.current = 0;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storageKey]);

  const src = active ? (useProxy ? proxyUrl(active.url) : active.url) : '';
  const isMixedBlocked =
    typeof window !== 'undefined' &&
    window.location.protocol === 'https:' &&
    !!active?.url?.startsWith('http:') &&
    !useProxy &&
    !isWebView();

  const handleError = useCallback(() => {
    let code = 0;
    try {
      code = videoRef.current?.error?.code || 0;
    } catch {}
    if (code === 2 || code === 1) {
      // network/aborted: retry once through the proxy host
      if (active && !useProxy) {
        setUseProxy(true);
        setBuffering(true);
        return;
      }
      setFailKind('network');
    } else if (code === 4) {
      setFailKind('unsupported');
    } else if (code === 3) {
      setFailKind('unsupported');
    } else {
      if (active && !useProxy) {
        setUseProxy(true);
        setBuffering(true);
        return;
      }
      setFailKind('unknown');
    }
    setBuffering(false);
  }, [active, useProxy]);

  const switchQuality = (s: PlayerSource) => {
    let t = 0;
    try {
      if (videoRef.current) t = videoRef.current.currentTime;
    } catch {}
    setActive(s);
    setUseProxy(false);
    setFailKind(null);
    setBuffering(true);
    requestAnimationFrame(() => {
      if (t > 0 && videoRef.current) {
        const seek = () => {
          try {
            videoRef.current!.currentTime = t;
          } catch {}
          videoRef.current!.removeEventListener('loadedmetadata', seek);
        };
        videoRef.current.addEventListener('loadedmetadata', seek);
      }
    });
  };

  const retry = () => {
    setFailKind(null);
    setUseProxy(false);
    setStarted(false);
    setBuffering(false);
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

  const showMx = getDeviceType() === 'android';
  const failTitle =
    failKind === 'network'
      ? 'اتصال به سرور فایل برقرار نشد'
      : failKind === 'unsupported'
        ? 'مرورگر نمی‌تواند این فرمت را پخش کند'
        : 'پخش این کیفیت ممکن نیست';

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
          {playable.map((s) => {
            const label = describeSource(s).label;
            const ext = needsExternalPlayer(s);
            return (
              <button
                key={s.id ?? s.url}
                onClick={() => switchQuality(s)}
                title={ext ? 'احتمالاً فقط با VLC پخش می‌شود' : label}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all duration-300 ring-1 flex items-center gap-1.5 ${
                  active?.url === s.url
                    ? 'bg-gradient-to-l from-amber-500 to-rose-500 text-white shadow-lg shadow-primary/30 ring-transparent'
                    : 'bg-secondary/50 text-muted-foreground hover:bg-secondary/80 hover:text-foreground ring-border/50'
                }`}
              >
                {label}
                {ext && (
                  <span
                    className={`rounded-full px-1.5 py-px text-[9px] ${
                      active?.url === s.url ? 'bg-white/25 text-white' : 'bg-amber-500/15 text-amber-400'
                    }`}
                  >
                    VLC
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-black/70 ring-1 ring-border/40 group">
          {!started && !failKind && (
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
              {active && needsExternalPlayer(active) && (
                <span className="relative text-[11px] text-amber-300/90">
                  این کیفیت در مرورگر پخش نمی‌شود — با VLC تماشا کنید
                </span>
              )}
            </button>
          )}

          {started && !failKind && (
            <>
              <video
                ref={videoRef}
                key={src}
                src={src}
                poster={poster}
                controls
                controlsList="nodownload"
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

          {failKind && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2.5 text-center px-5 py-4 bg-black/70 overflow-y-auto">
              <AlertTriangle className="h-9 w-9 text-amber-400 shrink-0" />
              <p className="text-sm text-white font-bold">{failTitle}</p>
              {isMixedBlocked ? (
                <p className="text-[11px] text-amber-200/90 leading-relaxed max-w-md">
                  مرورگر شما اجازه پخش مستقیم فایل‌های رمزنگاری‌نشده (http) را در صفحه امن نمی‌دهد.
                  لینک را کپی کنید یا با VLC / MX Player تماشا کنید.
                </p>
              ) : (
                <p className="text-[11px] text-muted-foreground leading-relaxed max-w-md">
                  کیفیت دیگری را امتحان کنید یا از روش‌های زیر برای تماشا استفاده کنید
                </p>
              )}
              <div className="flex flex-wrap items-center justify-center gap-2 mt-1">
                <Button
                  onClick={retry}
                  size="sm"
                  className="rounded-full bg-gradient-to-l from-amber-500 to-rose-500 text-white text-xs font-bold"
                >
                  <RefreshCw className="ml-1.5 h-3.5 w-3.5" />
                  تلاش مجدد
                </Button>
                {active && (
                  <>
                    <Button
                      onClick={() => copyText(active.url)}
                      size="sm"
                      variant="outline"
                      className="rounded-full text-xs"
                    >
                      <Copy className="ml-1.5 h-3.5 w-3.5" />
                      کپی لینک
                    </Button>
                    <Button asChild size="sm" variant="outline" className="rounded-full text-xs">
                      <a
                        href={'vlc://' + active.url}
                        target={!isWebView() ? '_blank' : undefined}
                        rel="noopener noreferrer"
                      >
                        <Clapperboard className="ml-1.5 h-3.5 w-3.5" />
                        تماشا با VLC
                      </a>
                    </Button>
                    {showMx && (
                      <Button asChild size="sm" variant="outline" className="rounded-full text-xs">
                        <a
                          href={mxPlayerIntent(active.url, title)}
                          rel="noopener noreferrer"
                        >
                          <ExternalLink className="ml-1.5 h-3.5 w-3.5" />
                          MX Player
                        </a>
                      </Button>
                    )}
                    <Button
                      onClick={() => triggerDownload(active.url)}
                      size="sm"
                      variant="outline"
                      className="rounded-full text-xs"
                    >
                      <Download className="ml-1.5 h-3.5 w-3.5" />
                      دانلود
                    </Button>
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        <p className="text-[11px] text-muted-foreground mt-3 leading-relaxed flex items-start gap-1.5">
          <Info className="h-3.5 w-3.5 shrink-0 mt-px" />
          <span>
            بهترین کیفیت سازگار به‌صورت خودکار انتخاب می‌شود. کیفیت‌های دارای برچسب VLC (معمولاً x265 و MKV) در مرورگر پخش نمی‌شوند. محل تماشای شما ذخیره می‌شود.
          </span>
        </p>
      </div>
    </div>
  );
}
