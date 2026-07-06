import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

interface Episode {
  url: string;
  filename: string;
  quality: string;
  subtitle: string;
  codec: string;
  episode: number;
}

interface Season {
  season: number;
  episodes: Episode[];
}

interface SeriesItem {
  type: 'series' | 'movie';
  title: string;
  url: string;
  imdb: string;
  poster: string;
  genres: string[];
  description: string;
  seasons?: Season[];
  links?: Array<{ url: string; quality: string; subtitle: string; codec: string }>;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[\u0600-\u06FF]+/g, (match) => {
      const persian: Record<string, string> = {
        'آ': 'a', 'ا': 'a', 'ب': 'b', 'پ': 'p', 'ت': 't',
        'ث': 's', 'ج': 'j', 'چ': 'ch', 'ح': 'h', 'خ': 'kh',
        'د': 'd', 'ذ': 'z', 'ر': 'r', 'ز': 'z', 'ژ': 'zh',
        'س': 's', 'ش': 'sh', 'ص': 's', 'ض': 'z', 'ط': 't',
        'ظ': 'z', 'ع': 'a', 'غ': 'gh', 'ف': 'f', 'ق': 'gh',
        'ک': 'k', 'گ': 'g', 'ل': 'l', 'م': 'm', 'ن': 'n',
        'و': 'v', 'ه': 'h', 'ی': 'y'
      };
      return match.split('').map(c => persian[c] || c).join('');
    })
    .replace(/[\s\W-]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'untitled';
}

function cleanTitle(title: string): string {
  return title
    .replace(/^دانلود\s+(سریال|فیلم|انیمه)\s+/i, '')
    .replace(/\s*-\s*دانلود\s+/i, '')
    .trim();
}

function extractYear(url: string): number | null {
  const match = url.match(/\/(\d{4})\//);
  return match ? parseInt(match[1]) : null;
}

function extractQualityLinks(episodes: Episode[]): Record<string, string> {
  const links: Record<string, string> = {};
  for (const ep of episodes) {
    const q = ep.quality.toLowerCase().replace('p', '') + 'p';
    if (!links[q]) links[q] = ep.url;
  }
  return links;
}

async function importItem(item: SeriesItem, index: number) {
  const cleanName = cleanTitle(item.title);
  const slug = slugify(cleanName);
  const imdbRating = parseFloat(item.imdb) || null;
  const year = extractYear(item.url);

  if (item.type === 'series' && item.seasons) {
    const existing = await prisma.series.findUnique({ where: { slug } });
    
    if (existing) {
      await prisma.series.update({
        where: { id: existing.id },
        data: {
          title: cleanName,
          posterUrl: item.poster || existing.posterUrl,
          description: item.description || existing.description,
          releaseYear: year || existing.releaseYear,
          imdbRating: imdbRating || existing.imdbRating,
          source: 'donyayeserial',
          sourceUrl: item.url,
        }
      });
    } else {
      await prisma.series.create({
        data: {
          title: cleanName,
          slug,
          posterUrl: item.poster || 'https://via.placeholder.com/300x450',
          description: item.description || '',
          releaseYear: year,
          imdbRating,
          source: 'donyayeserial',
          sourceUrl: item.url,
          cast: '[]',
          screenshots: '[]',
        }
      });
    }

    for (const seasonData of item.seasons) {
      const series = await prisma.series.findUnique({ where: { slug } });
      if (!series) continue;

      const season = await prisma.season.upsert({
        where: { id: (await prisma.season.findFirst({ where: { seriesId: series.id, seasonNumber: seasonData.season } }))?.id || -1 },
        update: {},
        create: {
          seriesId: series.id,
          seasonNumber: seasonData.season,
        }
      });

      if (season.id === -1) continue;

      for (const ep of seasonData.episodes) {
        await prisma.episode.upsert({
          where: { id: (await prisma.episode.findFirst({ where: { seasonId: season.id, episodeNumber: ep.episode } }))?.id || -1 },
          update: {
            downloadLinks: JSON.stringify({ server1: { [ep.quality]: ep.url } }),
          },
          create: {
            seasonId: season.id,
            episodeNumber: ep.episode,
            title: ep.filename,
            downloadLinks: JSON.stringify({ server1: { [ep.quality]: ep.url } }),
          }
        });
      }
    }
  }
}

async function main() {
  console.log('Reading scraped.json...');
  const filePath = path.join(__dirname, 'scraped.json');
  const rawData = fs.readFileSync(filePath, 'utf-8');
  const items: SeriesItem[] = JSON.parse(rawData);
  
  console.log(`Found ${items.length} items to import\n`);

  let imported = 0;
  let failed = 0;

  for (let i = 0; i < items.length; i++) {
    try {
      await importItem(items[i], i);
      imported++;
      if (imported % 100 === 0) {
        console.log(`  Progress: ${imported}/${items.length}`);
      }
    } catch (err: any) {
      failed++;
      if (failed <= 5) {
        console.error(`  Error on item ${i}: ${err.message?.substring(0, 80)}`);
      }
    }
  }

  const totalSeries = await prisma.series.count();
  const totalEpisodes = await prisma.episode.count();
  
  console.log(`\n========================================`);
  console.log(`✅ Import completed!`);
  console.log(`   Imported: ${imported} | Failed: ${failed}`);
  console.log(`   Total series in DB: ${totalSeries}`);
  console.log(`   Total episodes in DB: ${totalEpisodes}`);
  console.log(`========================================`);

  await prisma.$disconnect();
}

main().catch(console.error);
