import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Enabled only when the Upstash env vars are present — the app runs normally
// without them (rate limiting simply becomes a no-op).
const url = process.env.UPSTASH_REDIS_REST_URL;
const token = process.env.UPSTASH_REDIS_REST_TOKEN;

export const ratelimit =
  url && token
    ? new Ratelimit({
        redis: new Redis({ url, token }),
        // 30 write requests per 10s per IP: generous for real use, stops floods.
        limiter: Ratelimit.slidingWindow(30, "10 s"),
        prefix: "kasuwa_rl",
        analytics: false,
      })
    : null;
