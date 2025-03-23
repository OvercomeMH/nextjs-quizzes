"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/components/auth/AuthProvider"
import { QuizSummary } from "@/types/database"
import { useDataFetching } from "@/hooks/useDataFetching"

export default function QuizzesPage() {
  const { user } = useAuth();
  
  // Fetch all quizzes
  const { data: allQuizzes, loading: loadingQuizzes } = useDataFetching<'quizzes'>({
    table: 'quizzes',
    select: 'id, title, description, difficulty, total_questions, average_rating',
    orderBy: { column: 'created_at', ascending: false }
  });

  // Fetch user's submissions if logged in
  const { data: userSubmissions } = useDataFetching<'submissions'>({
    table: 'submissions',
    select: 'quiz_id',
    filter: user ? { column: 'user_id', operator: 'eq', value: user.id } : undefined
  });

  // Filter out quizzes the user has already taken
  const availableQuizzes = allQuizzes.filter(quiz => 
    !userSubmissions.some(sub => sub.quiz_id === quiz.id)
  );

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