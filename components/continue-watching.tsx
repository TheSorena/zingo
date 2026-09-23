'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Play, X, History } from 'lucide-react';
import { readHistory, type HistoryEntry } from './smart-player';

function fmtLeft(pos: number, dur: number): string {
  const left = Math.max(0, dur - pos);
  const m = Math.floor(left / 60);
  if (m < 1) return 'کمتر از یک دقیقه مانده';
  if (m < 60) return `${m} دقیقه مانده`;
  return `${Math.floor(m / 60)} ساعت و ${m % 60} دقیقه مانده`;
}

/**
 * "Continue watching" rail built from local playback history.
 * Clicking resumes: restores the saved snapshot then navigates —
 * the player picks up the saved position automatically.
 */
export function ContinueWatching() {
  const [items, setItems] = useState<HistoryEntry[]>([]);
  const router = useRouter();

  useEffect(() => {
    try {
      const valid = readHistory().filter(
        (h) =>
          h &&
          h.dur > 60 &&
          h.pos > 10 &&
          h.pos / h.dur > 0.02 &&
          h.pos / h.dur < 0.95 &&
          h.snapshot
      );
      setItems(valid.slice(0, 12));
    } catch {
      setItems([]);
    }
  }, []);

  const resume = (h: HistoryEntry) => {
    try {
      localStorage.setItem(
        h.kind === 'serie' ? 'selectedSerie' : 'selectedMovie',
        JSON.stringify(h.snapshot)
      );
    } catch {}
    router.push(h.kind === 'serie' ? `/serie/${h.id}` : '/movie');
  };

  const remove = (key: string) => {
    try {
      localStorage.setItem(
        'zingo-history',
        JSON.stringify(readHistory().filter((h) => h.key !== key))
      );
    } catch {}
    setItems((prev) => prev.filter((h) => h.key !== key));
  };

  if (items.length === 0) return null;

  return (
    <section className="mb-12">
      <h2 className="relative pr-4 mb-4 text-lg sm:text-xl md:text-2xl font-bold line-clamp-2 before:absolute before:right-0 before:top-1/2 before:-translate-y-1/2 before:h-6 before:w-1.5 before:rounded-full before:bg-gradient-to-b before:from-amber-400 before:to-rose-500 flex items-center gap-2">
        ادامه تماشا
        <History className="h-5 w-5 text-amber-400" />
      </h2>
      <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar mask-fade-x" dir="rtl">
        {items.map((h) => {
          const pct = Math.min(100, Math.max(0, (h.pos / h.dur) * 100));
          return (
            <div
              key={h.key}
              className="group relative w-40 sm:w-48 shrink-0 cursor-pointer"
              onClick={() => resume(h)}
            >
              <div className="relative aspect-video overflow-hidden rounded-2xl shadow-lg ring-1 ring-border/50 transition-all duration-300 group-hover:-translate-y-1 group-hover:ring-primary/40">
                {h.image ? (
                  <Image
                    src={h.image}
                    alt={h.title}
                    fill
                    sizes="200px"
                    className="object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="h-full w-full bg-secondary/50" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
                <span className="absolute inset-0 m-auto flex h-10 w-10 items-center justify-center rounded-full bg-primary/90 text-primary-foreground opacity-0 shadow-xl transition-all duration-300 group-hover:opacity-100">
                  <Play className="h-4 w-4 fill-current" />
                </span>
                <button
                  aria-label="حذف از ادامه تماشا"
                  onClick={(e) => {
                    e.stopPropagation();
                    remove(h.key);
                  }}
                  className="absolute left-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white/80 opacity-0 backdrop-blur-sm transition-opacity hover:bg-black/80 hover:text-white group-hover:opacity-100"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
                <div className="absolute bottom-0 right-0 left-0 p-2">
                  <p className="truncate text-xs font-bold text-white">{h.title}</p>
                  <p className="mt-0.5 text-[10px] text-white/70">{fmtLeft(h.pos, h.dur)}</p>
                  <div className="mt-1 h-1 overflow-hidden rounded-full bg-white/25">
                    <div
                      className="h-full rounded-full bg-gradient-to-l from-amber-400 to-rose-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
