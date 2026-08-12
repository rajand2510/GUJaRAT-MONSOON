import { NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';

const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;
const redis = redisUrl && redisToken ? new Redis({ url: redisUrl, token: redisToken }) : null;

const ACTIVE_USERS_KEY = 'gujarat_monsoon_active_users';
const TIMEOUT_SECONDS = 15;

export async function GET() {
  if (!redis) {
    return NextResponse.json({ count: 37, mock: true });
  }

  try {
    const now = Date.now();
    await redis.zremrangebyscore(ACTIVE_USERS_KEY, '-inf', now - (TIMEOUT_SECONDS * 1000));
    const count = await redis.zcard(ACTIVE_USERS_KEY);
    return NextResponse.json({ count, mock: false });
  } catch (error) {
    console.error("Redis GET error:", error);
    return NextResponse.json({ count: 37, mock: true });
  }
}

export async function POST(req) {
  if (!redis) {
    return NextResponse.json({ success: true, mock: true });
  }

  try {
    const body = await req.json();
    const { userId } = body;
    
    if (userId) {
      const now = Date.now();
      await redis.zadd(ACTIVE_USERS_KEY, { score: now, member: userId });
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Redis POST error:", error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
