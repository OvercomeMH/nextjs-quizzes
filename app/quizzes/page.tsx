"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
// Import the supabase client
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/components/auth/AuthProvider"

// Define the quiz type based on the Supabase table structure
interface Quiz {
  id: string;
  title: string;
  description: string;
  difficulty: string;
  totalQuestions: number; // This will map to total_questions in our Supabase data
  metadata: {
    totalPoints: number;
    averageRating: number;
    timesPlayed: number;
  };
}

export default function QuizzesPage() {
  const { user } = useAuth();
  const [quizzes, setQuizzes] = useState<Quiz[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Fetch quizzes from Supabase
    const fetchQuizzes = async () => {
      try {
        setLoading(true)
        
        // Query the quizzes table
        const { data, error } = await supabase
          .from('quizzes')
          .select('*')
          .order('created_at', { ascending: false })
        
        if (error) {
          throw new Error(error.message)
        }
        
        if (!data) {
          throw new Error('No quizzes found')
        }
        
        console.log('Raw quiz data from Supabase:', data)
        
        // Transform the Supabase data to match our Quiz interface
        const formattedQuizzes: Quiz[] = data.map(quiz => ({
          id: quiz.id,
          title: quiz.title,
          description: quiz.description,
          difficulty: quiz.difficulty,
          totalQuestions: quiz.total_questions,
          metadata: {
            totalPoints: quiz.total_points,
            averageRating: quiz.average_rating,
            timesPlayed: quiz.times_played
          }
        }))
        
        setQuizzes(formattedQuizzes)
      } catch (err) {
        console.error('Error fetching quizzes:', err)
        setError('Failed to load quizzes. Please try again later.')
      } finally {
        setLoading(false)
      }
    }
    
    fetchQuizzes()
  }, [])

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Available Quizzes</h1>
        <div className="flex gap-4">
          <Link href="/dashboard">
            <Button variant="outline">Dashboard</Button>
          </Link>
          {user && (
            <Link href="/profile">
              <Button variant="outline">Profile</Button>
            </Link>
          )}
          {!user && (
            <Link href="/login">
              <Button variant="outline">Login</Button>
            </Link>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <p>Loading quizzes from Supabase...</p>
        </div>
      ) : error ? (
        <div className="flex justify-center items-center h-64">
          <p className="text-red-500">{error}</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {quizzes.length > 0 ? (
            quizzes.map(quiz => (
              <Card key={quiz.id}>
                <CardHeader>
                  <CardTitle>{quiz.title}</CardTitle>
                  <CardDescription>{quiz.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2 mb-4">
                    <Badge variant="outline">{quiz.difficulty}</Badge>
                    <Badge variant="outline">{quiz.totalQuestions} Questions</Badge>
                    <Badge variant="outline">{quiz.metadata.totalPoints} Points</Badge>
                  </div>
                  <Button className="w-full" asChild>
                    <Link href={`/quizzes/${quiz.id}`}>Start Quiz</Link>
                  </Button>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="col-span-3 text-center py-10">
              <p>No quizzes available at the moment.</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
} 