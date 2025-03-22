import { createClient } from '@supabase/supabase-js'

// These environment variables will be loaded from .env.local
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string

// Create a single supabase client for interacting with your database
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// For browser-only usage, we can use this to check auth state
export const getUser = async () => {
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

// Helper function to get session
export const getSession = async () => {
  const { data: { session } } = await supabase.auth.getSession()
  return session
}

// Type definitions for our database tables
export type Tables = {
  users: {
    id: string
    username: string
    email: string
    full_name: string
    created_at: string
    quizzes_taken: number
    average_score: number
    total_points: number
    rank: string
    email_notifications: boolean
    public_profile: boolean
  }
  quizzes: {
    id: string
    title: string
    description: string
    difficulty: string
    category: string
    time_limit: number
    created_at: string
    updated_at: string
    total_questions: number
    total_points: number
    average_rating: number
    times_played: number
  }
  questions: {
    id: string
    quiz_id: string
    text: string
    type: string
    points: number
    correct_answer: string
    explanation: string
    order_num: number
    created_at: string
  }
  question_possible_answers: {
    id: string
    question_id: string
    option_id: string
    text: string
    order_num: number
  }
  submissions: {
    id: string
    user_id: string
    quiz_id: string
    score: number
    total_possible: number
    time_spent: number
    completed_at: string
  }
  user_answers: {
    id: string
    submission_id: string
    question_id: string
    selected_option: string
    is_correct: boolean
    created_at: string
  }
} 