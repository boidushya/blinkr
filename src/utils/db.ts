import { Redis } from "@upstash/redis";

if (
  !process.env.NEXT_PUBLIC_REDIS1_URL ||
  !process.env.NEXT_PUBLIC_REDIS1_TOKEN ||
  !process.env.NEXT_PUBLIC_REDIS2_URL ||
  !process.env.NEXT_PUBLIC_REDIS2_TOKEN
) {
  throw new Error("REDIS_URL or REDIS_TOKEN is null");
}

export const redis1 = new Redis({
  url: process.env.NEXT_PUBLIC_REDIS1_URL,
  token: process.env.NEXT_PUBLIC_REDIS1_TOKEN,
});

export const redis2 = new Redis({
  url: process.env.NEXT_PUBLIC_REDIS2_URL,
  token: process.env.NEXT_PUBLIC_REDIS2_TOKEN,
});
