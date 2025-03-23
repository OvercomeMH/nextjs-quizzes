"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { User } from "@supabase/supabase-js"
import { createBrowserClient } from "@supabase/ssr"
import { useRouter } from "next/navigation"

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// Define the shape of our auth context
type AuthContextType = {
  user: User | null
  isLoading: boolean
  signOut: () => Promise<void>
}

// Create the context with a default value
const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  signOut: async () => {},
})

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

// The provider component that wraps our app and makes auth available
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  // Function to create a user record in our public.users table
  const createUserRecord = async (authUser: User) => {
    try {
      console.log('Attempting to create user record for:', authUser.id)
      
      // First check if user already exists in our public.users table
      const { data: existingUser, error: selectError } = await supabase
        .from('users')
        .select('id')
        .eq('id', authUser.id)
        .single()

      if (selectError) {
        console.log('Error checking for existing user:', selectError)
      }

      if (!existingUser) {
        console.log('User does not exist, creating new record')
        
        // If user doesn't exist, create a new record
        const { error: insertError } = await supabase
          .from('users')
          .insert({
            id: authUser.id,
            email: authUser.email,
            username: authUser.email?.split('@')[0] || 'user',
            full_name: authUser.user_metadata?.full_name || '',
            quizzes_taken: 0,
            average_score: 0,
            total_points: 0,
            rank: 'Beginner',
            email_notifications: true,
            public_profile: false,
            created_at: new Date().toISOString()
          })

        if (insertError) {
          console.error('Error creating user record:', insertError)
          // Log more details about the error
          console.log('Error details:', {
            message: insertError.message,
            details: insertError.details,
            hint: insertError.hint
          })
        } else {
          console.log('Successfully created user record')
        }
      } else {
        console.log('User already exists')
      }
    } catch (error) {
      console.error('Error in createUserRecord:', error)
    }
  }

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (session?.user) {
          setUser(session.user)
          // Create user record if it doesn't exist
          await createUserRecord(session.user)
        }
      } catch (error) {
        console.error('Error getting initial session:', error)
      } finally {
        setIsLoading(false)
      }
    }

    getInitialSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setUser(session.user)
        // Create user record when user signs in
        if (event === 'SIGNED_IN') {
          await createUserRecord(session.user)
        }
      } else {
        setUser(null)
      }
      setIsLoading(false)
    })

    // Cleanup subscription
    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const signOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, signOut }}>
      {children}
    </AuthContext.Provider>
  )
} 