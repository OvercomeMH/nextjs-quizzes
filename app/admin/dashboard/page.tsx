"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

interface Quiz {
  id: number
  title: string
  description: string
  questions: number
  submissions: number
  averageScore: number
}

interface User {
  id: number
  name: string
  email: string
  quizzesTaken: number
  averageScore: number
}

interface Submission {
  name: string
  submissions: number
}

export default function AdminDashboard() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // In a real app, you would fetch this data from an API
    setTimeout(() => {
      setQuizzes([
        {
          id: 1,
          title: "Introduction to JavaScript",
          description: "Test your knowledge of JavaScript basics",
          questions: 10,
          submissions: 24,
          averageScore: 78,
        },
        {
          id: 2,
          title: "Advanced React Concepts",
          description: "Challenge yourself with advanced React topics",
          questions: 15,
          submissions: 12,
          averageScore: 65,
        },
        {
          id: 3,
          title: "Data Structures and Algorithms",
          description: "Test your knowledge of fundamental CS concepts",
          questions: 20,
          submissions: 8,
          averageScore: 72,
        },
      ])

      setUsers([
        { id: 1, name: "John Doe", email: "john@example.com", quizzesTaken: 5, averageScore: 82 },
        { id: 2, name: "Jane Smith", email: "jane@example.com", quizzesTaken: 3, averageScore: 75 },
        { id: 3, name: "Bob Johnson", email: "bob@example.com", quizzesTaken: 7, averageScore: 68 },
        { id: 4, name: "Alice Brown", email: "alice@example.com", quizzesTaken: 2, averageScore: 90 },
      ])

      setSubmissions([
        { name: "Introduction to JavaScript", submissions: 24 },
        { name: "Advanced React Concepts", submissions: 12 },
        { name: "Data Structures and Algorithms", submissions: 8 },
        { name: "HTML and CSS Basics", submissions: 32 },
        { name: "Python Fundamentals", submissions: 18 },
      ])

      setLoading(false)
    }, 1000)
  }, [])

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
            <Link className="text-sm font-medium hover:underline underline-offset-4" href="/admin/dashboard">
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
        <div className="grid gap-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
            <p className="text-muted-foreground">Manage quizzes, users, and view analytics.</p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Quizzes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{quizzes.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{users.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Submissions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{quizzes.reduce((acc, quiz) => acc + quiz.submissions, 0)}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Average Score</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {quizzes.length > 0
                    ? `${Math.round(quizzes.reduce((acc, quiz) => acc + quiz.averageScore, 0) / quizzes.length)}%`
                    : "N/A"}
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
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={submissions}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="submissions" fill="#3b82f6" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Latest quiz submissions and user registrations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="border-l-4 border-green-500 pl-4 py-2">
                    <p className="text-sm font-medium">John Doe completed "Introduction to JavaScript"</p>
                    <p className="text-xs text-muted-foreground">Score: 8/10 • 2 hours ago</p>
                  </div>
                  <div className="border-l-4 border-blue-500 pl-4 py-2">
                    <p className="text-sm font-medium">New user registered: Alice Brown</p>
                    <p className="text-xs text-muted-foreground">3 hours ago</p>
                  </div>
                  <div className="border-l-4 border-green-500 pl-4 py-2">
                    <p className="text-sm font-medium">Jane Smith completed "Advanced React Concepts"</p>
                    <p className="text-xs text-muted-foreground">Score: 12/15 • 5 hours ago</p>
                  </div>
                  <div className="border-l-4 border-yellow-500 pl-4 py-2">
                    <p className="text-sm font-medium">New quiz created: "Python Fundamentals"</p>
                    <p className="text-xs text-muted-foreground">1 day ago</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="quizzes" className="space-y-4">
            <TabsList>
              <TabsTrigger value="quizzes">Quizzes</TabsTrigger>
              <TabsTrigger value="users">Users</TabsTrigger>
            </TabsList>
            <TabsContent value="quizzes" className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold">Manage Quizzes</h2>
                <Button asChild>
                  <Link href="/admin/quizzes/create">Create Quiz</Link>
                </Button>
              </div>
              {loading ? (
                <div className="text-center py-4">Loading quizzes...</div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {quizzes.map((quiz) => (
                    <Card key={quiz.id}>
                      <CardHeader>
                        <CardTitle>{quiz.title}</CardTitle>
                        <CardDescription>{quiz.description}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span>Questions:</span>
                            <span className="font-medium">{quiz.questions}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Submissions:</span>
                            <span className="font-medium">{quiz.submissions}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Average Score:</span>
                            <span className="font-medium">{quiz.averageScore}%</span>
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter className="flex gap-2">
                        <Button variant="outline" asChild className="flex-1">
                          <Link href={`/admin/quizzes/${quiz.id}/edit`}>Edit</Link>
                        </Button>
                        <Button variant="outline" asChild className="flex-1">
                          <Link href={`/admin/quizzes/${quiz.id}/analytics`}>Analytics</Link>
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
            <TabsContent value="users" className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold">Manage Users</h2>
                <Button asChild>
                  <Link href="/admin/users/invite">Invite User</Link>
                </Button>
              </div>
              {loading ? (
                <div className="text-center py-4">Loading users...</div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {users.map((user) => (
                    <Card key={user.id}>
                      <CardHeader>
                        <CardTitle>{user.name}</CardTitle>
                        <CardDescription>{user.email}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span>Quizzes Taken:</span>
                            <span className="font-medium">{user.quizzesTaken}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Average Score:</span>
                            <span className="font-medium">{user.averageScore}%</span>
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter className="flex gap-2">
                        <Button variant="outline" asChild className="flex-1">
                          <Link href={`/admin/users/${user.id}`}>View Profile</Link>
                        </Button>
                        <Button variant="outline" asChild className="flex-1">
                          <Link href={`/admin/users/${user.id}/progress`}>View Progress</Link>
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}

