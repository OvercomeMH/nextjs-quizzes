"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { User } from "@/types/database"
import { useDataFetching } from "@/hooks/useDataFetching"

export default function UsersPage() {
  const [searchQuery, setSearchQuery] = useState("")
  
  // Fetch users using our hook
  const { data: users, loading, error } = useDataFetching<'users'>({
    table: 'users',
    select: 'id, full_name, email, quizzes_taken, total_points',
    orderBy: { column: 'created_at', ascending: false }
  });

  // Filter users when search query changes
  const filteredUsers = searchQuery.trim() === "" 
    ? users 
    : users.filter(user => 
        user.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
        user.email.toLowerCase().includes(searchQuery.toLowerCase())
      );

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
                        {filteredUsers.map((user) => (
                          <tr key={user.id} className="border-t">
                            <td className="p-4 font-medium">{user.full_name || 'N/A'}</td>
                            <td className="p-4">{user.email}</td>
                            <td className="p-4">{user.quizzes_taken || 0}</td>
                            <td className="p-4">
                              {user.quizzes_taken && user.total_points
                                ? ((user.total_points / (user.quizzes_taken * 100)) * 100).toFixed(1) + '%'
                                : '0%'}
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
      </main>
    </div>
  )
}