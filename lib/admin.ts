const COOKIE_NAME = 'zingo_admin';
const TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000;

export function safeEqual(a: string, b: string): boolean {
  const enc = new TextEncoder();
  const ab = enc.encode(a);
  const bb = enc.encode(b);
  if (ab.length !== bb.length) {
    // still walk the longer buffer to keep timing less predictable
    let diff = ab.length ^ bb.length;
    const len = Math.max(ab.length, bb.length);
    for (let i = 0; i < len; (i = (i + 1) | 0)) {
      const x = i < ab.length ? ab[i] : 0;
      const y = i < bb.length ? bb[i] : 0;
      diff |= x ^ y;
    }
    return diff === 0;
  }
  let diff = 0;
  for (let i = 0; i < ab.length; (i = (i + 1) | 0)) {
    diff |= ab[i] ^ bb[i];
  }
  return diff === 0;
}

function getSecret(): string {
  return process.env.ADMIN_SECRET || process.env.ADMIN_PASSCODE || '';
}

async function sign(value: string): Promise<string> {
  const secret = getSecret();
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(value));
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export async function createAdminToken(): Promise<string> {
  const ts = Date.now().toString();
  const sig = await sign(ts);
  return `${ts}.${sig}`;
}

export async function verifyAdminToken(token: string | undefined): Promise<boolean> {
  if (!token || !getSecret()) return false;
  const [ts, sig] = token.split('.');
  if (!ts || !sig) return false;

  const age = Date.now() - parseInt(ts, 10);
  if (isNaN(age) || age < 0 || age > TOKEN_TTL_MS) return false;

  const expected = await sign(ts);
  return safeEqual(sig, expected);
}

export const adminCookieName = COOKIE_NAME;