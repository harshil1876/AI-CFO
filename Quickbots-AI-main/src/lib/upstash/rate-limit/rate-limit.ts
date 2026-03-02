import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// One Redis instance shared app-wide
const redis = Redis.fromEnv();

/**
 * Chat rate limit
 *  - 20 requests per minute per session
 *  - sliding window = smoother UX
 */
export const chatRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, "1 m"),
  analytics: true, // enables dashboard graphs
  prefix: "ratelimit:chat",
});

/**
 * Field generation rate limit
 *  - 10 requests per minute per bot
 *  - More restrictive since AI generation is more expensive
 */
export const fieldGenerationRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, "1 m"),
  analytics: true,
  prefix: "ratelimit:field-generation",
});
