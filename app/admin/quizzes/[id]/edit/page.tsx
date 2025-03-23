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
import { AdminLayout } from "@/components/layouts/AdminLayout"

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
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="w-12 h-12 border-4 border-t-primary border-primary/30 rounded-full animate-spin"></div>
        </div>
      </AdminLayout>
    );
  }

  if (fetchError) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center text-red-500">{fetchError}</div>
        </div>
      </AdminLayout>
    );
  }

  if (!quizData?.[0]) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">Quiz not found</div>
        </div>
      </AdminLayout>
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
    <AdminLayout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Edit Quiz</h1>
            <p className="text-muted-foreground">Update quiz details and questions</p>
          </div>
          <Button variant="outline" asChild>
            <Link href="/admin/quizzes">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Quizzes
            </Link>
          </Button>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Tabs value={currentTab} onValueChange={setCurrentTab} className="space-y-6">
          <TabsList>
            <TabsTrigger value="details">Quiz Details</TabsTrigger>
            <TabsTrigger value="questions">Questions</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>Update the quiz's basic details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={quizTitle}
                    onChange={(e) => setQuizTitle(e.target.value)}
                    placeholder="Enter quiz title"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={quizDescription}
                    onChange={(e) => setQuizDescription(e.target.value)}
                    placeholder="Enter quiz description"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Input
                      id="category"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      placeholder="Enter category"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="difficulty">Difficulty</Label>
                    <Select value={difficulty} onValueChange={setDifficulty}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select difficulty" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="easy">Easy</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="hard">Hard</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="timeLimit">Time Limit (minutes)</Label>
                  <Input
                    id="timeLimit"
                    type="number"
                    value={timeLimit}
                    onChange={(e) => setTimeLimit(e.target.value)}
                    min="1"
                    max="120"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="questions" className="space-y-6">
            {questions.map((question, index) => (
              <Card key={index}>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Question {index + 1}</CardTitle>
                  {questions.length > 1 && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeQuestion(index)}
                      className="text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Question Text</Label>
                    <Textarea
                      value={question.text}
                      onChange={(e) => updateQuestionText(index, e.target.value)}
                      placeholder="Enter question text"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Options</Label>
                    {question.options.map((option) => (
                      <div key={option.id} className="flex items-center gap-2">
                        <RadioGroup
                          value={question.correct_answer}
                          onValueChange={(value) => updateCorrectAnswer(index, value)}
                          className="flex items-center"
                        >
                          <RadioGroupItem value={option.id} id={option.id} />
                        </RadioGroup>
                        <Input
                          value={option.text}
                          onChange={(e) => updateOptionText(index, option.id, e.target.value)}
                          placeholder={`Option ${option.id.toUpperCase()}`}
                          className="flex-1"
                        />
                      </div>
                    ))}
                  </div>
                  <div className="space-y-2">
                    <Label>Points</Label>
                    <Input
                      type="number"
                      value={question.points}
                      onChange={(e) => updateQuestionPoints(index, parseInt(e.target.value))}
                      min="1"
                      max="100"
                    />
                  </div>
                </CardContent>
              </Card>
            ))}

            <Button onClick={addQuestion} className="w-full">
              <Plus className="mr-2 h-4 w-4" />
              Add Question
            </Button>
          </TabsContent>
        </Tabs>

        <div className="mt-6 flex justify-end">
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            <Save className="mr-2 h-4 w-4" />
            {isSubmitting ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>
    </AdminLayout>
  );
} 