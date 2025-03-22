import { NextResponse } from 'next/server'
import { authenticateUser } from '@/lib/users'

const SESSION_COOKIE_NAME = 'quiz-master-session'

export async function POST(request: Request) {
  try {
    // Parse the request body
    const { username, password } = await request.json()
    
    // Validate inputs
    if (!username || !password) {
      return NextResponse.json(
        { error: "Username and password are required" },
        { status: 400 }
      )
    }
    
    // Authenticate the user
    const user = await authenticateUser(username, password)
    
    if (!user) {
      return NextResponse.json(
        { error: "Invalid username or password" },
        { status: 401 }
      )
    }
    
    // Return user data (excluding password)
    const { password: _, ...userWithoutPassword } = user
    
    // Create response with cookie
    const response = NextResponse.json({
      success: true,
      user: userWithoutPassword
    })
    
    // Set the session cookie
    response.cookies.set({
      name: SESSION_COOKIE_NAME,
      value: user.id,
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7, // 1 week
      sameSite: 'strict'
    })
    
    return response
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: "An error occurred during login" },
      { status: 500 }
    )
  }
} 