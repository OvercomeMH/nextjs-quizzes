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
import { AdminLayout } from "@/components/layouts/AdminLayout"

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
  const [error, setError] = useState<string | null>(null)

  // Fetch activities using our hook
  const { data: submissions, loading: loadingSubmissions } = useDataFetching<'submissions'>({
    table: 'submissions',
    select: 'id, user_id, quiz_id, created_at, score, total_possible',
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
        details: `${user?.full_name || 'Unknown User'} scored ${Math.round((submission.score / submission.total_possible) * 100)}%`,
        timestamp: submission.created_at || new Date().toISOString(),
        user_id: submission.user_id || undefined,
        quiz_id: submission.quiz_id || undefined
      });
    });

    // Add registrations
    users?.forEach(user => {
      allActivities.push({
        id: user.id,
        type: 'registration',
        title: 'User Registration',
        details: `${user.full_name || 'Unknown User'} joined the platform`,
        timestamp: user.created_at || new Date().toISOString(),
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
        timestamp: quiz.created_at || new Date().toISOString(),
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

  // Calculate pagination and get paginated activities in a single memo
  const { paginatedActivities, paginationData } = useMemo(() => {
    const total = filteredActivities.length;
    const totalPages = Math.ceil(total / pagination.limit);
    const start = (pagination.page - 1) * pagination.limit;
    
    return {
      paginatedActivities: filteredActivities.slice(start, start + pagination.limit),
      paginationData: {
        ...pagination,
        total,
        totalPages
      }
    };
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
    <AdminLayout>
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
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, "PPP") : "Pick a date"}
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
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {endDate ? format(endDate, "PPP") : "Pick a date"}
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
          <div className="space-y-4">
            {paginatedActivities.length > 0 ? (
              paginatedActivities.map((activity) => (
                <Card key={activity.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-4">
                      <Badge variant={getBadgeVariant(activity.type)} className="mt-1">
                        {getActivityTypeLabel(activity.type)}
                      </Badge>
                      <div className="flex-1">
                        <h3 className="font-medium">{activity.title}</h3>
                        <p className="text-sm text-muted-foreground">{activity.details}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(activity.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardHeader className="text-center py-10">
                  <CardTitle>No activities found</CardTitle>
                  <CardDescription>
                    {activityType !== 'all' || startDate || endDate
                      ? "No activities match your filter criteria. Try adjusting your filters."
                      : "There are no activities to display."}
                  </CardDescription>
                </CardHeader>
              </Card>
            )}

            {/* Pagination */}
            {paginationData.totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-6">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                  disabled={paginationData.page === 1}
                >
                  Previous
                </Button>
                <span className="flex items-center px-4">
                  Page {paginationData.page} of {paginationData.totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                  disabled={paginationData.page === paginationData.totalPages}
                >
                  Next
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </AdminLayout>
  )
} 