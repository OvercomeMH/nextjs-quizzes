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

// Define types for our data
type Submission = Database['public']['Tables']['submissions']['Row'];
type User = Database['public']['Tables']['users']['Row'];
type Quiz = Database['public']['Tables']['quizzes']['Row'];
type UserAnswer = Database['public']['Tables']['user_answers']['Row'];

// Define the type for our joined data
type SubmissionWithDetails = Submission & {
  user: User;
  quiz: Quiz;
  user_answers: UserAnswer[];
};

export default function SubmissionDetailsPage({ params }: { params: Promise<{ id: string, submissionId: string }> }) {
  // Unwrap params using React.use()
  const unwrappedParams = React.use(params);
  const { id: quizId, submissionId } = unwrappedParams;

  // Fetch submission data with joined user, quiz, and answers
  const { data: submission, loading, error } = useDataFetching<'submissions', [], [], [
    {
      table: 'users',
      on: 'user_id'
    },
    {
      table: 'quizzes',
      on: 'quiz_id'
    },
    {
      table: 'user_answers',
      on: 'submission_id',
      orderBy: { column: 'question_id', ascending: true }
    }
  ]>({
    table: 'submissions',
    filter: { column: 'id', operator: 'eq', value: submissionId }
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
  if (!submission?.[0]) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center text-gray-500">Submission not found</div>
        </div>
      </AdminLayout>
    );
  }

  const submissionData = submission[0] as SubmissionWithDetails;
  const percentage = Math.round((submissionData.score / submissionData.total_possible) * 100);
  const timeSpent = submissionData.time_spent ? `${Math.round(submissionData.time_spent / 60)}m ${submissionData.time_spent % 60}s` : 'N/A';

  return (
    <AdminLayout>
      <div className="max-w-6xl mx-auto">
        <div className="mb-6 flex items-center gap-4">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/admin/quizzes/${quizId}/submissions`}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Submissions
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Submission Details</h1>
            <p className="text-muted-foreground">
              {submissionData.quiz.title}
            </p>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Submission Info Card */}
          <Card>
            <CardHeader>
              <CardTitle>Submission Info</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium">User</h3>
                  <p className="text-sm text-muted-foreground">{submissionData.user.full_name}</p>
                </div>
                <div>
                  <h3 className="font-medium">Score</h3>
                  <p className="text-sm text-muted-foreground">
                    {submissionData.score}/{submissionData.total_possible} ({percentage}%)
                  </p>
                </div>
                <div>
                  <h3 className="font-medium">Time Spent</h3>
                  <p className="text-sm text-muted-foreground">{timeSpent}</p>
                </div>
                <div>
                  <h3 className="font-medium">Submitted At</h3>
                  <p className="text-sm text-muted-foreground">
                    {new Date(submissionData.created_at || '').toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quiz Info Card */}
          <Card>
            <CardHeader>
              <CardTitle>Quiz Info</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium">Title</h3>
                  <p className="text-sm text-muted-foreground">{submissionData.quiz.title}</p>
                </div>
                <div>
                  <h3 className="font-medium">Description</h3>
                  <p className="text-sm text-muted-foreground">{submissionData.quiz.description || 'No description'}</p>
                </div>
                <div>
                  <h3 className="font-medium">Difficulty</h3>
                  <p className="text-sm text-muted-foreground">{submissionData.quiz.difficulty}</p>
                </div>
                <div>
                  <h3 className="font-medium">Category</h3>
                  <p className="text-sm text-muted-foreground">{submissionData.quiz.category || 'Uncategorized'}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Answers List */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Answers</CardTitle>
            <p className="text-sm text-muted-foreground">
              {submissionData.user_answers.length} answers submitted
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {submissionData.user_answers.map((answer, index) => (
                <div key={answer.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium">Question {index + 1}</h3>
                      <p className="text-sm text-muted-foreground">
                        Answer: {answer.selected_option || 'No answer'}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Status: {answer.is_correct ? 'Correct' : 'Incorrect'}
                      </p>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {answer.is_correct ? 'Correct' : 'Incorrect'}
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