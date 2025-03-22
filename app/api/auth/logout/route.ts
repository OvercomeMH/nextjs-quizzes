import { NextResponse } from 'next/server'
import { logout } from '@/lib/auth'

export async function POST() {
  // Clear the session
  logout()
  
  return NextResponse.json({
    success: true,
    message: "Logged out successfully"
  })
} 