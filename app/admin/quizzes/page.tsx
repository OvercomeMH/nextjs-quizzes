"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface Quiz {
  id: string;
  title: string;
  description: string;
  difficulty: string;
  metadata: {
    totalQuestions: number;
    totalPoints: number;
    averageRating: number;
    timesPlayed: number;
  };
}

export default function AdminQuizzesPage() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([])
  const [loading, setLoading] = useState(true)

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
        setLoading(false);
      } catch (err) {
        console.error("Error fetching quizzes:", err);
        setLoading(false);
      }
    };
    
    fetchQuizzes();
  }, [])

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-10 border-b bg-background">
        <div className="container flex h-16 items-center justify-between py-4">
          <div className="flex items-center gap-2">
            <Link href="/admin/dashboard" className="font-bold">
              QuizMaster Admin
            </Link>
          </div>
          <nav className="hidden md:flex gap-6">
            <Link className="text-sm font-medium hover:underline underline-offset-4" href="/admin/dashboard">
              Dashboard
            </Link>
            <Link className="text-sm font-medium hover:underline underline-offset-4" href="/admin/quizzes">
              Quizzes
            </Link>
            <Link className="text-sm font-medium hover:underline underline-offset-4" href="/dashboard">
              User Dashboard
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
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Manage Quizzes</h1>
          <Button asChild>
            <Link href="/admin/quizzes/create">Create New Quiz</Link>
          </Button>
        </div>

        {loading ? (
          <div className="text-center py-12">Loading quizzes...</div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {quizzes.map((quiz) => (
              <Card key={quiz.id} className="overflow-hidden">
                <CardHeader>
                  <CardTitle>{quiz.title}</CardTitle>
                  <CardDescription>{quiz.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2 mb-4">
                    <Badge variant="outline">{quiz.difficulty}</Badge>
                    <Badge variant="outline">{quiz.metadata.totalQuestions} Questions</Badge>
                    <Badge variant="outline">{quiz.metadata.timesPlayed} Plays</Badge>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/admin/quizzes/${quiz.id}/analytics`}>Analytics</Link>
                  </Button>
                  <Button variant="default" size="sm">
                    <Link href={`/quizzes/${quiz.id}`}>Preview</Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  )
} 