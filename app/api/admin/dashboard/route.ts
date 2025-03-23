import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import 'server-only';

export async function GET() {
  try {
    // 1. Get total quizzes count
    const { count: quizzesCount, error: quizzesError } = await supabase
      .from('quizzes')
      .select('*', { count: 'exact', head: true });
    
    if (quizzesError) {
      console.error('Error counting quizzes:', quizzesError);
      throw quizzesError;
    }
    
    // 2. Get total users count
    const { count: usersCount, error: usersError } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true });
    
    if (usersError) {
      console.error('Error counting users:', usersError);
      throw usersError;
    }
    
    // 3. Get total submissions count
    const { count: submissionsCount, error: submissionsError } = await supabase
      .from('submissions')
      .select('*', { count: 'exact', head: true });
    
    if (submissionsError) {
      console.error('Error counting submissions:', submissionsError);
      throw submissionsError;
    }
    
    // 4. Get average score across all submissions
    const { data: avgScoreData, error: avgScoreError } = await supabase
      .from('submissions')
      .select('score, total_possible');
    
    if (avgScoreError) {
      console.error('Error fetching scores:', avgScoreError);
      throw avgScoreError;
    }
    
    let averageScore = 0;
    if (avgScoreData && avgScoreData.length > 0) {
      const totalPercentage = avgScoreData.reduce((sum, submission) => {
        return sum + (submission.score / submission.total_possible * 100);
      }, 0);
      averageScore = Math.round(totalPercentage / avgScoreData.length);
    }
    
    // Return formatted dashboard stats
    return NextResponse.json({
      totalQuizzes: quizzesCount || 0,
      totalUsers: usersCount || 0,
      totalSubmissions: submissionsCount || 0,
      averageScore: averageScore
    });
  } catch (error) {
    console.error('Error fetching admin dashboard data:', error);
    return NextResponse.json(
      { error: 'An error occurred while fetching dashboard data' },
      { status: 500 }
    );
  }
} 