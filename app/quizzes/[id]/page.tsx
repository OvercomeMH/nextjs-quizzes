"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { AlertCircle, Clock } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function QuizPage({ params }) {
  const router = useRouter()
  const [quiz, setQuiz] = useState(null)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState([])
  const [loading, setLoading] = useState(true)
  const [timeLeft, setTimeLeft] = useState(600) // 10 minutes in seconds
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    // In a real app, you would fetch the quiz data from an API
    setTimeout(() => {
      setQuiz({
        id: params.id,
        title: "Introduction to JavaScript",
        description: "Test your knowledge of JavaScript basics",
        questions: [
          {
            id: 1,
            text: "Which of the following is NOT a JavaScript data type?",
            options: [
              { id: "a", text: "String" },
              { id: "b", text: "Boolean" },
              { id: "c", text: "Float" },
              { id: "d", text: "Number" },
            ],
            correctAnswer: "c",
          },
          {
            id: 2,
            text: "What does the '===' operator do in JavaScript?",
            options: [
              { id: "a", text: "Checks for equality, but not type" },
              { id: "b", text: "Checks for equality, including type" },
              { id: "c", text: "Assigns a value" },
              { id: "d", text: "Checks if one value is greater than another" },
            ],
            correctAnswer: "b",
          },
          {
            id: 3,
            text: "Which method is used to add an element to the end of an array?",
            options: [
              { id: "a", text: "push()" },
              { id: "b", text: "pop()" },
              { id: "c", text: "shift()" },
              { id: "d", text: "unshift()" },
            ],
            correctAnswer: "a",
          },
          {
            id: 4,
            text: "What is the correct way to create a function in JavaScript?",
            options: [
              { id: "a", text: "function = myFunction() {}" },
              { id: "b", text: "function:myFunction() {}" },
              { id: "c", text: "function myFunction() {}" },
              { id: "d", text: "create myFunction() {}" },
            ],
            correctAnswer: "c",
          },
          {
            id: 5,
            text: "Which of these is NOT a JavaScript framework or library?",
            options: [
              { id: "a", text: "React" },
              { id: "b", text: "Angular" },
              { id: "c", text: "Django" },
              { id: "d", text: "Vue" },
            ],
            correctAnswer: "c",
          },
        ],
        timeLimit: 600, // 10 minutes in seconds
      })
      setAnswers(new Array(5).fill(null))
      setLoading(false)
    }, 1000)
  }, [params.id])

  useEffect(() => {
    if (!quiz) return

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          handleSubmit()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [quiz])

  const handleAnswerChange = (value) => {
    const newAnswers = [...answers]
    newAnswers[currentQuestion] = value
    setAnswers(newAnswers)
  }

  const handleNext = () => {
    if (currentQuestion < quiz.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
    }
  }

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1)
    }
  }

  const handleSubmit = () => {
    setIsSubmitting(true)

    // Calculate score
    let score = 0
    answers.forEach((answer, index) => {
      if (answer === quiz.questions[index].correctAnswer) {
        score++
      }
    })

    // In a real app, you would submit the answers to an API
    setTimeout(() => {
      router.push(`/quizzes/${params.id}/results?score=${score}&total=${quiz.questions.length}`)
    }, 1000)
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">Loading quiz...</div>
      </div>
    )
  }

  const question = quiz.questions[currentQuestion]
  const progress = ((currentQuestion + 1) / quiz.questions.length) * 100

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-10 border-b bg-background">
        <div className="container flex h-16 items-center justify-between py-4">
          <div className="flex items-center gap-2">
            <Link href="/" className="font-bold">
              QuizMaster
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span className={`font-medium ${timeLeft < 60 ? "text-red-500" : ""}`}>{formatTime(timeLeft)}</span>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link href="/dashboard">Exit Quiz</Link>
            </Button>
          </div>
        </div>
      </header>
      <main className="flex-1 container py-6">
        <div className="max-w-3xl mx-auto">
          <div className="mb-6">
            <h1 className="text-2xl font-bold">{quiz.title}</h1>
            <div className="flex items-center justify-between mt-2">
              <div className="text-sm text-muted-foreground">
                Question {currentQuestion + 1} of {quiz.questions.length}
              </div>
              <div className="text-sm font-medium">{Math.round(progress)}% Complete</div>
            </div>
            <Progress value={progress} className="mt-2" />
          </div>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Question {currentQuestion + 1}</CardTitle>
              <CardDescription>{question.text}</CardDescription>
            </CardHeader>
            <CardContent>
              <RadioGroup value={answers[currentQuestion]} onValueChange={handleAnswerChange} className="space-y-3">
                {question.options.map((option) => (
                  <div key={option.id} className="flex items-center space-x-2 rounded-md border p-3 hover:bg-muted">
                    <RadioGroupItem value={option.id} id={`option-${option.id}`} />
                    <Label htmlFor={`option-${option.id}`} className="flex-1 cursor-pointer">
                      {option.text}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={handlePrevious} disabled={currentQuestion === 0}>
                Previous
              </Button>
              {currentQuestion < quiz.questions.length - 1 ? (
                <Button onClick={handleNext} disabled={!answers[currentQuestion]}>
                  Next
                </Button>
              ) : (
                <Button onClick={handleSubmit} disabled={answers.some((answer) => answer === null) || isSubmitting}>
                  {isSubmitting ? "Submitting..." : "Submit Quiz"}
                </Button>
              )}
            </CardFooter>
          </Card>

          <div className="grid grid-cols-5 gap-2">
            {quiz.questions.map((_, index) => (
              <Button
                key={index}
                variant={index === currentQuestion ? "default" : answers[index] ? "outline" : "ghost"}
                className="h-10 w-10"
                onClick={() => setCurrentQuestion(index)}
              >
                {index + 1}
              </Button>
            ))}
          </div>

          {answers.some((answer) => answer === null) && (
            <Alert className="mt-6">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Incomplete Quiz</AlertTitle>
              <AlertDescription>
                You have {answers.filter((answer) => answer === null).length} unanswered questions.
              </AlertDescription>
            </Alert>
          )}
        </div>
      </main>
    </div>
  )
}

