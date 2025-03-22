import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: Request) {
  try {
    // Parse the request body
    const { email, password, username, fullName } = await request.json()
    
    // Validate required fields
    if (!email || !password || !username) {
      return NextResponse.json(
        { error: "Email, password, and username are required" },
        { status: 400 }
      )
    }
    
    // Register user with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username,
          full_name: fullName || username
        }
      }
    })
    
    if (authError || !authData.user) {
      console.error('Supabase auth registration error:', authError)
      return NextResponse.json(
        { error: authError?.message || "Registration failed" },
        { status: 400 }
      )
    }
    
    // Now create an entry in our users table with the same ID
    const { data: userData, error: userError } = await supabase
      .from('users')
      .insert({
        id: authData.user.id,
        email: email,
        username: username,
        full_name: fullName || username,
        // Default stats and settings
        rank: 'Beginner',
        email_notifications: true,
        public_profile: true
      })
      .select()
      .single()
    
    if (userError) {
      console.error('Error creating user profile:', userError)
      // We don't want to fail the registration if profile creation fails
      // since the auth user was already created
    }
    
    return NextResponse.json({
      success: true,
      message: "Registration successful! Please check your email to confirm your account.",
      user: {
        id: authData.user.id,
        email: authData.user.email,
        username,
        fullName: fullName || username
      }
    })
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: "An error occurred during registration" },
      { status: 500 }
    )
  }
} 