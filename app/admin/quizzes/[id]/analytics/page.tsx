"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import React from "react"
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
  ScatterChart,
  Scatter,
  ZAxis,
} from "recharts"

// Define types for quiz data
interface QuestionStat {
  id: string;
  question: string;
  question_number?: number;
  correct: number;
  incorrect: number;
}

interface ScoreDistribution {
  score: string;
  count: number;
}

interface CompletionTime {
  time: string;
  count: number;
}

interface CompletionTimePoint {
  id: string;
  user: string;
  time: number;
  score: number;
  maxScore: number;
  date: string;
}

interface SubmissionOverTime {
  date: string;
  submissions: number;
}

interface RecentSubmission {
  id: string;
  user: string;
  score: string;
  percentage: number;
  time: string;
  date: string;
}

interface QuizData {
  id: string;
  title: string;
  description: string;
  totalSubmissions: number;
  averageScore: number;
  questionStats: QuestionStat[];
  scoreDistribution: ScoreDistribution[];
  completionTime: CompletionTime[];
  completionTimeScatter: CompletionTimePoint[];
  submissionsOverTime: SubmissionOverTime[];
  recentSubmissions: RecentSubmission[];
}

export default function QuizAnalyticsPage({ params }: { params: Promise<{ id: string }> }) {
  // Unwrap params using React.use()
  const unwrappedParams = React.use(params);
  const quizId = unwrappedParams.id;
  const [quiz, setQuiz] = useState<QuizData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Fetch quiz analytics data from API
    const fetchQuizData = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/admin/quizzes/${quizId}/analytics`);
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => null);
          console.error('API error:', errorData);
          throw new Error(`Error fetching quiz analytics: ${response.status}${errorData?.error ? ` - ${errorData.error}` : ''}`);
        }
        
        const data = await response.json();
        setQuiz(data);
      } catch (err) {
        console.error('Failed to fetch quiz analytics:', err);
        setError(err instanceof Error ? err.message : 'Failed to load quiz data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchQuizData();
  }, [quizId]);

  if (loading || !quiz) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">Loading analytics...</div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center text-red-500">{error}</div>
      </div>
    );
  }

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];
  
  // Function to determine marker size based on score percentage
  const getMarkerSize = (score: number, maxScore: number) => {
    const percentage = (score / maxScore) * 100;
    // Size range: 40-100 based on score percentage
    return Math.max(40, Math.min(100, 40 + percentage * 0.6));
  };

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
                        <BarChart data={quiz.scoreDistribution || []}>
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
                    <CardTitle>Completion Time Distribution</CardTitle>
                    <CardDescription>Time taken by users to complete the quiz</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        {quiz.completionTimeScatter && quiz.completionTimeScatter.length > 0 ? (
                          <ScatterChart
                            margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
                          >
                            <CartesianGrid />
                            <XAxis 
                              type="number" 
                              dataKey="time" 
                              name="Time (minutes)" 
                              domain={[0, 60]}
                              label={{ value: 'Minutes', position: 'insideBottomRight', offset: -5 }}
                            />
                            <YAxis 
                              type="number" 
                              dataKey="percentage" 
                              name="Score (%)" 
                              domain={[0, 100]}
                              label={{ value: 'Score %', angle: -90, position: 'insideLeft' }}
                            />
                            <ZAxis 
                              type="number" 
                              range={[40, 100]} 
                              domain={[0, 100]}
                            />
                            <Tooltip 
                              cursor={{ strokeDasharray: '3 3' }}
                              formatter={(value, name) => {
                                if (name === 'Time (minutes)') return [`${value} min`, name];
                                return [`${value}%`, 'Score'];
                              }}
                            />
                            <Legend />
                            <Scatter 
                              name="Quiz Submissions" 
                              data={quiz.completionTimeScatter.map(point => ({
                                ...point,
                                percentage: Math.round((point.score / point.maxScore) * 100),
                                z: getMarkerSize(point.score, point.maxScore)
                              }))} 
                              fill="#8884d8"
                            />
                          </ScatterChart>
                        ) : (
                          <div className="flex h-full items-center justify-center">
                            <p className="text-muted-foreground">No completion time data available</p>
                          </div>
                        )}
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
                      <LineChart data={quiz.submissionsOverTime || []}>
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
                        data={quiz.questionStats || []}
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
                  const total = stat.correct + stat.incorrect;
                  const correctPercentage = total > 0 ? Math.round((stat.correct / total) * 100) : 0;

                  return (
                    <Card key={stat.id}>
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
                  );
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
                        {quiz.recentSubmissions.map((submission) => (
                          <tr key={submission.id} className="border-b">
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

