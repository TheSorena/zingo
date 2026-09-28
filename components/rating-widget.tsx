'use client';

import { useCallback, useEffect, useState } from 'react';
import { Star, LogIn } from 'lucide-react';
import { useAuth } from './auth-provider';
import { AuthDialog } from './auth-dialog';

interface RatingWidgetProps {
  type: 'movie' | 'serie';
  targetId: number;
}

/**
 * Zingo community rating (1-10, half-star precision).
 * Voting requires an account — guests get a login nudge instead.
 */
export function RatingWidget({ type, targetId }: RatingWidgetProps) {
  const { user } = useAuth();
  const [avg, setAvg] = useState<number | null>(null);
  const [count, setCount] = useState(0);
  const [mine, setMine] = useState<number | null>(null);
  const [hover, setHover] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await fetch(`/api/ratings?type=${type}&id=${targetId}`);
      if (!res.ok) return;
      const data = await res.json();
      setAvg(typeof data.avg === 'number' ? data.avg : null);
      setCount(data.count || 0);
      setMine(typeof data.mine === 'number' ? data.mine : null);
    } catch {}
  }, [type, targetId]);

  useEffect(() => {
    load();
  }, [load]);

  const vote = async (score: number) => {
    if (busy) return;
    setBusy(true);
    try {
      const res = await fetch('/api/ratings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, targetId, id: targetId, score }),
      });
      if (!res.ok) return;
      const data = await res.json();
      setAvg(typeof data.avg === 'number' ? data.avg : null);
      setCount(data.count || 0);
      setMine(typeof data.mine === 'number' ? data.mine : null);
    } catch {
    } finally {
      setBusy(false);
      setHover(null);
    }
  };

  const scoreFromEvent = (e: React.MouseEvent, star: number): number => {
    try {
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      const x = e.clientX - rect.left;
      return x < rect.width / 2 ? star * 2 - 1 : star * 2;
    } catch {
      return star * 2;
    }
  };

  const shown = hover ?? mine ?? 0;

  return (
    <div className="glass rounded-3xl border border-border/60 p-4 md:p-5 relative overflow-hidden">
      <div className="absolute -top-10 -right-10 h-28 w-28 rounded-full bg-primary/10 blur-2xl pointer-events-none" />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="font-bold text-sm">امتیاز کاربران زینگو</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            {avg !== null ? (
              <>
                <span className="text-base font-extrabold text-amber-400">{avg.toFixed(1)}</span>
                <span className="text-muted-foreground"> از ۱۰</span>
                <span className="mr-1.5">({count} رأی)</span>
              </>
            ) : (
              'هنوز امتیازی ثبت نشده — اولین نفر باشید'
            )}
          </p>
        </div>
        {user ? (
          <div className="flex items-center gap-1" dir="ltr">
            {[1, 2, 3, 4, 5].map((star) => {
              const full = shown >= star * 2;
              const half = !full && shown >= star * 2 - 1;
              return (
                <button
                  key={star}
                  aria-label={`امتیاز ${star * 2}`}
                  disabled={busy}
                  onMouseMove={(e) => setHover(scoreFromEvent(e, star))}
                  onMouseLeave={() => setHover(null)}
                  onClick={(e) => vote(scoreFromEvent(e, star))}
                  className="relative p-0.5 transition-transform hover:scale-110 active:scale-95 disabled:opacity-60"
                >
                  <Star className="h-7 w-7 text-muted-foreground/40" />
                  {(full || half) && (
                    <span
                      className="absolute inset-0.5 overflow-hidden"
                      style={{ width: full ? '100%' : '50%' }}
                    >
                      <Star className="h-7 w-7 fill-amber-400 text-amber-400" />
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        ) : (
          <button
            onClick={() => setLoginOpen(true)}
            className="flex items-center gap-1.5 rounded-full bg-primary/10 px-4 py-2 text-xs font-bold text-amber-400 ring-1 ring-primary/30 transition-all hover:bg-primary/20 hover:scale-[1.03] active:scale-95"
          >
            <LogIn className="h-3.5 w-3.5" />
            برای امتیاز دادن وارد شوید
          </button>
        )}
      </div>
      {user && mine !== null && (
        <p className="mt-2 text-[11px] text-emerald-400">امتیاز شما: {mine} از ۱۰ ✓</p>
      )}
      <AuthDialog open={loginOpen} onOpenChange={setLoginOpen} />
    </div>
  );
}
