import { NextResponse } from 'next/server'
import { authenticateUser } from '@/lib/users'

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
    const user = authenticateUser(username, password)
    
    if (!user) {
      return NextResponse.json(
        { error: "Invalid username or password" },
        { status: 401 }
      )
    }
    
    // Return user data (excluding password)
    const { password: _, ...userWithoutPassword } = user
    
    return NextResponse.json({
      success: true,
      user: userWithoutPassword,
      // Return userId for client-side session creation
      userId: user.id
    })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: "An error occurred during login" },
      { status: 500 }
    )
  }
} 