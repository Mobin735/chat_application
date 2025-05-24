import { NextResponse } from 'next/server';
import clientPromise from '@/lib/db';
import { verify } from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { ObjectId } from 'mongodb';

export async function POST() {
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
    const users = db.collection('users');

    // Increment chat count for the user
    const result = await users.updateOne(
      { _id: new ObjectId(decoded.userId) },
      { $inc: { chatCount: 1 } }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Chat count incremented successfully' });
  } catch (error) {
    console.error('Error incrementing chat count:', error);
    return NextResponse.json(
      { message: 'Error incrementing chat count' },
      { status: 500 }
    );
  }
} 