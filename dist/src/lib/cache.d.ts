import { Redis } from '@upstash/redis';
export declare const redis: Redis | undefined;
export declare function cacheGet<T>(key: string): Promise<T | null>;
export declare function cacheSet<T>(key: string, value: T, ttlSeconds?: number): Promise<T | "OK" | null | undefined>;
//# sourceMappingURL=cache.d.ts.map