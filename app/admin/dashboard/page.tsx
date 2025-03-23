"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { AdminLayout } from "@/components/layouts/AdminLayout"
import { useDataFetching } from "@/hooks/useDataFetching"

// Updated interface definitions to match our API responses
interface Quiz {
  id: string;
  title: string;
  description: string;
  questions: number;
  submissions: number;
  averageScore: number;
}

interface User {
  id: string;
  name: string;
  email: string;
  quizzesTaken: number;
  averageScore: number;
}

interface Submission {
  name: string;
  submissions: number;
}

interface DashboardStats {
  totalQuizzes: number;
  totalUsers: number;
  totalSubmissions: number;
  averageScore: number;
}

interface Activity {
  type: string;
  title: string;
  details: string;
  time: string;
  color: string;
}

export default function AdminDashboard() {
  // Fetch dashboard stats with 30-second refresh interval
  const { data: statsData, loading: loadingStats, error: statsError } = useDataFetching<'submissions'>({
    table: 'submissions',
    select: 'id, score, total_possible',
    refreshInterval: 30000, // Refresh every 30 seconds
    revalidateOnFocus: true,
    revalidateOnReconnect: true
  });

  // Fetch quizzes with 1-minute refresh interval
  const { data: quizzesData, loading: loadingQuizzes, error: quizzesError } = useDataFetching<'quizzes'>({
    table: 'quizzes',
    select: 'id, title, description, total_questions, times_played',
    refreshInterval: 60000, // Refresh every minute
    revalidateOnFocus: true
  });

  // Fetch users with 2-minute refresh interval
  const { data: usersData, loading: loadingUsers, error: usersError } = useDataFetching<'users'>({
    table: 'users',
    select: 'id, full_name, email, quizzes_taken, average_score',
    refreshInterval: 120000, // Refresh every 2 minutes
    revalidateOnFocus: true
  });

  // Fetch recent activity with 15-second refresh interval
  const { data: activityData, loading: loadingActivity, error: activityError } = useDataFetching<'submissions'>({
    table: 'submissions',
    select: 'id, user_id, quiz_id, created_at, score, total_possible',
    orderBy: { column: 'created_at', ascending: false },
    refreshInterval: 15000, // Refresh every 15 seconds
    revalidateOnFocus: true
  });

  // Process dashboard stats
  const stats = {
    totalQuizzes: quizzesData.length,
    totalUsers: usersData.length,
    totalSubmissions: statsData.length,
    averageScore: statsData.length > 0 
      ? statsData.reduce((acc, sub) => acc + (sub.score / sub.total_possible) * 100, 0) / statsData.length 
      : 0
  };

  // Process submissions chart data
  const submissions = quizzesData.map(quiz => ({
    name: quiz.title,
    submissions: quiz.times_played || 0
  }));

  // Process recent activity
  const activity = activityData.slice(0, 5).map(sub => ({
    type: 'submission',
    title: `Quiz Submission`,
    details: `Score: ${Math.round((sub.score / sub.total_possible) * 100)}%`,
    time: new Date(sub.created_at || new Date()).toLocaleString(),
    color: 'blue'
  }));

  const loading = loadingStats || loadingQuizzes || loadingUsers || loadingActivity;
  const error = statsError || quizzesError || usersError || activityError;

  return (
    <AdminLayout>
      <div className="grid gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage quizzes, users, and view analytics.</p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="w-12 h-12 border-4 border-t-primary border-primary/30 rounded-full animate-spin"></div>
          </div>
        ) : error ? (
          <div className="flex justify-center items-center h-64">
            <p className="text-red-500">{error}</p>
          </div>
        ) : (
          <>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Quizzes</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalQuizzes}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalUsers}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Submissions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalSubmissions}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Average Score</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {stats.averageScore > 0 ? `${stats.averageScore.toFixed(1)}%` : "N/A"}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Card className="col-span-1">
                <CardHeader>
                  <CardTitle>Quiz Submissions</CardTitle>
                  <CardDescription>Number of submissions per quiz</CardDescription>
                </CardHeader>
                <CardContent className="pl-2">
                  <div className="h-[300px]">
                    {submissions.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={submissions}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip />
                          <Bar dataKey="submissions" fill="#3b82f6" />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <p className="text-gray-500">No submission data available</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card className="col-span-1">
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>Latest quiz submissions and user registrations</CardDescription>
                </CardHeader>
                <CardContent>
                  {activity.length > 0 ? (
                    <div className="space-y-4">
                      {activity.map((item, index) => (
                        <div key={index} className={`border-l-4 border-${item.color}-500 pl-4 py-2`}>
                          <p className="text-sm font-medium">{item.title}</p>
                          <p className="text-xs text-muted-foreground">{item.details && `${item.details} • `}{item.time}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-10">
                      <p className="text-gray-500">No recent activity</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  )
}

