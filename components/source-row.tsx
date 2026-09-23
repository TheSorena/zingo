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

  const label =
    !source.quality || source.quality.includes('تیزر')
      ? 'تریلر'
      : source.quality;
  const externalOnly = needsExternalPlayer(source);

  return (
    <>
      <div className="flex items-center gap-2 rounded-2xl bg-secondary/40 hover:bg-secondary/60 ring-1 ring-border/50 px-3 py-2 transition-colors">
        <a
          href={source.url}
          onClick={handleDownload}
          rel="noopener noreferrer"
          title={`دانلود ${label}`}
          className="flex min-w-0 flex-1 items-center gap-2"
        >
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-l from-amber-500 to-rose-500 text-white shadow-md shadow-primary/25">
            <Download className="h-4 w-4" />
          </span>
          <span className="min-w-0">
            <span className="block truncate text-sm font-bold">{label}</span>
            <span className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
              {source.type && (
                <Badge variant="outline" className="h-5 px-1.5 text-[10px]">
                  {source.type}
                </Badge>
              )}
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
