"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { useDataFetching } from "@/hooks/useDataFetching"
import { AdminLayout } from "@/components/layouts/AdminLayout"
import type { Database } from '@/lib/database.types'

// Define types for our data
type User = Database['public']['Tables']['users']['Row'];
type Submission = Database['public']['Tables']['submissions']['Row'];

// Define the type for our joined data
type UserWithSubmissions = User & {
  submissions: Submission[];
};

export default function UsersPage() {
  const [searchQuery, setSearchQuery] = useState("")
  
  // Fetch users with joined submissions data
  const { data: users, loading, error } = useDataFetching<'users', [], [], [
    {
      table: 'submissions',
      on: 'user_id'
    }
  ]>({
    table: 'users',
    orderBy: { column: 'created_at', ascending: false }
  });

  // Filter users when search query changes
  const filteredUsers = searchQuery.trim() === "" 
    ? users 
    : users.filter((user: UserWithSubmissions) => 
        user.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
        user.email.toLowerCase().includes(searchQuery.toLowerCase())
      );

  // Calculate average score for a user
  const calculateAverageScore = (user: UserWithSubmissions) => {
    if (!user.submissions?.length) return 0;
    return user.submissions.reduce((acc, sub) => 
      acc + (sub.score / sub.total_possible) * 100, 0) / user.submissions.length;
  };

  return (
    <AdminLayout>
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Manage Users</h1>
          <p className="text-muted-foreground">View and manage user accounts</p>
        </div>

        <div className="mb-6 flex flex-col sm:flex-row justify-between gap-4">
          <div className="w-full sm:w-1/3">
            <Input
              placeholder="Search users by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full"
            />
          </div>
          <Button asChild variant="default">
            <Link href="/admin/users/create">Add New User</Link>
          </Button>
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
          <div className="grid gap-4">
            {filteredUsers.length > 0 ? (
              <div className="rounded-md border overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-muted/50">
                        <th className="text-left p-4 font-medium">Name</th>
                        <th className="text-left p-4 font-medium">Email</th>
                        <th className="text-left p-4 font-medium">Quizzes Taken</th>
                        <th className="text-left p-4 font-medium">Average Score</th>
                        <th className="text-left p-4 font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.map((user: UserWithSubmissions) => (
                        <tr key={user.id} className="border-t">
                          <td className="p-4 font-medium">{user.full_name || 'N/A'}</td>
                          <td className="p-4">{user.email}</td>
                          <td className="p-4">{user.submissions?.length || 0}</td>
                          <td className="p-4">
                            {user.submissions?.length > 0 
                              ? `${calculateAverageScore(user).toFixed(1)}%` 
                              : "N/A"}
                          </td>
                          <td className="p-4">
                            <div className="flex gap-2">
                              <Button variant="ghost" size="sm" asChild>
                                <Link href={`/admin/users/${user.id}`}>View</Link>
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <Card>
                <CardHeader className="text-center py-10">
                  <CardTitle>No users found</CardTitle>
                  {searchQuery ? (
                    <CardDescription>
                      No users match your search criteria. Try a different search term.
                    </CardDescription>
                  ) : (
                    <CardDescription>
                      There are no users registered in the system yet.
                    </CardDescription>
                  )}
                </CardHeader>
              </Card>
            )}
          </div>
        )}
      </div>
    </AdminLayout>
  )
}