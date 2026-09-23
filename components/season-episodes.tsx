'use client';

import { useEffect, useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import type { SerieEpisode, SerieSeason } from '../types';
import { EpisodeCard } from './episode-card';
import { OnlinePlayer } from './online-player';

interface SeasonEpisodesProps {
  season: SerieSeason;
  serieId: number;
  serieTitle: string;
  poster: string;
  snapshot?: unknown;
  allSeasons?: SerieSeason[];
}

/**
 * One season's episode list: search filter for long seasons + compact
 * episode boxes + a SINGLE shared player dialog (not one per episode).
 */
export function SeasonEpisodes({ season, serieId, serieTitle, poster, snapshot, allSeasons }: SeasonEpisodesProps) {
  const [query, setQuery] = useState('');
  const [playing, setPlaying] = useState<SerieEpisode | null>(null);
  const [visible, setVisible] = useState(30);

  const episodes = useMemo(() => season.episodes || [], [season.episodes]);

  const filtered = useMemo(() => {
    const q = query.trim();
    if (!q) return episodes;
    return episodes.filter((ep) => (ep.title || '').includes(q));
  }, [episodes, query]);

  useEffect(() => {
    setVisible(30);
  }, [query, season.id]);

  const shown = filtered.slice(0, visible);

  // next episode for autoplay (same season, else first episode of next season)
  const nextEpisode: SerieEpisode | null = useMemo(() => {
    if (!playing) return null;
    const eps = season.episodes || [];
    const idx = eps.findIndex((e) => e.id === playing.id);
    if (idx >= 0 && idx + 1 < eps.length) return eps[idx + 1];
    if (allSeasons && allSeasons.length) {
      const sIdx = allSeasons.findIndex((s) => s.id === season.id);
      for (let i = sIdx + 1; i < allSeasons.length; i++) {
        if (allSeasons[i]?.episodes?.length) return allSeasons[i].episodes[0];
      }
    }
    return null;
  }, [playing, season, allSeasons]);

  return (
    <>
      <Card className="bg-card/50 backdrop-blur border-0">
        <CardContent className="pt-4 md:pt-6">
          <div className="mb-3 flex items-center justify-between gap-2">
            <p className="text-xs text-muted-foreground">
              {episodes.length} قسمت
              {query.trim() && ` — ${filtered.length} نمایش`}
            </p>
            {episodes.length > 8 && (
              <div className="relative w-44 sm:w-56">
                <Search className="absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="جستجوی قسمت..."
                  className="w-full rounded-full bg-muted/50 py-1.5 pl-3 pr-9 text-xs ring-1 ring-border/60 focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all"
                />
              </div>
            )}
          </div>

          {filtered.length === 0 ? (
            <div className="rounded-2xl border border-border/60 p-8 text-center">
              <p className="text-sm text-muted-foreground">قسمتی با این نام پیدا نشد</p>
            </div>
          ) : (
            <>
              <div className="grid gap-2">
                {shown.map((episode) => (
                  <EpisodeCard
                    key={episode.id}
                    episode={episode}
                    onPlay={setPlaying}
                  />
                ))}
              </div>
              {filtered.length > visible && (
                <Button
                  onClick={() => setVisible((v) => v + 30)}
                  variant="ghost"
                  className="mt-3 w-full rounded-2xl bg-secondary/40 hover:bg-secondary/60 text-sm ring-1 ring-border/50"
                >
                  نمایش {Math.min(30, filtered.length - visible)} قسمت بیشتر
                  ({visible} از {filtered.length})
                </Button>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!playing} onOpenChange={(open) => !open && setPlaying(null)}>
        <DialogContent className="max-w-3xl p-4">
          <DialogHeader>
            <DialogTitle className="text-right">
              {serieTitle} — {playing?.title}
            </DialogTitle>
          </DialogHeader>
          {playing && (
            <OnlinePlayer
              title={playing.title}
              poster={poster}
              sources={playing.sources || []}
              storageKey={`serie-${serieId}-ep-${playing.id}`}
              history={{
                kind: 'serie',
                id: serieId,
                title: serieTitle,
                image: poster,
                snapshot: snapshot ?? null,
              }}
              nextTitle={nextEpisode ? nextEpisode.title : undefined}
              onNext={nextEpisode ? () => setPlaying(nextEpisode) : undefined}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
