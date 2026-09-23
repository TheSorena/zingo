'use client';

import { useState } from 'react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Copy, Download, Clapperboard, TriangleAlert } from 'lucide-react';
import { toast } from 'sonner';
import {
  isChromeBrowser,
  getDownloadMessage,
  triggerDownload,
  isWebView,
} from '../lib/utils';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from './ui/alert-dialog';

export interface SourceItem {
  id: number;
  quality: string | null;
  type: string;
  url: string;
}

const HEVC_RE = /x265|hevc|265/i;

export interface SourceInfo {
  /** Display label, e.g. "720p x265" or "تریلر" */
  label: string;
  isTrailer: boolean;
  /** Extra chips: container, codec, release, audio */
  tags: string[];
}

function fileNameOf(url: string): string {
  try {
    const path = new URL(url).pathname;
    return decodeURIComponent(path.substring(path.lastIndexOf('/') + 1));
  } catch {
    try {
      return decodeURIComponent(url.substring(url.lastIndexOf('/') + 1));
    } catch {
      return '';
    }
  }
}

/**
 * Smart source description. Upstream episode sources usually have EMPTY
 * quality/type — in that case guess from the file name instead of
 * wrongly calling everything "تریلر".
 */
export function describeSource(s: Pick<SourceItem, 'quality' | 'type' | 'url'>): SourceInfo {
  const quality = (s.quality || '').trim();
  const type = (s.type || '').trim();
  const file = fileNameOf(s.url || '');
  const hay = `${quality} ${file}`;

  const isTrailer = /تیزر|trailer|tizer/i.test(hay);
  if (isTrailer) {
    return { label: 'تریلر', isTrailer: true, tags: [] };
  }

  const tags: string[] = [];
  const parts: string[] = [];

  const q = quality || /((?:2160|1080|720|480)\s*p)/i.exec(file)?.[1]?.replace(/\s+/g, '') || '';
  if (q) parts.push(q);

  const codec = /x\s*265|h\s*\.?\s*265|hevc/i.test(hay)
    ? 'x265'
    : /x\s*264|h\s*\.?\s*264/i.test(hay)
      ? 'x264'
      : '';
  if (codec) parts.push(codec);

  const release = /web[\s._-]*dl/i.test(file)
    ? 'WEB-DL'
    : /blu[\s._-]*ray/i.test(file)
      ? 'BluRay'
      : /web[\s._-]*rip/i.test(file)
        ? 'WEBRip'
        : /hdtv/i.test(file)
          ? 'HDTV'
          : '';
  if (release) tags.push(release);

  if (/dubbed|دوبله|farsi/i.test(hay)) tags.push('دوبله');
  else if (/hardsub|هاردساب/i.test(hay)) tags.push('هاردساب');
  else if (/softsub|سافت‌ساب/i.test(hay)) tags.push('سافت‌ساب');
  else if (/زیرنویس/i.test(hay)) tags.push('زیرنویس');

  const ext =
    /\.([a-z0-9]{2,4})(\?|$)/i.exec(file)?.[1]?.toUpperCase() ||
    (type ? type.toUpperCase() : '');
  if (ext && !/^(MKV|MP4|AVI|WEBM|MOV)$/.test(ext)) tags.push(ext);

  const label = parts.length > 0 ? parts.join(' ') : type || ext || 'لینک دانلود';
  if (ext && /^(MKV|MP4|AVI|WEBM|MOV)$/.test(ext)) tags.unshift(ext);

  return { label, isTrailer: false, tags };
}

export function isHevcSource(s: Pick<SourceItem, 'quality' | 'url' | 'type'>): boolean {
  const label = `${s.quality || ''} ${s.type || ''} ${s.url || ''}`;
  return HEVC_RE.test(label);
}

export function isMkvSource(s: Pick<SourceItem, 'url' | 'type'>): boolean {
  return /\.mkv(\?|$)/i.test(s.url || '') || (s.type || '').toLowerCase() === 'mkv';
}

/** Browsers usually can't play this container/codec — needs VLC/MX Player. */
export function needsExternalPlayer(s: Pick<SourceItem, 'quality' | 'url' | 'type'>): boolean {
  return isHevcSource(s) || isMkvSource(s);
}

export function copyText(text: string, okMessage = 'لینک با موفقیت کپی شد'): boolean {
  try {
    void navigator.clipboard.writeText(text).then(
      () => {
        toast.success(okMessage, {
          description: 'لینک در کلیپ‌بورد شما ذخیره شد',
          duration: 3000,
          position: 'top-center',
        });
      },
      () => {
        toast.error('خطا در کپی لینک', { position: 'top-center' });
      }
    );
    return true;
  } catch {
    toast.error('خطا در کپی لینک', { position: 'top-center' });
    return false;
  }
}

/**
 * One compact download box per quality: quality badge + container chip
 * + icon actions (download / VLC / copy). Replaces the old bulky rows.
 */
export function SourceRow({ source }: { source: SourceItem }) {
  const [showAlert, setShowAlert] = useState(false);

  const handleDownload = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isChromeBrowser()) {
      setShowAlert(true);
      return;
    }
    triggerDownload(source.url);
  };

  const info = describeSource(source);
  const externalOnly = !info.isTrailer && needsExternalPlayer(source);

  return (
    <>
      <div className="flex items-center gap-2 rounded-2xl bg-secondary/40 hover:bg-secondary/60 ring-1 ring-border/50 px-3 py-2 transition-colors">
        <a
          href={source.url}
          onClick={handleDownload}
          rel="noopener noreferrer"
          title={`دانلود ${info.label}`}
          className="flex min-w-0 flex-1 items-center gap-2"
        >
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-l from-amber-500 to-rose-500 text-white shadow-md shadow-primary/25">
            <Download className="h-4 w-4" />
          </span>
          <span className="min-w-0">
            <span className="block truncate text-sm font-bold">{info.label}</span>
            <span className="flex flex-wrap items-center gap-1.5 text-[11px] text-muted-foreground">
              {info.tags.map((t) => (
                <Badge key={t} variant="outline" className="h-5 px-1.5 text-[10px]">
                  {t}
                </Badge>
              ))}
              {externalOnly && (
                <span className="inline-flex items-center gap-1 text-amber-400">
                  <TriangleAlert className="h-3 w-3" />
                  فقط VLC
                </span>
              )}
            </span>
          </span>
        </a>

        <Button
          asChild
          variant="ghost"
          size="icon"
          title="تماشا با VLC"
          className="h-9 w-9 shrink-0 rounded-xl bg-muted/60 hover:bg-muted ring-1 ring-border/50"
        >
          <a
            href={'vlc://' + source.url}
            target={!isWebView() ? '_blank' : undefined}
            rel="noopener noreferrer"
          >
            <Clapperboard className="h-4 w-4" />
          </a>
        </Button>

        <Button
          onClick={() => copyText(source.url)}
          variant="ghost"
          size="icon"
          title="کپی لینک"
          className="h-9 w-9 shrink-0 rounded-xl bg-muted/60 hover:bg-muted ring-1 ring-border/50"
        >
          <Copy className="h-4 w-4" />
        </Button>
      </div>

      <AlertDialog open={showAlert} onOpenChange={setShowAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-right">دانلود در مرورگر کروم</AlertDialogTitle>
            <AlertDialogDescription className="text-right whitespace-pre-line mt-4 leading-relaxed">
              {getDownloadMessage()}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="sm:justify-start">
            <AlertDialogAction
              onClick={() => {
                copyText(source.url);
                setShowAlert(false);
              }}
              className="w-full sm:w-auto"
            >
              کپی لینک دانلود
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
