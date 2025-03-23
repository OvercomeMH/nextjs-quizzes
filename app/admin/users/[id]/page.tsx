"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, User, Mail, Calendar, Award, Clock } from "lucide-react"
import React from "react"

// Define types for user data
interface UserSubmission {
  id: string;
  quizId: string;
  quizTitle: string;
  quizDifficulty: string;
  score: number;
  totalPossible: number;
  percentage: number;
  timeSpent: string;
  completedAt: string;
}

interface UserDetails {
  id: string;
  username: string;
  name: string;
  email: string;
  joinedAt: string;
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
}

export default function UserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  // Unwrap params using React.use()
  const unwrappedParams = React.use(params);
  const userId = unwrappedParams.id;
  const [user, setUser] = useState<UserDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/admin/users/${userId}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            setError("User not found");
          } else {
            setError("Failed to load user details");
          }
          setLoading(false);
          return;
        }
        
        const userData = await response.json();
        setUser(userData);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching user details:", err);
        setError("An error occurred while loading user details");
        setLoading(false);
      }
    };
    
    fetchUserDetails();
  }, [userId]);

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

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <p>Loading user details...</p>
          </div>
        ) : error ? (
          <div className="flex justify-center items-center h-64">
            <p className="text-red-500">{error}</p>
          </div>
        ) : user ? (
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
                    <p className="text-sm text-gray-500">{user.name}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Mail className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="text-sm font-medium">Email</p>
                    <p className="text-sm text-gray-500">{user.email}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Calendar className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="text-sm font-medium">Joined</p>
                    <p className="text-sm text-gray-500">{formatDate(user.joinedAt)}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Award className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="text-sm font-medium">Rank</p>
                    <p className="text-sm text-gray-500">{user.stats.rank}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* User Stats and Recent Submissions */}
            <div className="md:col-span-2 space-y-6">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="py-4">
                    <CardTitle className="text-sm font-medium">Quizzes Taken</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{user.stats.quizzesTaken}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="py-4">
                    <CardTitle className="text-sm font-medium">Average Score</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{user.stats.averageScore}%</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="py-4">
                    <CardTitle className="text-sm font-medium">Total Points</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{user.stats.totalPoints}</div>
                  </CardContent>
                </Card>
              </div>

              {/* Tabs with Recent Submissions */}
              <Tabs defaultValue="submissions" className="space-y-4">
                <TabsList>
                  <TabsTrigger value="submissions">Recent Submissions</TabsTrigger>
                  <TabsTrigger value="preferences">User Preferences</TabsTrigger>
                </TabsList>
                <TabsContent value="submissions">
                  <Card>
                    <CardHeader>
                      <CardTitle>Recent Quiz Submissions</CardTitle>
                      <CardDescription>The last {user.recentSubmissions.length} quizzes taken by this user</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {user.recentSubmissions.length > 0 ? (
                        <div className="space-y-4">
                          {user.recentSubmissions.map((submission) => (
                            <div key={submission.id} className="border rounded-lg p-4">
                              <div className="flex justify-between items-start mb-2">
                                <div>
                                  <h3 className="font-medium">{submission.quizTitle}</h3>
                                  <div className="flex items-center space-x-2 mt-1">
                                    <Badge className={getDifficultyColor(submission.quizDifficulty)}>
                                      {submission.quizDifficulty}
                                    </Badge>
                                    <div className="flex items-center text-sm text-gray-500">
                                      <Clock className="h-3 w-3 mr-1" />
                                      {submission.timeSpent}
                                    </div>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div className="text-lg font-bold">
                                    {submission.score}/{submission.totalPossible}
                                  </div>
                                  <div className={`text-sm ${
                                    submission.percentage >= 80 ? 'text-green-500' : 
                                    submission.percentage >= 60 ? 'text-yellow-500' : 'text-red-500'
                                  }`}>
                                    {submission.percentage}%
                                  </div>
                                </div>
                              </div>
                              <div className="text-xs text-gray-500 mt-2">
                                Completed on {formatDate(submission.completedAt)}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-10">
                          <p className="text-gray-500">No submissions found for this user</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
                <TabsContent value="preferences">
                  <Card>
                    <CardHeader>
                      <CardTitle>User Preferences</CardTitle>
                      <CardDescription>Account settings and preferences</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="font-medium">Email Notifications</span>
                          <Badge variant={user.preferences.emailNotifications ? "default" : "outline"}>
                            {user.preferences.emailNotifications ? "Enabled" : "Disabled"}
                          </Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="font-medium">Public Profile</span>
                          <Badge variant={user.preferences.publicProfile ? "default" : "outline"}>
                            {user.preferences.publicProfile ? "Enabled" : "Disabled"}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
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