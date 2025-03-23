"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import * as React from "react"
import { useAuth } from "@/components/auth/AuthProvider"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Plus, Trash2, Save, AlertCircle, ArrowLeft } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import ProtectedRoute from "@/components/auth/ProtectedRoute"
import { Quiz, Question, QuestionOption, QuizWithQuestions } from "@/types/database"
import { useDataFetching } from "@/hooks/useDataFetching"

// Types for our form
interface QuizFormQuestion {
  id?: string;
  text: string;
  options: {
    id: string; // a, b, c, d
    text: string;
    question_id: string | null;
    order_num: number;
  }[];
  correct_answer: string;
  points: number;
  type: string;
  order_num: number;
}

// Define the type for params
interface PageParams {
  id: string;
}

export default function EditQuizPage({ params }: { params: Promise<PageParams> }) {
  // Unwrap params using React.use()
  const unwrappedParams = React.use(params);
  const quizId = unwrappedParams.id;
  const router = useRouter();
  const { user } = useAuth();
  const [quizTitle, setQuizTitle] = useState("");
  const [quizDescription, setQuizDescription] = useState("");
  const [category, setCategory] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [timeLimit, setTimeLimit] = useState("10");
  const [questions, setQuestions] = useState<QuizFormQuestion[]>([
    {
      text: "",
      options: [
        { id: "a", text: "", question_id: null, order_num: 0 },
        { id: "b", text: "", question_id: null, order_num: 1 },
        { id: "c", text: "", question_id: null, order_num: 2 },
        { id: "d", text: "", question_id: null, order_num: 3 },
      ],
      correct_answer: "a",
      points: 10,
      type: "multiple_choice",
      order_num: 0
    }
  ]);
  const [currentTab, setCurrentTab] = useState("details");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

  // Fetch quiz data using our hook
  const { data: quizData, loading, error: fetchError } = useDataFetching<'quizzes'>({
    table: 'quizzes',
    select: `
      *,
      questions:questions (
        *,
        options:question_possible_answers (*)
      )
    `,
    filter: { column: 'id', operator: 'eq', value: quizId }
  });

  // Update form when quiz data changes
  useEffect(() => {
    if (quizData?.[0]) {
      const quiz = quizData[0] as QuizWithQuestions;
      setQuizTitle(quiz.title);
      setQuizDescription(quiz.description || '');
      setCategory(quiz.category || '');
      setDifficulty(quiz.difficulty);
      setTimeLimit(Math.round((quiz.time_limit || 600) / 60).toString()); // Convert seconds to minutes

      // Format questions for our UI
      const formattedQuestions: QuizFormQuestion[] = quiz.questions.map((question: Question & { options: QuestionOption[] }, index: number) => ({
        id: question.id,
        text: question.text,
        type: question.type || 'multiple_choice',
        options: question.options.map((option: QuestionOption) => ({
          id: option.option_id,
          text: option.text,
          question_id: option.question_id,
          order_num: option.order_num || 0
        })),
        correct_answer: question.correct_answer,
        points: question.points || 10,
        order_num: question.order_num || index
      }));

      // Set questions if we found any, otherwise keep the default empty question
      if (formattedQuestions.length > 0) {
        setQuestions(formattedQuestions);
      }
    }
  }, [quizData]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="w-12 h-12 border-4 border-t-primary border-primary/30 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center text-red-500">{fetchError}</div>
      </div>
    );
  }

  if (!quizData?.[0]) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">Quiz not found</div>
      </div>
    );
  }

  const addQuestion = () => {
    const newQuestion: QuizFormQuestion = {
      text: '',
      options: [
        { id: 'a', text: '', question_id: null, order_num: 0 },
        { id: 'b', text: '', question_id: null, order_num: 1 },
        { id: 'c', text: '', question_id: null, order_num: 2 },
        { id: 'd', text: '', question_id: null, order_num: 3 }
      ],
      correct_answer: 'a',
      points: 10,
      type: 'multiple_choice',
      order_num: questions.length
    };
    setQuestions([...questions, newQuestion]);
  };

  const removeQuestion = (index: number) => {
    if (questions.length > 1) {
      const newQuestions = [...questions];
      newQuestions.splice(index, 1);
      setQuestions(newQuestions);
    }
  };

  const handleQuestionChange = (index: number, field: keyof QuizFormQuestion, value: any) => {
    const updatedQuestions = [...questions];
    if (field === 'options') {
      // Handle options update separately to maintain all required fields
      const updatedOptions = value.map((opt: any, i: number) => ({
        ...opt,
        question_id: opt.question_id || null,
        order_num: opt.order_num || i
      }));
      updatedQuestions[index] = {
        ...updatedQuestions[index],
        options: updatedOptions
      };
    } else {
      updatedQuestions[index] = {
        ...updatedQuestions[index],
        [field]: value
      };
    }
    setQuestions(updatedQuestions);
  };

  const updateQuestionText = (index: number, text: string) => {
    handleQuestionChange(index, 'text', text);
  };

  const updateOptionText = (questionIndex: number, optionId: string, text: string) => {
    handleQuestionChange(questionIndex, 'options', questions[questionIndex].options.map((option) =>
      option.id === optionId ? { ...option, text } : option
    ));
  };

  const updateCorrectAnswer = (questionIndex: number, value: string) => {
    handleQuestionChange(questionIndex, 'correct_answer', value);
  };

  const updateQuestionPoints = (questionIndex: number, points: number) => {
    handleQuestionChange(questionIndex, 'points', points);
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      setError(null);
      
      if (!user) {
        setError("You must be logged in to update a quiz");
        setIsSubmitting(false);
        return;
      }

      // Calculate total points and total questions
      const totalQuestions = questions.length;
      const totalPoints = questions.reduce((sum, q) => sum + q.points, 0);
      
      // 1. Update quiz record
      const { error: quizError } = await supabase
        .from('quizzes')
        .update({
          title: quizTitle,
          description: quizDescription,
          category: category,
          difficulty: difficulty,
          time_limit: parseInt(timeLimit) * 60, // Convert to seconds
          total_questions: totalQuestions,
          total_points: totalPoints,
          updated_at: new Date().toISOString(),
        })
        .eq('id', quizId);
        
      if (quizError) throw quizError;

      // 2. Update questions
      for (const question of questions) {
        if (question.id) {
          // Update existing question
          const { error: questionError } = await supabase
            .from('questions')
            .update({
              text: question.text,
              type: question.type,
              correct_answer: question.correct_answer,
              points: question.points,
              order_num: question.order_num,
              updated_at: new Date().toISOString()
            })
            .eq('id', question.id);
            
          if (questionError) throw questionError;

          // Update existing options
          for (const option of question.options) {
            if (option.question_id) {
              const { error: optionError } = await supabase
                .from('question_possible_answers')
                .update({
                  text: option.text,
                  order_num: option.order_num,
                  updated_at: new Date().toISOString()
                })
                .eq('question_id', question.id)
                .eq('option_id', option.id);
                
              if (optionError) throw optionError;
            }
          }
        } else {
          // Create new question
          const { data: newQuestion, error: questionError } = await supabase
            .from('questions')
            .insert({
              quiz_id: quizId,
              text: question.text,
              type: question.type,
              correct_answer: question.correct_answer,
              points: question.points,
              order_num: question.order_num,
              created_at: new Date().toISOString()
            })
            .select()
            .single();
            
          if (questionError) throw questionError;

          // Create options for new question
          const optionPromises = question.options.map(async (option, index) => {
            const { error: optionError } = await supabase
              .from('question_possible_answers')
              .insert({
                question_id: newQuestion.id,
                option_id: option.id,
                text: option.text,
                order_num: index,
                created_at: new Date().toISOString()
              });
              
            if (optionError) throw optionError;
          });
          
          await Promise.all(optionPromises);
        }
      }
      
      setSuccess(true);
      
      // Redirect after a short delay to show success message
      setTimeout(() => {
        router.push("/admin/quizzes");
      }, 2000);
    } catch (err: any) {
      console.error("Error updating quiz:", err);
      setError(err.message || "Failed to update quiz. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isDetailsValid = quizTitle && quizDescription && category && difficulty && timeLimit;
  const areQuestionsValid = questions.every((q) => q.text && q.options.every((o) => o.text) && q.correct_answer);

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
              <Link className="text-sm font-medium hover:underline underline-offset-4" href="/admin/quizzes">
                Manage Quizzes
              </Link>
            </nav>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" asChild>
                <Link href="/admin/quizzes">Cancel</Link>
              </Button>
            </div>
          </div>
        </header>
        <main className="flex-1 container py-6">
          <div className="max-w-4xl mx-auto">
            <div className="mb-6">
              <Button variant="ghost" size="sm" className="mb-2" asChild>
                <Link href="/admin/quizzes">
                  <ArrowLeft className="h-4 w-4 mr-1" /> Back to Quizzes
                </Link>
              </Button>
              <h1 className="text-3xl font-bold">Edit Quiz</h1>
              <p className="text-muted-foreground">Update quiz details and questions.</p>
            </div>

            {error && (
              <Alert variant="destructive" className="mb-6">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert className="mb-6 bg-green-50 text-green-800 border-green-200">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Success</AlertTitle>
                <AlertDescription>Quiz updated successfully! Redirecting...</AlertDescription>
              </Alert>
            )}

            <Tabs value={currentTab} onValueChange={setCurrentTab} className="space-y-4">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="details">Quiz Details</TabsTrigger>
                <TabsTrigger value="questions" disabled={!isDetailsValid}>
                  Questions
                </TabsTrigger>
              </TabsList>

              <TabsContent value="details">
                <Card>
                  <CardHeader>
                    <CardTitle>Quiz Information</CardTitle>
                    <CardDescription>Update the basic information about your quiz.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">Quiz Title</Label>
                      <Input
                        id="title"
                        placeholder="Enter quiz title"
                        value={quizTitle}
                        onChange={(e) => setQuizTitle(e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        placeholder="Enter quiz description"
                        value={quizDescription}
                        onChange={(e) => setQuizDescription(e.target.value)}
                        rows={3}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="category">Category</Label>
                        <Select value={category} onValueChange={setCategory}>
                          <SelectTrigger id="category">
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="programming">Programming</SelectItem>
                            <SelectItem value="mathematics">Mathematics</SelectItem>
                            <SelectItem value="science">Science</SelectItem>
                            <SelectItem value="history">History</SelectItem>
                            <SelectItem value="general">General Knowledge</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="difficulty">Difficulty</Label>
                        <Select value={difficulty} onValueChange={setDifficulty}>
                          <SelectTrigger id="difficulty">
                            <SelectValue placeholder="Select difficulty" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="beginner">Beginner</SelectItem>
                            <SelectItem value="intermediate">Intermediate</SelectItem>
                            <SelectItem value="advanced">Advanced</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="time-limit">Time Limit (minutes)</Label>
                      <Input
                        id="time-limit"
                        type="number"
                        min="1"
                        max="60"
                        value={timeLimit}
                        onChange={(e) => setTimeLimit(e.target.value)}
                      />
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button onClick={() => setCurrentTab("questions")} disabled={!isDetailsValid}>
                      Next: Edit Questions
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>

              <TabsContent value="questions">
                <div className="space-y-4">
                  {questions.map((question, questionIndex) => (
                    <Card key={questionIndex}>
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <CardTitle>Question {questionIndex + 1}</CardTitle>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeQuestion(questionIndex)}
                            disabled={questions.length === 1}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor={`question-${questionIndex}`}>Question Text</Label>
                          <Textarea
                            id={`question-${questionIndex}`}
                            placeholder="Enter question text"
                            value={question.text}
                            onChange={(e) => updateQuestionText(questionIndex, e.target.value)}
                            rows={2}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Options</Label>
                          <div className="space-y-2">
                            {question.options.map((option) => (
                              <div key={option.id} className="flex items-center gap-2">
                                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-xs">
                                  {option.id}
                                </div>
                                <Input
                                  placeholder={`Option ${option.id.toUpperCase()}`}
                                  value={option.text}
                                  onChange={(e) => updateOptionText(questionIndex, option.id, e.target.value)}
                                />
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label>Correct Answer</Label>
                          <RadioGroup
                            value={question.correct_answer}
                            onValueChange={(value) => updateCorrectAnswer(questionIndex, value)}
                            className="flex space-x-2"
                          >
                            {question.options.map((option) => (
                              <div key={option.id} className="flex items-center space-x-1">
                                <RadioGroupItem value={option.id} id={`q${questionIndex}-${option.id}`} />
                                <Label htmlFor={`q${questionIndex}-${option.id}`} className="cursor-pointer">
                                  {option.id.toUpperCase()}
                                </Label>
                              </div>
                            ))}
                          </RadioGroup>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor={`points-${questionIndex}`}>Points</Label>
                          <Input
                            id={`points-${questionIndex}`}
                            type="number"
                            min="1"
                            max="100"
                            value={question.points.toString()}
                            onChange={(e) => updateQuestionPoints(questionIndex, parseInt(e.target.value) || 10)}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  ))}

                  <div className="flex justify-between">
                    <Button variant="outline" onClick={addQuestion} className="flex items-center gap-1">
                      <Plus className="h-4 w-4" /> Add Question
                    </Button>

                    <div className="flex gap-2">
                      <Button variant="outline" onClick={() => setCurrentTab("details")}>
                        Back to Details
                      </Button>
                      <Button
                        onClick={handleSubmit}
                        disabled={!isDetailsValid || !areQuestionsValid || isSubmitting}
                        className="flex items-center gap-1"
                      >
                        {isSubmitting ? "Updating Quiz..." : (
                          <>
                            <Save className="h-4 w-4" /> Update Quiz
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
} 