'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  RefreshCw,
  Copy,
  Download,
  Info,
} from 'lucide-react';
import { Button } from './ui/button';
import { triggerDownload } from '../lib/utils';
import { needsExternalPlayer, copyText } from './source-row';
import { SmartPlayer } from './smart-player';
import type { HistoryEntry } from './smart-player';
import { describeSource } from './source-row';

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
  history?: Omit<HistoryEntry, 'key' | 'pos' | 'dur' | 'at'>;
}

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

const proxyUrl = (url: string) =>
  `https://http-video.liara.run/?url=${encodeURIComponent(url)}`;

// NOTE: sources live on plain-http file servers; forcing https breaks them.
// Inside the Android WebView we enable mixed-content compatibility mode,
// so the original scheme must be preserved here.
export function OnlinePlayer({ title, poster, sources, storageKey, history }: OnlinePlayerProps) {
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
  const [fatal, setFatal] = useState(false);
  const [runId, setRunId] = useState(0);

  // Reset when switching content
  useEffect(() => {
    setActive(playable[0] || null);
    setUseProxy(false);
    setFatal(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storageKey]);

  if (!playable.length) {
    return null;
  }

  const src = active ? (useProxy ? proxyUrl(active.url) : active.url) : '';
  const isMixedBlocked =
    typeof window !== 'undefined' &&
    window.location.protocol === 'https:' &&
    !!active?.url?.startsWith('http:') &&
    !useProxy;

  const handleFirstError = () => {
    // Silent single retry through the proxy host — no scary panel yet
    if (!useProxy) {
      setUseProxy(true);
    } else {
      setFatal(true);
    }
  };

  const retry = () => {
    setFatal(false);
    setUseProxy(false);
    setActive(playable[0] || null);
    setRunId((v) => v + 1);
  };

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
                onClick={() => {
                  setActive(s);
                  setUseProxy(false);
                  setFatal(false);
                }}
                title={ext ? 'ممکن است در مرورگر پخش نشود' : label}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all duration-300 ring-1 flex items-center gap-1.5 ${
                  active?.url === s.url
                    ? 'bg-gradient-to-l from-amber-500 to-rose-500 text-white shadow-lg shadow-primary/30 ring-transparent'
                    : 'bg-secondary/50 text-muted-foreground hover:bg-secondary/80 hover:text-foreground ring-border/50'
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>

        {active && needsExternalPlayer(active) && !fatal && (
          <p className="mb-3 rounded-2xl bg-amber-500/10 px-3 py-2 text-[11px] leading-relaxed text-amber-300 ring-1 ring-amber-400/25">
            این کیفیت (x265 یا MKV) معمولاً در مرورگر پخش نمی‌شود؛ کیفیت MP4 را انتخاب کنید.
          </p>
        )}

        {!fatal ? (
          <SmartPlayer
            key={`${storageKey}:${runId}`}
            src={src}
            title={title}
            poster={poster}
            storageKey={storageKey}
            history={history}
            onFirstError={handleFirstError}
            onFatal={() => setFatal(true)}
          />
        ) : (
          <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-black/70 ring-1 ring-border/40">
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2.5 text-center px-5 py-4 bg-black/70 overflow-y-auto">
              <AlertTriangle className="h-9 w-9 text-amber-400 shrink-0" />
              <p className="text-sm text-white font-bold">پخش این کیفیت ممکن نیست</p>
              {isMixedBlocked ? (
                <p className="text-[11px] text-amber-200/90 leading-relaxed max-w-md">
                  مرورگر شما اجازه پخش مستقیم فایل‌های رمزنگاری‌نشده (http) را در صفحه امن نمی‌دهد.
                  لینک را کپی کنید یا فیلم را دانلود کنید.
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
          </div>
        )}

        <p className="text-[11px] text-muted-foreground mt-3 leading-relaxed flex items-start gap-1.5">
          <Info className="h-3.5 w-3.5 shrink-0 mt-px" />
          <span>
            بهترین کیفیت سازگار به‌صورت خودکار انتخاب می‌شود. با دکمه آپلود می‌توانید فایل زیرنویس (.srt) خودتان را اضافه کنید. محل تماشای شما ذخیره می‌شود.
          </span>
        </p>
      </div>
    </div>
  );
}
