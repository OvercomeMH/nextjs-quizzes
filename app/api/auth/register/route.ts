import { NextResponse } from 'next/server'
import { addUser, findUserByUsername } from '@/lib/users'

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
    const existingUser = findUserByUsername(username)
    if (existingUser) {
      return NextResponse.json(
        { error: "Username already exists" },
        { status: 409 }
      )
    }
    
    // Create new user
    const newUser = addUser({
      username,
      password, // Note: In a real app, we would hash this
      name,
      email,
      stats: {
        quizzesTaken: 0,
        averageScore: 0,
        totalPoints: 0,
      },
      settings: {
        emailNotifications: true,
        publicProfile: true,
      }
    })
    
    // Return user data (excluding password)
    const { password: _, ...userWithoutPassword } = newUser
    
    return NextResponse.json({
      success: true,
      user: userWithoutPassword,
      userId: newUser.id
    })
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: "An error occurred during registration" },
      { status: 500 }
    )
  }
} 