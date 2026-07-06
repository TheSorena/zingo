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

interface ScrapedItem {
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

async function main() {
  console.log('Reading scraped.json...');
  const filePath = path.join(__dirname, 'scraped.json');
  const rawData = fs.readFileSync(filePath, 'utf-8');
  const items: ScrapedItem[] = JSON.parse(rawData);
  
  console.log(`Found ${items.length} items to import\n`);

  let created = 0;
  let updated = 0;
  let failed = 0;

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    try {
      const cleanName = cleanTitle(item.title);
      const slug = slugify(cleanName);
      const imdbRating = parseFloat(item.imdb) || null;
      
      // Extract year from URL
      const yearMatch = item.url.match(/\/(\d{4})\//);
      const year = yearMatch ? parseInt(yearMatch[1]) : null;

      if (item.type === 'series' && item.seasons) {
        // Create or update series
        const existingSeries = await prisma.series.findUnique({ where: { slug } });
        
        if (existingSeries) {
          await prisma.series.update({
            where: { id: existingSeries.id },
            data: {
              posterUrl: item.poster || existingSeries.posterUrl,
              description: item.description || existingSeries.description,
              releaseYear: year || existingSeries.releaseYear,
              imdbRating: imdbRating || existingSeries.imdbRating,
              source: 'donyayeserial',
              sourceUrl: item.url,
            }
          });
          updated++;
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
          created++;
        }

        // Create seasons and episodes
        const series = await prisma.series.findUnique({ where: { slug } });
        if (!series) continue;

        for (const seasonData of item.seasons) {
          // Check if season exists
          let season = await prisma.season.findFirst({
            where: { seriesId: series.id, seasonNumber: seasonData.season }
          });

          if (!season) {
            season = await prisma.season.create({
              data: {
                seriesId: series.id,
                seasonNumber: seasonData.season,
              }
            });
          }

          // Create episodes
          for (const ep of seasonData.episodes) {
            const existingEp = await prisma.episode.findFirst({
              where: { seasonId: season.id, episodeNumber: ep.episode }
            });

            if (!existingEp) {
              await prisma.episode.create({
                data: {
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
    } catch (err: any) {
      failed++;
      if (failed <= 10) {
        console.error(`  Error on item ${i}: ${err.message?.substring(0, 80)}`);
      }
    }

    if ((created + updated) % 100 === 0 && created + updated > 0) {
      console.log(`  Progress: ${created + updated}/${items.length} (${created} created, ${updated} updated, ${failed} failed)`);
    }
  }

  const totalSeries = await prisma.series.count();
  const totalEpisodes = await prisma.episode.count();
  const totalSeasons = await prisma.season.count();
  
  console.log(`\n========================================`);
  console.log(`✅ Import completed!`);
  console.log(`   Created: ${created} | Updated: ${updated} | Failed: ${failed}`);
  console.log(`   Total series in DB: ${totalSeries}`);
  console.log(`   Total seasons in DB: ${totalSeasons}`);
  console.log(`   Total episodes in DB: ${totalEpisodes}`);
  console.log(`========================================`);

  await prisma.$disconnect();
}

main().catch(console.error);
