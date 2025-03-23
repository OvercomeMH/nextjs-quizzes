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

// Define type for submission with joined user data
type SubmissionWithUser = Database['public']['Tables']['submissions']['Row'] & {
  user: Database['public']['Tables']['users']['Row'];
};

export default function QuizSubmissionsPage({ params }: { params: Promise<{ id: string }> }) {
  // Unwrap params using React.use()
  const unwrappedParams = React.use(params);
  const quizId = unwrappedParams.id;

  // Fetch submissions with joined user data
  const { data: submissions, loading, error } = useDataFetching<'submissions', [], [
    {
      table: 'users',
      on: 'user_id'
    }
  ], []>({
    table: 'submissions',
    filter: { column: 'quiz_id', operator: 'eq', value: quizId },
    orderBy: { column: 'created_at', ascending: false }
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

  return (
    <AdminLayout>
      <div className="max-w-6xl mx-auto">
        <div className="mb-6 flex items-center gap-4">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/admin/quizzes/${quizId}`}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Quiz
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Quiz Submissions</h1>
            <p className="text-muted-foreground">
              {submissions?.length || 0} total submissions
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Submission History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {submissions?.map((submission: SubmissionWithUser) => (
                <div key={submission.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium">
                        {submission.user?.full_name || 'Anonymous User'}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Score: {submission.score}/{submission.total_possible} (
                        {Math.round((submission.score / submission.total_possible) * 100)}%)
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Time: {submission.time_spent ? `${Math.round(submission.time_spent / 60)}m ${submission.time_spent % 60}s` : 'N/A'}
                      </p>
                    </div>
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/admin/quizzes/${quizId}/submissions/${submission.id}`}>
                        View Details
                      </Link>
                    </Button>
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