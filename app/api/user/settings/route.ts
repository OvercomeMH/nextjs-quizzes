import { NextResponse } from 'next/server'
import { getUserById, updateUser } from '@/lib/users'
import { getSessionUserId } from '@/lib/auth-helpers'

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
    
    // Get the current user
    const user = await getUserById(userId)
    
    // If user not found, return error
    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      )
    }
    
    // Parse the request body
    const data = await request.json()
    
    // Update just the settings
    const updatedUser = await updateUser(userId, {
      settings: {
        ...user.settings,
        ...(data || {})
      }
    })
    
    // If update failed, return error
    if (!updatedUser) {
      return NextResponse.json(
        { error: "Failed to update settings" },
        { status: 500 }
      )
    }
    
    // Simulate a small delay
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // Return the updated settings
    return NextResponse.json({
      success: true,
      settings: updatedUser.settings
    })
  } catch (error) {
    console.error('Error updating user settings:', error)
    return NextResponse.json(
      { error: "Failed to update settings" },
      { status: 500 }
    )
  }
} 