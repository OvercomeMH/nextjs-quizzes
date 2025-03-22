"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import React from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { CheckCircle2, XCircle } from "lucide-react"

// Define types
interface QuizOption {
  id: string;
  text: string;
}

interface QuizQuestion {
  id: string;
  text: string;
  type: string;
  points: number;
  options: QuizOption[];
  correctAnswer: string;
  explanation?: string;
}

interface Quiz {
  id: string;
  title: string;
  description: string;
  difficulty: string;
  questions: QuizQuestion[];
  timeLimit: number;
  metadata: {
    createdAt: string;
    updatedAt: string;
    totalQuestions: number;
    totalPoints: number;
    averageRating: number;
    timesPlayed: number;
  };
}

interface PageParams {
  id: string;
}

export default function QuizResultsPage({ params }: { params: Promise<PageParams> }) {
  // Unwrap params using React.use()
  const unwrappedParams = React.use(params);
  const quizId = unwrappedParams.id;
  
  const searchParams = useSearchParams();
  const score = Number.parseInt(searchParams.get("score") || "0");
  const total = Number.parseInt(searchParams.get("total") || "1");
  const percentage = Math.round((score / total) * 100);

  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [userAnswers, setUserAnswers] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Get answers from query params
    const answersParam = searchParams.get("answers");
    const answers = answersParam ? JSON.parse(decodeURIComponent(answersParam)) : [];
    setUserAnswers(answers);
    
    // Fetch quiz data from API
    const fetchQuiz = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/quizzes/${quizId}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            setError("Quiz not found");
          } else {
            setError("Failed to load quiz");
          }
          setLoading(false);
          return;
        }
        
        const quizData = await response.json();
        setQuiz(quizData);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching quiz:", err);
        setError("Failed to load quiz. Please try again later.");
        setLoading(false);
      }
    };
    
    fetchQuiz();
  }, [quizId, searchParams]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">Loading results...</div>
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

  if (!quiz) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">Quiz results not found</div>
      </div>
    );
  }

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
                <Link href={`/quizzes/${quizId}`}>Retake Quiz</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/dashboard">Back to Dashboard</Link>
              </Button>
            </CardFooter>
          </Card>

          <h2 className="text-xl font-bold mb-4">Question Review</h2>
          <div className="space-y-4">
            {quiz.questions.map((question, index) => {
              const userAnswer = userAnswers[index] || '';
              const isCorrect = userAnswer === question.correctAnswer;
              const userOption = question.options.find((opt) => opt.id === userAnswer);
              const correctOption = question.options.find((opt) => opt.id === question.correctAnswer);

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
                            {question.correctAnswer}
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

