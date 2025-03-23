"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useDataFetching } from "@/hooks/useDataFetching"
import { AdminLayout } from "@/components/layouts/AdminLayout"
import type { TableRow } from "@/lib/supabase"

interface QuizWithSubmissions extends TableRow<'quizzes'> {
  submissions: { count: number }[];
}

export default function QuizzesPage() {
  const [searchQuery, setSearchQuery] = useState("")

  // Fetch quizzes with submission counts using a join
  const { data: quizzes, loading, error } = useDataFetching<'quizzes'>({
    table: 'quizzes',
    select: `
      *,
      submissions(count)
    `,
    orderBy: { column: 'created_at', ascending: false }
  });

  // Filter quizzes based on search query
  const filteredQuizzes = (quizzes || []).filter(quiz => 
    quiz.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (quiz.description?.toLowerCase() || '').includes(searchQuery.toLowerCase())
  );

  // Helper function to get submission count
  const getSubmissionCount = (quiz: QuizWithSubmissions) => {
    return quiz.submissions?.[0]?.count || 0;
  };

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Quizzes</h1>
        <p className="text-muted-foreground">Manage and view all quizzes</p>
      </div>

      <div className="mb-6 flex justify-between items-center">
        <div className="flex-1 max-w-sm">
          <Input
            placeholder="Search quizzes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button asChild>
          <Link href="/admin/quizzes/new">Create New Quiz</Link>
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="w-12 h-12 border-4 border-t-primary border-primary/30 rounded-full animate-spin"></div>
        </div>
      ) : error ? (
        <div className="flex items-center justify-center h-64">
          <p className="text-red-500">Error loading quizzes: {error}</p>
        </div>
      ) : filteredQuizzes.length === 0 ? (
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">No quizzes found</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredQuizzes.map((quiz) => (
            <Card key={quiz.id}>
              <CardHeader>
                <CardTitle>{quiz.title}</CardTitle>
                <CardDescription>
                  Created on {quiz.created_at ? new Date(quiz.created_at).toLocaleDateString() : 'Unknown date'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  {quiz.description || "No description provided"}
                </p>
                <div className="flex justify-between items-center">
                  <div className="text-sm text-muted-foreground">
                    {getSubmissionCount(quiz as QuizWithSubmissions)} submissions
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/admin/quizzes/${quiz.id}/edit`}>Edit</Link>
                    </Button>
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/admin/quizzes/${quiz.id}/analytics`}>Analytics</Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </AdminLayout>
  )
} 