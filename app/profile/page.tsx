"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"

export default function ProfilePage() {
  const [name, setName] = useState("John Doe")
  const [email, setEmail] = useState("john.doe@example.com")
  const [isLoading, setIsLoading] = useState(false)
  
  // Mock user data
  const userStats = {
    quizzesTaken: 12,
    averageScore: 75,
    totalPoints: 980,
    rank: "Quiz Enthusiast"
  }

  const handleUpdateProfile = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    // Simulate API call delay
    setTimeout(() => {
      setIsLoading(false)
    }, 1000)
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-10 border-b bg-background">
        <div className="container flex h-16 items-center justify-between py-4">
          <div className="flex items-center gap-2">
            <Link href="/" className="font-bold">
              QuizMaster
            </Link>
          </div>
          <nav className="hidden md:flex gap-6">
            <Link className="text-sm font-medium hover:underline underline-offset-4" href="/dashboard">
              Dashboard
            </Link>
            <Link className="text-sm font-medium hover:underline underline-offset-4" href="/dashboard">
              Quizzes
            </Link>
            <Link className="text-sm font-medium hover:underline underline-offset-4" href="/profile">
              Profile
            </Link>
            <Link className="text-sm font-medium hover:underline underline-offset-4" href="/admin/dashboard">
              Admin
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
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Your Profile</h1>
          
          <Tabs defaultValue="info" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-8">
              <TabsTrigger value="info">Personal Info</TabsTrigger>
              <TabsTrigger value="stats">Statistics</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>
            
            <TabsContent value="info" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Personal Information</CardTitle>
                  <CardDescription>Update your personal details here</CardDescription>
                </CardHeader>
                <form onSubmit={handleUpdateProfile}>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input 
                        id="name" 
                        value={name} 
                        onChange={(e) => setName(e.target.value)} 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input 
                        id="email" 
                        type="email" 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)} 
                      />
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button type="submit" disabled={isLoading}>
                      {isLoading ? "Saving..." : "Save Changes"}
                    </Button>
                  </CardFooter>
                </form>
              </Card>
            </TabsContent>
            
            <TabsContent value="stats" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Your Quiz Statistics</CardTitle>
                  <CardDescription>See how you've been performing</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2 p-4 border rounded-lg">
                      <p className="text-sm text-muted-foreground">Quizzes Taken</p>
                      <p className="text-2xl font-bold">{userStats.quizzesTaken}</p>
                    </div>
                    <div className="space-y-2 p-4 border rounded-lg">
                      <p className="text-sm text-muted-foreground">Average Score</p>
                      <p className="text-2xl font-bold">{userStats.averageScore}%</p>
                    </div>
                    <div className="space-y-2 p-4 border rounded-lg">
                      <p className="text-sm text-muted-foreground">Total Points</p>
                      <p className="text-2xl font-bold">{userStats.totalPoints}</p>
                    </div>
                    <div className="space-y-2 p-4 border rounded-lg">
                      <p className="text-sm text-muted-foreground">Rank</p>
                      <p className="text-2xl font-bold flex items-center gap-2">
                        {userStats.rank} <Badge>Level 3</Badge>
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="settings" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Account Settings</CardTitle>
                  <CardDescription>Manage your account preferences</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Email Notifications</Label>
                      <p className="text-sm text-muted-foreground">Receive emails about new quizzes</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Public Profile</Label>
                      <p className="text-sm text-muted-foreground">Allow others to see your quiz results</p>
                    </div>
                    <Switch />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full" asChild>
                    <Link href="/login">Change Password</Link>
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
} 