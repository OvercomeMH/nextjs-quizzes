"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { CheckCircle2, XCircle } from "lucide-react"

export default function QuizResultsPage({ params }) {
  const searchParams = useSearchParams()
  const score = Number.parseInt(searchParams.get("score") || "0")
  const total = Number.parseInt(searchParams.get("total") || "1")
  const percentage = Math.round((score / total) * 100)

  const [quiz, setQuiz] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // In a real app, you would fetch the quiz data and user's answers from an API
    setTimeout(() => {
      setQuiz({
        id: params.id,
        title: "Introduction to JavaScript",
        description: "Test your knowledge of JavaScript basics",
        userAnswers: ["c", "b", "a", "c", "c"],
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
      })
      setLoading(false)
    }, 1000)
  }, [params.id])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">Loading results...</div>
      </div>
    )
  }

  const getResultMessage = (percentage) => {
    if (percentage >= 90) return "Excellent! You've mastered this topic."
    if (percentage >= 70) return "Good job! You have a solid understanding."
    if (percentage >= 50) return "Not bad! But there's room for improvement."
    return "Keep studying! You'll get better with practice."
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
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link href="/dashboard">Back to Dashboard</Link>
            </Button>
          </div>
        </div>
      </header>
      <main className="flex-1 container py-6">
        <div className="max-w-3xl mx-auto">
          <Card className="mb-6">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Quiz Results</CardTitle>
              <CardDescription>{quiz.title}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <div className="text-5xl font-bold mb-2">
                  {score}/{total}
                </div>
                <div className="text-xl">{percentage}%</div>
                <Progress value={percentage} className="mt-2" />
                <p className="mt-4 text-muted-foreground">{getResultMessage(percentage)}</p>
              </div>
            </CardContent>
            <CardFooter className="flex justify-center gap-4">
              <Button asChild>
                <Link href={`/quizzes/${params.id}`}>Retake Quiz</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/dashboard">Back to Dashboard</Link>
              </Button>
            </CardFooter>
          </Card>

          <h2 className="text-xl font-bold mb-4">Question Review</h2>
          <div className="space-y-4">
            {quiz.questions.map((question, index) => {
              const userAnswer = quiz.userAnswers[index]
              const isCorrect = userAnswer === question.correctAnswer
              const userOption = question.options.find((opt) => opt.id === userAnswer)
              const correctOption = question.options.find((opt) => opt.id === question.correctAnswer)

              return (
                <Card key={question.id} className={isCorrect ? "border-green-200" : "border-red-200"}>
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-base">Question {index + 1}</CardTitle>
                      {isCorrect ? (
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-500" />
                      )}
                    </div>
                    <CardDescription className="text-base font-medium text-foreground">{question.text}</CardDescription>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <div className="space-y-2">
                      <div className="grid grid-cols-[20px_1fr] gap-2">
                        <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                          {userAnswer}
                        </div>
                        <div>
                          <p className={`${isCorrect ? "text-green-600" : "text-red-600"}`}>
                            Your answer: {userOption?.text}
                          </p>
                        </div>
                      </div>

                      {!isCorrect && (
                        <div className="grid grid-cols-[20px_1fr] gap-2">
                          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-green-500 text-xs text-white">
                            {question.correctAnswer}
                          </div>
                          <div>
                            <p className="text-green-600">Correct answer: {correctOption?.text}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </main>
    </div>
  )
}

