import { NextResponse } from 'next/server'

const SESSION_COOKIE_NAME = 'quiz-master-session'

export async function POST() {
  // Create response
  const response = NextResponse.json({
    success: true,
    message: "Logged out successfully"
  })
  
  // Clear the session cookie
  response.cookies.set({
    name: SESSION_COOKIE_NAME,
    value: '',
    path: '/',
    expires: new Date(0),
    maxAge: 0
  })
  
  return response
} 