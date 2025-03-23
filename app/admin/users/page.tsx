"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"

interface User {
  id: string;
  name: string;
  email: string;
  quizzesTaken: number;
  averageScore: number;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [filteredUsers, setFilteredUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/admin/users')
        
        if (!response.ok) {
          throw new Error(`Error fetching users: ${response.status}`)
        }
        
        const data = await response.json()
        setUsers(data)
        setFilteredUsers(data)
        setLoading(false)
      } catch (err) {
        console.error('Failed to fetch users:', err)
        setError(err instanceof Error ? err.message : 'Failed to load users. Please try again later.')
        setLoading(false)
      }
    }
    
    fetchUsers()
  }, [])

  // Filter users when search query changes
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredUsers(users)
      return
    }
    
    const query = searchQuery.toLowerCase()
    const filtered = users.filter(user => 
      user.name.toLowerCase().includes(query) || 
      user.email.toLowerCase().includes(query)
    )
    
    setFilteredUsers(filtered)
  }, [searchQuery, users])

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
            <div className="flex items-center justify-center h-64">
              <p>Loading users...</p>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-64 text-red-500">
              <p>{error}</p>
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
                            <td className="p-4 font-medium">{user.name}</td>
                            <td className="p-4">{user.email}</td>
                            <td className="p-4">{user.quizzesTaken}</td>
                            <td className="p-4">{user.averageScore}%</td>
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