import { NextResponse } from 'next/server'
import { addUser, findUserByUsername } from '@/lib/users'

const SESSION_COOKIE_NAME = 'quiz-master-session'

export async function POST(request: Request) {
  try {
    // Parse the request body
    const { username, password, name, email } = await request.json()
    
    // Validate required fields
    if (!username || !password || !name || !email) {
      return NextResponse.json(
        { error: "All fields are required: username, password, name, email" },
        { status: 400 }
      )
    }
    
    // Check if username already exists
    const existingUser = await findUserByUsername(username)
    if (existingUser) {
      return NextResponse.json(
        { error: "Username already exists" },
        { status: 409 }
      )
    }
    
    // Create new user
    const newUser = await addUser({
      username,
      password, // Note: In a real app, we would hash this
      name,
      email,
      stats: {
        quizzesTaken: 0,
        averageScore: 0,
        totalPoints: 0,
        rank: "Beginner"
      },
      settings: {
        emailNotifications: true,
        publicProfile: true,
      }
    })
    
    // Return user data (excluding password)
    const { password: _, ...userWithoutPassword } = newUser
    
    // Create response with cookie
    const response = NextResponse.json({
      success: true,
      user: userWithoutPassword
    })
    
    // Set the session cookie
    response.cookies.set({
      name: SESSION_COOKIE_NAME,
      value: newUser.id,
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7, // 1 week
      sameSite: 'strict'
    })
    
    return response
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: "An error occurred during registration" },
      { status: 500 }
    )
  }
} 