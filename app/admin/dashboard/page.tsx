"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { AdminLayout } from "@/components/layouts/AdminLayout"

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
  const [quizzes, setQuizzes] = useState<Quiz[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [stats, setStats] = useState<DashboardStats>({
    totalQuizzes: 0,
    totalUsers: 0,
    totalSubmissions: 0,
    averageScore: 0
  })
  const [activity, setActivity] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true)
        
        // Fetch dashboard stats
        const statsResponse = await fetch('/api/admin/dashboard')
        if (!statsResponse.ok) throw new Error('Failed to fetch dashboard stats')
        const statsData = await statsResponse.json()
        setStats(statsData)
        
        // Fetch quizzes
        const quizzesResponse = await fetch('/api/admin/quizzes')
        if (!quizzesResponse.ok) throw new Error('Failed to fetch quizzes')
        const quizzesData = await quizzesResponse.json()
        setQuizzes(quizzesData)
        
        // Fetch users
        const usersResponse = await fetch('/api/admin/users')
        if (!usersResponse.ok) throw new Error('Failed to fetch users')
        const usersData = await usersResponse.json()
        setUsers(usersData)
        
        // Fetch submissions chart data
        const submissionsResponse = await fetch('/api/admin/activity/submissions')
        if (!submissionsResponse.ok) throw new Error('Failed to fetch submissions chart')
        const submissionsData = await submissionsResponse.json()
        setSubmissions(submissionsData)
        
        // Fetch recent activity
        const activityResponse = await fetch('/api/admin/activity/recent')
        if (!activityResponse.ok) throw new Error('Failed to fetch recent activity')
        const activityData = await activityResponse.json()
        setActivity(activityData)
        
        setLoading(false)
      } catch (err) {
        console.error('Error fetching dashboard data:', err)
        setError(err instanceof Error ? err.message : 'An error occurred')
        setLoading(false)
      }
    }
    
    fetchDashboardData()
  }, [])

  return (
    <AdminLayout>
      <div className="grid gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage quizzes, users, and view analytics.</p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <p>Loading dashboard data...</p>
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

