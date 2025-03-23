"use client"

import { useState } from "react"
import Link from "next/link"
import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, User, Mail, Calendar, Award, Clock } from "lucide-react"
import React from "react"
import type { Database } from '@/lib/database.types';
import { useDataFetching } from "@/hooks/useDataFetching";

// Define types for our data
type User = Database['public']['Tables']['users']['Row'];
type Submission = Database['public']['Tables']['submissions']['Row'];
type Quiz = Database['public']['Tables']['quizzes']['Row'];

// Define the type for our joined data
type UserWithSubmissions = User & {
  submissions: (Submission & {
    quizzes: Quiz;
  })[];
};

type UserSubmission = Submission & {
  quizzes: Quiz;
  // Computed properties for display
  displayTimeSpent?: string;
  percentage?: number;
};

type UserDetails = User & {
  stats: {
    quizzesTaken: number;
    averageScore: number;
    totalPoints: number;
    rank: string;
  };
  preferences: {
    emailNotifications: boolean;
    publicProfile: boolean;
  };
  recentSubmissions: UserSubmission[];
  // Computed properties for display
  displayName?: string;
  joinedAt?: string;
};

export default function UserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  // Unwrap params using React.use()
  const unwrappedParams = React.use(params);
  const userId = unwrappedParams.id;
  
  // Use the useDataFetching hook to fetch user details with joined submissions and quizzes
  const { data: users, loading, error } = useDataFetching<'users', [], [], [
    {
      table: 'submissions',
      on: 'user_id',
      orderBy: { column: 'created_at', ascending: false }
    },
    {
      table: 'quizzes',
      on: 'quiz_id'
    }
  ]>({
    table: 'users',
    filter: {
      column: 'id',
      operator: 'eq',
      value: userId
    }
  });

  // Get the first (and only) user from the array
  const rawUser = users?.[0] as UserWithSubmissions;

  // Format date helper function
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "PPP");
    } catch (error) {
      return "Unknown date";
    }
  };

  // Helper function to determine badge color based on difficulty
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'easy':
        return 'bg-green-100 text-green-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'hard':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Format user data for display
  const formattedUser = rawUser ? {
    ...rawUser,
    displayName: rawUser.full_name || 'Unknown User',
    joinedAt: rawUser.created_at,
    stats: {
      quizzesTaken: rawUser.quizzes_taken || 0,
      averageScore: rawUser.average_score || 0,
      totalPoints: rawUser.total_points || 0,
      rank: rawUser.rank || 'Beginner'
    },
    preferences: {
      emailNotifications: rawUser.email_notifications || false,
      publicProfile: rawUser.public_profile || false
    },
    recentSubmissions: (rawUser.submissions || []).slice(0, 10).map(submission => ({
      ...submission,
      displayTimeSpent: submission.time_spent ? `${Math.floor(submission.time_spent / 60)}m ${submission.time_spent % 60}s` : 'Unknown',
      percentage: Math.round((submission.score / submission.total_possible) * 100)
    })) as UserSubmission[]
  } : null;

  // Show loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p>Loading user details...</p>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-10 border-b bg-background">
        <div className="container flex h-16 items-center justify-between py-4">
          <div className="flex items-center gap-2">
            <Link href="/" className="font-bold">
              QuizMaster <Badge>Admin</Badge>
            </Link>
          </div>
          <nav className="hidden md:flex gap-6">
            <Link className="text-sm font-medium hover:underline underline-offset-4" href="/admin/dashboard">
              Dashboard
            </Link>
            <Link className="text-sm font-medium hover:underline underline-offset-4" href="/admin/quizzes/create">
              Quizzes
            </Link>
            <Link className="text-sm font-medium hover:underline underline-offset-4" href="/admin/dashboard">
              Users
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
        <div className="flex items-center mb-6">
          <Button variant="outline" size="sm" className="mr-2" asChild>
            <Link href="/admin/dashboard">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">User Details</h1>
        </div>

        {formattedUser ? (
          <div className="grid gap-6 md:grid-cols-3">
            {/* User Profile Card */}
            <Card className="md:col-span-1">
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>User account details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3">
                  <User className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="text-sm font-medium">Name</p>
                    <p className="text-sm text-gray-500">{formattedUser.displayName}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Mail className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="text-sm font-medium">Email</p>
                    <p className="text-sm text-gray-500">{formattedUser.email}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Calendar className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="text-sm font-medium">Joined</p>
                    <p className="text-sm text-gray-500">
                      Joined {formattedUser.joinedAt ? format(new Date(formattedUser.joinedAt), 'MMMM yyyy') : 'Unknown'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Award className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="text-sm font-medium">Rank</p>
                    <p className="text-sm text-gray-500">{formattedUser.stats.rank}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* User Stats Card */}
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Statistics</CardTitle>
                <CardDescription>User performance metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold">{formattedUser.stats.quizzesTaken}</p>
                    <p className="text-sm text-gray-500">Quizzes Taken</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold">{formattedUser.stats.averageScore}%</p>
                    <p className="text-sm text-gray-500">Average Score</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold">{formattedUser.stats.totalPoints}</p>
                    <p className="text-sm text-gray-500">Total Points</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold">{formattedUser.stats.rank}</p>
                    <p className="text-sm text-gray-500">Current Rank</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Submissions Card */}
            <Card className="md:col-span-3">
              <CardHeader>
                <CardTitle>Recent Submissions</CardTitle>
                <CardDescription>Latest quiz attempts</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {formattedUser.recentSubmissions.map((submission) => (
                    <div key={submission.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h3 className="font-medium">{submission.quizzes.title}</h3>
                        <p className="text-sm text-gray-500">
                          Score: {submission.score}/{submission.total_possible} ({submission.percentage}%)
                        </p>
                        <p className="text-sm text-gray-500">
                          Time: {submission.displayTimeSpent}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getDifficultyColor(submission.quizzes.difficulty)}>
                          {submission.quizzes.difficulty}
                        </Badge>
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/admin/quizzes/${submission.quiz_id}/submissions/${submission.id}`}>
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
        ) : (
          <div className="flex justify-center items-center h-64">
            <p className="text-gray-500">User not found</p>
          </div>
        )}
      </main>
    </div>
  );
} 