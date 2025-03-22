"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"

// Define interfaces for type safety
interface Quiz {
  id: string;
  title: string;
  description: string;
  difficulty: string;
  metadata: {
    totalQuestions: number;
    totalPoints: number;
    timesPlayed: number;
    averageRating: number;
  };
}

interface CompletedQuiz {
  id: string;
  title: string;
  score: number;
  totalQuestions: number;
  completedAt: string;
}

export default function UserDashboard() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([])
  const [completedQuizzes, setCompletedQuizzes] = useState<CompletedQuiz[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/quizzes');
        
        if (!response.ok) {
          throw new Error('Failed to fetch quizzes');
        }
        
        const data = await response.json();
        setQuizzes(data);
        
        // For now, we'll use hardcoded completed quizzes
        // In a real app, you would fetch this from an API
        setCompletedQuizzes([
          {
            id: "completed1",
            title: "HTML and CSS Basics",
            score: 8,
            totalQuestions: 10,
            completedAt: "2023-05-15",
          },
        ]);
        
        setLoading(false);
      } catch (err) {
        console.error("Error fetching quizzes:", err);
        setError("Failed to load quizzes. Please try again later.");
        setLoading(false);
      }
    };
    
    fetchQuizzes();
  }, [])

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-10 border-b bg-background">
        <div className="container flex h-16 items-center justify-between py-4">
          <div className="flex items-center gap-2">
            <Link href="/" className="font-bold">
              QuizMaster
            </Link>
          </div>
          <nav className="hidden md:flex gap-6">
            <Link className="text-sm font-medium hover:underline underline-offset-4" href="/dashboard">
              Dashboard
            </Link>
            <Link className="text-sm font-medium hover:underline underline-offset-4" href="/quizzes">
              Quizzes
            </Link>
            <Link className="text-sm font-medium hover:underline underline-offset-4" href="/profile">
              Profile
            </Link>
          </nav>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link href="/">Logout</Link>
            </Button>
          </div>
        </div>
      </header>
      <main className="flex-1 container py-6">
        <div className="grid gap-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Welcome back, User!</h1>
            <p className="text-muted-foreground">Track your progress and take new quizzes to improve your knowledge.</p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Quizzes Completed</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{completedQuizzes.length}</div>
                <p className="text-xs text-muted-foreground">+0% from last month</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Average Score</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {completedQuizzes.length > 0
                    ? `${Math.round((completedQuizzes.reduce((acc, quiz) => acc + quiz.score / quiz.totalQuestions, 0) / completedQuizzes.length) * 100)}%`
                    : "N/A"}
                </div>
                <p className="text-xs text-muted-foreground">+0% from last month</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Quizzes Available</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{quizzes.length}</div>
                <p className="text-xs text-muted-foreground">+0 new this month</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {Math.round((completedQuizzes.length / (quizzes.length + completedQuizzes.length)) * 100)}%
                </div>
                <Progress
                  value={(completedQuizzes.length / (quizzes.length + completedQuizzes.length)) * 100}
                  className="mt-2"
                />
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="available" className="space-y-4">
            <TabsList>
              <TabsTrigger value="available">Available Quizzes</TabsTrigger>
              <TabsTrigger value="completed">Completed Quizzes</TabsTrigger>
            </TabsList>
            <TabsContent value="available" className="space-y-4">
              {loading ? (
                <div className="text-center py-4">Loading quizzes...</div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {quizzes.map((quiz) => (
                    <Card key={quiz.id}>
                      <CardHeader>
                        <CardTitle>{quiz.title}</CardTitle>
                        <CardDescription>{quiz.description}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-wrap gap-2 mb-4">
                          <Badge variant="outline">{quiz.difficulty}</Badge>
                          <Badge variant="outline">{quiz.metadata.totalQuestions} Questions</Badge>
                          <Badge variant="outline">{quiz.metadata.totalPoints} Points</Badge>
                        </div>
                      </CardContent>
                      <CardFooter>
                        <Button asChild className="w-full">
                          <Link href={`/quizzes/${quiz.id}`}>Start Quiz</Link>
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
            <TabsContent value="completed" className="space-y-4">
              {loading ? (
                <div className="text-center py-4">Loading completed quizzes...</div>
              ) : completedQuizzes.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {completedQuizzes.map((quiz) => (
                    <Card key={quiz.id}>
                      <CardHeader>
                        <CardTitle>{quiz.title}</CardTitle>
                        <CardDescription>Completed on {quiz.completedAt}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span>Score:</span>
                            <span className="font-medium">
                              {quiz.score}/{quiz.totalQuestions}
                            </span>
                          </div>
                          <Progress value={(quiz.score / quiz.totalQuestions) * 100} />
                        </div>
                      </CardContent>
                      <CardFooter>
                        <Button variant="outline" asChild className="w-full">
                          <Link href={`/quizzes/${quiz.id}/results`}>View Results</Link>
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4">You haven't completed any quizzes yet.</div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}

