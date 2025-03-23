"use client"

import React from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Database } from '@/lib/database.types';
import { useDataFetching } from '@/hooks/useDataFetching';
import { AdminLayout } from '@/components/layouts/AdminLayout';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

// Define types for our joined data
type Submission = Database['public']['Tables']['submissions']['Row'];
type Question = Database['public']['Tables']['questions']['Row'];

export default function QuizDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  // Unwrap params using React.use()
  const unwrappedParams = React.use(params);
  const quizId = unwrappedParams.id;

  // Fetch quiz data with joined questions and submissions
  const { data: quiz, loading, error } = useDataFetching<'quizzes', [], [], [
    {
      table: 'questions',
      on: 'quiz_id',
      orderBy: { column: 'order_num', ascending: true }
    },
    {
      table: 'submissions',
      on: 'quiz_id',
      orderBy: { column: 'created_at', ascending: false }
    }
  ]>({
    table: 'quizzes',
    filter: { column: 'id', operator: 'eq', value: quizId }
  });

  // Show loading state
  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="w-12 h-12 border-4 border-t-primary border-primary/30 rounded-full animate-spin"></div>
        </div>
      </AdminLayout>
    );
  }

  // Show error state
  if (error) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center text-red-500">{error}</div>
        </div>
      </AdminLayout>
    );
  }

  // Show not found state
  if (!quiz) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center text-gray-500">Quiz not found</div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="max-w-6xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" asChild>
              <Link href="/admin/quizzes">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Quizzes
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold">{quiz.title}</h1>
              <p className="text-muted-foreground">{quiz.description}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link href={`/admin/quizzes/${quiz.id}/edit`}>Edit Quiz</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href={`/admin/quizzes/${quiz.id}/analytics`}>View Analytics</Link>
            </Button>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Quiz Details Card */}
          <Card>
            <CardHeader>
              <CardTitle>Quiz Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium">Description</h3>
                  <p className="text-sm text-muted-foreground">{quiz.description || 'No description provided'}</p>
                </div>
                <div>
                  <h3 className="font-medium">Difficulty</h3>
                  <p className="text-sm text-muted-foreground">{quiz.difficulty}</p>
                </div>
                <div>
                  <h3 className="font-medium">Category</h3>
                  <p className="text-sm text-muted-foreground">{quiz.category || 'Uncategorized'}</p>
                </div>
                <div>
                  <h3 className="font-medium">Time Limit</h3>
                  <p className="text-sm text-muted-foreground">{Math.round((quiz.time_limit || 600) / 60)} minutes</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Statistics Card */}
          <Card>
            <CardHeader>
              <CardTitle>Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium">Total Questions</h3>
                  <p className="text-sm text-muted-foreground">{quiz.questions?.length || 0}</p>
                </div>
                <div>
                  <h3 className="font-medium">Total Submissions</h3>
                  <p className="text-sm text-muted-foreground">{quiz.submissions?.length || 0}</p>
                </div>
                <div>
                  <h3 className="font-medium">Average Score</h3>
                  <p className="text-sm text-muted-foreground">
                    {quiz.submissions?.length > 0
                      ? Math.round(
                          quiz.submissions.reduce((acc: number, sub: Submission) => 
                            acc + (sub.score / sub.total_possible), 0) /
                          quiz.submissions.length *
                          100
                        )
                      : 0}
                    %
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Questions List */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Questions</CardTitle>
            <p className="text-sm text-muted-foreground">
              {quiz.questions?.length || 0} questions in this quiz
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {quiz.questions?.map((question: Question, index: number) => (
                <div key={question.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium">Question {index + 1}</h3>
                      <p className="text-sm text-muted-foreground">{question.text}</p>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {question.points} points
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
} 