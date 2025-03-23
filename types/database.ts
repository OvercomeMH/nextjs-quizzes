import type { TableRow } from '@/lib/supabase'

// Export type aliases for better readability
export type User = TableRow<'users'>
export type Quiz = TableRow<'quizzes'>
export type Question = TableRow<'questions'>
export type QuestionOption = TableRow<'question_possible_answers'>
export type Submission = TableRow<'submissions'>
export type UserAnswer = TableRow<'user_answers'>

// Common type combinations
export type QuizWithQuestions = Quiz & {
  questions: (Question & {
    options: QuestionOption[]
  })[]
}

export type QuestionWithOptions = Question & {
  options: QuestionOption[]
}

export type SubmissionWithAnswers = Submission & {
  user_answers: UserAnswer[]
}

// Utility types for specific views
export type QuizSummary = Pick<Quiz, 'id' | 'title' | 'description' | 'difficulty' | 'total_questions' | 'average_rating'>

export type UserProfile = Pick<User, 'username' | 'full_name' | 'email' | 'rank' | 'total_points' | 'quizzes_taken'>

// Frontend-specific types that combine database types with UI needs
export type QuizWithMetadata = Quiz & {
  metadata: {
    createdAt: string;
    updatedAt: string;
    totalQuestions: number;
    totalPoints: number;
    averageRating: number;
    timesPlayed: number;
  }
}

export type QuizWithQuestionsAndMetadata = QuizWithMetadata & {
  questions: (Question & {
    options: QuestionOption[]
    correctAnswer: string  // Alias for correct_answer
  })[]
} 