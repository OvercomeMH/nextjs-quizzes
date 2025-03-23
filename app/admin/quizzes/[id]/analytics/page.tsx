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
import { useMemo } from 'react';

// Define types for our data
type Submission = Database['public']['Tables']['submissions']['Row'];
type User = Database['public']['Tables']['users']['Row'];

interface QuestionStat {
  id: string;
  question: string;
  question_number?: number;
  correct: number;
  incorrect: number;
}

interface CompletionTime {
  time: number;
  count: number;
}

interface CompletionTimePoint {
  score: number;
  time: number;
}

interface RecentSubmission {
  id: string;
  user: string;
  score: string;
  percentage: number;
  time: string;
  date: string;
}

export default function QuizAnalyticsPage({ params }: { params: Promise<{ id: string }> }) {
  // Unwrap params using React.use()
  const unwrappedParams = React.use(params);
  const quizId = unwrappedParams.id;

  // Fetch quiz data with joined submissions and users
  const { data: quiz, loading, error } = useDataFetching<'quizzes', [], [], [
    {
      table: 'submissions',
      on: 'quiz_id',
      orderBy: { column: 'created_at', ascending: false }
    },
    {
      table: 'users',
      on: 'user_id'
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

  // Process analytics data
  const analyticsData = useMemo(() => {
    const submissions = quiz.submissions || [];
    const users = quiz.users || [];

    // Calculate score distribution
    const scoreCounts: Record<number, number> = {};
    submissions.forEach((sub: Submission) => {
      const score = Math.round((sub.score / sub.total_possible) * 100);
      scoreCounts[score] = (scoreCounts[score] || 0) + 1;
    });
    const scoreDistribution = Object.entries(scoreCounts).map(([score, count]) => ({
      score: parseInt(score),
      count
    }));

    // Calculate submissions over time
    const dateCounts: Record<string, number> = {};
    submissions.forEach((sub: Submission) => {
      if (sub.created_at) {
        const date = new Date(sub.created_at).toISOString().split('T')[0];
        dateCounts[date] = (dateCounts[date] || 0) + 1;
      }
    });
    const submissionsOverTime = Object.entries(dateCounts).map(([date, count]) => ({
      date,
      count
    }));

    // Format recent submissions
    const recentSubmissions = submissions.slice(0, 10).map((sub: Submission) => {
      const user = users.find((u: User) => u.id === sub.user_id);
      const percentage = Math.round((sub.score / sub.total_possible) * 100);
      return {
        id: sub.id,
        user: user?.full_name || 'Anonymous',
        score: `${sub.score}/${sub.total_possible}`,
        percentage,
        time: sub.time_spent ? `${Math.round(sub.time_spent / 60)}m ${sub.time_spent % 60}s` : 'N/A',
        date: sub.created_at ? new Date(sub.created_at).toLocaleDateString() : 'Unknown'
      };
    });

    return {
      quiz,
      totalSubmissions: submissions.length,
      averageScore: submissions.length > 0
        ? Math.round(
            submissions.reduce((acc: number, sub: Submission) => 
              acc + (sub.score / sub.total_possible), 0) /
            submissions.length *
            100
          )
        : 0,
      scoreDistribution,
      submissionsOverTime,
      recentSubmissions,
      questionStats: [], // This will be populated by the API
      completionTime: [], // This will be populated by the API
      completionTimeScatter: [] // This will be populated by the API
    };
  }, [quiz]);

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
            <h1 className="text-3xl font-bold">Quiz Analytics</h1>
            <p className="text-muted-foreground">
              {analyticsData.quiz.title}
            </p>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Overview Card */}
          <Card>
            <CardHeader>
              <CardTitle>Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium">Total Submissions</h3>
                  <p className="text-sm text-muted-foreground">{analyticsData.totalSubmissions}</p>
                </div>
                <div>
                  <h3 className="font-medium">Average Score</h3>
                  <p className="text-sm text-muted-foreground">{analyticsData.averageScore}%</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Submissions Card */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Submissions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analyticsData.recentSubmissions.map((submission: RecentSubmission) => (
                  <div key={submission.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium">{submission.user}</h3>
                        <p className="text-sm text-muted-foreground">
                          Score: {submission.score} ({submission.percentage}%)
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Time: {submission.time}
                        </p>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {submission.date}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}

