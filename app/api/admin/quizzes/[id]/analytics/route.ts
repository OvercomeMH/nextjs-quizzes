import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import 'server-only';

// Define types
interface Submission {
  id: string;
  quiz_id: string;
  user_id: string;
  score: number;
  total_possible: number;
  completion_time: number;
  created_at: string;
  answers?: string | Record<string, any>;
  users?: {
    display_name: string;
  };
}

interface Question {
  id: string;
  quiz_id: string;
  question_text?: string;
  question_number?: number;
}

interface CompletionTimePoint {
  id: string;
  user: string;
  time: number;
  score: number;
  maxScore: number;
  date: string;
}

interface TimeBin {
  time: string;
  count: number;
}

interface ScoreRange {
  score: string;
  count: number;
}

interface QuestionStat {
  id: string;
  question: string;
  question_number?: number;
  correct: number;
  incorrect: number;
}

// Helper to calculate time distribution from seconds
function getTimeDistribution(submissions: Submission[]): { 
  timeBins: TimeBin[]; 
  completionTimes: CompletionTimePoint[] 
} {
  // Create time bins
  const timeBins: Record<string, number> = {
    'under 5min': 0,
    '5-10min': 0,
    '10-15min': 0, 
    '15-30min': 0,
    '30-60min': 0,
    'over 60min': 0
  };
  
  // Map for scatter plot data
  const completionTimes: CompletionTimePoint[] = [];
  
  submissions.forEach(sub => {
    // Skip submissions without completion time
    if (sub.completion_time === null || sub.completion_time === undefined) {
      return;
    }
    
    const timeInMinutes = Math.round(sub.completion_time / 60);
    
    // Add to scatter plot data
    completionTimes.push({
      id: sub.id,
      user: formatUserId(sub.user_id),
      time: timeInMinutes,
      score: sub.score,
      maxScore: sub.total_possible,
      date: sub.created_at
    });
    
    // Increment appropriate bin
    if (timeInMinutes < 5) timeBins['under 5min']++;
    else if (timeInMinutes < 10) timeBins['5-10min']++;
    else if (timeInMinutes < 15) timeBins['10-15min']++;
    else if (timeInMinutes < 30) timeBins['15-30min']++;
    else if (timeInMinutes < 60) timeBins['30-60min']++;
    else timeBins['over 60min']++;
  });
  
  return {
    timeBins: Object.entries(timeBins).map(([time, count]) => ({ time, count })),
    completionTimes
  };
}

// Helper to calculate score distribution
function getScoreDistribution(submissions: Submission[]): ScoreRange[] {
  const distribution: Record<string, number> = {
    '0-20%': 0,
    '21-40%': 0,
    '41-60%': 0,
    '61-80%': 0,
    '81-100%': 0
  };
  
  submissions.forEach(sub => {
    const percentage = Math.floor((sub.score / sub.total_possible) * 100);
    
    if (percentage <= 20) distribution['0-20%']++;
    else if (percentage <= 40) distribution['21-40%']++;
    else if (percentage <= 60) distribution['41-60%']++;
    else if (percentage <= 80) distribution['61-80%']++;
    else distribution['81-100%']++;
  });
  
  return Object.entries(distribution).map(([score, count]) => ({ score, count }));
}

