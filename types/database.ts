import type { Database } from '@/lib/database.types';

// Export type aliases for better readability
export type User = Database['public']['Tables']['users']['Row'];
export type Quiz = Database['public']['Tables']['quizzes']['Row'];
export type Question = Database['public']['Tables']['questions']['Row'];
export type QuestionOption = Database['public']['Tables']['question_possible_answers']['Row'];
export type Submission = Database['public']['Tables']['submissions']['Row'];
export type UserAnswer = Database['public']['Tables']['user_answers']['Row'];

// Common type combinations
export type QuizWithQuestions = Quiz & {
  questions: (Question & {
    options: QuestionOption[]
  })[]
}

export type QuizWithSubmissions = Quiz & {
  submissions: Submission[]
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