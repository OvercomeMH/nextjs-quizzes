import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { cookies } from 'next/headers'

export async function POST(request: Request) {
  try {
    // Parse the request body
    const { email, password } = await request.json()
    
    // Validate inputs
    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      )
    }
    
    // Authenticate with Supabase
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    
    if (error || !data.user) {
      console.error('Supabase auth error:', error)
      return NextResponse.json(
        { error: error?.message || "Invalid email or password" },
        { status: 401 }
      )
    }
    
    // Get the user profile data from our users table
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', data.user.id)
      .single()
    
    if (userError) {
      console.error('Error fetching user data:', userError)
    }
    
    // Create response (cookies are automatically handled by Supabase client)
    return NextResponse.json({
      success: true,
      user: {
        id: data.user.id,
        email: data.user.email,
        username: data.user.user_metadata?.username || userData?.username,
        full_name: data.user.user_metadata?.full_name || userData?.full_name
      }
    })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: "An error occurred during login" },
      { status: 500 }
    )
  }
} 