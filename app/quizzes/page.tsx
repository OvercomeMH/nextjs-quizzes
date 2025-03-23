"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/components/auth/AuthProvider"
import { QuizSummary } from "@/types/database"
import { useDataFetching } from "@/hooks/useDataFetching"
import type { Database } from '@/lib/database.types'

// Define types for our data
type Quiz = Database['public']['Tables']['quizzes']['Row'];
type Submission = Database['public']['Tables']['submissions']['Row'];

export default function QuizzesPage() {
  const { user } = useAuth();
  
  // Fetch all quizzes with joined submissions
  const { data: allQuizzes, loading: loadingQuizzes, error: quizzesError } = useDataFetching<'quizzes', [], [], [
    {
      table: 'submissions',
      on: 'quiz_id'
    }
  ]>({
    table: 'quizzes',
    orderBy: { column: 'created_at', ascending: false }
  });

  // Fetch user's submissions if logged in
  const { data: userSubmissions, error: submissionsError } = useDataFetching<'submissions'>({
    table: 'submissions',
    filter: user ? { column: 'user_id', operator: 'eq', value: user.id } : undefined
  });

  // Debug logging
  console.log('All Quizzes:', allQuizzes);
  console.log('User Submissions:', userSubmissions);
  console.log('Quizzes Error:', quizzesError);
  console.log('Submissions Error:', submissionsError);
  console.log('Is allQuizzes an array?', Array.isArray(allQuizzes));
  console.log('Number of quizzes:', Array.isArray(allQuizzes) ? allQuizzes.length : 0);
  console.log('Is userSubmissions an array?', Array.isArray(userSubmissions));
  console.log('Number of user submissions:', Array.isArray(userSubmissions) ? userSubmissions.length : 0);

  // Filter out quizzes the user has already taken
  const availableQuizzes = Array.isArray(allQuizzes) 
    ? allQuizzes.filter(quiz => 
        !Array.isArray(userSubmissions) || !userSubmissions.some(sub => sub.quiz_id === quiz.id)
      )
    : [];

  const loading = loadingQuizzes;

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
          <div className="w-12 h-12 border-4 border-t-primary border-primary/30 rounded-full animate-spin"></div>
        </div>
      ) : quizzesError ? (
        <div className="flex justify-center items-center h-64">
          <p className="text-red-500">Error loading quizzes: {quizzesError}</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {availableQuizzes.length > 0 ? (
            availableQuizzes.map(quiz => (
              <Card key={quiz.id}>
                <CardHeader>
                  <CardTitle>{quiz.title}</CardTitle>
                  <CardDescription>{quiz.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2 mb-4">
                    <Badge variant="outline">{quiz.difficulty}</Badge>
                    <Badge variant="outline">{quiz.total_questions || 0} Questions</Badge>
                    <Badge variant="outline">{quiz.average_rating?.toFixed(1) || '0.0'} Rating</Badge>
                  </div>
                  <Button className="w-full" asChild>
                    <Link href={`/quizzes/${quiz.id}`}>Start Quiz</Link>
                  </Button>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="col-span-full text-center py-12 border rounded-lg">
              <h3 className="text-lg font-medium mb-2">No quizzes available</h3>
              <p className="text-muted-foreground">
                {user 
                  ? "You've completed all available quizzes! Check back later for new ones."
                  : "Please log in to see available quizzes."}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
} 