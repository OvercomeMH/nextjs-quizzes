"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Plus, Trash2, Save } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export default function CreateQuizPage() {
  const router = useRouter()
  const [quizTitle, setQuizTitle] = useState("")
  const [quizDescription, setQuizDescription] = useState("")
  const [category, setCategory] = useState("")
  const [difficulty, setDifficulty] = useState("")
  const [timeLimit, setTimeLimit] = useState("10")
  const [questions, setQuestions] = useState([
    {
      text: "",
      options: [
        { id: "a", text: "" },
        { id: "b", text: "" },
        { id: "c", text: "" },
        { id: "d", text: "" },
      ],
      correctAnswer: "a",
    },
  ])
  const [currentTab, setCurrentTab] = useState("details")
  const [isSubmitting, setIsSubmitting] = useState(false)

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
      },
    ])
  }

  const removeQuestion = (index) => {
    if (questions.length > 1) {
      const newQuestions = [...questions]
      newQuestions.splice(index, 1)
      setQuestions(newQuestions)
    }
  }

  const updateQuestionText = (index, text) => {
    const newQuestions = [...questions]
    newQuestions[index].text = text
    setQuestions(newQuestions)
  }

  const updateOptionText = (questionIndex, optionId, text) => {
    const newQuestions = [...questions]
    const optionIndex = newQuestions[questionIndex].options.findIndex((o) => o.id === optionId)
    newQuestions[questionIndex].options[optionIndex].text = text
    setQuestions(newQuestions)
  }

  const updateCorrectAnswer = (questionIndex, value) => {
    const newQuestions = [...questions]
    newQuestions[questionIndex].correctAnswer = value
    setQuestions(newQuestions)
  }

  const handleSubmit = () => {
    setIsSubmitting(true)

    // In a real app, you would submit the quiz data to an API
    setTimeout(() => {
      router.push("/admin/quizzes")
    }, 1000)
  }

  const isDetailsValid = quizTitle && quizDescription && category && difficulty && timeLimit
  const areQuestionsValid = questions.every((q) => q.text && q.options.every((o) => o.text) && q.correctAnswer)

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
                                placeholder={`Option ${option.id}`}
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
                          className="flex space-x-4"
                        >
                          {question.options.map((option) => (
                            <div key={option.id} className="flex items-center space-x-2">
                              <RadioGroupItem value={option.id} id={`answer-${questionIndex}-${option.id}`} />
                              <Label htmlFor={`answer-${questionIndex}-${option.id}`}>{option.id.toUpperCase()}</Label>
                            </div>
                          ))}
                        </RadioGroup>
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
                      disabled={!areQuestionsValid || isSubmitting}
                      className="flex items-center gap-1"
                    >
                      <Save className="h-4 w-4" />
                      {isSubmitting ? "Saving..." : "Save Quiz"}
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

