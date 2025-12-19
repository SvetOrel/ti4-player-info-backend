import { Redis } from "@upstash/redis";
import 'dotenv/config';
import { redis } from "../lib/cache";

export const redisClient = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
}); 

redisClient.ping()
.then(() => {
    console.log("Redis client successfully connected to Upstash.");
}).catch((err) => {
    console.error("Redis connection error:", err);
});