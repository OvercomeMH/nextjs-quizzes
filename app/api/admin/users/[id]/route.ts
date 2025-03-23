import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import 'server-only';

interface SubmissionWithQuiz {
  id: string;
  quiz_id: string;
  score: number;
  total_possible: number;
  time_spent: number | null;
  created_at: string;
  quizzes?: {
    title?: string;
    difficulty?: string;
  };
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const userId = params.id;
    
    // Fetch user details from Supabase
    const { data: user, error: userError } = await supabase
      .from('users')
      .select(`
        id,
        username,
        full_name,
        email,
        created_at,
        quizzes_taken,
        average_score,
        total_points,
        rank,
        email_notifications,
        public_profile
      `)
      .eq('id', userId)
      .single();
    
    if (userError) {
      console.error('Error fetching user details:', userError);
      if (userError.code === 'PGRST116') {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }
      return NextResponse.json(
        { error: "An error occurred while fetching user details" },
        { status: 500 }
      );
    }

    // Fetch user's quiz submissions
    const { data: submissions, error: submissionsError } = await supabase
      .from('submissions')
      .select(`
        id,
        quiz_id,
        score,
        total_possible,
        time_spent,
        created_at,
        quizzes(title, difficulty)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(10);

    if (submissionsError) {
      console.error('Error fetching user submissions:', submissionsError);
      // Continue without submissions data
    }

    // Format user data with submissions
    const formattedUser = {
      id: user.id,
      username: user.username || 'No Username',
      name: user.full_name || 'Unknown User',
      email: user.email || 'No Email',
      joinedAt: user.created_at,
      stats: {
        quizzesTaken: user.quizzes_taken || 0,
        averageScore: user.average_score || 0,
        totalPoints: user.total_points || 0,
        rank: user.rank || 'Beginner'
      },
      preferences: {
        emailNotifications: user.email_notifications || false,
        publicProfile: user.public_profile || false
      },
      recentSubmissions: (submissions as SubmissionWithQuiz[])?.map(submission => ({
        id: submission.id,
        quizId: submission.quiz_id,
        quizTitle: submission.quizzes?.title || 'Unknown Quiz',
        quizDifficulty: submission.quizzes?.difficulty || 'Unknown',
        score: submission.score,
        totalPossible: submission.total_possible,
        percentage: Math.round((submission.score / submission.total_possible) * 100),
        timeSpent: submission.time_spent ? `${Math.floor(submission.time_spent / 60)}m ${submission.time_spent % 60}s` : 'Unknown',
        completedAt: submission.created_at
      })) || []
    };
    
    return NextResponse.json(formattedUser);
  } catch (error) {
    console.error('Error fetching user details:', error);
    return NextResponse.json(
      { error: 'An error occurred while fetching user details' },
      { status: 500 }
    );
  }
} 