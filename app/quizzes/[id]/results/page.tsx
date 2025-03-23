"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import React from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { CheckCircle2, XCircle } from "lucide-react"
import { useAuth } from "@/components/auth/AuthProvider"
import { supabase } from "@/lib/supabase"
import { QuizWithQuestions, Question, QuestionOption } from "@/types/database"
import { useDataFetching } from "@/hooks/useDataFetching"

interface PageParams {
  id: string;
}

export default function QuizResultsPage({ params }: { params: Promise<PageParams> }) {
  // Unwrap params using React.use()
  const unwrappedParams = React.use(params);
  const quizId = unwrappedParams.id;
  
  // Get auth context
  const { user } = useAuth();
  
  const searchParams = useSearchParams();
  const score = Number.parseInt(searchParams.get("score") || "0");
  const total = Number.parseInt(searchParams.get("total") || "1");
  const percentage = Math.round((score / total) * 100);

  const [userAnswers, setUserAnswers] = useState<string[]>([]);
  
  // Fetch quiz data using our hook
  const { data: quizData, loading, error } = useDataFetching<'quizzes'>({
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

  // Get answers from query params
  useEffect(() => {
    const answersParam = searchParams.get("answers");
    const answers = answersParam ? JSON.parse(decodeURIComponent(answersParam)) : [];
    setUserAnswers(answers);
  }, [searchParams]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="w-12 h-12 border-4 border-t-primary border-primary/30 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center text-red-500">{error}</div>
      </div>
    );
  }

  if (!quizData?.[0]) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">Quiz results not found</div>
      </div>
    );
  }

  const quiz = quizData[0] as QuizWithQuestions;

  const getResultMessage = (percentage: number): string => {
    if (percentage >= 90) return "Excellent! You've mastered this topic.";
    if (percentage >= 70) return "Good job! You have a solid understanding.";
    if (percentage >= 50) return "Not bad! But there's room for improvement.";
    return "Keep studying! You'll get better with practice.";
  };

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
              <div className="text-center space-y-4">
                <h1 className="text-4xl font-bold">Quiz Complete!</h1>
                <div className="text-6xl font-bold text-primary">{percentage}%</div>
                <p className="text-muted-foreground">
                  You scored {score}/{total} points ({percentage}%)
                </p>
              </div>
            </CardContent>
            <CardFooter className="flex justify-center gap-4">
              <Button asChild>
                <Link href={`/quizzes/${quizId}`}>Retake Quiz</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/dashboard">Back to Dashboard</Link>
              </Button>
            </CardFooter>
          </Card>

          <h2 className="text-xl font-bold mb-4">Question Review</h2>
          <div className="space-y-4">
            {quiz.questions.map((question: Question & { options: QuestionOption[] }, index: number) => {
              const userAnswer = userAnswers[index] || '';
              const isCorrect = userAnswer === question.correct_answer;
              const userOption = question.options.find((opt: QuestionOption) => opt.id === userAnswer);
              const correctOption = question.options.find((opt: QuestionOption) => opt.id === question.correct_answer);

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
                          {userAnswer || '-'}
                        </div>
                        <div>
                          <p className={`${isCorrect ? "text-green-600" : "text-red-600"}`}>
                            Your answer: {userOption?.text || 'Not answered'}
                          </p>
                        </div>
                      </div>

                      {!isCorrect && (
                        <div className="grid grid-cols-[20px_1fr] gap-2">
                          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-green-500 text-xs text-white">
                            {question.correct_answer}
                          </div>
                          <div>
                            <p className="text-green-600">Correct answer: {correctOption?.text}</p>
                          </div>
                        </div>
                      )}
                      
                      {question.explanation && (
                        <div className="mt-2 p-2 bg-muted rounded">
                          <p className="text-sm">{question.explanation}</p>
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

