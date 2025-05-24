import { NextResponse } from 'next/server';
import clientPromise from '@/lib/db';
import { verify } from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { ObjectId } from 'mongodb';
import type { ChatMessage } from '@/lib/types';

export async function POST(request: Request) {
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
    
    // Get request body
    const { chatId, messages } = await request.json();

    if (!chatId || !messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { message: 'Invalid request body' },
        { status: 400 }
      );
    }

    // Connect to database
    const client = await clientPromise;
    const db = client.db('finchat');
    const chats = db.collection('chats');

    // Update or insert chat history
    const result = await chats.updateOne(
      { 
        chat_id: chatId,
        userId: new ObjectId(decoded.userId)
      },
      { 
        $set: { 
          messages,
          lastUpdated: new Date(),
          // If this is the first message, set the title to the first user message
          ...(messages.length === 2 && { 
            title: messages[1].text.slice(0, 50) + (messages[1].text.length > 50 ? '...' : '')
          })
        },
        $setOnInsert: {
          createdAt: new Date(),
          userId: new ObjectId(decoded.userId)
        }
      },
      { upsert: true }
    );

    return NextResponse.json({ 
      message: 'Chat history saved successfully',
      chatId: result.upsertedId || chatId
    });
  } catch (error) {
    console.error('Error saving chat history:', error);
    return NextResponse.json(
      { message: 'Error saving chat history' },
      { status: 500 }
    );
  }
} 