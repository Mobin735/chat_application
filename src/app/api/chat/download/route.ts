import { NextResponse } from 'next/server';
import clientPromise from '@/lib/db';
import { verify } from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { ObjectId } from 'mongodb';
import { Filter, Document } from 'mongodb';

function toMongoId(id: string): ObjectId {
    if (!ObjectId.isValid(id)) {
        throw new Error('Invalid ObjectId');
    }
    return new ObjectId(id);
}

export async function GET(request: Request) {
    let chatId: string | null = null;
    let decoded: { userId: string } | null = null;
    
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

        decoded = verify(token.value, process.env.JWT_SECRET!) as { userId: string };

        const { searchParams } = new URL(request.url);
        chatId = searchParams.get('chatId');

        if (!chatId) {
            return NextResponse.json(
                { message: 'Chat ID is required' },
                { status: 400 }
            );
        }

        // Connect to database
        const client = await clientPromise;
        const db = client.db('finchat');
        const chats = db.collection('chats');
        console.log("chat_id: ",chatId)
        console.log("userId: ",decoded.userId)
        const chat = await chats.findOne(
            {
                chat_id: chatId,             
                userId: new ObjectId(decoded.userId),
            } as Filter<Document>,
            { projection: { messages: 1, title: 1 } }
        );

        if (!chat) {
            return NextResponse.json(
                { message: 'Chat session not found' },
                { status: 404 }
            );
        }

        // Format the chat data
        const chatData = {
            title: chat.title || 'Untitled Chat',
            messages: chat.messages,
            exportDate: new Date().toISOString()
        };

        // Convert to JSON string
        const jsonString = JSON.stringify(chatData, null, 2);

        // Create a Blob with the JSON data
        const blob = new Blob([jsonString], { type: 'application/json' });

        // Create headers for file download
        const headers = new Headers();
        headers.set('Content-Type', 'application/json');
        headers.set('Content-Disposition', `attachment; filename="chat-${chatId}.json"`);

        // Return the file as a download
        return new NextResponse(blob, {
            status: 200,
            headers
        });
    } catch (error) {
        console.error('Error details:', {
            error,
            message: error instanceof Error ? error.message : 'Unknown error',
            stack: error instanceof Error ? error.stack : undefined,
            chatId: chatId || 'not set',
            userId: decoded?.userId || 'not set'
        });
        return NextResponse.json(
            { 
                message: 'Error fetching chat messages',
                details: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
} 