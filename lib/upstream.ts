import { redis } from './redis';

const BROWSER_HEADERS: Record<string, string> = {
  'Accept': 'application/json, text/plain, */*',
  'Accept-Language': 'fa-IR,fa;q=0.9,en;q=0.8',
  'User-Agent':
    'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Mobile Safari/537.36',
  Referer: 'https://hostinnegar.com/',
};

const cacheKey = (url: string) => `zingo:cache:${url}`;

/**
 * Fetch JSON from the upstream source with browser-like headers.
 * On success the payload is cached in Upstash for `ttlSeconds`.
 * If the upstream is unreachable/blocked, serve the last cached copy
 * (even if expired) so the site keeps working during outages.
 */
export async function fetchUpstreamJson<T = unknown>(
  url: string,
  ttlSeconds = 1800
): Promise<T> {
  let liveError: unknown = null;

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 12000);
    const res = await fetch(url, {
      headers: BROWSER_HEADERS,
      cache: 'no-store',
      signal: controller.signal,
    });
    clearTimeout(timer);

    if (!res.ok) {
      throw new Error(`Upstream responded ${res.status}`);
    }

    const data = (await res.json()) as T;

    if (redis) {
      try {
        await redis.set(cacheKey(url), data as any, { ex: ttlSeconds });
      } catch {
        // cache write failures must never break the response
      }
    }

    return data;
  } catch (err) {
    liveError = err;
  }

  if (redis) {
    try {
      const cached = await redis.get<any>(cacheKey(url));
      if (cached) {
        return (typeof cached === 'string' ? JSON.parse(cached) : cached) as T;
      }
    } catch {
      // fall through to throw
    }
  }

  throw liveError ?? new Error('Upstream fetch failed');
}