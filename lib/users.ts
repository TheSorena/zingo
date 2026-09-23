import { redis } from './redis';

export interface PublicUser {
  id: string;
  name: string;
  color: number;
  createdAt: number;
  vip: boolean;
}

interface StoredUser extends PublicUser {
  pass: string; // saltHex.hashHex (PBKDF2-SHA256)
}

const userCountKey = 'u:count';

function toPublic(stored: Record<string, string>): PublicUser {
  return {
    id: stored.id,
    name: stored.name,
    color: Number(stored.color) || 0,
    createdAt: Number(stored.createdAt) || Date.now(),
    vip: stored.vip === 'true' || stored.vip === '1',
  };
}

export const userCookieName = 'zingo_user';
const SESSION_TTL_S = 30 * 24 * 60 * 60;

const userKey = (id: string) => `u:id:${id}`;
const nameKey = (normalized: string) => `u:name:${normalized}`;
const favKey = (id: string) => `u:fav:${id}`;

const enc = new TextEncoder();

function hex(buf: ArrayBuffer): string {
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

function unhex(s: string): Uint8Array {
  const out = new Uint8Array(s.length / 2);
  for (let i = 0; i < out.length; i++) out[i] = parseInt(s.slice(i * 2, i * 2 + 2), 16);
  return out;
}

function getSecret(): string {
  return process.env.ADMIN_SECRET || process.env.ADMIN_PASSCODE || 'zingo-dev-secret';
}

export function normalizeName(name: string): string {
  return name.trim().replace(/\s+/g, ' ').toLowerCase();
}

export function validateName(name: unknown): string | null {
  if (typeof name !== 'string') return 'نام کاربری لازم است';
  const t = name.trim().replace(/\s+/g, ' ');
  if (t.length < 2 || t.length > 24) return 'نام کاربری باید بین ۲ تا ۲۴ حرف باشد';
  if (/[<>&"']/.test(t)) return 'نام کاربری کاراکتر غیرمجاز دارد';
  return null;
}

export function validatePassword(pw: unknown): string | null {
  if (typeof pw !== 'string' || pw.length < 6 || pw.length > 72) {
    return 'رمز عبور باید بین ۶ تا ۷۲ حرف باشد';
  }
  return null;
}

export async function hashPassword(pw: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const key = await crypto.subtle.importKey('raw', enc.encode(pw), 'PBKDF2', false, [
    'deriveBits',
  ]);
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt: salt as BufferSource, iterations: 100000, hash: 'SHA-256' },
    key,
    256
  );
  return `${hex(salt.buffer as ArrayBuffer)}.${hex(bits)}`;
}

export async function verifyPassword(pw: string, stored: string): Promise<boolean> {
  const [saltHex, hashHex] = stored.split('.');
  if (!saltHex || !hashHex) return false;
  const key = await crypto.subtle.importKey('raw', enc.encode(pw), 'PBKDF2', false, [
    'deriveBits',
  ]);
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt: unhex(saltHex) as BufferSource, iterations: 100000, hash: 'SHA-256' },
    key,
    256
  );
  const a = hex(bits);
  if (a.length !== hashHex.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ hashHex.charCodeAt(i);
  return diff === 0;
}

async function sign(value: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(getSecret() + ':user'),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(value));
  return hex(sig);
}

function colorFor(name: string): number {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  return h % 5;
}

export async function createUser(
  name: string,
  password: string
): Promise<{ user: PublicUser } | { error: string }> {
  if (!redis) return { error: 'سرویس حساب در دسترس نیست' };
  const clean = name.trim().replace(/\s+/g, ' ');
  const norm = normalizeName(clean);
  const id = crypto.randomUUID();
  const pass = await hashPassword(password);
  const user: StoredUser = {
    id,
    name: clean,
    color: colorFor(norm),
    createdAt: Date.now(),
    vip: false,
    pass,
  };
  const taken = await redis.set(nameKey(norm), id, { nx: true });
  if (taken === null) return { error: 'این نام کاربری قبلاً گرفته شده' };
  await redis.hset(userKey(id), { ...user, vip: false } as any);
  try {
    await redis.incr(userCountKey);
  } catch {}
  const { pass: _p, ...pub } = user;
  return { user: { ...pub, vip: false } };
}

export async function authenticate(
  name: string,
  password: string
): Promise<{ user: PublicUser } | { error: string }> {
  if (!redis) return { error: 'سرویس حساب در دسترس نیست' };
  const id = await redis.get<string>(nameKey(normalizeName(name)));
  if (!id) return { error: 'کاربری با این نام پیدا نشد' };
  const stored = await redis.hgetall<Record<string, string>>(userKey(typeof id === 'string' ? id : String(id)));
  if (!stored || !stored['id']) return { error: 'کاربری با این نام پیدا نشد' };
  const ok = await verifyPassword(password, stored.pass);
  if (!ok) return { error: 'رمز عبور اشتباه است' };
  return { user: toPublic(stored) };
}

