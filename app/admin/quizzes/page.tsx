"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/components/auth/AuthProvider"
import ProtectedRoute from "@/components/auth/ProtectedRoute"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { PlusCircle, Pencil, BarChart3, Trash } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface Quiz {
  id: string;
  title: string;
  description: string;
  difficulty: string;
  category: string;
  times_played: number;
  total_questions: number;
  created_at: string;
}

export default function AdminQuizzesPage() {
  const { user } = useAuth();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        setLoading(true);
        
        const { data, error } = await supabase
          .from('quizzes')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (error) {
          throw error;
        }
        
        setQuizzes(data || []);
      } catch (err: any) {
        console.error('Error fetching quizzes:', err);
        setError(err.message || 'Failed to load quizzes');
      } finally {
        setLoading(false);
      }
    };
    
    fetchQuizzes();
  }, []);

  const handleDeleteQuiz = async (id: string) => {
    try {
      setDeleteId(id);
      
      // First delete all questions associated with this quiz
      const { error: questionsError } = await supabase
        .from('questions')
        .delete()
        .eq('quiz_id', id);
      
      if (questionsError) throw questionsError;
      
      // Then delete the quiz
      const { error: quizError } = await supabase
        .from('quizzes')
        .delete()
        .eq('id', id);
      
      if (quizError) throw quizError;
      
      // Update the UI
      setQuizzes(quizzes.filter(quiz => quiz.id !== id));
    } catch (err: any) {
      console.error('Error deleting quiz:', err);
      setError(`Failed to delete quiz: ${err.message}`);
    } finally {
      setDeleteId(null);
    }
  };

  // Function to format date string
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  return (
    <ProtectedRoute>
      <div className="flex min-h-screen flex-col">
        <header className="sticky top-0 z-10 border-b bg-background">
          <div className="container flex h-16 items-center justify-between py-4">
            <div className="flex items-center gap-2">
              <Link href="/admin/dashboard" className="font-bold">
                QuizMaster <Badge>Admin</Badge>
              </Link>
            </div>
            <nav className="hidden md:flex gap-6">
              <Link className="text-sm font-medium hover:underline underline-offset-4" href="/admin/dashboard">
                Dashboard
              </Link>
              <Link
                className="text-sm font-medium hover:underline underline-offset-4 text-primary"
                href="/admin/quizzes"
              >
                Manage Quizzes
              </Link>
            </nav>
            <div className="flex items-center gap-2">
              <Button size="sm" asChild className="gap-1">
                <Link href="/admin/quizzes/create">
                  <PlusCircle className="h-4 w-4" /> New Quiz
                </Link>
              </Button>
            </div>
          </div>
        </header>
        <main className="flex-1 container py-6">
          <div className="mb-6">
            <h1 className="text-3xl font-bold">Manage Quizzes</h1>
            <p className="text-muted-foreground">Create, edit, and analyze quizzes.</p>
          </div>

          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="w-12 h-12 border-4 border-t-primary border-primary/30 rounded-full animate-spin"></div>
            </div>
          ) : quizzes.length === 0 ? (
            <div className="text-center py-12 border rounded-lg">
              <h3 className="text-lg font-medium mb-2">No quizzes yet</h3>
              <p className="text-muted-foreground mb-4">Get started by creating your first quiz.</p>
              <Button asChild>
                <Link href="/admin/quizzes/create">Create Quiz</Link>
              </Button>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {quizzes.map((quiz) => (
                <Card key={quiz.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="line-clamp-1">{quiz.title}</CardTitle>
                        <div className="flex gap-2 mt-1">
                          <Badge variant="outline" className="capitalize">
                            {quiz.difficulty}
                          </Badge>
                          {quiz.category && (
                            <Badge variant="outline" className="capitalize">
                              {quiz.category}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{quiz.description}</p>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-muted-foreground">Questions:</span> {quiz.total_questions}
                      </div>
                      <div>
                        <span className="text-muted-foreground">Times Played:</span> {quiz.times_played}
                      </div>
                      <div className="col-span-2">
                        <span className="text-muted-foreground">Created:</span> {formatDate(quiz.created_at)}
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" asChild className="gap-1">
                        <Link href={`/admin/quizzes/${quiz.id}/edit`}>
                          <Pencil className="h-3.5 w-3.5" /> Edit
                        </Link>
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="gap-1 text-red-500 hover:text-red-700"
                        onClick={() => handleDeleteQuiz(quiz.id)}
                        disabled={deleteId === quiz.id}
                      >
                        <Trash className="h-3.5 w-3.5" /> 
                        {deleteId === quiz.id ? 'Deleting...' : 'Delete'}
                      </Button>
                    </div>
                    <Button variant="ghost" size="sm" asChild className="gap-1">
                      <Link href={`/admin/quizzes/${quiz.id}/analytics`}>
                        <BarChart3 className="h-3.5 w-3.5" /> Analytics
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </main>
      </div>
    </ProtectedRoute>
  )
} 