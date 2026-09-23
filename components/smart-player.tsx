'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Play,
  Pause,
  Loader2,
  Maximize,
  Minimize,
  Volume2,
  VolumeX,
  RotateCcw,
  RotateCw,
  Captions,
  Upload,
} from 'lucide-react';
import {
  probeMkv,
  fetchSubtitleWindow,
  pickTrack,
  type MkvMeta,
} from '../lib/mkv-subs';

const metaCache = new Map<string, Promise<MkvMeta>>();

/**
 * Same-origin range fetch through /api/mkv-range so plain-http file hosts
 * are reachable without mixed-content blocks (WebView + browsers).
 */
async function apiRangeFetch(url: string, headers?: Record<string, string>): Promise<Response> {
  const m = /bytes=(\d+)-(\d+)/.exec(headers?.Range || '');
  const start = m ? Number(m[1]) : 0;
  const len = m ? Number(m[2]) - Number(m[1]) + 1 : 2 * 1024 * 1024;
  return fetch(
    `/api/mkv-range?url=${encodeURIComponent(url)}&start=${start}&len=${len}`
  );
}

interface SmartPlayerProps {
  src: string;
  title: string;
  poster?: string;
  storageKey: string;
  /** First error before any frame played (parent may switch source/proxy silently) */
  onFirstError: () => void;
  /** Fatal error before any frame played and parent already retried */
  onFatal: () => void;
}

const SPEEDS = [1, 1.25, 1.5, 2];

function fmt(t: number): string {
  if (!isFinite(t) || t < 0) t = 0;
  const h = Math.floor(t / 3600);
  const m = Math.floor((t % 3600) / 60);
  const s = Math.floor(t % 60);
  const mm = h > 0 ? String(m).padStart(2, '0') : String(m);
  const ss = String(s).padStart(2, '0');
  return h > 0 ? `${h}:${mm}:${ss}` : `${mm}:${ss}`;
}

/**
 * Dedicated Zingo player: custom smooth controls, safe fullscreen,
 * resume memory, subtitle (.srt/.vtt) upload, and glitch-free errors.
 * The <video> element stays mounted for life — source switches never
 * remount it, so exiting fullscreen or changing quality can't glitch.
 */
