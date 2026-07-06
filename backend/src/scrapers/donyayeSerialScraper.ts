import { BaseScraper } from './baseScraper';
import * as cheerio from 'cheerio';

export interface ScrapedContent {
  title: string;
  originalTitle?: string;
  posterUrl: string;
  description: string;
  releaseYear?: number;
  imdbRating?: number;
  genreNames: string[];
  country?: string;
  quality?: string;
  downloadLinks: Record<string, Record<string, string>>;
  source: string;
  sourceUrl: string;
  screenshots: string[];
  type: 'movie' | 'series';
}

export class DonyayeSerialScraper extends BaseScraper {
  constructor() {
    super('https://donyayeserial.com', 'donyayeserial');
  }

  async getListings(page: number = 1): Promise<string[]> {
    const urls: string[] = [];
    const $ = await this.fetchPage(`${this.baseUrl}/page/${page}/`);
    if (!$) return urls;

    // Find all content links (series, movie, film)
    $('a[href]').each((_, el) => {
      const href = this.getAttr($(el), 'href');
      if (!href) return;

      // Match series/movie/film links
      if (href.match(/donyayeserial\.com\/(series|movie|film|serial)\//) ||
          href.match(/donyayeserial\.com\/\d+\//)) {
        urls.push(href.startsWith('http') ? href : `${this.baseUrl}${href}`);
      }
    });

    return [...new Set(urls)];
  }

  async scrapeContent(url: string): Promise<ScrapedContent | null> {
    const $ = await this.fetchPage(url);
    if (!$) return null;

    // Detect type from URL
    const type = url.includes('/series/') || url.includes('/serial/') ? 'series' : 'movie';

    // Title - try multiple selectors
    let title = '';
    const titleSelectors = [
      'h1.entry-title',
      'h1.title',
      '.header h1',
      'h1',
    ];
    for (const selector of titleSelectors) {
      title = this.getText($(selector));
      if (title) break;
    }
    if (!title) {
      const ogTitle = $('meta[property="og:title"]').attr('content');
      if (ogTitle) title = ogTitle;
    }
    if (!title) return null;

    // Clean title - remove Persian prefix
    title = title.replace(/^دانلود\s+(سریال|فیلم|انیمه)\s+/i, '').trim();

    // Poster
    const posterUrl = $('meta[property="og:image"]').attr('content') ||
                      $('img.featured').attr('src') ||
                      $('img.wp-post-image').attr('src') ||
                      $('img').first().attr('src') || '';

    // Description
    const description = $('meta[name="description"]').attr('content') ||
                       $('meta[property="og:description"]').attr('content') ||
                       $('.entry-content p').first().text().trim() || '';

    // Year
    const yearMatch = $('body').html()?.match(/\(?(\d{4})\)?/);
    const releaseYear = yearMatch ? parseInt(yearMatch[1]) : null;

    // IMDB
    const imdbMatch = $('body').text().match(/IMDB[:\s]*(\d+\.?\d*)/i);
    const imdbRating = imdbMatch ? parseFloat(imdbMatch[1]) : null;

    // Genres
    const genreNames: string[] = [];
    $('a[href*="/genre/"], a[href*="/tag/"]').each((_, el) => {
      const genre = $(el).text().trim();
      if (genre && genre.length > 1 && genre.length < 30) {
        genreNames.push(genre);
      }
    });

    // Download links - try multiple approaches
    const downloadLinks: Record<string, Record<string, string>> = {};
    let serverIdx = 1;

    // Method 1: Look for download sections
    $('div.download a, .download-link a, a[href*="download"], a[href*="dl="]').each((_, el) => {
      const href = this.getAttr($(el), 'href');
      const text = this.getText($(el));
      if (!href || href.includes('donyayeserial.com')) return;
      if (href.includes('preview=true')) return;

      const quality = this.extractQualityFromText(text) || this.extractQualityFromText(href);
      const serverName = `server${serverIdx}`;

      if (!downloadLinks[serverName]) downloadLinks[serverName] = {};
      downloadLinks[serverName][quality] = href;
      serverIdx++;
    });

    // Method 2: Scan all links for download patterns
    if (Object.keys(downloadLinks).length === 0) {
      $('a[href]').each((_, el) => {
        const href = this.getAttr($(el), 'href');
        if (!href) return;
        if (href.includes('donyayeserial.com')) return;

        // Check if it's a download link
        if (href.match(/\.mkv|\.mp4|\.avi|download|dl=|iran-gamecenter|mega\.nz|google\.com|dropbox/i)) {
          const quality = this.extractQualityFromText(href) || 'unknown';
          const serverName = `server${serverIdx}`;

          if (!downloadLinks[serverName]) downloadLinks[serverName] = {};
          downloadLinks[serverName][quality] = href;
          serverIdx++;
        }
      });
    }

    return {
      title,
      posterUrl,
      description,
      releaseYear: releaseYear || undefined,
      imdbRating: imdbRating || undefined,
      genreNames: [...new Set(genreNames)],
      downloadLinks,
      source: this.name,
      sourceUrl: url,
      screenshots: [],
      type,
    };
  }

  private extractQualityFromText(text: string): string {
    const t = text.toLowerCase();
    if (t.includes('4k') || t.includes('2160p')) return '4K';
    if (t.includes('1080p') || t.includes('fhd')) return '1080p';
    if (t.includes('720p') || t.includes('hd')) return '720p';
    if (t.includes('480p') || t.includes('sd')) return '480p';
    if (t.includes('360p')) return '360p';
    return 'unknown';
  }
}
