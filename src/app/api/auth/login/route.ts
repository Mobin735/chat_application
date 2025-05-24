import { NextResponse } from 'next/server';
import clientPromise from '@/lib/db';
import { compare } from 'bcryptjs';
import jwt from 'jsonwebtoken';

export async function POST(request: Request) {
  try {
    console.log('Login request received:', request.url, request.method);

    if (!process.env.MONGODB_URI) {
      console.error('MongoDB URI is not set');
      return NextResponse.json(
        { message: 'Server configuration error' },
        { status: 500 }
      );
    }

    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET is not set');
      return NextResponse.json(
        { message: 'Server configuration error' },
        { status: 500 }
      );
    }

    const { email, password } = await request.json();
    console.log('Login attempt for email:', email);

    // Validate input
    if (!email || !password) {
      console.log('Missing email or password');
      return NextResponse.json(
        { message: 'Email and password are required' },
        { status: 400 }
      );
    }

    try {
      // Connect to database
      const client = await clientPromise;
      const db = client.db('finchat');
      const users = db.collection('users');

      // Find user by email
      const user = await users.findOne({ email });
      if (!user) {
        console.log('User not found:', email);
        return Response.json(
          { message: 'Invalid credentials' },
          { status: 401 }
        );
      }

      // Verify password
      const isValidPassword = await compare(password, user.password);
      if (!isValidPassword) {
        console.log('Invalid password for user:', email);
        return NextResponse.json(
          { message: 'Invalid credentials' },
          { status: 401 }
        );
      }

      console.log('Login successful for user:', email);
      // Return user data (excluding password)
      const { password: _, ...userWithoutPassword } = user;
      
      // Create JWT token
      const token = jwt.sign(
        { 
          userId: user._id,
          email: user.email 
        },
        process.env.JWT_SECRET!,
        { expiresIn: '7d' } // Token expires in 7 days
      );
      
      // Return response with JWT token
      return NextResponse.json(
        { 
          message: 'Login successful',
          user: userWithoutPassword,
          token
        },
        { 
          status: 200,
          headers: {
            'Set-Cookie': `auth-token=${token}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${7 * 24 * 60 * 60}`
          }
        }
      );
    } catch (dbError) {
      console.error('Database error:', dbError);
      return NextResponse.json(
        { message: 'Database connection error' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { message: 'Error during login' },
      { status: 500 }
    );
  }
} 