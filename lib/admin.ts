const COOKIE_NAME = 'zingo_admin';
const TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000;

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
  return sig === expected;
}

export const adminCookieName = COOKIE_NAME;