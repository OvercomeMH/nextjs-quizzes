import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { formatDistanceToNow } from 'date-fns';
import 'server-only';
import type { Database } from '@/lib/database.types';

type SubmissionWithDetails = Database['public']['Tables']['submissions']['Row'] & {
  users?: {
    full_name: string | null;
  } | null;
  quizzes?: {
    title: string | null;
  } | null;
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

export async function GET(request: Request) {
  try {
    const { data: submissions, error } = await supabase
      .from('submissions')
      .select(`
        *,
        users (
          full_name
        ),
        quizzes (
          title
        )
      `)
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) {
      console.error('Error fetching recent submissions:', error);
      return NextResponse.json({ error: 'Failed to fetch recent submissions' }, { status: 500 });
    }

    const recentSubmissions = (submissions as SubmissionWithDetails[]).map(sub => ({
      id: sub.id,
      user: sub.users?.full_name || 'Anonymous',
      quiz: sub.quizzes?.title || 'Unknown Quiz',
      score: sub.score,
      total_possible: sub.total_possible,
      time: sub.created_at ? formatDistanceToNow(new Date(sub.created_at), { addSuffix: true }) : 'Unknown time'
    }));

    return NextResponse.json(recentSubmissions);
  } catch (error) {
    console.error('Error in recent submissions route:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
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