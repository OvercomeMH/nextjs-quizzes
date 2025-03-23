"use client"

import { useState, useEffect } from "react"
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

interface ActivityItem {
  id: string;
  type: 'submission' | 'registration' | 'quiz_creation';
  title: string;
  details: string;
  time: string;
  timestamp: string;
  color: string;
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
  const [activities, setActivities] = useState<ActivityItem[]>([])
  const [pagination, setPagination] = useState<PaginationData>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Filter states
  const [activityType, setActivityType] = useState<string>("all")
  const [startDate, setStartDate] = useState<Date | undefined>(undefined)
  const [endDate, setEndDate] = useState<Date | undefined>(undefined)

  // Function to fetch activities with filters
  const fetchActivities = async (page = 1) => {
    try {
      setLoading(true)
      
      // Build query parameters
      const params = new URLSearchParams()
      params.append('page', page.toString())
      
      if (activityType && activityType !== "all") {
        params.append('type', activityType)
      }
      
      if (startDate) {
        params.append('startDate', startDate.toISOString())
      }
      
      if (endDate) {
        params.append('endDate', endDate.toISOString())
      }
      
      // Make API request
      const response = await fetch(`/api/admin/activity?${params.toString()}`)
      
      if (!response.ok) {
        throw new Error(`Error fetching activities: ${response.status}`)
      }
      
      const data = await response.json()
      setActivities(data.activities)
      setPagination(data.pagination)
      setLoading(false)
    } catch (err) {
      console.error('Failed to fetch activities:', err)
      setError(err instanceof Error ? err.message : 'Failed to load activities. Please try again later.')
      setLoading(false)
    }
  }
  
  // Load activities when filters change
  useEffect(() => {
    fetchActivities(1) // Reset to page 1 when filters change
  }, [activityType, startDate, endDate])

  // Helper function to get badge color based on activity type
  const getBadgeVariant = (type: string) => {
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
  const getActivityTypeLabel = (type: string) => {
    switch (type) {
      case 'submission':
        return 'Quiz Submission'
      case 'registration':
        return 'User Registration'
      case 'quiz_creation':
        return 'Quiz Creation'
      default:
        return type
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
                <Select value={activityType} onValueChange={setActivityType}>
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
          ) : error ? (
            <div className="flex items-center justify-center h-64 text-red-500">
              <p>{error}</p>
            </div>
          ) : (
            <div className="space-y-6">
              {activities.length > 0 ? (
                <>
                  <div className="space-y-4">
                    {activities.map((activity) => (
                      <div 
                        key={`${activity.type}-${activity.id}`} 
                        className="bg-card rounded-lg border p-4 hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <Badge variant={getBadgeVariant(activity.type)}>
                                {getActivityTypeLabel(activity.type)}
                              </Badge>
                              <span className="text-sm text-muted-foreground">{activity.time}</span>
                            </div>
                            <h3 className="font-medium">{activity.title}</h3>
                            {activity.details && (
                              <p className="text-sm text-muted-foreground mt-1">{activity.details}</p>
                            )}
                          </div>
                          <div className="flex gap-2">
                            {activity.user_id && (
                              <Button variant="ghost" size="sm" asChild>
                                <Link href={`/admin/users/${activity.user_id}`}>View User</Link>
                              </Button>
                            )}
                            {activity.quiz_id && (
                              <Button variant="ghost" size="sm" asChild>
                                <Link href={`/admin/quizzes/${activity.quiz_id}`}>View Quiz</Link>
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Pagination */}
                  <div className="flex justify-center gap-2 mt-6">
                    <Button 
                      variant="outline" 
                      disabled={pagination.page <= 1}
                      onClick={() => fetchActivities(pagination.page - 1)}
                    >
                      Previous
                    </Button>
                    <span className="flex items-center px-4">
                      Page {pagination.page} of {pagination.totalPages}
                    </span>
                    <Button 
                      variant="outline" 
                      disabled={pagination.page >= pagination.totalPages}
                      onClick={() => fetchActivities(pagination.page + 1)}
                    >
                      Next
                    </Button>
                  </div>
                </>
              ) : (
                <Card>
                  <CardHeader className="text-center py-10">
                    <CardTitle>No activities found</CardTitle>
                    <CardDescription>
                      Try changing your filters to see more results.
                    </CardDescription>
                  </CardHeader>
                </Card>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  )
} 