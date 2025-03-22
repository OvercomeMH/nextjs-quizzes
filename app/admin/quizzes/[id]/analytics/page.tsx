"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
} from "recharts"

export default function QuizAnalyticsPage({ params }) {
  const [quiz, setQuiz] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // In a real app, you would fetch this data from an API
    setTimeout(() => {
      setQuiz({
        id: params.id,
        title: "Introduction to JavaScript",
        description: "Test your knowledge of JavaScript basics",
        totalSubmissions: 24,
        averageScore: 78,
        questionStats: [
          { question: "Q1", correct: 20, incorrect: 4 },
          { question: "Q2", correct: 15, incorrect: 9 },
          { question: "Q3", correct: 22, incorrect: 2 },
          { question: "Q4", correct: 18, incorrect: 6 },
          { question: "Q5", correct: 12, incorrect: 12 },
        ],
        scoreDistribution: [
          { score: "0-20%", count: 1 },
          { score: "21-40%", count: 2 },
          { score: "41-60%", count: 5 },
          { score: "61-80%", count: 10 },
          { score: "81-100%", count: 6 },
        ],
        completionTime: [
          { time: "<2 min", count: 3 },
          { time: "2-4 min", count: 8 },
          { time: "4-6 min", count: 10 },
          { time: "6-8 min", count: 2 },
          { time: ">8 min", count: 1 },
        ],
        submissionsOverTime: [
          { date: "Jan 1", submissions: 2 },
          { date: "Jan 2", submissions: 3 },
          { date: "Jan 3", submissions: 1 },
          { date: "Jan 4", submissions: 5 },
          { date: "Jan 5", submissions: 4 },
          { date: "Jan 6", submissions: 6 },
          { date: "Jan 7", submissions: 3 },
        ],
        recentSubmissions: [
          { user: "John Doe", score: "8/10", time: "3m 45s", date: "2 hours ago" },
          { user: "Jane Smith", score: "7/10", time: "5m 12s", date: "5 hours ago" },
          { user: "Bob Johnson", score: "9/10", time: "4m 30s", date: "1 day ago" },
          { user: "Alice Brown", score: "6/10", time: "6m 20s", date: "1 day ago" },
          { user: "Mike Wilson", score: "10/10", time: "3m 10s", date: "2 days ago" },
        ],
      })
      setLoading(false)
    }, 1000)
  }, [params.id])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">Loading analytics...</div>
      </div>
    )
  }

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"]

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-10 border-b bg-background">
        <div className="container flex h-16 items-center justify-between py-4">
          <div className="flex items-center gap-2">
            <Link href="/admin/dashboard" className="font-bold">
              QuizMaster <Badge>Admin</Badge>
            </Link>
          </div>
          <nav className="hidden md:flex gap-6">
            <Link className="text-sm font-medium hover:underline underline-offset-4" href="/admin/dashboard">
              Dashboard
            </Link>
            <Link className="text-sm font-medium hover:underline underline-offset-4" href="/admin/quizzes">
              Manage Quizzes
            </Link>
          </nav>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link href="/admin/quizzes">Back to Quizzes</Link>
            </Button>
          </div>
        </div>
      </header>
      <main className="flex-1 container py-6">
        <div className="max-w-6xl mx-auto">
          <div className="mb-6">
            <h1 className="text-3xl font-bold">{quiz.title} - Analytics</h1>
            <p className="text-muted-foreground">Detailed analytics and insights for this quiz.</p>
          </div>

          <div className="grid gap-4 md:grid-cols-3 mb-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Submissions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{quiz.totalSubmissions}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Average Score</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{quiz.averageScore}%</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">96%</div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="overview" className="space-y-4">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="questions">Question Analysis</TabsTrigger>
              <TabsTrigger value="submissions">Submissions</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Score Distribution</CardTitle>
                    <CardDescription>Distribution of scores across all submissions</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={quiz.scoreDistribution}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="score" />
                          <YAxis />
                          <Tooltip />
                          <Bar dataKey="count" fill="#3b82f6" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Completion Time</CardTitle>
                    <CardDescription>How long it takes users to complete the quiz</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={quiz.completionTime}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="count"
                            label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                          >
                            {quiz.completionTime.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Submissions Over Time</CardTitle>
                  <CardDescription>Number of quiz submissions over the past week</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={quiz.submissionsOverTime}>
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
            </TabsContent>

            <TabsContent value="questions" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Question Performance</CardTitle>
                  <CardDescription>Correct vs. incorrect answers for each question</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={quiz.questionStats}
                        layout="vertical"
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" />
                        <YAxis dataKey="question" type="category" />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="correct" stackId="a" fill="#4ade80" />
                        <Bar dataKey="incorrect" stackId="a" fill="#f87171" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {quiz.questionStats.map((stat, index) => {
                  const total = stat.correct + stat.incorrect
                  const correctPercentage = Math.round((stat.correct / total) * 100)

                  return (
                    <Card key={index}>
                      <CardHeader>
                        <CardTitle>Question {index + 1}</CardTitle>
                        <CardDescription>Performance analysis</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="flex justify-between items-center">
                            <div className="text-sm font-medium">Correct</div>
                            <div className="text-sm font-medium text-green-600">
                              {stat.correct} ({correctPercentage}%)
                            </div>
                          </div>
                          <div className="flex justify-between items-center">
                            <div className="text-sm font-medium">Incorrect</div>
                            <div className="text-sm font-medium text-red-600">
                              {stat.incorrect} ({100 - correctPercentage}%)
                            </div>
                          </div>
                          <div className="h-[100px]">
                            <ResponsiveContainer width="100%" height="100%">
                              <PieChart>
                                <Pie
                                  data={[
                                    { name: "Correct", value: stat.correct },
                                    { name: "Incorrect", value: stat.incorrect },
                                  ]}
                                  cx="50%"
                                  cy="50%"
                                  innerRadius={25}
                                  outerRadius={40}
                                  fill="#8884d8"
                                  dataKey="value"
                                >
                                  <Cell fill="#4ade80" />
                                  <Cell fill="#f87171" />
                                </Pie>
                              </PieChart>
                            </ResponsiveContainer>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </TabsContent>

            <TabsContent value="submissions" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Submissions</CardTitle>
                  <CardDescription>Latest quiz submissions from users</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-3 px-4 font-medium">User</th>
                          <th className="text-left py-3 px-4 font-medium">Score</th>
                          <th className="text-left py-3 px-4 font-medium">Time Taken</th>
                          <th className="text-left py-3 px-4 font-medium">Date</th>
                          <th className="text-left py-3 px-4 font-medium">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {quiz.recentSubmissions.map((submission, index) => (
                          <tr key={index} className="border-b">
                            <td className="py-3 px-4">{submission.user}</td>
                            <td className="py-3 px-4">{submission.score}</td>
                            <td className="py-3 px-4">{submission.time}</td>
                            <td className="py-3 px-4">{submission.date}</td>
                            <td className="py-3 px-4">
                              <Button variant="ghost" size="sm">
                                View Details
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-end">
                <Button variant="outline">Export All Submissions</Button>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}

