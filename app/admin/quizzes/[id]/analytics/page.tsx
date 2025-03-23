"use client"

import { useState, useEffect, useMemo } from "react"
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
import { Quiz, Submission, User } from "@/types/database"
import { useDataFetching } from "@/hooks/useDataFetching"
import type { TableRow } from "@/lib/supabase"

// Define types for analytics data
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

interface QuizAnalyticsData {
  quiz: TableRow<'quizzes'>;
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

  // Fetch quiz data using our hook
  const { data: quizData, loading: loadingQuiz } = useDataFetching<'quizzes'>({
    table: 'quizzes',
    select: '*',
    filter: { column: 'id', operator: 'eq', value: quizId }
  });

  // Fetch submissions data using our hook
  const { data: submissions, loading: loadingSubmissions } = useDataFetching<'submissions'>({
    table: 'submissions',
    select: 'id, user_id, quiz_id, score, total_possible, created_at, time_spent',
    filter: { column: 'quiz_id', operator: 'eq', value: quizId },
    orderBy: { column: 'created_at', ascending: false }
  });

  // Fetch users data using our hook
  const { data: users, loading: loadingUsers } = useDataFetching<'users'>({
    table: 'users',
    select: 'id, full_name'
  });

  // Process analytics data
  const analytics = useMemo(() => {
    if (!quizData?.[0] || !submissions || !users) return null;

    const quiz = quizData[0] as TableRow<'quizzes'>;
    const totalSubmissions = submissions.length;
    const averageScore = submissions.reduce((acc, sub) => acc + (sub.score / sub.total_possible) * 100, 0) / totalSubmissions;

    // Process question stats
    const questionStats: QuestionStat[] = [];
    // TODO: Implement question stats processing

    // Process score distribution
    const scoreDistribution: ScoreDistribution[] = [];
    const scoreRanges = ['0-20', '21-40', '41-60', '61-80', '81-100'];
    scoreRanges.forEach(range => {
      const [min, max] = range.split('-').map(Number);
      const count = submissions.filter(sub => {
        const percentage = (sub.score / sub.total_possible) * 100;
        return percentage >= min && percentage <= max;
      }).length;
      scoreDistribution.push({ score: range, count });
    });

    // Process completion time
    const completionTime: CompletionTime[] = [];
    const timeRanges = ['0-5', '6-10', '11-15', '16-20', '21+'];
    timeRanges.forEach(range => {
      const [min, max] = range.split('-').map(Number);
      const count = submissions.filter(sub => {
        const time = sub.time_spent || 0;
        if (max) {
          return time >= min && time <= max;
        }
        return time >= min;
      }).length;
      completionTime.push({ time: range, count });
    });

    // Process completion time scatter
    const completionTimeScatter: CompletionTimePoint[] = submissions.map(sub => {
      const user = users.find(u => u.id === sub.user_id);
      const percentage = (sub.score / sub.total_possible) * 100;
      return {
        id: sub.id,
        user: user?.full_name || 'Unknown User',
        time: sub.time_spent || 0,
        score: percentage,
        maxScore: 100,
        date: sub.created_at || new Date().toISOString()
      };
    });

    // Process submissions over time
    const submissionsOverTime: SubmissionOverTime[] = [];
    const submissionsByDate = submissions.reduce((acc, sub) => {
      const date = sub.created_at?.split('T')[0] || new Date().toISOString().split('T')[0];
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    Object.entries(submissionsByDate).forEach(([date, count]) => {
      submissionsOverTime.push({ date, submissions: count });
    });

    // Process recent submissions
    const recentSubmissions: RecentSubmission[] = submissions.slice(0, 5).map(sub => {
      const user = users.find(u => u.id === sub.user_id);
      const percentage = (sub.score / sub.total_possible) * 100;
      const date = new Date(sub.created_at || new Date().toISOString());
      return {
        id: sub.id,
        user: user?.full_name || 'Unknown User',
        score: `${sub.score}/${sub.total_possible}`,
        percentage: percentage,
        time: `${sub.time_spent || 0} min`,
        date: date.toLocaleString()
      };
    });

    return {
      quiz,
      totalSubmissions,
      averageScore,
      questionStats,
      scoreDistribution,
      completionTime,
      completionTimeScatter,
      submissionsOverTime,
      recentSubmissions
    } as QuizAnalyticsData;
  }, [quizData, submissions, users]);

  const loading = loadingQuiz || loadingSubmissions || loadingUsers;

  if (loading || !analytics) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="w-12 h-12 border-4 border-t-primary border-primary/30 rounded-full animate-spin"></div>
      </div>
    );
  }

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];
  
  // Memoize chart data
  const scoreDistributionData = useMemo(() => analytics?.scoreDistribution || [], [analytics?.scoreDistribution]);
  const submissionsOverTimeData = useMemo(() => analytics?.submissionsOverTime || [], [analytics?.submissionsOverTime]);
  const questionStatsData = useMemo(() => analytics?.questionStats || [], [analytics?.questionStats]);

  // Memoize chart components
  const ScoreDistributionChart = useMemo(() => (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={scoreDistributionData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="score" />
        <YAxis />
        <Tooltip />
        <Bar dataKey="count" fill="#3b82f6" />
      </BarChart>
    </ResponsiveContainer>
  ), [scoreDistributionData]);

  const SubmissionsOverTimeChart = useMemo(() => (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={submissionsOverTimeData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey="submissions" stroke="#3b82f6" activeDot={{ r: 8 }} />
      </LineChart>
    </ResponsiveContainer>
  ), [submissionsOverTimeData]);

  const QuestionPerformanceChart = useMemo(() => (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={questionStatsData}
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
  ), [questionStatsData]);

  // Memoize question stat cards
  const QuestionStatCards = useMemo(() => (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {questionStatsData.map((stat, index) => {
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
  ), [questionStatsData]);

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
            <h1 className="text-3xl font-bold">{analytics.quiz.title} - Analytics</h1>
            <p className="text-muted-foreground">Detailed analytics and insights for this quiz.</p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 mb-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Submissions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics.totalSubmissions}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Average Score</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics.averageScore.toFixed(1)}%</div>
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
                      {ScoreDistributionChart}
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
                        {analytics.completionTimeScatter && analytics.completionTimeScatter.length > 0 ? (
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
                              data={analytics.completionTimeScatter.map(point => ({
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
                    {SubmissionsOverTimeChart}
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
                    {QuestionPerformanceChart}
                  </div>
                </CardContent>
              </Card>

              {QuestionStatCards}
            </TabsContent>

            <TabsContent value="submissions" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Submissions</CardTitle>
                  <CardDescription>Latest attempts on this quiz</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {analytics.recentSubmissions.map((submission) => (
                      <div key={submission.id} className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{submission.user}</p>
                          <p className="text-sm text-muted-foreground">
                            Score: {submission.score} ({submission.percentage.toFixed(1)}%)
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Time: {submission.time}
                          </p>
                        </div>
                        <Badge variant="outline">
                          {submission.date}
                        </Badge>
                      </div>
                    ))}
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

