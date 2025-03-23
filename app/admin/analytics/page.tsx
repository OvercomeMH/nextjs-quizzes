"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart, 
  Pie,
  Cell,
  Legend
} from "recharts"

interface QuizStats {
  name: string;
  submissions: number;
  averageScore: number;
}

interface CategoryStats {
  name: string;
  count: number;
}

interface DailyStats {
  date: string;
  submissions: number;
}

interface AnalyticsData {
  quizStats: QuizStats[];
  categoryStats: CategoryStats[];
  dailyStats: DailyStats[];
  totalQuizzes: number;
  totalSubmissions: number;
  totalUsers: number;
  averageScore: number;
  completionRate: number;
}

export default function AdminAnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/admin/analytics');
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => null);
          throw new Error(`Error fetching analytics: ${response.status}${errorData?.error ? ` - ${errorData.error}` : ''}`);
        }
        
        const analyticsData = await response.json();
        setData(analyticsData);
      } catch (err) {
        console.error('Failed to fetch analytics data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load analytics data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchAnalyticsData();
  }, [])

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"]

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
            <Link className="text-sm font-medium hover:underline underline-offset-4" href="/admin/quizzes">
              Quizzes
            </Link>
            <Link className="text-sm font-medium hover:underline underline-offset-4" href="/admin/users">
              Users
            </Link>
            <Link className="text-sm font-medium hover:underline underline-offset-4" href="/admin/activity">
              Activity
            </Link>
            <Link className="text-sm font-medium hover:underline underline-offset-4" href="/admin/analytics">
              Analytics
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
        <div className="max-w-6xl mx-auto">
          <div className="mb-6">
            <h1 className="text-3xl font-bold">Analytics Overview</h1>
            <p className="text-muted-foreground">Platform-wide performance and engagement metrics</p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-64">
              <p>Loading analytics data...</p>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-64 text-red-500">
              <p>{error}</p>
            </div>
          ) : data ? (
            <>
              <div className="grid gap-4 md:grid-cols-4 mb-6">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Total Quizzes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{data.totalQuizzes}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{data.totalUsers}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Total Submissions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{data.totalSubmissions}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Average Score</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{data.averageScore}%</div>
                  </CardContent>
                </Card>
              </div>

              <div className="grid gap-6 mb-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Submissions Over Time</CardTitle>
                    <CardDescription>Daily quiz submissions for the past week</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={data.dailyStats}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Line type="monotone" dataKey="submissions" stroke="#3b82f6" activeDot={{ r: 8 }} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Quiz Performance</CardTitle>
                    <CardDescription>Submissions and average scores by quiz</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        {data.quizStats && data.quizStats.length > 0 ? (
                          <BarChart data={data.quizStats} layout="vertical">
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis type="number" />
                            <YAxis dataKey="name" type="category" width={150} />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="submissions" fill="#3b82f6" name="Submissions" />
                            <Bar dataKey="averageScore" fill="#10b981" name="Avg. Score (%)" />
                          </BarChart>
                        ) : (
                          <div className="flex h-full items-center justify-center">
                            <p className="text-muted-foreground">No quiz performance data available</p>
                          </div>
                        )}
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Quiz Categories</CardTitle>
                    <CardDescription>Distribution of quizzes by category</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        {data.categoryStats && data.categoryStats.length > 0 ? (
                          <PieChart>
                            <Pie
                              data={data.categoryStats}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              outerRadius={100}
                              fill="#8884d8"
                              dataKey="count"
                              label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                            >
                              {data.categoryStats.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip />
                            <Legend />
                          </PieChart>
                        ) : (
                          <div className="flex h-full items-center justify-center">
                            <p className="text-muted-foreground">No category data available</p>
                          </div>
                        )}
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </>
          ) : null}
        </div>
      </main>
    </div>
  )
} 