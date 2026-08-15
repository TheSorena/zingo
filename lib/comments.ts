import { redis } from './redis';

export type CommentItem = {
  id: string;
  type: 'movie' | 'serie';
  targetId: number;
  name: string;
  text: string;
  hasSpoiler: boolean;
  createdAt: number;
  reply?: string;
  repliedAt?: number;
};

const dataKey = (id: string) => `c:data:${id}`;
const listKey = (type: string, targetId: number) => `c:${type}:${targetId}`;
const allKey = 'c:all';

export function validateComment(input: {
  name?: string;
  text?: string;
}): string | null {
  const name = input.name?.trim() || '';
  const text = input.text?.trim() || '';

  if (name.length < 2 || name.length > 30) {
    return 'نام باید بین ۲ تا ۳۰ حرف باشد';
  }
  if (text.length < 1 || text.length > 600) {
    return 'متن کامنت باید بین ۱ تا ۶۰۰ حرف باشد';
  }
  return null;
}

export async function addComment(
  comment: Omit<CommentItem, 'id' | 'createdAt'>
): Promise<CommentItem> {
  const item: CommentItem = {
    ...comment,
    id: crypto.randomUUID(),
    createdAt: Date.now(),
  };

  await Promise.all([
    redis?.hset(dataKey(item.id), { ...item }),
    redis?.zadd(listKey(item.type, item.targetId), {
      score: item.createdAt,
      member: item.id,
    }),
    redis?.zadd(allKey, { score: item.createdAt, member: item.id }),
  ]);

  return item;
}

export async function listComments(
  type: string,
  targetId: number,
  limit = 100
): Promise<CommentItem[]> {
  if (!redis) return [];
  const client = redis;
  const ids = await client.zrange<string[]>(listKey(type, targetId), 0, limit - 1, { rev: true });
  if (ids.length === 0) return [];
  const entries = await Promise.all(
    ids.map((id) => client.hgetall<CommentItem>(dataKey(id)))
  );

  return entries
    .filter((e): e is CommentItem => !!e && !!e.id)
    .map((e) => ({ ...e, hasSpoiler: !!e.hasSpoiler }))
    .sort((a, b) => b.createdAt - a.createdAt);
}

export async function listAllComments(limit = 200): Promise<CommentItem[]> {
  if (!redis) return [];
  const client = redis;
  const ids = await client.zrange<string[]>(allKey, 0, limit - 1, { rev: true });
  if (ids.length === 0) return [];
  const entries = await Promise.all(
    ids.map((id) => client.hgetall<CommentItem>(dataKey(id)))
  );
  return entries
    .filter((e): e is CommentItem => !!e && !!e.id)
    .map((e) => ({ ...e, hasSpoiler: !!e.hasSpoiler }))
    .sort((a, b) => b.createdAt - a.createdAt);
}

export async function deleteComment(id: string): Promise<boolean> {
  if (!redis) return false;
  const data = await redis.hgetall<CommentItem>(dataKey(id));
  if (!data || !data.id) return false;

  await Promise.all([
    redis.zrem(listKey(data.type, data.targetId), id),
    redis.zrem(allKey, id),
    redis.del(dataKey(id)),
  ]);
  return true;
}

export async function addReply(id: string, reply: string): Promise<boolean> {
  if (!redis) return false;
  const existing = await redis.hgetall<CommentItem>(dataKey(id));
  if (!existing || !existing.id) return false;

  await redis.hset(dataKey(id), { reply, repliedAt: Date.now() });
  return true;
}

export async function countComments(): Promise<number> {
  if (!redis) return 0;
  return redis.zcard(allKey);
}