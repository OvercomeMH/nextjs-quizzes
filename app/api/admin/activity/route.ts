import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { formatDistanceToNow } from 'date-fns';
import 'server-only';

// Define interfaces for the data we'll be working with
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
  id: string;
  type: 'submission' | 'registration' | 'quiz_creation';
  title: string;
  details: string;
  time: string;
  timestamp: string;
  color: string;
  user_id?: string;
  quiz_id?: string;
}

interface DateFilter {
  gte?: string;
  lte?: string;
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    
    // Parse query parameters
    const type = url.searchParams.get('type');
    const startDate = url.searchParams.get('startDate');
    const endDate = url.searchParams.get('endDate');
    const userId = url.searchParams.get('userId');
    const quizId = url.searchParams.get('quizId');
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '20');
    
    const offset = (page - 1) * limit;
    
    // Initialize arrays for different activity types
    let submissionActivities: ActivityItem[] = [];
    let userActivities: ActivityItem[] = [];
    let quizActivities: ActivityItem[] = [];
    
    // Conditionally fetch submissions
    if (!type || type === 'submission') {
      let query = supabase
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
        .order('created_at', { ascending: false });
      
      // Apply filters
      if (startDate) {
        query = query.gte('created_at', startDate);
      }
      if (endDate) {
        query = query.lte('created_at', endDate);
      }
      if (userId) {
        query = query.eq('user_id', userId);
      }
      if (quizId) {
        query = query.eq('quiz_id', quizId);
      }
      
      // Get count for pagination
      const countQuery = supabase
        .from('submissions')
        .select('id', { count: 'exact' });
      
      // Apply same filters to count query
      if (startDate) {
        countQuery.gte('created_at', startDate);
      }
      if (endDate) {
        countQuery.lte('created_at', endDate);
      }
      if (userId) {
        countQuery.eq('user_id', userId);
      }
      if (quizId) {
        countQuery.eq('quiz_id', quizId);
      }
      
      const { count: submissionsCount } = await countQuery;
      
      // Paginate results
      const { data: recentSubmissions, error: submissionsError } = await query
        .range(offset, offset + limit - 1);
      
      if (submissionsError) {
        console.error('Error fetching submissions:', submissionsError);
        throw submissionsError;
      }
      
      // Format submissions
      submissionActivities = (recentSubmissions as SubmissionWithDetails[]).map(submission => ({
        id: submission.id,
        type: 'submission',
        title: `${submission.users?.full_name || 'Anonymous'} completed "${submission.quizzes?.title || 'Unknown Quiz'}"`,
        details: `Score: ${submission.score}/${submission.total_possible}`,
        time: formatTimeAgo(submission.created_at),
        timestamp: submission.created_at,
        color: 'green',
        user_id: submission.user_id,
        quiz_id: submission.quiz_id
      }));
    }
    
    // Conditionally fetch user registrations
    if (!type || type === 'registration') {
      let query = supabase
        .from('users')
        .select('id, full_name, created_at')
        .order('created_at', { ascending: false });
      
      // Apply filters
      if (startDate) {
        query = query.gte('created_at', startDate);
      }
      if (endDate) {
        query = query.lte('created_at', endDate);
      }
      if (userId) {
        query = query.eq('id', userId);
      }
      
      // Get count for pagination
      const countQuery = supabase
        .from('users')
        .select('id', { count: 'exact' });
      
      // Apply same filters to count query
      if (startDate) {
        countQuery.gte('created_at', startDate);
      }
      if (endDate) {
        countQuery.lte('created_at', endDate);
      }
      if (userId) {
        countQuery.eq('id', userId);
      }
      
      const { count: usersCount } = await countQuery;
      
      // Paginate results
      const { data: recentUsers, error: usersError } = await query
        .range(offset, offset + limit - 1);
      
      if (usersError) {
        console.error('Error fetching users:', usersError);
        throw usersError;
      }
      
      // Format user registrations
      userActivities = (recentUsers as UserWithDetails[]).map(user => ({
        id: user.id,
        type: 'registration',
        title: `New user registered: ${user.full_name}`,
        details: '',
        time: formatTimeAgo(user.created_at),
        timestamp: user.created_at,
        color: 'blue',
        user_id: user.id
      }));
    }
    
    // Conditionally fetch quiz creations
    if (!type || type === 'quiz_creation') {
      let query = supabase
        .from('quizzes')
        .select('id, title, created_at')
        .order('created_at', { ascending: false });
      
      // Apply filters
      if (startDate) {
        query = query.gte('created_at', startDate);
      }
      if (endDate) {
        query = query.lte('created_at', endDate);
      }
      if (quizId) {
        query = query.eq('id', quizId);
      }
      
      // Get count for pagination
      const countQuery = supabase
        .from('quizzes')
        .select('id', { count: 'exact' });
      
      // Apply same filters to count query
      if (startDate) {
        countQuery.gte('created_at', startDate);
      }
      if (endDate) {
        countQuery.lte('created_at', endDate);
      }
      if (quizId) {
        countQuery.eq('id', quizId);
      }
      
      const { count: quizzesCount } = await countQuery;
      
      // Paginate results
      const { data: recentQuizzes, error: quizzesError } = await query
        .range(offset, offset + limit - 1);
      
      if (quizzesError) {
        console.error('Error fetching quizzes:', quizzesError);
        throw quizzesError;
      }
      
      // Format quiz creations
      quizActivities = (recentQuizzes as QuizWithDetails[]).map(quiz => ({
        id: quiz.id,
        type: 'quiz_creation',
        title: `New quiz created: "${quiz.title}"`,
        details: '',
        time: formatTimeAgo(quiz.created_at),
        timestamp: quiz.created_at,
        color: 'yellow',
        quiz_id: quiz.id
      }));
    }
    
    // Combine all activities
    let allActivities = [
      ...submissionActivities,
      ...userActivities,
      ...quizActivities
    ];
    
    // Sort by timestamp (newest first)
    allActivities.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
    
    // For mixed activity types, we need to handle pagination after combining
    if (!type) {
      // If we've combined different types, we need to paginate the combined result
      allActivities = allActivities.slice(0, limit);
    }
    
    // Get total count
    const totalCount = submissionActivities.length + userActivities.length + quizActivities.length;
    
    // Return the paginated and filtered activities
    return NextResponse.json({
      activities: allActivities,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching activity data:', error);
    return NextResponse.json(
      { error: 'An error occurred while fetching activity data' },
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