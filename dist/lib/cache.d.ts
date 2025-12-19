import { Redis } from '@upstash/redis';
export declare const redis: Redis | undefined;
export declare function cacheGet<T>(key: string): Promise<T | null>;
export declare function cacheSet(key: string, value: T, ttlSeconds?: number): Promise<any>;
//# sourceMappingURL=cache.d.ts.map