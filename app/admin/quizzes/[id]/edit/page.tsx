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

// Types for our form
interface QuizOption {
  id: string;
  text: string;
  question_id?: string;
  order_num?: number;
}

interface QuizQuestion {
  id?: string;
  text: string;
  options: QuizOption[];
  correctAnswer: string;
  points?: number;
  order_num?: number;
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
  const [questions, setQuestions] = useState<QuizQuestion[]>([
    {
      text: "",
      options: [
        { id: "a", text: "" },
        { id: "b", text: "" },
        { id: "c", text: "" },
        { id: "d", text: "" },
      ],
      correctAnswer: "a",
      points: 10,
    },
  ]);
  const [currentTab, setCurrentTab] = useState("details");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

  // Fetch quiz data when the component mounts
  useEffect(() => {
    const fetchQuizData = async () => {
      try {
        // Fetch the quiz
        const { data: quizData, error: quizError } = await supabase
          .from('quizzes')
          .select('*')
          .eq('id', quizId)
          .single();

        if (quizError) {
          throw new Error(`Failed to fetch quiz: ${quizError.message}`);
        }

        if (!quizData) {
          throw new Error('Quiz not found');
        }

        // Set quiz details
        setQuizTitle(quizData.title);
        setQuizDescription(quizData.description);
        setCategory(quizData.category || '');
        setDifficulty(quizData.difficulty);
        setTimeLimit(Math.round(quizData.time_limit / 60).toString()); // Convert seconds to minutes

        // Fetch quiz questions
        const { data: questionsData, error: questionsError } = await supabase
          .from('questions')
          .select('*')
          .eq('quiz_id', quizId)
          .order('order_num', { ascending: true });

        if (questionsError) {
          throw new Error(`Failed to fetch questions: ${questionsError.message}`);
        }

        // Create an array to hold the formatted questions
        const formattedQuestions: QuizQuestion[] = [];

        // Fetch and process each question with its options
        for (const question of questionsData) {
          // Fetch options for this question
          const { data: optionsData, error: optionsError } = await supabase
            .from('question_possible_answers')
            .select('*')
            .eq('question_id', question.id)
            .order('order_num', { ascending: true });

          if (optionsError) {
            throw new Error(`Failed to fetch options for question ${question.id}: ${optionsError.message}`);
          }

          // Format options for our UI
          const options: QuizOption[] = optionsData.map(option => ({
            id: option.option_id,
            text: option.text,
            question_id: option.question_id,
            order_num: option.order_num
          }));

          // Add the question with its options to our formatted questions array
          formattedQuestions.push({
            id: question.id,
            text: question.text,
            options: options,
            correctAnswer: question.correct_answer,
            points: question.points,
            order_num: question.order_num
          });
        }

        // Set questions if we found any, otherwise keep the default empty question
        if (formattedQuestions.length > 0) {
          setQuestions(formattedQuestions);
        }

        setIsLoading(false);
      } catch (err: any) {
        console.error("Error fetching quiz data:", err);
        setError(err.message || "Failed to load quiz data");
        setIsLoading(false);
      }
    };

    fetchQuizData();
  }, [quizId]);

  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        text: "",
        options: [
          { id: "a", text: "" },
          { id: "b", text: "" },
          { id: "c", text: "" },
          { id: "d", text: "" },
        ],
        correctAnswer: "a",
        points: 10,
      },
    ]);
  };

  const removeQuestion = (index: number) => {
    if (questions.length > 1) {
      const newQuestions = [...questions];
      newQuestions.splice(index, 1);
      setQuestions(newQuestions);
    }
  };

  const updateQuestionText = (index: number, text: string) => {
    const newQuestions = [...questions];
    newQuestions[index].text = text;
    setQuestions(newQuestions);
  };

  const updateOptionText = (questionIndex: number, optionId: string, text: string) => {
    const newQuestions = [...questions];
    const optionIndex = newQuestions[questionIndex].options.findIndex((o) => o.id === optionId);
    newQuestions[questionIndex].options[optionIndex].text = text;
    setQuestions(newQuestions);
  };

  const updateCorrectAnswer = (questionIndex: number, value: string) => {
    const newQuestions = [...questions];
    newQuestions[questionIndex].correctAnswer = value;
    setQuestions(newQuestions);
  };

  const updateQuestionPoints = (questionIndex: number, points: number) => {
    const newQuestions = [...questions];
    newQuestions[questionIndex].points = points;
    setQuestions(newQuestions);
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
      const totalPoints = questions.reduce((sum, q) => sum + (q.points || 10), 0);
      
      // 1. Update quiz record
      try {
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
          
        if (quizError) {
          console.error("Supabase error updating quiz:", quizError);
          throw new Error(`Database error: ${quizError.message}`);
        }
      } catch (fetchError: any) {
        console.error("Network error when updating quiz:", fetchError);
        throw new Error("Network error when connecting to database. Please check your internet connection and try again.");
      }
      
      // 2. Handle questions - this is more complex as we need to:
      // - Update existing questions
      // - Create new questions
      // - Delete questions that are no longer present
      
      // First, fetch all existing questions to determine what to update/delete
      const { data: existingQuestions, error: fetchError } = await supabase
        .from('questions')
        .select('id')
        .eq('quiz_id', quizId);
        
      if (fetchError) {
        throw new Error(`Failed to fetch existing questions: ${fetchError.message}`);
      }
      
      // Create a set of existing question IDs
      const existingQuestionIds = new Set(existingQuestions.map(q => q.id));
      
      // Create a set of current question IDs from our form
      const currentQuestionIds = new Set(questions.filter(q => q.id).map(q => q.id));
      
      // Find questions to delete (in existingQuestionIds but not in currentQuestionIds)
      const questionIdsToDelete = [...existingQuestionIds].filter(id => !currentQuestionIds.has(id));
      
      // Delete questions that are no longer present
      if (questionIdsToDelete.length > 0) {
        const { error: deleteError } = await supabase
          .from('questions')
          .delete()
          .in('id', questionIdsToDelete);
          
        if (deleteError) {
          throw new Error(`Failed to delete questions: ${deleteError.message}`);
        }
      }
      
      // Update or create questions
      const questionPromises = questions.map(async (question, index) => {
        if (question.id) {
          // Update existing question
          const { error: updateError } = await supabase
            .from('questions')
            .update({
              text: question.text,
              correct_answer: question.correctAnswer,
              points: question.points || 10,
              order_num: index,
            })
            .eq('id', question.id);
            
          if (updateError) {
            throw new Error(`Failed to update question ${index + 1}: ${updateError.message}`);
          }
          
          // Fetch existing options for this question
          const { data: existingOptions, error: optionsError } = await supabase
            .from('question_possible_answers')
            .select('id, option_id')
            .eq('question_id', question.id);
            
          if (optionsError) {
            throw new Error(`Failed to fetch options for question ${index + 1}: ${optionsError.message}`);
          }
          
          // Create a map of option_id to database id
          const optionMap = new Map(existingOptions.map(o => [o.option_id, o.id]));
          
          // Update options
          const optionPromises = question.options.map(async (option, optionIndex) => {
            if (optionMap.has(option.id)) {
              // Update existing option
              const { error: updateOptionError } = await supabase
                .from('question_possible_answers')
                .update({
                  text: option.text,
                  order_num: optionIndex
                })
                .eq('id', optionMap.get(option.id));
                
              if (updateOptionError) {
                throw new Error(`Failed to update option ${option.id} for question ${index + 1}: ${updateOptionError.message}`);
              }
            } else {
              // Create new option
              const { error: createOptionError } = await supabase
                .from('question_possible_answers')
                .insert({
                  question_id: question.id,
                  option_id: option.id,
                  text: option.text,
                  order_num: optionIndex
                });
                
              if (createOptionError) {
                throw new Error(`Failed to create option ${option.id} for question ${index + 1}: ${createOptionError.message}`);
              }
            }
          });
          
          await Promise.all(optionPromises);
          
          return question.id;
        } else {
          // Create new question
          const { data: newQuestion, error: createError } = await supabase
            .from('questions')
            .insert({
              quiz_id: quizId,
              text: question.text,
              correct_answer: question.correctAnswer,
              points: question.points || 10,
              order_num: index,
            })
            .select()
            .single();
            
          if (createError) {
            throw new Error(`Failed to create question ${index + 1}: ${createError.message}`);
          }
          
          // Create options for new question
          const optionPromises = question.options.map(async (option, optionIndex) => {
            const { error: optionError } = await supabase
              .from('question_possible_answers')
              .insert({
                question_id: newQuestion.id,
                option_id: option.id,
                text: option.text,
                order_num: optionIndex
              });
              
            if (optionError) {
              throw new Error(`Failed to create option ${option.id} for question ${index + 1}: ${optionError.message}`);
            }
          });
          
          await Promise.all(optionPromises);
          
          return newQuestion.id;
        }
      });
      
      await Promise.all(questionPromises);
      
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
  const areQuestionsValid = questions.every((q) => q.text && q.options.every((o) => o.text) && q.correctAnswer);

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center">
        <h2 className="text-xl font-semibold mb-2">Loading quiz data...</h2>
        <p className="text-muted-foreground">Please wait while we fetch the quiz information.</p>
      </div>
    );
  }

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
                            value={question.correctAnswer}
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
                            value={question.points?.toString() || "10"}
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