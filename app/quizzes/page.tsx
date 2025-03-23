"use client"

import { useState } from "react"
import Link from "next/link"
import { useAuth } from "@/components/auth/AuthProvider"
import { useDataFetching } from "@/hooks/useDataFetching"
import type { Database } from '@/lib/database.types'

// Define types for our data
type Quiz = Database['public']['Tables']['quizzes']['Row'];
type Submission = Database['public']['Tables']['submissions']['Row'];

function QuizCard({ quiz, isCompleted }: { quiz: Quiz & { submissions?: Submission[] }, isCompleted: boolean }) {
  // Find the user's submission if completed
  const { user } = useAuth();
  const userSubmission = quiz.submissions?.find(sub => sub.user_id === user?.id);

  return (
    <div className="mb-4 p-4 border rounded">
      <h2 className="text-xl font-bold">{quiz.title}</h2>
      <p className="text-gray-600">{quiz.description}</p>
      <div className="mt-2 space-x-2">
        <span className="inline-block px-2 py-1 text-sm bg-gray-100 rounded">{quiz.difficulty}</span>
        <span className="inline-block px-2 py-1 text-sm bg-gray-100 rounded">{quiz.total_questions || 0} Questions</span>
        {isCompleted && userSubmission && (
          <span className="inline-block px-2 py-1 text-sm bg-green-100 rounded">
            Score: {Math.round((userSubmission.score / userSubmission.total_possible) * 100)}%
          </span>
        )}
      </div>
      <Link 
        href={`/quizzes/${quiz.id}`} 
        className="mt-4 inline-block px-4 py-2 bg-black text-white rounded"
      >
        {isCompleted ? 'Retake Quiz' : 'Start Quiz'}
      </Link>
    </div>
  );
}

export default function QuizzesPage() {
  const { user } = useAuth();
  
  // Fetch all quizzes with their submissions
  const { data: quizData, loading, error } = useDataFetching<'quizzes', [], [], [
    {
      table: 'submissions',
      on: 'quiz_id',
      select: '*'
    }
  ]>({
    table: 'quizzes',
    select: `
      id,
      title,
      description,
      difficulty,
      category,
      time_limit,
      total_questions,
      submissions (
        id,
        user_id,
        score,
        total_possible,
        created_at
      )
    `,
    orderBy: { column: 'created_at', ascending: false }
  });

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  // Separate quizzes into completed and available
  const completedQuizzes = quizData?.filter((quiz: Quiz & { submissions?: Submission[] }) => 
    user && quiz.submissions?.some((sub: Submission) => sub.user_id === user.id)
  ) || [];

  const availableQuizzes = quizData?.filter((quiz: Quiz & { submissions?: Submission[] }) => 
    !user || !quiz.submissions?.some((sub: Submission) => sub.user_id === user.id)
  ) || [];

  return (
    <div className="max-w-4xl mx-auto p-4">
      {/* Available Quizzes Section */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-4">Available Quizzes</h1>
        {availableQuizzes.length > 0 ? (
          availableQuizzes.map((quiz: Quiz & { submissions?: Submission[] }) => (
            <QuizCard key={quiz.id} quiz={quiz} isCompleted={false} />
          ))
        ) : (
          <p className="text-gray-600">No available quizzes found.</p>
        )}
      </div>

      {/* Completed Quizzes Section */}
      {user && completedQuizzes.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold mb-4">Completed Quizzes</h2>
          {completedQuizzes.map((quiz: Quiz & { submissions?: Submission[] }) => (
            <QuizCard key={quiz.id} quiz={quiz} isCompleted={true} />
          ))}
        </div>
      )}

      {/* Show login message if not logged in */}
      {!user && (
        <div className="mt-8 p-4 bg-gray-50 rounded">
          <p className="text-gray-600">
            <Link href="/login" className="text-blue-600 hover:underline">Log in</Link>
            {' '}to track your quiz progress and see your completed quizzes.
          </p>
        </div>
      )}
    </div>
  );
} 