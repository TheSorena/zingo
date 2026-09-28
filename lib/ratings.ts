import { redis } from './redis';

export type RateTarget = 'movie' | 'serie';

const aggKey = (type: string, id: number) => `r:agg:${type}:${id}`;
const userKey = (uid: string) => `r:u:${uid}`;
const field = (type: string, id: number) => `${type}:${id}`;

export interface RatingSummary {
  avg: number | null;
  count: number;
  mine: number | null;
}

export async function getRating(
  type: string,
  id: number,
  uid?: string | null
): Promise<RatingSummary> {
  let avg: number | null = null;
  let count = 0;
  let mine: number | null = null;
  if (!redis) return { avg, count, mine };
  try {
    const agg = await redis.hgetall<Record<string, string>>(aggKey(type, id));
    if (agg && agg.sum !== undefined) {
      const sum = Number(agg.sum) || 0;
      count = Number(agg.count) || 0;
      if (count > 0) avg = Math.round((sum / count) * 10) / 10;
    }
  } catch {}
  if (uid) {
    try {
      const v = await redis.hget<string>(userKey(uid), field(type, id));
      if (v !== null && v !== undefined) mine = Number(v) || null;
    } catch {}
  }
  return { avg, count, mine };
}

export async function setRating(
  uid: string,
  type: string,
  id: number,
  score: number
): Promise<RatingSummary> {
  if (!redis) throw new Error('unavailable');
  const s = Math.max(1, Math.min(10, Math.round(score)));
  const f = field(type, id);
  const prev = await redis.hget<string>(userKey(uid), f);
  const prevNum = prev !== null && prev !== undefined ? Number(prev) || 0 : 0;
  await redis.hset(userKey(uid), { [f]: s });
  if (prevNum > 0) {
    await redis.hincrby(aggKey(type, id), 'sum', s - prevNum);
  } else {
    await redis.hincrby(aggKey(type, id), 'sum', s);
    await redis.hincrby(aggKey(type, id), 'count', 1);
  }
  return getRating(type, id, uid);
}

export async function getMyRatings(uid: string): Promise<
  { type: string; id: number; score: number }[]
> {
  if (!redis) return [];
  try {
    const all = await redis.hgetall<Record<string, string>>(userKey(uid));
    if (!all) return [];
    const out: { type: string; id: number; score: number }[] = [];
    for (const k of Object.keys(all)) {
      const m = /^(movie|serie):(\d+)$/.exec(k);
      if (m) out.push({ type: m[1], id: Number(m[2]), score: Number(all[k]) || 0 });
    }
    return out;
  } catch {
    return [];
  }
}
