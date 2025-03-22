"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { AlertCircle, Clock } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

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

export default function QuizPage({ params }: { params: Promise<PageParams> }) {
  // Unwrap params using React.use()
  const unwrappedParams = React.use(params);
  const quizId = unwrappedParams.id;
  
  const router = useRouter();
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(600); // Default to 10 minutes, will be updated from quiz data
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
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
        
        // Initialize answers array with null values
        setAnswers(new Array(quizData.questions.length).fill(null));
        
        // Set time limit from quiz data
        setTimeLeft(quizData.timeLimit);
        
        setLoading(false);
      } catch (err) {
        console.error("Error fetching quiz:", err);
        setError("Failed to load quiz. Please try again later.");
        setLoading(false);
      }
    };
    
    fetchQuiz();
  }, [quizId]);

  useEffect(() => {
    if (!quiz) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [quiz]);

  const handleAnswerChange = (value: string) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = value;
    setAnswers(newAnswers);
  };

  const handleNext = () => {
    if (quiz && currentQuestion < quiz.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleSubmit = () => {
    if (!quiz) return;
    
    setIsSubmitting(true);

    // Calculate score
    let score = 0;
    answers.forEach((answer, index) => {
      if (answer === quiz.questions[index].correctAnswer) {
        score += quiz.questions[index].points;
      }
    });

    // Encode answers as URL parameter
    const encodedAnswers = encodeURIComponent(JSON.stringify(answers));
    
    // In a real app, you would submit the answers to an API
    setTimeout(() => {
      router.push(`/quizzes/${quizId}/results?score=${score}&total=${quiz.metadata.totalPoints}&answers=${encodedAnswers}`);
    }, 1000);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">Loading quiz...</div>
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
        <div className="text-center">Quiz not found</div>
      </div>
    );
  }

  const question = quiz.questions[currentQuestion];
  const progress = ((currentQuestion + 1) / quiz.questions.length) * 100;

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

