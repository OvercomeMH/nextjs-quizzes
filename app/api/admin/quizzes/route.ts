import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import 'server-only';

export async function GET() {
  try {
    // Get quiz data with aggregated submission counts and scores
    const { data: quizzes, error: quizzesError } = await supabase
      .from('quizzes')
      .select(`
        id, 
        title, 
        description, 
        difficulty,
        category,
        total_questions,
        total_points,
        times_played,
        average_rating
      `)
      .order('created_at', { ascending: false });
    
    if (quizzesError) {
      console.error('Error fetching quizzes:', quizzesError);
      throw quizzesError;
    }
    
    if (!quizzes) {
      return NextResponse.json([]);
    }
    
    // For each quiz, get the average score from submissions
    const quizzesWithStats = await Promise.all(quizzes.map(async (quiz) => {
      // Get submissions for this quiz
      const { data: submissions, error: submissionsError } = await supabase
        .from('submissions')
        .select('score, total_possible')
        .eq('quiz_id', quiz.id);
      
      if (submissionsError) {
        console.error(`Error fetching submissions for quiz ${quiz.id}:`, submissionsError);
        return {
          id: quiz.id,
          title: quiz.title,
          description: quiz.description,
          questions: quiz.total_questions || 0,
          submissions: quiz.times_played || 0,
          averageScore: 0
        };
      }
      
      // Calculate average score
      let averageScore = 0;
      if (submissions && submissions.length > 0) {
        const totalPercentage = submissions.reduce((sum, submission) => {
          return sum + (submission.score / submission.total_possible * 100);
        }, 0);
        averageScore = Math.round(totalPercentage / submissions.length);
      }
      
      return {
        id: quiz.id,
        title: quiz.title,
        description: quiz.description,
        questions: quiz.total_questions || 0,
        submissions: submissions?.length || quiz.times_played || 0,
        averageScore: averageScore
      };
    }));
    
    return NextResponse.json(quizzesWithStats);
  } catch (error) {
    console.error('Error fetching admin quizzes data:', error);
    return NextResponse.json(
      { error: 'An error occurred while fetching quizzes data' },
      { status: 500 }
    );
  }
} 