export function SmartPlayer({ src, title, poster, storageKey, onFirstError, onFatal }: SmartPlayerProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSavedRef = useRef(0);
  const resumeAtRef = useRef(0);
  const pendingSeekRef = useRef(0);
  const hasPlayedRef = useRef(false);
  const firstErrorFiredRef = useRef(false);
  const retryingRef = useRef(false);

  const [started, setStarted] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [buffering, setBuffering] = useState(false);
  const [controls, setControls] = useState(true);
  const [time, setTime] = useState(0);
  const [dur, setDur] = useState(0);
  const [buffered, setBuffered] = useState(0);
  const [muted, setMuted] = useState(false);
  const [vol, setVol] = useState(1);
  const [speedIdx, setSpeedIdx] = useState(0);
  const [isFs, setIsFs] = useState(false);
  const [seeking, setSeeking] = useState(false);
  const [seekVal, setSeekVal] = useState(0);
  const [flash, setFlash] = useState<string | null>(null);
  const [transient, setTransient] = useState(false);
  const [trackUrl, setTrackUrl] = useState<string | null>(null);
  const [ccOn, setCcOn] = useState(false);
  const [posterOk, setPosterOk] = useState(true);
  const [subAuto, setSubAuto] = useState<'idle' | 'loading' | 'on' | 'error'>('idle');
  const [subMsg, setSubMsg] = useState('');
  const [subCount, setSubCount] = useState(0);
  const flashTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // auto-subtitle internals (embedded MKV subs)
  const autoTrackRef = useRef<TextTrack | null>(null);
  const addedCuesRef = useRef<Set<string>>(new Set());
  const coveredRef = useRef({ from: 0, until: 0 });
  const fetchingRef = useRef(false);
  const metaRef = useRef<MkvMeta | null>(null);
  const trackNumRef = useRef(0);

  // Load saved position once per content
  useEffect(() => {
    hasPlayedRef.current = false;
    firstErrorFiredRef.current = false;
    retryingRef.current = false;
    pendingSeekRef.current = 0;
    try {
      const saved = parseFloat(localStorage.getItem(`zingo-pos:${storageKey}`) || '0');
      resumeAtRef.current = saved > 30 ? saved : 0;
    } catch {
      resumeAtRef.current = 0;
    }
    setStarted(false);
    setPlaying(false);
    setTime(0);
    setDur(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storageKey]);

  // Switch source imperatively — NEVER remount the video element
  useEffect(() => {
    const v = videoRef.current;
    if (!v || !src) return;
    // reset auto subtitles for the new source
    try {
      if (autoTrackRef.current) autoTrackRef.current.mode = 'disabled';
    } catch {}
    autoTrackRef.current = null;
    addedCuesRef.current = new Set();
    coveredRef.current = { from: 0, until: 0 };
    fetchingRef.current = false;
    metaRef.current = null;
    setSubAuto('idle');
    setSubMsg('');
    setSubCount(0);
    try {
      pendingSeekRef.current = v.currentTime > 5 ? v.currentTime : 0;
    } catch {
      pendingSeekRef.current = 0;
    }
    if (v.src !== src) {
      setBuffering(true);
      v.src = src;
      v.load();
      if (started) {
        v.play().catch(() => {});
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src]);

  const pokeControls = useCallback(() => {
    setControls(true);
    if (hideTimer.current) clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => {
      try {
        if (videoRef.current && !videoRef.current.paused) setControls(false);
      } catch {}
    }, 3200);
  }, []);

  useEffect(() => {
    pokeControls();
    return () => {
      if (hideTimer.current) clearTimeout(hideTimer.current);
    };
  }, [pokeControls]);

  // Sync fullscreen state (covers Fullscreen API + WebView custom view)
  useEffect(() => {
    const onFs = () => {
      try {
        setIsFs(!!document.fullscreenElement);
      } catch {
        setIsFs(false);
      }
    };
    document.addEventListener('fullscreenchange', onFs);
    return () => document.removeEventListener('fullscreenchange', onFs);
  }, []);

  const flashMsg = (msg: string) => {
    setFlash(msg);
    if (flashTimer.current) clearTimeout(flashTimer.current);
    flashTimer.current = setTimeout(() => setFlash(null), 800);
  };

  const togglePlay = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    if (!started) {
      setStarted(true);
      setBuffering(true);
      v.play().catch(() => setBuffering(false));
      pokeControls();
      return;
    }
    if (v.paused) {
      v.play().catch(() => {});
    } else {
      v.pause();
    }
    pokeControls();
  }, [started, pokeControls]);

  const seekBy = useCallback(
    (delta: number) => {
      const v = videoRef.current;
      if (!v || !started) return;
      try {
        v.currentTime = Math.max(0, Math.min(v.duration || 0, v.currentTime + delta));
        flashMsg(delta > 0 ? `+${delta} ثانیه` : `${delta} ثانیه`);
      } catch {}
      pokeControls();
    },
    [started, pokeControls]
  );

  const toggleFs = useCallback(() => {
    const el = wrapRef.current;
    if (!el) return;
    try {
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
      } else if (el.requestFullscreen) {
        el.requestFullscreen().catch(() => {
          // WebView without Fullscreen API: fall back to native video fullscreen
          const v = videoRef.current as any;
          if (v?.webkitEnterFullscreen) {
            try {
              v.webkitEnterFullscreen();
            } catch {}
          }
        });
      } else {
        const v = videoRef.current as any;
        if (v?.webkitEnterFullscreen) {
          try {
            v.webkitEnterFullscreen();
          } catch {}
        }
      }
    } catch {}
    pokeControls();
  }, [pokeControls]);

  const cycleSpeed = () => {
    const next = (speedIdx + 1) % SPEEDS.length;
    setSpeedIdx(next);
    try {
      if (videoRef.current) videoRef.current.playbackRate = SPEEDS[next];
    } catch {}
    flashMsg(`سرعت ${SPEEDS[next]}x`);
    pokeControls();
  };

  const toggleMute = () => {
    const v = videoRef.current;
    if (!v) return;
    try {
      v.muted = !v.muted;
      setMuted(v.muted);
    } catch {}
    pokeControls();
  };

  const applyTrackMode = (on: boolean) => {
    try {
      const v = videoRef.current;
      if (v && v.textTracks && v.textTracks.length > 0) {
        for (let i = 0; i < v.textTracks.length; i++) {
          v.textTracks[i].mode = on && i === v.textTracks.length - 1 ? 'showing' : 'disabled';
        }
      }
    } catch {}
  };

  const onSubtitleFile = (file: File | undefined) => {
    if (!file) return;
    try {
      if (trackUrl) URL.revokeObjectURL(trackUrl);
      const url = URL.createObjectURL(file);
      setTrackUrl(url);
      setCcOn(true);
      // apply after track element mounts
      setTimeout(() => applyTrackMode(true), 300);
      flashMsg('زیرنویس اضافه شد');
    } catch {}
    pokeControls();
  };

  const toggleCc = () => {
    if (!trackUrl) return;
    const next = !ccOn;
    setCcOn(next);
    applyTrackMode(next);
    pokeControls();
  };

  // ---- auto subtitles (embedded MKV SoftSub) ----
  const addAutoCues = useCallback((cues: { start: number; end: number; text: string }[]) => {
    const v = videoRef.current;
    const track = autoTrackRef.current;
    if (!v || !track) return;
    let added = 0;
    for (const c of cues) {
      const key = `${c.start.toFixed(1)}|${c.text.slice(0, 24)}`;
      if (addedCuesRef.current.has(key)) continue;
      addedCuesRef.current.add(key);
      try {
        track.addCue(new VTTCue(c.start, Math.max(c.end, c.start + 0.5), c.text));
        added++;
      } catch {}
    }
    if (added > 0) {
      setSubCount((n) => n + added);
      try {
        track.mode = 'showing';
      } catch {}
    }
  }, []);

  const fetchWindowAt = useCallback(
    async (t: number) => {
      const v = videoRef.current;
      if (!v || !src || fetchingRef.current || !autoTrackRef.current || !metaRef.current) return;
      fetchingRef.current = true;
      try {
        const w = await fetchSubtitleWindow(src, metaRef.current, trackNumRef.current, t, 180, apiRangeFetch);
        addAutoCues(w.cues.filter((c) => c.start >= t - 15));
        coveredRef.current = {
          from: Math.min(coveredRef.current.from || Infinity, t),
          until: Math.max(coveredRef.current.until, w.coveredUntilMs / 1000),
        };
      } catch {
        // keep what we have; next timeupdate will retry once playback advances
      } finally {
        fetchingRef.current = false;
      }
    },
    [src, addAutoCues]
  );

  const maybeFetchMore = useCallback(
    (t: number) => {
      if (subAuto !== 'on') return;
      const { from, until } = coveredRef.current;
      if (until === 0 || t < from - 5 || t > until - 45) {
        void fetchWindowAt(t);
      }
    },
    [subAuto, fetchWindowAt]
  );

  const enableAutoSubs = useCallback(async () => {
    const v = videoRef.current;
    if (!v || !src || subAuto === 'loading' || subAuto === 'on') return;
    setSubAuto('loading');
    setSubMsg('در حال آماده‌سازی زیرنویس...');
    pokeControls();
    try {
      let p = metaCache.get(src);
      if (!p) {
        p = probeMkv(src, apiRangeFetch);
        metaCache.set(src, p);
      }
      const meta = await p;
      const track = pickTrack(meta.tracks);
      if (!track) throw new Error('notrack');
      metaRef.current = meta;
      trackNumRef.current = track.num;
      if (!autoTrackRef.current) {
        try {
          autoTrackRef.current = v.addTextTrack('subtitles', 'فارسی', 'fa');
          autoTrackRef.current.mode = 'showing';
        } catch {
          throw new Error('track');
        }
      } else {
        try {
          autoTrackRef.current.mode = 'showing';
        } catch {}
      }
      coveredRef.current = { from: 0, until: 0 };
      await fetchWindowAt(v.currentTime || 0);
      if (addedCuesRef.current.size === 0) {
        // try a later window before giving up (subs may start late)
        await fetchWindowAt(Math.max(60, v.currentTime || 0) + 300);
      }
      if (addedCuesRef.current.size === 0) throw new Error('empty');
      setSubAuto('on');
      setSubMsg('');
      flashMsg('زیرنویس فارسی فعال شد');
    } catch (e) {
      const msg = (e as Error)?.message;
      setSubAuto('error');
      setSubMsg(
        msg === 'notrack'
          ? 'زیرنویس داخلی در این فایل پیدا نشد'
          : 'خطا در خواندن زیرنویس — فایل .srt آپلود کنید'
      );
      setTimeout(() => {
        setSubAuto((s) => (s === 'error' ? 'idle' : s));
        setSubMsg('');
      }, 4000);
    }
    pokeControls();
  }, [src, subAuto, fetchWindowAt, pokeControls]);

  const disableAutoSubs = useCallback(() => {
    try {
      if (autoTrackRef.current) autoTrackRef.current.mode = 'disabled';
    } catch {}
    setSubAuto('idle');
    setSubMsg('');
    pokeControls();
  }, [pokeControls]);

  // ---- video events ----
  const onLoadedMetadata = () => {
    const v = videoRef.current;
    if (!v) return;
    try {
      setDur(v.duration || 0);
      let target = 0;
      if (pendingSeekRef.current > 0) {
        target = pendingSeekRef.current;
        pendingSeekRef.current = 0;
      } else if (resumeAtRef.current > 0) {
        target = resumeAtRef.current;
        resumeAtRef.current = 0;
      }
      const d = v.duration;
      if (target > 0 && isFinite(d) && target < d - 20) {
        v.currentTime = target;
      } else if (resumeAtRef.current !== 0 || target === 0) {
        try {
          localStorage.removeItem(`zingo-pos:${storageKey}`);
        } catch {}
      }
    } catch {}
  };

  const onTimeUpdate = () => {
    const v = videoRef.current;
    if (!v || seeking) return;
    try {
      setTime(v.currentTime);
      maybeFetchMore(v.currentTime);
      const now = Date.now();
      if (now - lastSavedRef.current > 5000 && v.currentTime > 10) {
        lastSavedRef.current = now;
        try {
          localStorage.setItem(`zingo-pos:${storageKey}`, String(v.currentTime));
        } catch {}
      }
    } catch {}
  };

  const onProgress = () => {
    const v = videoRef.current;
    if (!v) return;
    try {
      if (v.buffered.length > 0 && v.duration > 0) {
        setBuffered((v.buffered.end(v.buffered.length - 1) / v.duration) * 100);
      }
    } catch {}
  };

  const onPlaying = () => {
    hasPlayedRef.current = true;
    setPlaying(true);
    setBuffering(false);
    setTransient(false);
    retryingRef.current = false;
  };

  const onPause = () => setPlaying(false);
  const onWaiting = () => setBuffering(true);
  const onCanPlay = () => setBuffering(false);

  const onEnded = () => {
    setPlaying(false);
    setControls(true);
    try {
      localStorage.removeItem(`zingo-pos:${storageKey}`);
    } catch {}
  };

  const onSeeked = () => {
    try {
      if (videoRef.current) maybeFetchMore(videoRef.current.currentTime);
    } catch {}
  };

  const onVideoError = () => {
    setBuffering(false);
    // Already playing at some point → transient hiccup, never a fatal panel
    if (hasPlayedRef.current) {
      if (!retryingRef.current) {
        retryingRef.current = true;
        setTransient(true);
        try {
          const v = videoRef.current;
          if (v) {
            const t = v.currentTime;
            v.load();
            const seek = () => {
              try {
                if (t > 0) v.currentTime = t;
              } catch {}
              v.play().catch(() => {});
              v.removeEventListener('loadedmetadata', seek);
            };
            v.addEventListener('loadedmetadata', seek);
            setTimeout(() => {
              if (retryingRef.current) {
                retryingRef.current = false;
                setTransient(false);
              }
            }, 8000);
          }
        } catch {
          retryingRef.current = false;
          setTransient(false);
        }
      }
      return;
    }
    // Pre-play error: let parent try proxy once, else fatal
    if (!firstErrorFiredRef.current) {
      firstErrorFiredRef.current = true;
      onFirstError();
    } else {
      onFatal();
    }
  };

  const progress = dur > 0 ? (seeking ? (seekVal / dur) * 100 : (time / dur) * 100) : 0;

  return (
    <div
      ref={wrapRef}
      className="relative aspect-video w-full overflow-hidden rounded-2xl bg-black ring-1 ring-border/40 select-none"
      onMouseMove={pokeControls}
    >
      <video
        ref={videoRef}
        poster={undefined}
        controls={false}
        playsInline
        preload="metadata"
        className="h-full w-full"
        onLoadedMetadata={onLoadedMetadata}
        onTimeUpdate={onTimeUpdate}
        onProgress={onProgress}
        onPlaying={onPlaying}
        onPause={onPause}
        onWaiting={onWaiting}
        onCanPlay={onCanPlay}
        onEnded={onEnded}
        onSeeked={onSeeked}
        onError={onVideoError}
        onClick={togglePlay}
        onDoubleClick={toggleFs}
      >
        {trackUrl && (
          <track key={trackUrl} kind="subtitles" src={trackUrl} srcLang="fa" label="فارسی" default />
        )}
      </video>

      {/* Preview overlay (custom — never a broken poster) */}
      {!started && (
        <button
          onClick={togglePlay}
          className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-4 bg-gradient-to-b from-black/60 via-black/40 to-black/70"
        >
          {poster && posterOk ? (
            <img
              src={poster}
              alt={title}
              className="absolute inset-0 h-full w-full object-cover opacity-40"
              onError={() => setPosterOk(false)}
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/20 via-transparent to-rose-500/20" />
          )}
          <span className="relative flex h-20 w-20 items-center justify-center">
            <span className="absolute inset-0 rounded-full bg-gradient-to-l from-amber-400 to-rose-500 opacity-30 blur-md animate-pulse" />
            <span className="relative flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-l from-amber-500 to-rose-500 text-white shadow-2xl shadow-primary/40">
              <Play className="mr-1 h-7 w-7 fill-current" />
            </span>
          </span>
          <span className="relative px-4 text-sm font-bold text-white drop-shadow">پخش {title}</span>
        </button>
      )}

      {/* Side double-tap zones (±10s) once started */}
      {started && (
        <>
          <button
            aria-label="ده ثانیه عقب"
            onDoubleClick={() => seekBy(-10)}
            onClick={(e) => e.stopPropagation()}
            className="absolute inset-y-0 left-0 z-[5] w-1/4"
          />
          <button
            aria-label="ده ثانیه جلو"
            onDoubleClick={() => seekBy(10)}
            onClick={(e) => e.stopPropagation()}
            className="absolute inset-y-0 right-0 z-[5] w-1/4"
          />
        </>
      )}

      {/* Center flash (±10s / speed) */}
      {flash && (
        <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center">
          <span className="rounded-full bg-black/70 px-4 py-2 text-sm font-bold text-white ring-1 ring-white/20">
            {flash}
          </span>
        </div>
      )}

      {/* Buffering */}
      {started && buffering && (
        <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center">
          <Loader2 className="h-12 w-12 animate-spin text-amber-400 drop-shadow-lg" />
        </div>
      )}

      {/* Subtitle status line */}
      {started && subMsg && (
        <div className="absolute left-1/2 top-3 z-20 -translate-x-1/2">
          <span
            className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-bold ring-1 ${
              subAuto === 'error'
                ? 'bg-black/70 text-red-300 ring-red-400/30'
                : 'bg-black/70 text-amber-300 ring-amber-400/30'
            }`}
          >
            {subAuto === 'loading' && <Loader2 className="h-3 w-3 animate-spin" />}
            {subMsg}
          </span>
        </div>
      )}

      {/* Transient reconnect notice (never blocks playback) */}
      {transient && (
        <div className="absolute left-1/2 top-3 z-20 -translate-x-1/2">
          <span className="flex items-center gap-1.5 rounded-full bg-black/70 px-3 py-1.5 text-[11px] font-bold text-amber-300 ring-1 ring-amber-400/30">
            <Loader2 className="h-3 w-3 animate-spin" />
            در حال وصل مجدد...
          </span>
        </div>
      )}

      {/* Controls */}
      {started && (
        <div
          className={`absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-black/90 via-black/50 to-transparent px-3 pb-2.5 pt-10 transition-all duration-300 ${
            controls ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-2 opacity-0'
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Seek bar */}
          <div className="group/bar relative mb-1.5 flex h-5 items-center" dir="ltr">
            <div className="absolute h-1 w-full overflow-hidden rounded-full bg-white/20">
              <div
                className="h-full rounded-full bg-white/30"
                style={{ width: `${Math.min(100, buffered)}%` }}
              />
            </div>
            <div
              className="absolute h-1 rounded-full bg-gradient-to-l from-amber-400 to-rose-500"
              style={{ width: `${Math.min(100, progress)}%` }}
            />
            <div
              className="absolute h-3 w-3 rounded-full bg-white shadow transition-transform group-hover/bar:scale-125"
              style={{ left: `calc(${Math.min(100, progress)}% - 6px)` }}
            />
            <input
              type="range"
              min={0}
              max={dur || 0}
              step={0.1}
              value={seeking ? seekVal : time}
              aria-label="نوار پخش"
              className="absolute h-full w-full cursor-pointer opacity-0"
              onChange={(e) => {
                const v = parseFloat(e.target.value);
                setSeeking(true);
                setSeekVal(v);
              }}
              onPointerUp={(e) => {
                const v = parseFloat((e.target as HTMLInputElement).value);
                try {
                  if (videoRef.current) videoRef.current.currentTime = v;
                } catch {}
                setTime(v);
                setSeeking(false);
                pokeControls();
              }}
            />
          </div>

          <div className="flex items-center gap-1 sm:gap-1.5">
            <button
              onClick={togglePlay}
              aria-label={playing ? 'توقف' : 'پخش'}
              className="flex h-9 w-9 items-center justify-center rounded-full text-white transition-colors hover:bg-white/15"
            >
              {playing ? <Pause className="h-5 w-5 fill-current" /> : <Play className="ml-0.5 h-5 w-5 fill-current" />}
            </button>
            <button
              onClick={() => seekBy(-10)}
              aria-label="ده ثانیه عقب"
              className="hidden h-9 w-9 items-center justify-center rounded-full text-white/90 transition-colors hover:bg-white/15 sm:flex"
            >
              <RotateCcw className="h-5 w-5" />
            </button>
            <button
              onClick={() => seekBy(10)}
              aria-label="ده ثانیه جلو"
              className="hidden h-9 w-9 items-center justify-center rounded-full text-white/90 transition-colors hover:bg-white/15 sm:flex"
            >
              <RotateCw className="h-5 w-5" />
            </button>

            <span className="mx-1 text-[11px] font-medium tabular-nums text-white/90" dir="ltr">
              {fmt(seeking ? seekVal : time)} / {fmt(dur)}
            </span>

            <span className="flex-1" />

            {/* Auto embedded subtitle (SoftSub inside MKV) */}
            <button
              onClick={() => (subAuto === 'on' ? disableAutoSubs() : void enableAutoSubs())}
              aria-label="زیرنویس خودکار"
              title={
                subAuto === 'on'
                  ? `زیرنویس فارسی فعال (${subCount} خط) — بزن برای خاموش`
                  : subAuto === 'loading'
                    ? 'در حال آماده‌سازی زیرنویس...'
                    : 'روشن کردن زیرنویس فارسی داخل فایل'
              }
              className={`flex h-9 items-center gap-1 rounded-full px-2.5 text-[11px] font-bold transition-colors hover:bg-white/15 ${
                subAuto === 'on' ? 'text-amber-300' : subAuto === 'error' ? 'text-red-300' : 'text-white/70'
              }`}
            >
              {subAuto === 'loading' ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Captions className="h-4 w-4" />
              )}
              زیرنویس
            </button>

            {trackUrl ? (
              <button
                onClick={toggleCc}
                aria-label="زیرنویس"
                title="روشن/خاموش کردن زیرنویس"
                className={`flex h-9 items-center gap-1 rounded-full px-2.5 text-[11px] font-bold transition-colors hover:bg-white/15 ${
                  ccOn ? 'text-amber-300' : 'text-white/70'
                }`}
              >
                <Captions className="h-4 w-4" />
                CC
              </button>
            ) : null}
            <label
              title="افزودن فایل زیرنویس (.srt)"
              className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full text-white/80 transition-colors hover:bg-white/15"
            >
              <Upload className="h-4 w-4" />
              <input
                type="file"
                accept=".srt,.vtt"
                className="hidden"
                onChange={(e) => {
                  onSubtitleFile(e.target.files?.[0]);
                  e.target.value = '';
                }}
              />
            </label>

            <button
              onClick={cycleSpeed}
              aria-label="سرعت پخش"
              title="سرعت پخش"
              className="h-9 rounded-full px-2 text-[11px] font-bold text-white/90 transition-colors hover:bg-white/15"
            >
              {SPEEDS[speedIdx]}x
            </button>

            <button
              onClick={toggleMute}
              aria-label="بی‌صدا"
              className="flex h-9 w-9 items-center justify-center rounded-full text-white/90 transition-colors hover:bg-white/15"
            >
              {muted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
            </button>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={muted ? 0 : vol}
              aria-label="صدا"
              dir="ltr"
              className="hidden h-1 w-16 accent-amber-400 md:block"
              onChange={(e) => {
                const v = parseFloat(e.target.value);
                setVol(v);
                try {
                  if (videoRef.current) {
                    videoRef.current.volume = v;
                    videoRef.current.muted = v === 0;
                    setMuted(v === 0);
                  }
                } catch {}
              }}
            />

            <button
              onClick={toggleFs}
              aria-label="تمام صفحه"
              className="flex h-9 w-9 items-center justify-center rounded-full text-white/90 transition-colors hover:bg-white/15"
            >
              {isFs ? <Minimize className="h-5 w-5" /> : <Maximize className="h-5 w-5" />}
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
