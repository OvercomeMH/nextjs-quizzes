import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { formatDistanceToNow } from 'date-fns';
import 'server-only';

interface SubmissionWithDetails {
  id: string;
  user_id: string;
  quiz_id: string;
  score: number;
  total_possible: number;
  created_at: string;
  users?: {
    full_name?: string;
  };
  quizzes?: {
    title?: string;
  };
}

interface UserWithDetails {
  id: string;
  full_name: string;
  created_at: string;
}

interface QuizWithDetails {
  id: string;
  title: string;
  created_at: string;
}

interface ActivityItem {
  type: 'submission' | 'registration' | 'quiz_creation';
  title: string;
  details: string;
  time: string;
  color: string;
}

export async function GET() {
  try {
    // Get recent submissions
    const { data: recentSubmissions, error: submissionsError } = await supabase
      .from('submissions')
      .select(`
        id,
        user_id,
        quiz_id,
        score,
        total_possible,
        created_at,
        users(full_name),
        quizzes(title)
      `)
      .order('created_at', { ascending: false })
      .limit(3);
    
    if (submissionsError) {
      console.error('Error fetching recent submissions:', submissionsError);
      throw submissionsError;
    }
    
    // Get recent user registrations
    const { data: recentUsers, error: usersError } = await supabase
      .from('users')
      .select('id, full_name, created_at')
      .order('created_at', { ascending: false })
      .limit(2);
    
    if (usersError) {
      console.error('Error fetching recent users:', usersError);
      throw usersError;
    }
    
    // Get recent quiz creations
    const { data: recentQuizzes, error: quizzesError } = await supabase
      .from('quizzes')
      .select('id, title, created_at')
      .order('created_at', { ascending: false })
      .limit(2);
    
    if (quizzesError) {
      console.error('Error fetching recent quizzes:', quizzesError);
      throw quizzesError;
    }
    
    // Format submissions
    const formattedSubmissions: ActivityItem[] = (recentSubmissions as SubmissionWithDetails[]).map(submission => ({
      type: 'submission',
      title: `${submission.users?.full_name || 'Anonymous'} completed "${submission.quizzes?.title || 'Unknown Quiz'}"`,
      details: `Score: ${submission.score}/${submission.total_possible}`,
      time: formatTimeAgo(submission.created_at),
      color: 'green'
    }));
    
    // Format user registrations
    const formattedUsers: ActivityItem[] = (recentUsers as UserWithDetails[]).map(user => ({
      type: 'registration',
      title: `New user registered: ${user.full_name}`,
      details: '',
      time: formatTimeAgo(user.created_at),
      color: 'blue'
    }));
    
    // Format quiz creations
    const formattedQuizzes: ActivityItem[] = (recentQuizzes as QuizWithDetails[]).map(quiz => ({
      type: 'quiz_creation',
      title: `New quiz created: "${quiz.title}"`,
      details: '',
      time: formatTimeAgo(quiz.created_at),
      color: 'yellow'
    }));
    
    // Combine and sort all activity by time (assuming created_at is recent first)
    const allActivity = [
      ...formattedSubmissions,
      ...formattedUsers,
      ...formattedQuizzes
    ];
    
    // If no activities are found, return an empty array
    if (allActivity.length === 0) {
      return NextResponse.json([]);
    }
    
    return NextResponse.json(allActivity);
  } catch (error) {
    console.error('Error fetching recent activity:', error);
    return NextResponse.json(
      { error: 'An error occurred while fetching recent activity' },
      { status: 500 }
    );
  }
}

// Helper function to format time
function formatTimeAgo(dateString: string): string {
  try {
    return formatDistanceToNow(new Date(dateString), { addSuffix: true });
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'recently';
  }
} 