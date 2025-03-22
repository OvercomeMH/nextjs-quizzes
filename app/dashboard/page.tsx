"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useAuth } from "@/components/auth/AuthProvider"
import ProtectedRoute from "@/components/auth/ProtectedRoute"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"

// Define interfaces for type safety
interface Quiz {
  id: string;
  title: string;
  description: string;
  difficulty: string;
  metadata: {
    totalQuestions: number;
    totalPoints: number;
    timesPlayed: number;
    averageRating: number;
  };
}

interface CompletedQuiz {
  id: string;
  title: string;
  score: number;
  totalQuestions: number;
  completedAt: string;
}

// Define user profile data type
type UserProfile = {
  id: string;
  username: string;
  full_name: string;
  email: string;
  quizzes_taken: number;
  total_points: number;
  average_score: number;
  created_at?: string;
};

export default function DashboardPage() {
  const { user, signOut } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [recentSubmissions, setRecentSubmissions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quizzes, setQuizzes] = useState<Quiz[]>([])
  const [completedQuizzes, setCompletedQuizzes] = useState<CompletedQuiz[]>([])

  const fetchUserData = async () => {
    if (!user) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Fetch user profile
      const { data: profileData, error: profileError } = await supabase
        .from("users")
        .select("*")
        .eq("id", user.id)
        .single();
        
      if (profileError) throw profileError;
      setProfile(profileData);
      
      // Fetch recent submissions
      const { data: submissionsData, error: submissionsError } = await supabase
        .from("submissions")
        .select(`
          id,
          score,
          total_possible,
          time_spent,
          created_at,
          quizzes:quiz_id (
            id,
            title
          )
        `)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(5);
        
      if (submissionsError) throw submissionsError;
      setRecentSubmissions(submissionsData || []);
      
    } catch (err: any) {
      console.error("Error fetching user data:", err);
      setError(err.message || "Failed to load user data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchUserData();
    }
  }, [user]);

  const handleSignOut = async () => {
    await signOut();
  };

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/quizzes');
        
        if (!response.ok) {
          throw new Error('Failed to fetch quizzes');
        }
        
        const data = await response.json();
        setQuizzes(data);
        
        // For now, we'll use hardcoded completed quizzes
        // In a real app, you would fetch this from an API
        setCompletedQuizzes([
          {
            id: "completed1",
            title: "HTML and CSS Basics",
            score: 8,
            totalQuestions: 10,
            completedAt: "2023-05-15",
          },
        ]);
        
        setIsLoading(false);
      } catch (err) {
        console.error("Error fetching quizzes:", err);
        setError("Failed to load quizzes. Please try again later.");
        setIsLoading(false);
      }
    };
    
    fetchQuizzes();
  }, [])

  return (
    <ProtectedRoute>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <div className="flex gap-4">
            <Link href="/quizzes">
              <Button variant="outline">Browse Quizzes</Button>
            </Link>
            <Button onClick={handleSignOut} variant="destructive">Sign Out</Button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="w-12 h-12 border-4 border-t-blue-500 border-blue-200 rounded-full animate-spin"></div>
          </div>
        ) : error ? (
          <div className="p-4 bg-red-100 text-red-700 rounded-md mb-6">
            {error}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {/* User Profile Card */}
            <Card>
              <CardHeader>
                <CardTitle>Profile</CardTitle>
                <CardDescription>Your personal information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <span className="font-semibold">Username:</span> {profile?.username}
                </div>
                <div>
                  <span className="font-semibold">Name:</span> {profile?.full_name}
                </div>
                <div>
                  <span className="font-semibold">Email:</span> {profile?.email}
                </div>
              </CardContent>
            </Card>

            {/* Stats Card */}
            <Card>
              <CardHeader>
                <CardTitle>Statistics</CardTitle>
                <CardDescription>Your quiz activity</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <span className="font-semibold">Quizzes Taken:</span> {profile?.quizzes_taken || 0}
                </div>
                <div>
                  <span className="font-semibold">Total Points:</span> {profile?.total_points || 0}
                </div>
                <div>
                  <span className="font-semibold">Average Score:</span> {profile?.average_score?.toFixed(1) || 0}%
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Your latest quiz submissions</CardDescription>
              </CardHeader>
              <CardContent>
                {recentSubmissions.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full table-auto">
                      <thead>
                        <tr className="border-b">
                          <th className="px-4 py-2 text-left">Quiz</th>
                          <th className="px-4 py-2 text-left">Score</th>
                          <th className="px-4 py-2 text-left">Time Spent</th>
                          <th className="px-4 py-2 text-left">Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {recentSubmissions.map((submission) => (
                          <tr key={submission.id} className="border-b">
                            <td className="px-4 py-2">
                              <Link href={`/quizzes/${submission.quizzes.id}`} className="text-blue-500 hover:underline">
                                {submission.quizzes.title}
                              </Link>
                            </td>
                            <td className="px-4 py-2">
                              {submission.score}/{submission.total_possible} ({((submission.score / submission.total_possible) * 100).toFixed(0)}%)
                            </td>
                            <td className="px-4 py-2">
                              {Math.floor(submission.time_spent / 60)}m {submission.time_spent % 60}s
                            </td>
                            <td className="px-4 py-2">
                              {new Date(submission.created_at).toLocaleDateString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-gray-500">You haven't taken any quizzes yet.</p>
                )}
              </CardContent>
              <CardFooter>
                <Link href="/quizzes">
                  <Button variant="outline">Take a Quiz</Button>
                </Link>
              </CardFooter>
            </Card>
          </div>
        )}
      </div>
    </ProtectedRoute>
  )
}

