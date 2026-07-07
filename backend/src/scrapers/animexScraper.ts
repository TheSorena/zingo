import { BaseScraper } from './baseScraper';
import * as cheerio from 'cheerio';

export interface ScrapedContent {
  title: string;
  originalTitle?: string;
  posterUrl: string;
  backdropUrl?: string;
  description: string;
  releaseYear?: number;
  imdbRating?: number;
  genreNames: string[];
  country?: string;
  quality?: string;
  contentType?: string;
  episodeCount?: number;
  seasonCount?: number;
  status?: string;
  airDay?: string;
  downloadLinks: Record<string, Record<string, string>>;
  source: string;
  sourceUrl: string;
  screenshots: string[];
  type: 'movie' | 'series';
}

export class AnimexScraper extends BaseScraper {
  constructor() {
    super('https://animex.click', 'animex');
  }

  async getListings(page: number = 1): Promise<string[]> {
    const urls: string[] = [];
    
    // animex.click uses /movie/, /serial/, /anime/ for listings
    // and /movie/page/2/, /serial/page/3/ for pagination
    const pages = [
      page === 1 ? `${this.baseUrl}/movie/` : `${this.baseUrl}/movie/page/${page}/`,
      page === 1 ? `${this.baseUrl}/serial/` : `${this.baseUrl}/serial/page/${page}/`,
      page === 1 ? `${this.baseUrl}/anime/` : `${this.baseUrl}/anime/page/${page}/`,
    ];

    for (const pageUrl of pages) {
      const $ = await this.fetchPage(pageUrl);
      if (!$) continue;

      $('a[href]').each((_, el) => {
        const href = this.getAttr($(el), 'href');
        if (!href) return;

        // Match anime/movie/serial links
        if (href.match(/animex\.(click|cc)\/(anime|movie|serial)\//)) {
          const normalizedUrl = href.replace('animex.cc', 'animex.click');
          urls.push(normalizedUrl);
        }
      });
    }

    return [...new Set(urls)];
  }

  async scrapeContent(url: string): Promise<ScrapedContent | null> {
    const $ = await this.fetchPage(url);
    if (!$) return null;

    const pageTitle = this.getText($('title'));
    const title = pageTitle.replace(/–\s*انیمکس$/i, '').replace(/\s*-\s*انیمکس$/i, '').trim();
    if (!title) return null;

    const posterUrl = this.getAttr($('img.postimgf, .post-thumbnail img, .entry-content img').first(), 'src')
      || this.getAttr($('img').first(), 'src') || '';

    const data: ScrapedContent = {
      title,
      posterUrl,
      description: '',
      genreNames: [],
      downloadLinks: {},
      source: this.name,
      sourceUrl: url,
      screenshots: [],
      type: 'movie'
    };

    // === METADATA: Use proper cheerio selectors ===

    // Type: detect from URL path (/serial/ = series, /anime/ = series, /movie/ = movie)
    if (url.includes('/serial/') || url.includes('/anime/')) {
      data.type = 'series';
    } else {
      data.type = 'movie';
    }

    // Country: .countsta contains "محصول : <a>کشور</a>"
    const countryLink = $('.countsta a').first();
    if (countryLink.length) {
      data.country = countryLink.text().trim();
    } else {
      // Fallback: look for /country/ link anywhere in header
      const countryFallback = $('a[href*="/country/"]').first();
      if (countryFallback.length) {
        const t = countryFallback.text().trim();
        if (t.length > 1 && t.length < 30) data.country = t;
      }
    }

    // Quality: .keyfiatnam contains "کیفیت نمایش : WEB-DL"
    const qualEl = $('.keyfiatnam').first();
    if (qualEl.length) {
      const qt = qualEl.text().replace(/\s+/g, ' ').trim();
      const qm = qt.match(/کیفیت\s*(?:نمایش|دانلود)?\s*:\s*(.+)/i);
      if (qm) data.quality = qm[1].trim();
    }

    // Episode count: .epsis contains the total episode count (e.g. "39")
    // OR .notfseries contains "قسمت <span>16</span> فصل <span>5</span>"
    const epsisEl = $('.epsis').first();
    if (epsisEl.length) {
      const epNum = parseInt(epsisEl.text().trim());
      if (epNum > 0 && epNum < 10000) data.episodeCount = epNum;
    }
    // Also check .notfseries for episode/season info
    const notfEl = $('.notfseries').first();
    if (notfEl.length) {
      const notfText = notfEl.text().replace(/\s+/g, ' ');
      const epM = notfText.match(/قسمت\s*(\d+)/);
      if (epM && !data.episodeCount) data.episodeCount = parseInt(epM[1]);
      const ssnM = notfText.match(/فصل\s*(\d+)/);
      if (ssnM) data.seasonCount = parseInt(ssnM[1]);
    }

    // Season count: also check .ghesmatd for "S1 EP10" pattern
    if (!data.seasonCount) {
      const ghesmatEl = $('.ghesmatd').first();
      if (ghesmatEl.length) {
        const gt = ghesmatEl.text();
        const sm = gt.match(/S(\d+)/i);
        if (sm) data.seasonCount = parseInt(sm[1]);
      }
    }

    // Year: find /release/ or /releasea/ link in header (NOT nav menu)
    // Look specifically in .sectionfour or .timeplye which is in the article header
    const yearLink = $('.sectionfour a[href*="/release"], .timeplye a[href*="/release"], .sectionfive a[href*="/release"]').first();
    if (yearLink.length) {
      const ym = yearLink.attr('href')?.match(/release[ak]?\/(\d{4})/);
      if (ym) {
        const y = parseInt(ym[1]);
        if (y >= 1940 && y <= 2027) data.releaseYear = y;
      }
    }
    // Fallback: look in article header for any release link
    if (!data.releaseYear) {
      const articleYear = $('article a[href*="/release/"], article a[href*="/releasea/"]').first();
      if (articleYear.length) {
        const ym2 = articleYear.attr('href')?.match(/release[ak]?\/(\d{4})/);
        if (ym2) {
          const y2 = parseInt(ym2[1]);
          if (y2 >= 1940 && y2 <= 2027) data.releaseYear = y2;
        }
      }
    }

    // Status: .vazipakh2 contains "وضعیت : اتمام پخش"
    const statusEl = $('.vazipakh2').first();
    if (statusEl.length) {
      const st = statusEl.text().replace(/\s+/g, ' ').trim();
      const stm = st.match(/وضعیت\s*:\s*(.+)/i);
      if (stm) data.status = stm[1].trim();
    }

    // Air day
    const bodyText = $.root().text().replace(/\s+/g, ' ').trim();
    const dayMatch = bodyText.match(/روز\s*پخش\s*(?:هفتگی)?\s*:\s*([\w\u0600-\u06FF]+)/i);
    if (dayMatch) data.airDay = dayMatch[1].trim();

    // IMDB rating: look in main article header (not related cards)
    // The main page has IMDB in .sjmrate inside the header section
    const imdbEl = $('article .sjmrate, .topinterface .sjmrate, header .sjmrate').first();
    if (imdbEl.length) {
      const imdbText = imdbEl.text().replace(/\s+/g, ' ');
      const imdbM = imdbText.match(/(\d+\.?\d*)/);
      if (imdbM) {
        const r = parseFloat(imdbM[1]);
        if (r > 0 && r <= 10) data.imdbRating = r;
      }
    }
    // Fallback: look for IMDB rating in .singletitle section
    if (!data.imdbRating) {
      const imdbFallback = $('.singletitle').parent().find('.sjmrate').first();
      if (imdbFallback.length) {
        const ft = imdbFallback.text().replace(/\s+/g, ' ');
        const fm = ft.match(/(\d+\.?\d*)/);
        if (fm) {
          const fr = parseFloat(fm[1]);
          if (fr > 0 && fr <= 10) data.imdbRating = fr;
        }
      }
    }

    // Genres: find links INSIDE .sectiontwo .timeradif (header metadata section only)
    // Avoid nav menu links by scoping to the article/header section
    const seenGenres = new Set<string>();
    const genreSelector = '.timeradif a[href*="/genre"], .sectiontwo a[href*="/genre"], article a[href*="/genre"]';
    $(genreSelector).each((_, el) => {
      const href = this.getAttr($(el), 'href') || '';
      // Only match genre links (not /country/, /release/, /cast/, /director/ etc)
      if (!href.match(/\/genre[cakt]?\//)) return;
      const text = this.getText($(el)).trim();
      if (text.length > 1 && text.length < 30 && !seenGenres.has(text)) {
        seenGenres.add(text);
        data.genreNames.push(text);
      }
    });
    // Fallback: if no genres found from scoped selectors, try broader search
    if (data.genreNames.length === 0) {
      $('a[href*="/genre/"], a[href*="/genrea/"], a[href*="/genrek/"], a[href*="/genret/"]').each((_, el) => {
        const href = this.getAttr($(el), 'href') || '';
        // Skip nav menu links - they have long paths like /genrea/آشپزی/
        // Genre links in content are shorter
        const text = this.getText($(el)).trim();
        if (text.length > 1 && text.length < 25 && !seenGenres.has(text) && href.split('/').filter(Boolean).length <= 3) {
          // Additional check: skip if href contains URL-encoded long paths (nav menu)
          const pathParts = href.split('/').filter(Boolean);
          if (pathParts.length === 2 && pathParts[0].match(/^genre[cakt]?$/)) {
            seenGenres.add(text);
            data.genreNames.push(text);
          }
        }
      });
    }

    // --- Download Links ---
    // Strategy: find pairs of "پخش آنلاین" + "دانلود" links
    // The download link href contains the quality in the URL path
    // Download hosts (all variations of storage servers)
    const dlHosts = ['csdl1', 'ndl1', 'ndl2', 'ndl3', 'ndl4', 'ndl5', 'ndl6', 'ndl7', 'ndl8', 'ndl9',
                     'dl.hollowofthealley', 'dl2.hollowofthealley', 'dl2a.hollowofthealley', 'dl6.hollowofthealley'];
    const hostSelector = dlHosts.map(h => `a[href*="${h}"]`).join(', ');

    interface DlEntry { url: string; quality: string; serverHost: string; isDirect: boolean }
    const entries: DlEntry[] = [];
    const seenUrls = new Set<string>();

    $(hostSelector).each((_, el) => {
      const href = this.getAttr($(el), 'href');
      if (!href || seenUrls.has(href)) return;
      seenUrls.add(href);

      // Skip subtitle links
      if (href.includes('subsource.net') || href.includes('subsource')) return;
      // Skip stream links
      if (href.includes('animexstream.fun') || href.includes('animexstream')) return;

      let serverHost = 'unknown';
      try {
        const fullUrl = href.startsWith('http') ? href : `https://${href}`;
        serverHost = new URL(fullUrl).hostname.replace('.hollowofthealley.space', '');
      } catch {}

      const quality = this.extractQualityFromUrl(href);
      const isDirect = !!href.match(/\.(mkv|mp4|zip)$/i) || href.includes('/N/');

      entries.push({ url: href, quality, serverHost, isDirect });
    });

    // Group by server host + directory key (to separate seasons/episode ranges)
    // Directory key = common path prefix that groups same-season links
    const groupMap = new Map<string, Record<string, string>>();

    for (const entry of entries) {
      let groupKey = entry.serverHost;
      // For directory URLs, use the parent directory as group key
      try {
        const u = new URL(entry.url);
        const dir = u.searchParams.get('dir') || '';
        if (dir) {
          const parts = dir.split('/').filter(Boolean);
          if (parts.length > 1) {
            // Use everything except the last segment as the group key
            const parentDir = parts.slice(0, -1).join('/');
            groupKey = `${entry.serverHost}/${parentDir}`;
          }
        }
      } catch {}

      if (!groupMap.has(groupKey)) groupMap.set(groupKey, {});
      const linkGroup = groupMap.get(groupKey)!;
      linkGroup[entry.quality] = entry.url;
    }

    // Assign server names
    let serverIdx = 1;
    for (const [groupKey, links] of groupMap) {
      data.downloadLinks[`server${serverIdx}`] = links;
      serverIdx++;
    }

    // Fallback: if no download links found, try generic "دانلود" anchor search
    if (Object.keys(data.downloadLinks).length === 0) {
      $('a').each((_, el) => {
        const href = this.getAttr($(el), 'href');
        const text = this.getText($(el)).trim();
        if (href && text === 'دانلود' && !href.includes('subsource.net') && !href.includes('animexstream.fun')) {
          const quality = this.extractQualityFromUrl(href);
          const serverName = `server${Object.keys(data.downloadLinks).length + 1}`;
          if (!data.downloadLinks[serverName]) data.downloadLinks[serverName] = {};
          data.downloadLinks[serverName][quality] = href;
        }
      });
    }

    // --- Screenshots ---
    const seenScreenshots = new Set<string>();
    $('img').each((_, el) => {
      const src = this.getAttr($(el), 'src');
      if (src && (src.includes('screenshot') || src.includes('/ss/') || src.includes('wp-content/uploads'))
        && !src.includes('logo') && !src.includes('avatar') && !src.includes('poster')
        && !seenScreenshots.has(src) && data.screenshots.length < 8) {
        seenScreenshots.add(src);
        data.screenshots.push(src);
      }
    });

    // --- Description ---
    const descEl = $('.story, .entry-content, .post-content, .contenctpost p').first();
    let descText = '';
    if (descEl.length) {
      descText = descEl.text().trim();
    }
    if (!descText) {
      const entryContent = $('.entry-content, .post-content').html() || '';
      const descHtml = entryContent.replace(/<table[\s\S]*?<\/table>/gi, '').replace(/<div[^>]*class="[^"]*download[^"]*"[\s\S]*?<\/div>/gi, '');
      descText = cheerio.load(descHtml)('body').text().trim();
    }
    data.description = descText.substring(0, 2000);

    return data;
  }
}
