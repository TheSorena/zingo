'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Shield, Lock, LogOut, Trash2, RefreshCw, MessageSquare,
  Film, MonitorPlay, AlertTriangle, Reply,
} from 'lucide-react';
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
  reply?: string;
  repliedAt?: number;
}

function timeAgo(ts: number): string {
  const sec = Math.floor((Date.now() - ts) / 1000);
  if (sec < 60) return 'همین حالا';
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min} دقیقه پیش`;
  const hour = Math.floor(min / 60);
  if (hour < 24) return `${hour} ساعت پیش`;
  const day = Math.floor(hour / 24);
  if (day < 30) return `${day} روز پیش`;
  return new Date(ts).toLocaleDateString('fa-IR');
}

export default function AdminPage() {
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [passcode, setPasscode] = useState('');
  const [loggingIn, setLoggingIn] = useState(false);
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [filter, setFilter] = useState<'all' | 'movie' | 'serie' | 'spoiler'>('all');
  const [loadingComments, setLoadingComments] = useState(false);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [sendingReply, setSendingReply] = useState(false);

  const loadComments = useCallback(async () => {
    setLoadingComments(true);
    try {
      const res = await fetch('/api/admin/comments');
      if (res.status === 401) {
        setAuthed(false);
        return;
      }
      const data = await res.json();
      setComments(data.comments || []);
      setAuthed(true);
    } catch {
      setAuthed(false);
    } finally {
      setLoadingComments(false);
    }
  }, []);

  useEffect(() => {
    loadComments();
  }, [loadComments]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passcode || loggingIn) return;
    setLoggingIn(true);
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passcode }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        toast.error(data?.error || 'رمز عبور اشتباه است');
        return;
      }
      setPasscode('');
      setAuthed(true);
      loadComments();
      toast.success('خوش آمدید', { description: 'ورود به پنل ادمین موفق بود' });
    } catch {
      toast.error('خطا در ارتباط با سرور');
    } finally {
      setLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' });
    setAuthed(false);
    setComments([]);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('این کامنت حذف شود؟')) return;
    try {
      const res = await fetch(`/api/admin/comments?id=${id}`, { method: 'DELETE' });
      if (!res.ok) {
        toast.error('خطا در حذف کامنت');
        return;
      }
      setComments((prev) => prev.filter((c) => c.id !== id));
      toast.success('کامنت حذف شد');
    } catch {
      toast.error('خطا در حذف کامنت');
    }
  };

  const handleReply = async (id: string) => {
    if (!replyText.trim() || sendingReply) return;
    setSendingReply(true);
    try {
      const res = await fetch('/api/admin/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, reply: replyText }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        toast.error(data?.error || 'خطا در ثبت پاسخ');
        return;
      }
      setReplyingTo(null);
      setReplyText('');
      toast.success('پاسخ ثبت شد');
      loadComments();
    } catch {
      toast.error('خطا در ثبت پاسخ');
    } finally {
      setSendingReply(false);
    }
  };

  const filtered = comments.filter((c) => {
    if (filter === 'movie') return c.type === 'movie';
    if (filter === 'serie') return c.type === 'serie';
    if (filter === 'spoiler') return c.hasSpoiler;
    return true;
  });

  if (authed === null) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">در حال بررسی...</div>
      </main>
    );
  }

  if (!authed) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="fixed inset-0 -z-10">
          <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-amber-500/10 blur-3xl" />
          <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-rose-500/10 blur-3xl" />
        </div>
        <form onSubmit={handleLogin} className="w-full max-w-sm glass rounded-3xl border border-border/60 p-8 space-y-6 shadow-2xl shadow-black/30">
          <div className="text-center space-y-3">
            <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 to-rose-500 text-white shadow-xl shadow-primary/30">
              <Shield className="h-8 w-8" />
            </span>
            <h1 className="text-2xl font-extrabold text-gradient-warm">پنل ادمین زینگو</h1>
            <p className="text-sm text-muted-foreground">برای ورود، رمز عبور ادمین را وارد کنید</p>
          </div>
          <div className="relative">
            <Lock className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="password"
              value={passcode}
              onChange={(e) => setPasscode(e.target.value)}
              placeholder="رمز عبور"
              autoFocus
              className="w-full rounded-full bg-muted/50 py-3 pr-10 pl-4 text-sm ring-1 ring-border/60 focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all"
            />
          </div>
          <button
            type="submit"
            disabled={loggingIn || !passcode}
            className="group relative w-full inline-flex items-center justify-center gap-2 overflow-hidden rounded-full bg-gradient-to-l from-amber-500 to-rose-500 px-6 py-3 text-sm font-bold text-white shadow-xl shadow-primary/25 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:shadow-primary/40 active:scale-95 disabled:opacity-40 disabled:pointer-events-none"
          >
            <span className="absolute inset-0 overflow-hidden rounded-full">
              <span className="absolute inset-y-0 w-1/3 -left-1/3 bg-white/25 blur-md -skew-x-12 translate-x-0 transition-transform duration-700 group-hover:translate-x-[400%]" />
            </span>
            {loggingIn ? 'در حال ورود...' : 'ورود به پنل'}
          </button>
        </form>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      <Toaster richColors closeButton position="top-center" />
      <div className="fixed inset-0 -z-10">
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-amber-500/10 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-rose-500/10 blur-3xl" />
      </div>

      <header className="sticky top-0 z-40 w-full border-b border-border/60 glass">
        <div className="container flex h-16 items-center justify-between px-4 md:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-rose-500 text-white shadow-lg shadow-primary/20">
              <Shield className="h-5 w-5" />
            </span>
            <h1 className="text-lg md:text-xl font-bold text-gradient-warm">پنل ادمین زینگو</h1>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 rounded-full bg-muted/60 px-4 py-2 text-sm text-muted-foreground ring-1 ring-border/50 transition-all hover:bg-muted hover:text-foreground"
          >
            <LogOut className="h-4 w-4" />
            خروج
          </button>
        </div>
      </header>

      <div className="container max-w-5xl mx-auto py-8 px-4 md:px-6 lg:px-8">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          {[
            { label: 'کل کامنت‌ها', value: comments.length, icon: MessageSquare, color: 'from-amber-500 to-rose-500' },
            { label: 'کامنت فیلم‌ها', value: comments.filter((c) => c.type === 'movie').length, icon: Film, color: 'from-sky-500 to-indigo-500' },
            { label: 'کامنت سریال‌ها', value: comments.filter((c) => c.type === 'serie').length, icon: MonitorPlay, color: 'from-emerald-500 to-teal-500' },
            { label: 'حاوی اسپویل', value: comments.filter((c) => c.hasSpoiler).length, icon: AlertTriangle, color: 'from-orange-500 to-red-500' },
          ].map((stat) => (
            <div key={stat.label} className="glass rounded-2xl border border-border/60 p-4 flex items-center gap-3">
              <span className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${stat.color} text-white shadow-lg`}>
                <stat.icon className="h-5 w-5" />
              </span>
              <div>
                <p className="text-xl font-extrabold">{stat.value}</p>
                <p className="text-[11px] text-muted-foreground">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Filter tabs */}
        <div className="flex flex-wrap items-center gap-2 mb-5">
          {([
            { value: 'all', label: 'همه' },
            { value: 'movie', label: 'فیلم‌ها' },
            { value: 'serie', label: 'سریال‌ها' },
            { value: 'spoiler', label: 'اسپویل‌ها' },
          ] as const).map((tab) => (
            <button
              key={tab.value}
              onClick={() => setFilter(tab.value)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
                filter === tab.value
                  ? 'bg-gradient-to-l from-amber-500 to-rose-500 text-white shadow-lg shadow-primary/25'
                  : 'bg-muted/50 text-muted-foreground ring-1 ring-border/50 hover:bg-muted'
              }`}
            >
              {tab.label}
            </button>
          ))}
          <button
            onClick={loadComments}
            className="mr-auto flex items-center gap-1.5 rounded-full bg-muted/50 px-4 py-2 text-sm text-muted-foreground ring-1 ring-border/50 transition-all hover:bg-muted hover:text-foreground"
          >
            <RefreshCw className={`h-4 w-4 ${loadingComments ? 'animate-spin' : ''}`} />
            بروزرسانی
          </button>
        </div>

        {/* Comments list */}
        {loadingComments ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="glass rounded-2xl border border-border/60 p-4 animate-pulse">
                <div className="h-4 w-1/3 rounded-full bg-muted/60 mb-3" />
                <div className="h-3 w-full rounded-full bg-muted/40" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="glass rounded-3xl border border-border/60 p-12 text-center">
            <MessageSquare className="h-10 w-10 mx-auto text-muted-foreground/40 mb-3" />
            <p className="text-muted-foreground font-medium">کامنتی یافت نشد</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((comment) => (
              <div key={comment.id} className="glass rounded-2xl border border-border/60 p-4 transition-colors hover:border-primary/25">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-amber-500 to-rose-500 text-white text-xs font-bold">
                    {comment.name.slice(0, 1)}
                  </span>
                  <span className="text-sm font-bold">{comment.name}</span>
                  <span className={`flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                    comment.type === 'movie'
                      ? 'bg-sky-500/15 text-sky-400 ring-1 ring-sky-400/30'
                      : 'bg-emerald-500/15 text-emerald-400 ring-1 ring-emerald-400/30'
                  }`}>
                    {comment.type === 'movie' ? <Film className="h-3 w-3" /> : <MonitorPlay className="h-3 w-3" />}
                    {comment.type === 'movie' ? 'فیلم' : 'سریال'} #{comment.targetId}
                  </span>
                  {comment.hasSpoiler && (
                    <span className="flex items-center gap-1 rounded-full bg-amber-500/15 px-2.5 py-0.5 text-[11px] font-bold text-amber-400 ring-1 ring-amber-400/30">
                      <AlertTriangle className="h-3 w-3" />
                      اسپویل
                    </span>
                  )}
                  <span className="text-[11px] text-muted-foreground/70 mr-auto">{timeAgo(comment.createdAt)}</span>
                </div>
                <p className="text-sm text-foreground/90 leading-relaxed whitespace-pre-line">{comment.text}</p>
                {comment.reply && (
                  <div className="mt-3 rounded-xl bg-primary/5 ring-1 ring-primary/20 p-3">
                    <p className="text-[11px] font-bold text-amber-400 mb-1 flex items-center gap-1">
                      <Reply className="h-3 w-3" />
                      پاسخ ادمین
                    </p>
                    <p className="text-sm text-foreground/90 leading-relaxed whitespace-pre-line">{comment.reply}</p>
                  </div>
                )}
                {replyingTo === comment.id ? (
                  <div className="mt-3 space-y-2">
                    <textarea
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder="متن پاسخ..."
                      rows={2}
                      maxLength={600}
                      autoFocus
                      className="w-full rounded-xl bg-muted/50 px-3 py-2 text-sm ring-1 ring-border/60 focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all resize-none"
                    />
                    <div className="flex gap-2 justify-end">
                      <button
                        onClick={() => { setReplyingTo(null); setReplyText(''); }}
                        className="rounded-full bg-muted/60 px-4 py-1.5 text-xs font-bold text-muted-foreground ring-1 ring-border/50 hover:bg-muted"
                      >
                        انصراف
                      </button>
                      <button
                        onClick={() => handleReply(comment.id)}
                        disabled={sendingReply || !replyText.trim()}
                        className="flex items-center gap-1 rounded-full bg-gradient-to-l from-amber-500 to-rose-500 px-4 py-1.5 text-xs font-bold text-white shadow-lg shadow-primary/25 transition-all hover:scale-105 disabled:opacity-40"
                      >
                        <Reply className="h-3 w-3" />
                        {sendingReply ? 'در حال ارسال...' : 'ارسال پاسخ'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-end gap-2 mt-3">
                    <button
                      onClick={() => { setReplyingTo(comment.id); setReplyText(comment.reply || ''); }}
                      className="flex items-center gap-1 rounded-full bg-primary/10 px-3.5 py-1.5 text-xs font-bold text-amber-400 ring-1 ring-primary/30 transition-all hover:bg-primary/20"
                    >
                      <Reply className="h-3.5 w-3.5" />
                      {comment.reply ? 'ویرایش پاسخ' : 'پاسخ'}
                    </button>
                    <button
                      onClick={() => handleDelete(comment.id)}
                      className="flex items-center gap-1 rounded-full bg-red-500/10 px-3.5 py-1.5 text-xs font-bold text-red-400 ring-1 ring-red-400/30 transition-all hover:bg-red-500/20"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      حذف
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}