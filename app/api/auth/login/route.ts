import { NextRequest, NextResponse } from 'next/server'

// Simple hardcoded credentials for now
const ADMIN_EMAIL = 'admin@fitura.com'
const ADMIN_PASSWORD = 'admin123'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      return NextResponse.json({
        success: true,
        user: {
          email: ADMIN_EMAIL,
          name: 'Admin',
        },
      })
    }

    return NextResponse.json(
      { error: 'Invalid email or password' },
      { status: 401 }
    )
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'An error occurred during login' },
      { status: 500 }
    )
  }
}






