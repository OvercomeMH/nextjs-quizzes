import { NextResponse } from 'next/server'
import { getUserById, updateUser } from '@/lib/users'

// Temporary solution: use a hardcoded test user ID
// In a real app, you would get this from the session
const TEST_USER_ID = "1" // This matches our test user in lib/users.ts

export async function POST(request: Request) {
  // Get the current user
  const user = getUserById(TEST_USER_ID)
  
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
  const updatedUser = updateUser(TEST_USER_ID, {
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
} 