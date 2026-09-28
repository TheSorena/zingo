'use client';

import { useEffect, useState } from 'react';
import { Megaphone, X } from 'lucide-react';

/**
 * Site-wide admin broadcast. Dismissible per notice text.
 */
export function SiteNotice() {
  const [text, setText] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/notice')
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        const t = d?.notice?.text;
        if (typeof t !== 'string' || !t) return;
        try {
          if (localStorage.getItem('zingo-notice-dismissed') === t) return;
        } catch {}
        setText(t);
      })
      .catch(() => {});
  }, []);

  if (!text) return null;

  const dismiss = () => {
    try {
      localStorage.setItem('zingo-notice-dismissed', text);
    } catch {}
    setText(null);
  };

  return (
    <div className="mb-6 flex items-start gap-2.5 rounded-2xl bg-gradient-to-l from-amber-500/12 to-rose-500/12 px-4 py-3 ring-1 ring-primary/30 animate-fade-in">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-rose-500 text-white shadow-md">
        <Megaphone className="h-4 w-4" />
      </span>
      <p className="flex-1 pt-1 text-xs leading-relaxed font-medium">{text}</p>
      <button
        onClick={dismiss}
        aria-label="بستن اطلاعیه"
        className="rounded-full p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
