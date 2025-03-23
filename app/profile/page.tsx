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

interface UserProfile {
  id: string
  username: string
  email: string
  full_name: string
  quizzes_taken: number
  average_score: number
  total_points: number
  rank: string
  email_notifications: boolean
  public_profile: boolean
  created_at: string
}

export default function ProfilePage() {
  const { user, signOut } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [nameInput, setNameInput] = useState<string>("")
  const [emailInput, setEmailInput] = useState<string>("")
  const [usernameInput, setUsernameInput] = useState<string>("")
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingProfile, setIsLoadingProfile] = useState(true)
  const [emailNotifications, setEmailNotifications] = useState(false)
  const [publicProfile, setPublicProfile] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  
  // Fetch profile data when component mounts
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      
      try {
        setIsLoadingProfile(true);
        setError(null);
        
        const { data, error } = await supabase
          .from("users")
          .select("*")
          .eq("id", user.id)
          .single();
          
        if (error) throw error;
        
        setProfile(data);
        
        // Set form values
        setNameInput(data.full_name || "");
        setEmailInput(data.email || "");
        setUsernameInput(data.username || "");
        setEmailNotifications(data.email_notifications || false);
        setPublicProfile(data.public_profile || false);
      } catch (err: any) {
        console.error("Error fetching profile:", err);
        setError(err.message || "Failed to load profile data");
      } finally {
        setIsLoadingProfile(false);
      }
    };
    
    fetchProfile();
  }, [user]);

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
      
      // Update the local state
      setProfile(prev => prev ? { ...prev, [setting]: value } : null);
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
    setEmailNotifications(checked);
    updateSettings('email_notifications', checked);
  };
  
  // Handle public profile toggle
  const handlePublicProfileChange = (checked: boolean) => {
    setPublicProfile(checked);
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
      
      // Refetch the profile to get the updated data
      const { data: updatedProfile, error: fetchError } = await supabase
        .from("users")
        .select("*")
        .eq("id", user.id)
        .single();
        
      if (fetchError) throw fetchError;
      
      setProfile(updatedProfile);
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
        <div className="text-xl">Loading profile...</div>
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
                <CardDescription>See how you've been performing</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2 p-4 border rounded-lg">
                    <p className="text-sm text-muted-foreground">Quizzes Taken</p>
                    <p className="text-2xl font-bold">{profile?.quizzes_taken || 0}</p>
                  </div>
                  <div className="space-y-2 p-4 border rounded-lg">
                    <p className="text-sm text-muted-foreground">Average Score</p>
                    <p className="text-2xl font-bold">{profile?.average_score ? `${profile.average_score.toFixed(1)}%` : "0%"}</p>
                  </div>
                  <div className="space-y-2 p-4 border rounded-lg">
                    <p className="text-sm text-muted-foreground">Total Points</p>
                    <p className="text-2xl font-bold">{profile?.total_points || 0}</p>
                  </div>
                  <div className="space-y-2 p-4 border rounded-lg">
                    <p className="text-sm text-muted-foreground">Member Since</p>
                    <p className="text-2xl font-bold">
                      {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : "N/A"}
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
                <Button variant="outline" className="w-full" onClick={() => setError("Password change functionality not implemented yet")}>
                  Change Password
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </ProtectedRoute>
  );
} 