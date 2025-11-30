import { Redis } from '@upstash/redis';

const url = process.env.UPSTASH_REDIS_REST_URL!;
const token = process.env.UPSTASH_REDIS_REST_TOKEN!;

export const redis = (url && token) ? new Redis({
  url,
  token,
}) : null;

export async function cacheGet(key: string): Promise<T | null> {
  if (!redis) return null;
  try{
    return await redis.get<T>(key);
  }catch{
    return null;
  }
}

export async function cacheSet(key: string, value: T, ttlSeconds = 86400){
  if (!redis) return null;
  try{
    return await redis.set(key, value, { ex: ttlSeconds });
  }catch{}
}