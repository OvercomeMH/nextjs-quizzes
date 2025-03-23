"use client"

import { useState, useEffect, useMemo } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { User, Quiz, Submission } from "@/types/database"
import { useDataFetching } from "@/hooks/useDataFetching"

// Define activity types
type ActivityType = 'submission' | 'registration' | 'quiz_creation';

interface ActivityItem {
  id: string;
  type: ActivityType;
  title: string;
  details: string;
  timestamp: string;
  user_id?: string;
  quiz_id?: string;
}

interface PaginationData {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export default function ActivityPage() {
  const [pagination, setPagination] = useState<PaginationData>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  })
  
  // Filter states
  const [activityType, setActivityType] = useState<ActivityType | 'all'>("all")
  const [startDate, setStartDate] = useState<Date | undefined>(undefined)
  const [endDate, setEndDate] = useState<Date | undefined>(undefined)

  // Fetch activities using our hook
  const { data: submissions, loading: loadingSubmissions } = useDataFetching<'submissions'>({
    table: 'submissions',
    select: 'id, user_id, quiz_id, created_at, score',
    orderBy: { column: 'created_at', ascending: false }
  });

  const { data: users, loading: loadingUsers } = useDataFetching<'users'>({
    table: 'users',
    select: 'id, full_name, created_at',
    orderBy: { column: 'created_at', ascending: false }
  });

  const { data: quizzes, loading: loadingQuizzes } = useDataFetching<'quizzes'>({
    table: 'quizzes',
    select: 'id, title, created_at',
    orderBy: { column: 'created_at', ascending: false }
  });

  // Combine and format activities
  const activities = useMemo(() => {
    const allActivities: ActivityItem[] = [];

    // Add submissions
    submissions?.forEach(submission => {
      const quiz = quizzes?.find(q => q.id === submission.quiz_id);
      const user = users?.find(u => u.id === submission.user_id);
      
      allActivities.push({
        id: submission.id,
        type: 'submission',
        title: `Quiz Submission: ${quiz?.title || 'Unknown Quiz'}`,
        details: `${user?.full_name || 'Unknown User'} scored ${submission.score}%`,
        timestamp: submission.created_at,
        user_id: submission.user_id,
        quiz_id: submission.quiz_id
      });
    });

    // Add registrations
    users?.forEach(user => {
      allActivities.push({
        id: user.id,
        type: 'registration',
        title: 'User Registration',
        details: `${user.full_name || 'Unknown User'} joined the platform`,
        timestamp: user.created_at,
        user_id: user.id
      });
    });

    // Add quiz creations
    quizzes?.forEach(quiz => {
      allActivities.push({
        id: quiz.id,
        type: 'quiz_creation',
        title: 'Quiz Created',
        details: `New quiz "${quiz.title}" was created`,
        timestamp: quiz.created_at,
        quiz_id: quiz.id
      });
    });

    // Sort by timestamp
    return allActivities.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }, [submissions, users, quizzes]);

  // Filter activities based on selected filters
  const filteredActivities = useMemo(() => {
    return activities.filter(activity => {
      // Filter by type
      if (activityType !== 'all' && activity.type !== activityType) {
        return false;
      }

      // Filter by date range
      const activityDate = new Date(activity.timestamp);
      if (startDate && activityDate < startDate) {
        return false;
      }
      if (endDate && activityDate > endDate) {
        return false;
      }

      return true;
    });
  }, [activities, activityType, startDate, endDate]);

  // Calculate pagination
  useEffect(() => {
    const total = filteredActivities.length;
    const totalPages = Math.ceil(total / pagination.limit);
    setPagination(prev => ({
      ...prev,
      total,
      totalPages
    }));
  }, [filteredActivities, pagination.limit]);

  // Get paginated activities
  const paginatedActivities = useMemo(() => {
    const start = (pagination.page - 1) * pagination.limit;
    return filteredActivities.slice(start, start + pagination.limit);
  }, [filteredActivities, pagination.page, pagination.limit]);

  const loading = loadingSubmissions || loadingUsers || loadingQuizzes;

  // Helper function to get badge color based on activity type
  const getBadgeVariant = (type: ActivityType | 'all'): "default" | "secondary" | "outline" => {
    switch (type) {
      case 'submission':
        return 'default'
      case 'registration':
        return 'secondary'
      case 'quiz_creation':
        return 'outline'
      default:
        return 'default'
    }
  }
  
  // Helper function for activity type label
  const getActivityTypeLabel = (type: ActivityType | 'all'): string => {
    switch (type) {
      case 'submission':
        return 'Quiz Submission'
      case 'registration':
        return 'User Registration'
      case 'quiz_creation':
        return 'Quiz Creation'
      default:
        return 'All Activities'
    }
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
            <h1 className="text-3xl font-bold">Activity Log</h1>
            <p className="text-muted-foreground">View all user and system activities</p>
          </div>

          {/* Filters section */}
          <div className="mb-6 space-y-4">
            <h2 className="text-xl font-semibold">Filters</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Activity Type</label>
                <Select value={activityType} onValueChange={(value) => setActivityType(value as ActivityType | 'all')}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Activities" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Activities</SelectItem>
                    <SelectItem value="submission">Quiz Submissions</SelectItem>
                    <SelectItem value="registration">User Registrations</SelectItem>
                    <SelectItem value="quiz_creation">Quiz Creations</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm font-medium mb-1 block">Start Date</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {startDate ? format(startDate, "PPP") : "Pick a start date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={startDate}
                      onSelect={setStartDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              <div>
                <label className="text-sm font-medium mb-1 block">End Date</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {endDate ? format(endDate, "PPP") : "Pick an end date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={endDate}
                      onSelect={setEndDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button onClick={() => {
                setActivityType("all")
                setStartDate(undefined)
                setEndDate(undefined)
              }}>
                Reset Filters
              </Button>
            </div>
          </div>

          {/* Activities list */}
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <p>Loading activities...</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Activity list */}
              <div className="space-y-4">
                {paginatedActivities.map((activity) => (
                  <Card key={activity.id}>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold">{activity.title}</h3>
                            <Badge variant={getBadgeVariant(activity.type)}>
                              {getActivityTypeLabel(activity.type)}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{activity.details}</p>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {new Date(activity.timestamp).toLocaleString()}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Pagination */}
              <div className="mt-6 flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} activities
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
                    disabled={pagination.page === 1}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPagination(prev => ({ ...prev, page: Math.min(pagination.totalPages, prev.page + 1) }))}
                    disabled={pagination.page === pagination.totalPages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
} 