// Helper to calculate question statistics
function getQuestionStats(submissions: Submission[], questions: Question[]): QuestionStat[] {
  // Create a map to track correct/incorrect answers for each question
  const questionStats: Record<string, QuestionStat> = {};
  
  // Initialize stats for each question
  questions.forEach(q => {
    questionStats[q.id] = {
      id: q.id,
      question: q.question_text?.substring(0, 30) || `Question ${q.id.substring(0, 5)}`,
      question_number: undefined,
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

// Helper to format seconds into minutes and seconds
function formatTime(seconds: number | null | undefined): string {
  if (!seconds) return 'N/A';
  
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  
  return `${mins}m ${secs}s`;
}

// Helper to calculate time ago
function getTimeAgo(date: Date): string {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) return 'just now';
  
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
  
  const diffInMonths = Math.floor(diffInDays / 30);
  return `${diffInMonths} month${diffInMonths > 1 ? 's' : ''} ago`;
}

// Helper to format a user ID safely
function formatUserId(userId: string | null | undefined): string {
  if (!userId) return 'Anonymous';
  
  try {
    return `User ${userId.substring(0, 8)}...`;
  } catch (e) {
    return 'Anonymous';
  }
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Await params to get the quiz ID
    const unwrappedParams = await params;
    const quizId = unwrappedParams.id;
    
    // 1. Fetch quiz details
    const { data: quiz, error: quizError } = await supabase
      .from('quizzes')
      .select('*')
      .eq('id', quizId)
      .single();
    
    if (quizError) {
      console.error('Error fetching quiz details:', quizError);
      return NextResponse.json(
        { error: 'Quiz not found' },
        { status: 404 }
      );
    }
    
    // 2. Fetch submissions for this quiz
    const { data: submissions, error: submissionsError } = await supabase
      .from('submissions')
      .select('*')
      .eq('quiz_id', quizId)
      .order('created_at', { ascending: false });
    
    if (submissionsError) {
      console.error('Error fetching submissions:', submissionsError);
      return NextResponse.json(
        { error: 'Failed to fetch quiz submissions' },
        { status: 500 }
      );
    }

    // 3. Fetch questions for this quiz
    const { data: questions, error: questionsError } = await supabase
      .from('questions')
      .select('id, quiz_id, question_text')
      .eq('quiz_id', quizId)
      .order('id', { ascending: true });
    
    if (questionsError) {
      console.error('Error fetching questions:', questionsError);
    }
    
    // 4. Process data for analytics
    const submissionsData: Submission[] = submissions || [];
    const questionsData: Question[] = questions || [];
    
    // Calculate stats
    const totalSubmissions = submissionsData.length;
    let averageScore = 0;
    
    if (totalSubmissions > 0) {
      const totalPercentage = submissionsData.reduce((sum, sub) => {
        return sum + (sub.score / sub.total_possible * 100);
      }, 0);
      averageScore = Math.round(totalPercentage / totalSubmissions);
    }
    
    // Get time and score distributions
    const { timeBins, completionTimes } = getTimeDistribution(submissionsData);
    const scoreDistribution = getScoreDistribution(submissionsData);
    
    // Get question stats
    const questionStats = questions && questions.length > 0 
      ? getQuestionStats(submissionsData, questionsData)
      : [];
    
    // Calculate submissions over time (last 7 days)
    const submissionsOverTime = [];
    const now = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      
      const daySubmissions = submissionsData.filter(sub => {
        const subDate = new Date(sub.created_at);
        return subDate.getDate() === date.getDate() && 
               subDate.getMonth() === date.getMonth() && 
               subDate.getFullYear() === date.getFullYear();
      });
      
      submissionsOverTime.push({
        date: dateStr,
        submissions: daySubmissions.length
      });
    }
    
    // Format recent submissions
    const recentSubmissions = submissionsData.slice(0, 10).map(sub => {
      const date = new Date(sub.created_at);
      const timeAgo = getTimeAgo(date);
      
      return {
        id: sub.id,
        user: formatUserId(sub.user_id),
        score: `${sub.score}/${sub.total_possible}`,
        percentage: Math.round((sub.score / sub.total_possible) * 100),
        time: formatTime(sub.completion_time),
        date: timeAgo
      };
    });
    
    // Build the response
    const analyticsData = {
      id: quiz?.id || quizId,
      title: quiz?.title || 'Quiz Details',
      description: quiz?.description || '',
      totalSubmissions,
      averageScore,
      questionStats,
      scoreDistribution,
      completionTime: timeBins,
      completionTimeScatter: completionTimes,
      submissionsOverTime,
      recentSubmissions
    };
    
    return NextResponse.json(analyticsData);
  } catch (error) {
    console.error('Error fetching quiz analytics:', error);
    return NextResponse.json(
      { error: 'An error occurred while fetching quiz analytics' },
      { status: 500 }
    );
  }
} 