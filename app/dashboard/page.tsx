"use client"

import { useState } from "react"
import Link from "next/link"
import { useAuth } from "@/components/auth/AuthProvider"
import ProtectedRoute from "@/components/auth/ProtectedRoute"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { User, QuizSummary, Submission } from "@/types/database"
import { useDataFetching } from "@/hooks/useDataFetching"
import type { TableRow } from "@/lib/supabase"

// Define a type for submissions with joined quiz data
type SubmissionWithQuiz = TableRow<'submissions'> & {
  quizzes: Pick<TableRow<'quizzes'>, 'id' | 'title'> | null;
};

export default function DashboardPage() {
  const { user, signOut } = useAuth();
  
  // Fetch user profile
  const { data: profileData, loading: profileLoading, error: profileError } = useDataFetching<'users'>({
    table: 'users',
    select: '*',
    orderBy: { column: 'created_at', ascending: false }
  });
  
  const profile = profileData[0] || null;

  // Fetch recent submissions
  const { data: submissionsData, loading: submissionsLoading, error: submissionsError } = useDataFetching<'submissions'>({
    table: 'submissions',
    select: `
      id,
      score,
      total_possible,
      time_spent,
      created_at,
      quizzes:quiz_id (
        id,
        title
      )
    `,
    orderBy: { column: 'created_at', ascending: false }
  });

  const recentSubmissions = submissionsData as unknown as SubmissionWithQuiz[];

  // Fetch available quizzes
  const { data: quizzes, loading: quizzesLoading, error: quizzesError } = useDataFetching<'quizzes'>({
    table: 'quizzes',
    select: 'id, title, description, difficulty, total_questions, average_rating',
    orderBy: { column: 'created_at', ascending: false }
  });

  const availableQuizzes = quizzes;

  const handleSignOut = async () => {
    await signOut();
  };

  // Calculate loading and error states
  const isLoading = profileLoading || submissionsLoading || quizzesLoading;
  const error = profileError || submissionsError || quizzesError;

  return (
    <ProtectedRoute>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <div className="flex gap-4">
            <Button variant="outline" onClick={handleSignOut}>
              Sign Out
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="w-12 h-12 border-4 border-t-primary border-primary/30 rounded-full animate-spin"></div>
          </div>
        ) : error ? (
          <div className="flex justify-center items-center h-64">
            <p className="text-red-500">{error}</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* Profile Card */}
            <Card className="md:col-span-2 lg:col-span-1">
              <CardHeader>
                <CardTitle>Profile</CardTitle>
                <CardDescription>Your quiz statistics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Username</p>
                    <p className="font-medium">{profile?.username}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Points</p>
                    <p className="font-medium">{profile?.total_points || 0}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Quizzes Taken</p>
                    <p className="font-medium">{profile?.quizzes_taken || 0}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Average Score</p>
                    <p className="font-medium">
                      {profile?.quizzes_taken && profile?.total_points
                        ? ((profile.total_points / (profile.quizzes_taken * 100)) * 100).toFixed(1) + '%'
                        : '0%'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity Card */}
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Your latest quiz attempts</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentSubmissions.length > 0 ? (
                    recentSubmissions.map((submission) => (
                      <div key={submission.id} className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{submission.quizzes?.title}</p>
                          <p className="text-sm text-muted-foreground">
                            Score: {submission.score}/{submission.total_possible}
                          </p>
                        </div>
                        <Badge variant="outline">
                          {new Date(submission.created_at || '').toLocaleDateString()}
                        </Badge>
                      </div>
                    ))
                  ) : (
                    <p className="text-muted-foreground">No recent activity</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Available Quizzes Card */}
            <Card className="md:col-span-2 lg:col-span-1">
              <CardHeader>
                <CardTitle>Available Quizzes</CardTitle>
                <CardDescription>Quizzes you haven't taken yet</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {availableQuizzes.length > 0 ? (
                    availableQuizzes.map((quiz) => (
                      <div key={quiz.id} className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{quiz.title}</p>
                          <p className="text-sm text-muted-foreground">
                            {quiz.total_questions} questions • {quiz.difficulty}
                          </p>
                        </div>
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/quizzes/${quiz.id}`}>Start</Link>
                        </Button>
                      </div>
                    ))
                  ) : (
                    <p className="text-muted-foreground">No quizzes available</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </ProtectedRoute>
  )
}

