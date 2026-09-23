'use client';

import { useState } from 'react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Play, ChevronDown, Copy, Check } from 'lucide-react';
import type { SerieEpisode } from '../types';
import { SourceRow, copyText, describeSource } from './source-row';

interface EpisodeCardProps {
  episode: SerieEpisode;
  onPlay: (episode: SerieEpisode) => void;
}

/**
 * Compact episode box: one row with play + expand, sources shown only
 * when expanded. Keeps hundred-episode seasons (e.g. One Piece) usable.
 */
export function EpisodeCard({ episode, onPlay }: EpisodeCardProps) {
  const [open, setOpen] = useState(false);
  const [copiedAll, setCopiedAll] = useState(false);
  const count = episode.sources?.length ?? 0;
  const preview = episode.sources?.[0] ? describeSource(episode.sources[0]).label : '';

  const copyAll = async () => {
    const links = (episode.sources || []).map((s) => s.url).join('\n');
    if (!links) return;
    copyText(links, 'همه لینک‌های قسمت کپی شد');
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  };

  return (
    <div
      className={`rounded-2xl ring-1 transition-colors ${
        open
          ? 'bg-card/70 ring-primary/30'
          : 'bg-secondary/30 hover:bg-secondary/50 ring-border/50'
      }`}
    >
      <div className="flex items-center gap-2 p-2.5">
        <Button
          onClick={() => onPlay(episode)}
          size="icon"
          title={`پخش آنلاین ${episode.title}`}
          className="h-10 w-10 shrink-0 rounded-xl bg-gradient-to-l from-amber-500 to-rose-500 text-white shadow-md shadow-primary/25 hover:opacity-90 active:scale-95 transition-transform"
        >
          <Play className="h-4 w-4 fill-current" />
        </Button>

        <button
          onClick={() => setOpen((v) => !v)}
          className="flex min-w-0 flex-1 items-center justify-between gap-2 text-right"
        >
          <span className="min-w-0">
            <span className="block truncate text-sm font-bold">{episode.title}</span>
            <span className="mt-0.5 flex flex-wrap items-center gap-1.5 text-[11px] text-muted-foreground">
              <Badge variant="outline" className="h-5 px-1.5 text-[10px]">
                {count} لینک دانلود
              </Badge>
              {preview && preview !== 'لینک دانلود' && (
                <Badge variant="outline" className="h-5 px-1.5 text-[10px] text-amber-400 border-amber-400/30">
                  {preview}
                </Badge>
              )}
              {episode.duration && <span>{episode.duration}</span>}
            </span>
          </span>
          <ChevronDown
            className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-300 ${
              open ? 'rotate-180' : ''
            }`}
          />
        </button>
      </div>

      {open && (
        <div className="grid gap-1.5 px-2.5 pb-2.5">
          {(episode.sources || []).map((source) => (
            <SourceRow key={source.id} source={source} />
          ))}
          {count > 1 && (
            <Button
              onClick={copyAll}
              variant="ghost"
              size="sm"
              className="justify-center rounded-xl bg-muted/50 hover:bg-muted text-xs ring-1 ring-border/50"
            >
              {copiedAll ? (
                <>
                  <Check className="ml-1.5 h-3.5 w-3.5 text-emerald-400" />
                  کپی شد
                </>
              ) : (
                <>
                  <Copy className="ml-1.5 h-3.5 w-3.5" />
                  کپی همه لینک‌های این قسمت
                </>
              )}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
