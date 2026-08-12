import { NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';

// Initialize Redis client using environment variables
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const room = searchParams.get('room');

    if (!room) {
      return NextResponse.json({ error: 'Room ID is required' }, { status: 400 });
    }

    // Fetch messages and player state in parallel
    const [messagesList, playerStateString] = await Promise.all([
      redis.lrange(`room_chat:${room}`, 0, 49),
      redis.get(`room_player:${room}`)
    ]);

    const playerState = playerStateString ? (typeof playerStateString === 'string' ? JSON.parse(playerStateString) : playerStateString) : null;

    return NextResponse.json({ messages: messagesList, playerState });
  } catch (error) {
    console.error('Chat GET Error:', error);
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { room, type, message, author, userId, playerState } = body;

    if (!room) {
      return NextResponse.json({ error: 'Room ID is required' }, { status: 400 });
    }

    if (type === 'playerState' && playerState) {
      // Set the player state with a 24-hour expiration
      await redis.set(`room_player:${room}`, JSON.stringify(playerState), { ex: 60 * 60 * 24 });
      return NextResponse.json({ success: true });
    }

    if (type === 'message' || (!type && message)) {
      if (!message || !author) {
        return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
      }

      const newMessage = {
        id: crypto.randomUUID(),
        author,
        userId: userId || 'unknown',
        message,
        timestamp: Date.now(),
      };

      // Push new message to the start of the list
      await redis.lpush(`room_chat:${room}`, JSON.stringify(newMessage));
      
      // Trim the list to keep only the latest 50 messages
      await redis.ltrim(`room_chat:${room}`, 0, 49);
      
      // Set an expiration of 24 hours
      await redis.expire(`room_chat:${room}`, 60 * 60 * 24);

      return NextResponse.json({ success: true, message: newMessage });
    }

    return NextResponse.json({ error: 'Invalid payload type' }, { status: 400 });
  } catch (error) {
    console.error('Chat POST Error:', error);
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
  }
}
