"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { useAuth } from "@/components/auth/AuthProvider"
import ProtectedRoute from "@/components/auth/ProtectedRoute"
import { supabase } from "@/lib/supabase"
import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { User } from "@/types/database"
import { useDataFetching } from "@/hooks/useDataFetching"

export default function ProfilePage() {
  const { user, signOut } = useAuth();
  const [nameInput, setNameInput] = useState<string>("")
  const [emailInput, setEmailInput] = useState<string>("")
  const [usernameInput, setUsernameInput] = useState<string>("")
  const [isLoading, setIsLoading] = useState(false)
  const [emailNotifications, setEmailNotifications] = useState(false)
  const [publicProfile, setPublicProfile] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  
  // Fetch profile data using our hook
  const { data: profileData, loading: isLoadingProfile, error: profileError } = useDataFetching<'users'>({
    table: 'users',
    select: '*',
    orderBy: { column: 'created_at', ascending: false }
  });

  // Set form values when profile data changes
  useEffect(() => {
    if (profileData?.[0]) {
      const profile = profileData[0];
      setNameInput(profile.full_name || "");
      setEmailInput(profile.email || "");
      setUsernameInput(profile.username || "");
      setEmailNotifications(profile.email_notifications || false);
      setPublicProfile(profile.public_profile || false);
    }
  }, [profileData]);

  // Handle settings changes
  const updateSettings = async (setting: 'email_notifications' | 'public_profile', value: boolean) => {
    if (!user) return;
    
    try {
      setError(null);
      
      // Create an object with just the changed setting
      const updatedSettings = { [setting]: value };
      
      // Update the settings in Supabase
      const { error } = await supabase
        .from("users")
        .update(updatedSettings)
        .eq("id", user.id);
        
      if (error) throw error;
      
      // Update local state
      setEmailNotifications(setting === 'email_notifications' ? value : emailNotifications);
      setPublicProfile(setting === 'public_profile' ? value : publicProfile);
      setSuccessMessage("Settings updated successfully!");
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      console.error("Error updating settings:", err);
      setError(err.message || "Failed to update settings");
    }
  };
  
  // Handle email notifications toggle
  const handleEmailNotificationsChange = (checked: boolean) => {
    updateSettings('email_notifications', checked);
  };
  
  // Handle public profile toggle
  const handlePublicProfileChange = (checked: boolean) => {
    updateSettings('public_profile', checked);
  };

  const handleUpdateProfile = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Update user profile in Supabase
      const { error } = await supabase
        .from("users")
        .update({
          full_name: nameInput,
          username: usernameInput,
        })
        .eq("id", user.id);
      
      if (error) throw error;
      
      // Update the email in Supabase Auth if it changed
      if (emailInput !== user.email) {
        const { error: emailError } = await supabase.auth.updateUser({
          email: emailInput,
        });
        
        if (emailError) throw emailError;
      }
      
      setSuccessMessage("Profile updated successfully!");
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      console.error("Error updating profile:", err);
      setError(err.message || "Failed to update profile");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoadingProfile) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-t-primary border-primary/30 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Your Profile</h1>
          <div className="flex gap-4">
            <Link href="/dashboard">
              <Button variant="outline">Dashboard</Button>
            </Link>
            <Button onClick={() => signOut()} variant="destructive">Sign Out</Button>
          </div>
        </div>
        
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {successMessage && (
          <Alert className="mb-6 bg-green-50 border-green-200 text-green-800">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Success</AlertTitle>
            <AlertDescription>{successMessage}</AlertDescription>
          </Alert>
        )}
          
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
                      value={nameInput} 
                      onChange={(e) => setNameInput(e.target.value)} 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <Input 
                      id="username" 
                      value={usernameInput} 
                      onChange={(e) => setUsernameInput(e.target.value)} 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input 
                      id="email" 
                      type="email" 
                      value={emailInput} 
                      onChange={(e) => setEmailInput(e.target.value)} 
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
                <CardDescription>View your quiz performance and achievements</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Quizzes Taken</p>
                    <p className="text-2xl font-bold">{profileData?.[0]?.quizzes_taken || 0}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Total Points</p>
                    <p className="text-2xl font-bold">{profileData?.[0]?.total_points || 0}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Average Score</p>
                    <p className="text-2xl font-bold">
                      {profileData?.[0]?.quizzes_taken && profileData?.[0]?.total_points
                        ? ((profileData[0].total_points / (profileData[0].quizzes_taken * 100)) * 100).toFixed(1) + '%'
                        : '0%'}
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
                    <p className="text-sm text-muted-foreground">
                      Receive email notifications about your quiz results and achievements
                    </p>
                  </div>
                  <Switch
                    checked={emailNotifications}
                    onCheckedChange={handleEmailNotificationsChange}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Public Profile</Label>
                    <p className="text-sm text-muted-foreground">
                      Allow other users to view your quiz statistics and achievements
                    </p>
                  </div>
                  <Switch
                    checked={publicProfile}
                    onCheckedChange={handlePublicProfileChange}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </ProtectedRoute>
  )
}