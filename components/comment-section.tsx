'use client';

import { useState, useEffect, useCallback } from 'react';
import { MessageSquare, Send, AlertTriangle, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import { Toaster } from 'sonner';

interface CommentItem {
  id: string;
  type: 'movie' | 'serie';
  targetId: number;
  name: string;
  text: string;
  hasSpoiler: boolean;
  createdAt: number;
}

interface CommentSectionProps {
  type: 'movie' | 'serie';
  targetId: number;
}

const COLORS = ['bg-amber-500', 'bg-rose-500', 'bg-emerald-500', 'bg-sky-500', 'bg-violet-500'];

function timeAgo(ts: number): string {
  const diff = Date.now() - ts;
  const sec = Math.floor(diff / 1000);
  if (sec < 60) return 'همین حالا';
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min} دقیقه پیش`;
  const hour = Math.floor(min / 60);
  if (hour < 24) return `${hour} ساعت پیش`;
  const day = Math.floor(hour / 24);
  if (day < 30) return `${day} روز پیش`;
  const month = Math.floor(day / 30);
  if (month < 12) return `${month} ماه پیش`;
  return `${Math.floor(month / 12)} سال پیش`;
}

export function CommentSection({ type, targetId }: CommentSectionProps) {
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [name, setName] = useState('');
  const [text, setText] = useState('');
  const [hasSpoiler, setHasSpoiler] = useState(false);
  const [revealed, setRevealed] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const loadComments = useCallback(async () => {
    try {
      const res = await fetch(`/api/comments?type=${type}&id=${targetId}`);
      const data = await res.json();
      setComments(data.comments || []);
    } catch {
      setComments([]);
    } finally {
      setLoading(false);
    }
  }, [type, targetId]);

  useEffect(() => {
    loadComments();
  }, [loadComments]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !text.trim() || submitting) return;
    setSubmitting(true);

    try {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, targetId, name, text, hasSpoiler }),
      });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || 'خطا در ثبت کامنت');
        return;
      }

      setComments((prev) => [data.comment, ...prev]);
      setName('');
      setText('');
      setHasSpoiler(false);
      toast.success('کامنت شما ثبت شد', { position: 'top-center' });
    } catch {
      toast.error('خطا در ارسال کامنت');
    } finally {
      setSubmitting(false);
    }
  };

  const toggleReveal = (id: string) => {
    setRevealed((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <section className="mt-8">
      <Toaster richColors closeButton position="top-center" />
      <div className="flex items-center gap-3 mb-6">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-rose-500 text-white shadow-lg shadow-primary/20">
          <MessageSquare className="h-5 w-5" />
        </span>
        <div>
          <h2 className="text-lg md:text-xl font-bold text-gradient-warm">نظرات کاربران</h2>
          <p className="text-xs text-muted-foreground">
            {comments.length > 0 ? `${comments.length} نظر برای این ${type === 'movie' ? 'فیلم' : 'سریال'}` : 'اولین نفر باشید'}
          </p>
        </div>
      </div>

      {/* Comment Form */}
      <form onSubmit={handleSubmit} className="glass rounded-3xl border border-border/60 p-4 md:p-5 mb-6 space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="نام شما"
            maxLength={30}
            className="flex-1 rounded-full bg-muted/50 px-4 py-2.5 text-sm ring-1 ring-border/60 focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all"
          />
          <label className="flex items-center gap-2 cursor-pointer select-none rounded-full bg-muted/50 px-4 py-2.5 text-sm ring-1 ring-border/60 transition-colors hover:bg-muted/80">
            <input
              type="checkbox"
              checked={hasSpoiler}
              onChange={(e) => setHasSpoiler(e.target.checked)}
              className="accent-amber-500 h-4 w-4"
            />
            <AlertTriangle className="h-4 w-4 text-amber-400" />
            <span className="text-muted-foreground">حاوی اسپویل است</span>
          </label>
        </div>
        <div className="relative">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="نظر خود را بنویسید..."
            rows={3}
            maxLength={600}
            className="w-full rounded-2xl bg-muted/50 px-4 py-3 text-sm ring-1 ring-border/60 focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all resize-none"
          />
          <span className="absolute bottom-2 left-3 text-[11px] text-muted-foreground/60">
            {text.length}/600
          </span>
        </div>
        <button
          type="submit"
          disabled={submitting || !name.trim() || !text.trim()}
          className="group relative inline-flex items-center gap-2 overflow-hidden rounded-full bg-gradient-to-l from-amber-500 to-rose-500 px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-primary/25 transition-all duration-300 hover:scale-[1.03] hover:shadow-xl hover:shadow-primary/40 active:scale-95 disabled:opacity-40 disabled:pointer-events-none"
        >
          <span className="absolute inset-0 overflow-hidden rounded-full">
            <span className="absolute inset-y-0 w-1/3 -left-1/3 bg-white/25 blur-md -skew-x-12 translate-x-0 transition-transform duration-700 group-hover:translate-x-[400%]" />
          </span>
          <Send className="h-4 w-4" />
          {submitting ? 'در حال ارسال...' : 'ثبت نظر'}
        </button>
      </form>

      {/* Comments List */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="glass rounded-2xl border border-border/60 p-4 animate-pulse">
              <div className="h-4 w-1/3 rounded-full bg-muted/60 mb-3" />
              <div className="h-3 w-full rounded-full bg-muted/40" />
              <div className="h-3 w-2/3 rounded-full bg-muted/40 mt-2" />
            </div>
          ))}
        </div>
      ) : comments.length === 0 ? (
        <div className="glass rounded-3xl border border-border/60 p-10 text-center">
          <MessageSquare className="h-10 w-10 mx-auto text-muted-foreground/40 mb-3" />
          <p className="text-muted-foreground font-medium">هنوز نظری ثبت نشده</p>
          <p className="text-sm text-muted-foreground/60 mt-1">اولین نظر را درباره این {type === 'movie' ? 'فیلم' : 'سریال'} بنویسید</p>
        </div>
      ) : (
        <div className="space-y-3">
          {comments.map((comment) => {
            const isSpoilerHidden = comment.hasSpoiler && !revealed.has(comment.id);
            const color = COLORS[comment.name.charCodeAt(0) % COLORS.length];
            return (
              <div key={comment.id} className="glass rounded-2xl border border-border/60 p-4 transition-colors hover:border-primary/25">
                <div className="flex items-center gap-3 mb-2.5">
                  <span className={`flex h-9 w-9 items-center justify-center rounded-full ${color} text-white text-sm font-bold shadow-md`}>
                    {comment.name.slice(0, 1)}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold truncate">{comment.name}</p>
                    <p className="text-[11px] text-muted-foreground/70">{timeAgo(comment.createdAt)}</p>
                  </div>
                  {comment.hasSpoiler && (
                    <button
                      onClick={() => toggleReveal(comment.id)}
                      className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold transition-all ${
                        isSpoilerHidden
                          ? 'bg-amber-500/15 text-amber-400 ring-1 ring-amber-400/30 hover:bg-amber-500/25'
                          : 'bg-muted/60 text-muted-foreground ring-1 ring-border/50 hover:bg-muted'
                      }`}
                    >
                      {isSpoilerHidden ? (
                        <>
                          <Eye className="h-3 w-3" />
                          حاوی اسپویل - نمایش
                        </>
                      ) : (
                        <>
                          <EyeOff className="h-3 w-3" />
                          پنهان کردن اسپویل
                        </>
                      )}
                    </button>
                  )}
                </div>
                {isSpoilerHidden ? (
                  <div className="rounded-xl bg-amber-500/5 ring-1 ring-amber-400/20 p-4 text-center">
                    <AlertTriangle className="h-5 w-5 mx-auto text-amber-400 mb-1" />
                    <p className="text-sm text-muted-foreground">
                      این نظر شامل اسپویل است. برای نمایش کلیک کنید.
                    </p>
                  </div>
                ) : (
                  <p className="text-sm text-foreground/90 leading-relaxed whitespace-pre-line">{comment.text}</p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}