"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
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
import { Plus, Trash2, Save, AlertCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import type { Database } from "@/lib/database.types"

type Question = Database['public']['Tables']['questions']['Row']
type QuestionOption = Database['public']['Tables']['question_possible_answers']['Row']

// Types for our form
interface QuizFormQuestion {
  text: string;
  options: {
    id: string; // a, b, c, d
    text: string;
  }[];
  correct_answer: string;
  points: number;
  type: string;
}

export default function CreateQuizPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [quizTitle, setQuizTitle] = useState("")
  const [quizDescription, setQuizDescription] = useState("")
  const [category, setCategory] = useState("")
  const [difficulty, setDifficulty] = useState("")
  const [timeLimit, setTimeLimit] = useState("10")
  const [questions, setQuestions] = useState<QuizFormQuestion[]>([
    {
      text: "",
      options: [
        { id: "a", text: "" },
        { id: "b", text: "" },
        { id: "c", text: "" },
        { id: "d", text: "" },
      ],
      correct_answer: "a",
      points: 10,
      type: "multiple_choice"
    },
  ])
  const [currentTab, setCurrentTab] = useState("details")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<boolean>(false)

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
        correct_answer: "a",
        points: 10,
        type: "multiple_choice"
      },
    ])
  }

  const removeQuestion = (index: number) => {
    if (questions.length > 1) {
      const newQuestions = [...questions]
      newQuestions.splice(index, 1)
      setQuestions(newQuestions)
    }
  }

  const updateQuestionText = (index: number, text: string) => {
    const newQuestions = [...questions]
    newQuestions[index].text = text
    setQuestions(newQuestions)
  }

  const updateOptionText = (questionIndex: number, optionId: string, text: string) => {
    const newQuestions = [...questions]
    const optionIndex = newQuestions[questionIndex].options.findIndex((o) => o.id === optionId)
    newQuestions[questionIndex].options[optionIndex].text = text
    setQuestions(newQuestions)
  }

  const updateCorrectAnswer = (questionIndex: number, value: string) => {
    const newQuestions = [...questions]
    newQuestions[questionIndex].correct_answer = value
    setQuestions(newQuestions)
  }

  const updateQuestionPoints = (questionIndex: number, points: number) => {
    const newQuestions = [...questions]
    newQuestions[questionIndex].points = points
    setQuestions(newQuestions)
  }

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true)
      setError(null)
      
      if (!user) {
        setError("You must be logged in to create a quiz")
        setIsSubmitting(false)
        return
      }

      // Calculate total points and total questions
      const totalQuestions = questions.length
      const totalPoints = questions.reduce((sum, q) => sum + q.points, 0)
      
      // 1. Create quiz record
      const { data: quiz, error: quizError } = await supabase
        .from('quizzes')
        .insert({
          title: quizTitle,
          description: quizDescription,
          category: category,
          difficulty: difficulty,
          time_limit: parseInt(timeLimit) * 60, // Convert to seconds
          total_questions: totalQuestions,
          total_points: totalPoints,
          times_played: 0,
          average_rating: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();
        
      if (quizError) {
        throw new Error(`Failed to create quiz: ${quizError.message}`);
      }
      
      // 2. Create questions
      const questionPromises = questions.map(async (question, index) => {
        // Create the question first
        const { data: questionData, error: questionError } = await supabase
          .from('questions')
          .insert({
            quiz_id: quiz.id,
            text: question.text,
            type: question.type,
            correct_answer: question.correct_answer,
            points: question.points,
            order_num: index,
            created_at: new Date().toISOString()
          })
          .select()
          .single();
          
        if (questionError) {
          throw new Error(`Failed to create question ${index + 1}: ${questionError.message}`);
        }
        
        // 3. Create possible answers for this question
        const optionPromises = question.options.map(async (option, optionIndex) => {
          const { error: optionError } = await supabase
            .from('question_possible_answers')
            .insert({
              question_id: questionData.id,
              option_id: option.id,
              text: option.text,
              order_num: optionIndex,
              created_at: new Date().toISOString()
            });
            
          if (optionError) {
            throw new Error(`Failed to create option ${option.id} for question ${index + 1}: ${optionError.message}`);
          }
        });
        
        // Wait for all options to be created
        await Promise.all(optionPromises);
        
        return questionData;
      });
      
      // Wait for all questions to be created
      await Promise.all(questionPromises);
      
      setSuccess(true);
      
      // Redirect after a short delay to show success message
      setTimeout(() => {
        router.push("/admin/quizzes");
      }, 2000);
    } catch (err: any) {
      console.error("Error creating quiz:", err);
      setError(err.message || "Failed to create quiz. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  const isDetailsValid = quizTitle && quizDescription && category && difficulty && timeLimit
  const areQuestionsValid = questions.every((q) => q.text && q.options.every((o) => o.text) && q.correct_answer)

  return (
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
            <h1 className="text-3xl font-bold">Create New Quiz</h1>
            <p className="text-muted-foreground">Fill in the details and add questions to create a new quiz.</p>
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
              <AlertDescription>Quiz created successfully! Redirecting...</AlertDescription>
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
                  <CardDescription>Enter the basic information about your quiz.</CardDescription>
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
                    Next: Add Questions
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
                      {isSubmitting ? "Creating Quiz..." : (
                        <>
                          <Save className="h-4 w-4" /> Create Quiz
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
  )
}

