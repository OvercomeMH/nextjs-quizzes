import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import 'server-only';
import type { Database } from '@/lib/database.types';

// Define types using the database types
type Submission = Database['public']['Tables']['submissions']['Row'] & {
  users?: {
    full_name: string | null;
  } | null;
  answers?: string | Record<string, any>;
  completion_time?: number;
}

type Question = Database['public']['Tables']['questions']['Row'];

interface QuestionStat {
  id: string;
  question: string;
  question_number?: number;
  correct: number;
  incorrect: number;
}

interface ScoreDistribution {
  score: number;
  count: number;
}

interface CompletionTime {
  time: number;
  count: number;
}

interface CompletionTimePoint {
  score: number;
  time: number;
}

interface SubmissionOverTime {
  date: string;
  count: number;
}

interface RecentSubmission {
  id: string;
  score: number;
  total_possible: number;
  time_spent: number | null;
  created_at: string | null;
  user?: {
    full_name: string | null;
  } | null;
}

// Helper to calculate question statistics
function getQuestionStats(submissions: Submission[], questions: Question[]): QuestionStat[] {
  // Create a map to track correct/incorrect answers for each question
  const questionStats: Record<string, QuestionStat> = {};
  
  // Initialize stats for each question
  questions.forEach(q => {
    questionStats[q.id] = {
      id: q.id,
      question: q.text.substring(0, 30) || `Question ${q.id.substring(0, 5)}`,
      question_number: q.order_num,
      correct: 0,
      incorrect: 0
    };
  });
  
  // Process answers from submissions
  submissions.forEach(sub => {
    if (sub.answers) {
      try {
        const answers = typeof sub.answers === 'string' ? JSON.parse(sub.answers) : sub.answers;
        
        // Count correct/incorrect answers
        Object.entries(answers).forEach(([questionId, answer]: [string, any]) => {
          if (questionStats[questionId]) {
            if (answer.correct) {
              questionStats[questionId].correct++;
            } else {
              questionStats[questionId].incorrect++;
            }
          }
        });
      } catch (e) {
        console.error('Error parsing answers:', e);
      }
    }
  });
  
  return Object.values(questionStats);
}

// Helper to calculate score distribution
function getScoreDistribution(submissions: Submission[]): ScoreDistribution[] {
  const distribution: Record<number, number> = {};
  
  submissions.forEach(sub => {
    const score = Math.round((sub.score / sub.total_possible) * 100);
    distribution[score] = (distribution[score] || 0) + 1;
  });
  
  return Object.entries(distribution).map(([score, count]) => ({
    score: parseInt(score),
    count
  }));
}

// Helper to calculate time distribution
function getTimeDistribution(submissions: Submission[]): CompletionTime[] {
  const distribution: Record<number, number> = {};
  
  submissions.forEach(sub => {
    if (sub.time_spent) {
      const timeInMinutes = Math.round(sub.time_spent / 60);
      distribution[timeInMinutes] = (distribution[timeInMinutes] || 0) + 1;
    }
  });
  
  return Object.entries(distribution).map(([time, count]) => ({
    time: parseInt(time),
    count
  }));
}

// Helper to calculate submissions over time
function getSubmissionsOverTime(submissions: Submission[]): SubmissionOverTime[] {
  const distribution: Record<string, number> = {};
  
  submissions.forEach(sub => {
    if (sub.created_at) {
      const date = new Date(sub.created_at).toLocaleDateString();
      distribution[date] = (distribution[date] || 0) + 1;
    }
  });
  
  return Object.entries(distribution).map(([date, count]) => ({
    date,
    count
  }));
}

// Helper to format recent submissions
function getRecentSubmissions(submissions: Submission[]): RecentSubmission[] {
  return submissions.slice(0, 5).map(sub => ({
    id: sub.id,
    score: sub.score,
    total_possible: sub.total_possible,
    time_spent: sub.time_spent,
    created_at: sub.created_at,
    user: sub.users
  }));
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const quizId = params.id;

    // Fetch submissions for this quiz
    const { data: submissionsData, error: submissionsError } = await supabase
      .from('submissions')
      .select(`
        *,
        users (
          full_name
        )
      `)
      .eq('quiz_id', quizId)
      .order('created_at', { ascending: false });

    if (submissionsError) {
      console.error('Error fetching submissions:', submissionsError);
      return NextResponse.json({ error: 'Failed to fetch submissions' }, { status: 500 });
    }

    // Fetch questions for this quiz
    const { data: questions, error: questionsError } = await supabase
      .from('questions')
      .select('*')
      .eq('quiz_id', quizId)
      .order('order_num', { ascending: true });

    if (questionsError) {
      console.error('Error fetching questions:', questionsError);
      return NextResponse.json({ error: 'Failed to fetch questions' }, { status: 500 });
    }

    if (!questions) {
      return NextResponse.json({ error: 'No questions found' }, { status: 404 });
    }

    // Get time and score distributions
    const timeDistribution = getTimeDistribution(submissionsData || []);
    const scoreDistribution = getScoreDistribution(submissionsData || []);
    
    // Calculate question statistics
    const questionStats = getQuestionStats(submissionsData || [], questions);
    
    // Calculate submissions over time
    const submissionsOverTime = getSubmissionsOverTime(submissionsData || []);
    
    // Format recent submissions
    const recentSubmissions = getRecentSubmissions(submissionsData || []);

    // Build the response
    return NextResponse.json({
      totalSubmissions: submissionsData?.length || 0,
      averageScore: submissionsData?.reduce((acc, sub) => acc + sub.score, 0) / (submissionsData?.length || 1),
      questionStats,
      scoreDistribution,
      completionTime: timeDistribution,
      submissionsOverTime,
      recentSubmissions
    });
  } catch (error) {
    console.error('Error in analytics route:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}