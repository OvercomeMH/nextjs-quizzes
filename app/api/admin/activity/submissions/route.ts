import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import 'server-only';
import type { Database } from '@/lib/database.types';

type SubmissionWithQuiz = Database['public']['Tables']['submissions']['Row'] & {
  quizzes?: {
    title?: string;
  } | null;
}

export async function GET(request: Request) {
  try {
    const { data: submissions, error } = await supabase
      .from('submissions')
      .select(`
        quiz_id,
        quizzes (
          title
        )
      `)
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) {
      console.error('Error fetching submissions:', error);
      return NextResponse.json({ error: 'Failed to fetch submissions' }, { status: 500 });
    }

    // Group submissions by quiz
    const quizSubmissions: Record<string, number> = {};
    submissions?.forEach(sub => {
      if (sub.quiz_id && sub.quizzes?.title) {
        quizSubmissions[sub.quizzes.title] = (quizSubmissions[sub.quizzes.title] || 0) + 1;
      }
    });

    return NextResponse.json(quizSubmissions);
  } catch (error) {
    console.error('Error in submissions route:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 