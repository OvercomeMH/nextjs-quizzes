import { NextResponse } from 'next/server'
import { getUserById, updateUser } from '@/lib/users'

// Temporary solution: use a hardcoded test user ID
// In a real app, you would get this from the session
const TEST_USER_ID = "1" // This matches our test user in lib/users.ts

export async function GET() {
  // Get the user data
  const userData = getUserById(TEST_USER_ID)
  
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
}

export async function POST(request: Request) {
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
  const updatedUser = updateUser(TEST_USER_ID, {
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
} 