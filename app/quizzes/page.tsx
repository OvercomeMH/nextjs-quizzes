"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
// Import the supabase client
import { supabase } from "@/lib/supabase"

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
  const [quizzes, setQuizzes] = useState<Quiz[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [debugInfo, setDebugInfo] = useState<string>('Initializing...')

  useEffect(() => {
    // Fetch quizzes from Supabase
    const fetchQuizzes = async () => {
      try {
        setLoading(true)
        setDebugInfo('Connecting to Supabase...')
        
        // Query the quizzes table
        const { data, error } = await supabase
          .from('quizzes')
          .select('*')
          .order('created_at', { ascending: false })
        
        if (error) {
          setDebugInfo(`Supabase error: ${error.message}`)
          throw new Error(error.message)
        }
        
        if (!data) {
          setDebugInfo('No quiz data received from Supabase')
          throw new Error('No quizzes found')
        }
        
        setDebugInfo(`Received ${data.length} quizzes from Supabase`)
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
        
        setDebugInfo(`Formatted ${formattedQuizzes.length} quizzes successfully`)
        setQuizzes(formattedQuizzes)
      } catch (err) {
        console.error('Error fetching quizzes:', err)
        setError('Failed to load quizzes. Please try again later.')
        setDebugInfo(`Error: ${err instanceof Error ? err.message : 'Unknown error'}`)
      } finally {
        setLoading(false)
      }
    }
    
    fetchQuizzes()
  }, [])

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b">
        <div className="container flex h-16 items-center justify-between py-4">
          <div className="flex items-center gap-2">
            <Link href="/" className="font-bold">
              QuizMaster
            </Link>
          </div>
          <nav className="flex items-center gap-4">
            <Link href="/dashboard" className="text-sm font-medium hover:underline">
              Dashboard
            </Link>
            <Link href="/profile" className="text-sm font-medium hover:underline">
              Profile
            </Link>
            <Link href="/admin/dashboard" className="text-sm font-medium hover:underline">
              Admin
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1 container py-6">
        <h1 className="text-2xl font-bold mb-6">All Quizzes</h1>
        
        {/* Add debug info for development */}
        <div className="mb-4 p-2 bg-gray-100 text-sm rounded">
          <p>Debug: {debugInfo}</p>
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
      </main>
    </div>
  )
} 