export async function getUserById(id: string): Promise<PublicUser | null> {
  if (!redis || !id) return null;
  const stored = await redis.hgetall<Record<string, string>>(userKey(id));
  if (!stored || !stored.id) return null;
  return toPublic(stored);
}

export async function setUserColor(id: string, color: number): Promise<PublicUser | null> {
  if (!redis) return null;
  const c = Math.max(0, Math.min(4, Math.floor(color)));
  const stored = await redis.hgetall<Record<string, string>>(userKey(id));
  if (!stored || !stored.id) return null;
  await redis.hset(userKey(id), { color: c });
  return getUserById(id);
}

export async function setUserVip(id: string, vip: boolean): Promise<PublicUser | null> {
  if (!redis) return null;
  const stored = await redis.hgetall<Record<string, string>>(userKey(id));
  if (!stored || !stored.id) return null;
  await redis.hset(userKey(id), { vip: vip ? 'true' : 'false' });
  return getUserById(id);
}

export async function getUserCount(): Promise<number> {
  if (!redis) return 0;
  try {
    const n = await redis.get<number>(userCountKey);
    if (typeof n === 'number') return n;
    if (typeof n === 'string') return Number(n) || 0;
  } catch {}
  return 0;
}

/** Paginated admin user list (newest heuristic via scan order isn't guaranteed). */
export async function listUsers(limit = 200): Promise<PublicUser[]> {
  if (!redis) return [];
  try {
    const out: PublicUser[] = [];
    let cursor: string | number = 0;
    do {
      const [next, keys] = await redis.scan(cursor, { match: 'u:id:*', count: 100 });
      cursor = next as string | number;
      for (const key of keys as string[]) {
        if (out.length >= limit) break;
        try {
          const stored = await redis.hgetall<Record<string, string>>(key);
          if (stored && stored.id) out.push(toPublic(stored));
        } catch {}
      }
    } while ((cursor !== 0 && cursor !== '0') && out.length < limit);
    return out.sort((a, b) => b.createdAt - a.createdAt);
  } catch {
    return [];
  }
}

export async function createSessionToken(userId: string): Promise<string> {
  const exp = Math.floor(Date.now() / 1000) + SESSION_TTL_S;
  const body = `${userId}.${exp}`;
  return `${body}.${await sign(body)}`;
}

export async function verifySessionToken(token: string | undefined): Promise<string | null> {
  if (!token) return null;
  const [id, exp, sig] = token.split('.');
  if (!id || !exp || !sig) return null;
  const expNum = Number(exp);
  if (!Number.isFinite(expNum) || expNum < Date.now() / 1000) return null;
  const expected = await sign(`${id}.${exp}`);
  if (expected.length !== sig.length) return null;
  let diff = 0;
  for (let i = 0; i < expected.length; i++) diff |= expected.charCodeAt(i) ^ sig.charCodeAt(i);
  return diff === 0 ? id : null;
}

export function sessionCookie(token: string, host: string | null) {
  const isLocal = !!host && (host.includes('localhost') || host.startsWith('127.'));
  return {
    name: userCookieName,
    value: token,
    opts: {
      httpOnly: true,
      sameSite: 'lax' as const,
      secure: !isLocal,
      path: '/',
      maxAge: SESSION_TTL_S,
    },
  };
}

// ---- per-user cloud favorites ----
export interface FavItem {
  id: number;
  title: string;
  type: string;
  year?: number;
  imdb?: number;
  duration?: string;
  image?: string;
  description?: string;
  country?: { id: number; title: string }[];
}

export function validateFavItem(input: any): string | null {
  if (!input || typeof input !== 'object') return 'آیتم نامعتبر است';
  if (!Number.isInteger(input.id) || input.id <= 0) return 'شناسه نامعتبر است';
  if (input.type !== 'movie' && input.type !== 'serie') return 'نوع نامعتبر است';
  if (typeof input.title !== 'string' || !input.title.trim()) return 'عنوان لازم است';
  return null;
}

export async function listFavorites(userId: string): Promise<FavItem[]> {
  if (!redis) return [];
  try {
    const raw = await redis.get<string>(favKey(userId));
    if (!raw) return [];
    const arr = typeof raw === 'string' ? JSON.parse(raw) : raw;
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

export async function addFavorite(userId: string, item: FavItem): Promise<FavItem[]> {
  const list = (await listFavorites(userId)).filter(
    (f) => !(f.id === item.id && f.type === item.type)
  );
  list.unshift(item);
  if (redis) {
    await redis.set(favKey(userId), JSON.stringify(list.slice(0, 500)));
  }
  return list.slice(0, 500);
}

export async function removeFavorite(
  userId: string,
  id: number,
  type: string
): Promise<FavItem[]> {
  const list = (await listFavorites(userId)).filter(
    (f) => !(f.id === id && f.type === type)
  );
  if (redis) {
    await redis.set(favKey(userId), JSON.stringify(list));
  }
  return list;
}
