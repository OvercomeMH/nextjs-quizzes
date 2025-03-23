import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import 'server-only';

interface SubmissionWithQuiz {
  quiz_id: string;
  quizzes?: {
    title?: string;
  };
}

export async function GET() {
  try {
    // Get all quiz submissions
    const { data: submissions, error: submissionsError } = await supabase
      .from('submissions')
      .select(`
        quiz_id,
        quizzes(title)
      `);
    
    if (submissionsError) {
      console.error('Error fetching submissions:', submissionsError);
      throw submissionsError;
    }
    
    if (!submissions) {
      return NextResponse.json([]);
    }
    
    // Count submissions per quiz
    const submissionCounts: Record<string, number> = {};
    const quizTitles: Record<string, string> = {};
    
    (submissions as SubmissionWithQuiz[]).forEach(submission => {
      const quizId = submission.quiz_id;
      // If the quiz title exists in the joined data, use it, otherwise use a placeholder
      const quizTitle = submission.quizzes?.title || 'Unknown Quiz';
      
      submissionCounts[quizId] = (submissionCounts[quizId] || 0) + 1;
      quizTitles[quizId] = quizTitle;
    });
    
    // Format data for the chart
    const submissionsData = Object.keys(submissionCounts)
      .map(quizId => ({
        name: quizTitles[quizId],
        submissions: submissionCounts[quizId]
      }))
      .sort((a, b) => b.submissions - a.submissions)
      .slice(0, 5); // Get top 5
    
    return NextResponse.json(submissionsData);
  } catch (error) {
    console.error('Error fetching submissions chart data:', error);
    return NextResponse.json(
      { error: 'An error occurred while fetching submissions data' },
      { status: 500 }
    );
  }
} 