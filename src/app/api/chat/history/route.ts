import { NextResponse } from 'next/server';
import clientPromise from '@/lib/db';
import { verify } from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { ObjectId } from 'mongodb';
import type { ChatSession } from '@/lib/types';

export async function GET() {
  try {
    // Get the auth token from cookies
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token');

    if (!token) {
      return NextResponse.json(
        { message: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Verify the token
    const decoded = verify(token.value, process.env.JWT_SECRET!) as { userId: string };
    
    // Connect to database
    const client = await clientPromise;
    const db = client.db('finchat');
    const chats = db.collection('chats');

    // Find all chats for the user, sorted by lastUpdated
    const chatSessions = await chats
      .find(
        { userId: new ObjectId(decoded.userId) },
        { 
          projection: { 
            _id: 1,
            chat_id: 1,
            title: 1,
            lastUpdated: 1,
            messages: 1
          }
        }
      )
      .sort({ lastUpdated: -1 })
      .toArray();
    // Transform the data to match ChatSession type
    const sessions: ChatSession[] = chatSessions.map(chat => ({
      id: chat._id.toString(),
      chat_id: chat.chat_id,
      title: chat.title || 'Untitled Chat',
      lastMessageTime: chat.lastUpdated,
      messageCount: chat.messages?.length || 0,
      previewText: chat.messages?.[chat.messages.length - 1]?.text?.slice(0, 100) + 
        (chat.messages?.[chat.messages.length - 1]?.text?.length > 100 ? '...' : '')
    }));

    return NextResponse.json(sessions);
  } catch (error) {
    console.error('Error fetching chat history:', error);
    return NextResponse.json(
      { message: 'Error fetching chat history' },
      { status: 500 }
    );
  }
} 