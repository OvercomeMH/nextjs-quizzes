'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabase'
import { FcGoogle } from 'react-icons/fc'

export function GoogleLoginButton() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleGoogleLogin = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          // Redirect to the home page after successful login
          redirectTo: `${window.location.origin}/auth/callback`
        }
      })

      if (error) {
        throw error
      }
    } catch (err) {
      console.error('Error signing in with Google:', err)
      setError('Failed to sign in with Google. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <Button 
        variant="outline" 
        onClick={handleGoogleLogin}
        disabled={isLoading}
        className="w-full flex items-center gap-2"
      >
        <FcGoogle className="w-5 h-5" />
        {isLoading ? 'Signing in...' : 'Sign in with Google'}
      </Button>
      
      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}
    </div>
  )
} 