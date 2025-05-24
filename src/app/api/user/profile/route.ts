import { NextResponse } from 'next/server';
import clientPromise from '@/lib/db';
import { verify } from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { ObjectId } from 'mongodb';

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
    const users = db.collection('users');

    // Find user by ID
    const user = await users.findOne(
      { _id: new ObjectId(decoded.userId) },
      { projection: { email: 1, chatCount: 1, _id: 0 } }
    );

    if (!user) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return NextResponse.json(
      { message: 'Error fetching user profile' },
      { status: 500 }
    );
  }
} 