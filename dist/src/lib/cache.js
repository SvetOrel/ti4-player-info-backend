import { Redis } from '@upstash/redis';
const url = process.env.UPSTASH_REDIS_REST_URL;
const token = process.env.UPSTASH_REDIS_REST_TOKEN;
export const redis = (url && token) ? new Redis({
    url,
    token,
}) : undefined;
export async function cacheGet(key) {
    if (!redis)
        return null;
    try {
        return await redis.get(key);
    }
    catch {
        return null;
    }
}
export async function cacheSet(key, value, ttlSeconds = 86400) {
    if (!redis)
        return null;
    try {
        return await redis.set(key, value, { ex: ttlSeconds });
    }
    catch { }
}
//# sourceMappingURL=cache.js.map