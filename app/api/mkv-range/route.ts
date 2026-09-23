import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

// Known file hosts (upstream video/subtitle sources). Anything else → 403
// so this endpoint can't be abused as an open relay.
const ALLOWED_HOST_RE =
  /giftmond|ariaservers|freeverss|dl175m|hostinnegar|saberfun|digimoviez|avamovie|filmkio|tizer/i;

const MAX_LEN = 4 * 1024 * 1024; // 4MB per window (subtitle index/cluster ranges)

const BROWSER_HEADERS: Record<string, string> = {
  Accept: '*/*',
  'Accept-Language': 'fa-IR,fa;q=0.9,en;q=0.8',
  'User-Agent':
    'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Mobile Safari/537.36',
  Referer: 'https://hostinnegar.com/',
};

/**
 * Byte-range proxy for subtitle extraction (MKV headers / Cues / clusters).
 * Same-origin https wrapper so WebView + browsers can fetch ranges from
 * plain-http file hosts without mixed-content blocks.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const raw = searchParams.get('url') || '';
    const start = Math.max(0, Number(searchParams.get('start') || '0'));
    const len = Math.min(MAX_LEN, Math.max(1, Number(searchParams.get('len') || `${2 * 1024 * 1024}`)));

    let target: URL;
    try {
      target = new URL(raw);
    } catch {
      return NextResponse.json({ error: 'آدرس نامعتبر است' }, { status: 400 });
    }
    if (target.protocol !== 'http:' && target.protocol !== 'https:') {
      return NextResponse.json({ error: 'پروتکل نامعتبر است' }, { status: 400 });
    }
    if (!ALLOWED_HOST_RE.test(target.hostname)) {
      return NextResponse.json({ error: 'هاست مجاز نیست' }, { status: 403 });
    }
    if (!Number.isFinite(start) || !Number.isFinite(len)) {
      return NextResponse.json({ error: 'بازه نامعتبر است' }, { status: 400 });
    }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 25000);
    let upstream: Response;
    try {
      upstream = await fetch(target.toString(), {
        headers: { ...BROWSER_HEADERS, Range: `bytes=${start}-${start + len - 1}` },
        cache: 'no-store',
        signal: controller.signal,
      });
    } finally {
      clearTimeout(timer);
    }

    if (upstream.status !== 206 && upstream.status !== 200) {
      return NextResponse.json(
        { error: 'سرور فایل پاسخ نداد' },
        { status: 502 }
      );
    }

    const outHeaders = new Headers();
    const cr = upstream.headers.get('Content-Range');
    const cl = upstream.headers.get('Content-Length');
    if (cr) outHeaders.set('Content-Range', cr);
    if (cl) outHeaders.set('Content-Length', cl);
    outHeaders.set('Content-Type', 'application/octet-stream');
    outHeaders.set('Accept-Ranges', 'bytes');
    outHeaders.set('Cache-Control', 'public, max-age=86400');

    return new Response(upstream.body, { status: upstream.status, headers: outHeaders });
  } catch (error) {
    console.error('mkv-range error:', error);
    return NextResponse.json({ error: 'خطا در دریافت بازه فایل' }, { status: 500 });
  }
}
