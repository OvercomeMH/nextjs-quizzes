import { NextResponse } from 'next/server'
import { getUserById, updateUser } from '@/lib/users'
import { getSessionUserId } from '@/lib/auth-helpers'

export async function GET() {
  try {
    // Get the current user ID from the session
    const userId = await getSessionUserId();
    
    // If not authenticated, return error
    if (!userId) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      )
    }
    
    // Get the user data
    const userData = await getUserById(userId)
    
    // If user not found, return error
    if (!userData) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      )
    }
    
    // Exclude sensitive data like password
    const { password, ...userWithoutPassword } = userData
    
    // Simulate a small delay to mimic database/network latency
    await new Promise(resolve => setTimeout(resolve, 500))
    
    return NextResponse.json(userWithoutPassword)
  } catch (error) {
    console.error('Error fetching user profile:', error)
    return NextResponse.json(
      { error: "Failed to retrieve user profile" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    // Get the current user ID from the session
    const userId = await getSessionUserId();
    
    // If not authenticated, return error
    if (!userId) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      )
    }
    
    // Parse the request body
    const data = await request.json()
    
    // Simple validation
    if (!data.name || !data.email) {
      return NextResponse.json(
        { error: "Name and email are required" },
        { status: 400 }
      )
    }
    
    // Update the user data
    const updatedUser = await updateUser(userId, {
      name: data.name,
      email: data.email,
      settings: data.settings
    })
    
    // If update failed, return error
    if (!updatedUser) {
      return NextResponse.json(
        { error: "Failed to update user" },
        { status: 500 }
      )
    }
    
    // Remove sensitive data
    const { password, ...userWithoutPassword } = updatedUser
    
    // Simulate a small delay
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // Return the updated user data
    return NextResponse.json(userWithoutPassword)
  } catch (error) {
    console.error('Error updating user profile:', error)
    return NextResponse.json(
      { error: "Failed to update user profile" },
      { status: 500 }
    )
  }
} 