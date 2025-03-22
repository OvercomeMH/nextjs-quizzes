"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"

interface UserProfile {
  name: string
  email: string
  stats: {
    quizzesTaken: number
    averageScore: number
    totalPoints: number
    rank: string
  }
  settings: {
    emailNotifications: boolean
    publicProfile: boolean
  }
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [name, setName] = useState<string | undefined>(undefined)
  const [email, setEmail] = useState<string | undefined>(undefined)
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingProfile, setIsLoadingProfile] = useState(true)
  const [emailNotifications, setEmailNotifications] = useState<boolean | undefined>(undefined)
  const [publicProfile, setPublicProfile] = useState<boolean | undefined>(undefined)
  const router = useRouter()
  
  // Fetch profile data when component mounts
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch('/api/user/profile')
        if (!response.ok) {
          throw new Error('Failed to fetch profile')
        }
        
        const data = await response.json()
        setProfile(data)
        
        // Only set state if it hasn't been set or is different from current values
        if (name === undefined || name !== data.name) setName(data.name)
        if (email === undefined || email !== data.email) setEmail(data.email)
        if (emailNotifications === undefined || emailNotifications !== data.settings.emailNotifications) 
          setEmailNotifications(data.settings.emailNotifications)
        if (publicProfile === undefined || publicProfile !== data.settings.publicProfile) 
          setPublicProfile(data.settings.publicProfile)
      } catch (error) {
        console.error('Error fetching profile:', error)
      } finally {
        setIsLoadingProfile(false)
      }
    }
    
    fetchProfile()
  }, []) // We still want this to run only on mount

  // Handle logout - simplified for testing
  const handleLogout = () => {
    // For now, just redirect to login
    router.push('/login')
  }

  // Handle settings changes
  const updateSettings = async (setting: string, value: boolean) => {
    try {
      // Create an object with just the changed setting
      const updatedSettings = { [setting]: value }
      
      // Send to the settings API
      const response = await fetch('/api/user/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedSettings),
      })
      
      if (!response.ok) {
        throw new Error('Failed to update settings')
      }
      
      // Get the response data
      const data = await response.json()
      
      if (data.success) {
        // Update both the profile data and individual state variables
        if (profile) {
          // Update the profile state
          setProfile({
            ...profile,
            settings: data.settings
          })
          
          // Also update the individual state variables
          setEmailNotifications(data.settings.emailNotifications)
          setPublicProfile(data.settings.publicProfile)
        }
      }
    } catch (error) {
      console.error('Error updating settings:', error)
      alert('Failed to update settings. Please try again.')
    }
  }
  
  // Handle email notifications toggle
  const handleEmailNotificationsChange = (checked: boolean) => {
    setEmailNotifications(checked)
    updateSettings('emailNotifications', checked)
  }
  
  // Handle public profile toggle
  const handlePublicProfileChange = (checked: boolean) => {
    setPublicProfile(checked)
    updateSettings('publicProfile', checked)
  }

  const handleUpdateProfile = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    
    try {
      // Send data to the API
      const response = await fetch('/api/user/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          email,
          settings: {
            emailNotifications,
            publicProfile
          }
        }),
      })
      
      if (!response.ok) {
        throw new Error('Failed to update profile')
      }
      
      // Get the updated profile data
      const updatedProfile = await response.json()
      setProfile(updatedProfile)
      
      // Show success message
      alert('Profile updated successfully!')
    } catch (error) {
      console.error('Error updating profile:', error)
      alert('Failed to update profile. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoadingProfile) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center">
        <div className="text-xl">Loading profile...</div>
      </div>
    )
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
            <Button variant="outline" size="sm" onClick={handleLogout}>
              Logout
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
                      <p className="text-2xl font-bold">{profile?.stats.quizzesTaken}</p>
                    </div>
                    <div className="space-y-2 p-4 border rounded-lg">
                      <p className="text-sm text-muted-foreground">Average Score</p>
                      <p className="text-2xl font-bold">{profile?.stats.averageScore}%</p>
                    </div>
                    <div className="space-y-2 p-4 border rounded-lg">
                      <p className="text-sm text-muted-foreground">Total Points</p>
                      <p className="text-2xl font-bold">{profile?.stats.totalPoints}</p>
                    </div>
                    <div className="space-y-2 p-4 border rounded-lg">
                      <p className="text-sm text-muted-foreground">Rank</p>
                      <div className="text-2xl font-bold flex items-center gap-2">
                        {profile?.stats.rank} <Badge>Level 3</Badge>
                      </div>
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
                    <Switch 
                      checked={emailNotifications} 
                      onCheckedChange={handleEmailNotificationsChange}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Public Profile</Label>
                      <p className="text-sm text-muted-foreground">Allow others to see your quiz results</p>
                    </div>
                    <Switch 
                      checked={publicProfile}
                      onCheckedChange={handlePublicProfileChange}
                    />
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