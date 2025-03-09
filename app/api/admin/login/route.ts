import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const { username, password } = await request.json();

  // Debug log (will appear in server logs)
  console.log('Login attempt:', {
    providedUsername: username,
    expectedUsername: process.env.ADMIN_USERNAME,
    providedPassword: password,
    expectedPassword: process.env.ADMIN_PASSWORD,
    envVarsExist: {
      username: !!process.env.ADMIN_USERNAME,
      password: !!process.env.ADMIN_PASSWORD
    }
  });

  // Strict comparison and proper type checking
  if (
    typeof username === 'string' &&
    typeof password === 'string' &&
    username === process.env.ADMIN_USERNAME &&
    password === process.env.ADMIN_PASSWORD
  ) {
    cookies().set('admin-auth', 'authenticated', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 // 24 hours
    });

    return NextResponse.json({ success: true });
  }

  return NextResponse.json(
    { success: false, message: 'Invalid credentials' },
    { status: 401 }
  );
} 