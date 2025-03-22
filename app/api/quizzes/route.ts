import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import 'server-only';

export async function GET() {
  try {
    // Query the quizzes table from Supabase
    const { data, error } = await supabase
      .from('quizzes')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching quizzes from Supabase:', error);
      return NextResponse.json(
        { error: "An error occurred while fetching quizzes" },
        { status: 500 }
      );
    }
    
    // Transform the data to match the format expected by the frontend
    const quizzes = data.map(quiz => ({
      id: quiz.id,
      title: quiz.title,
      description: quiz.description,
      difficulty: quiz.difficulty,
      timeLimit: quiz.time_limit,
      totalQuestions: quiz.total_questions,
      metadata: {
        createdAt: quiz.created_at,
        updatedAt: quiz.updated_at,
        totalPoints: quiz.total_points,
        averageRating: quiz.average_rating,
        timesPlayed: quiz.times_played
      }
    }));
    
    // Simulate a delay to mimic network latency (optional, can be removed)
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Return the list of quizzes
    return NextResponse.json(quizzes);
  } catch (error) {
    console.error('Error fetching quizzes:', error);
    return NextResponse.json(
      { error: "An error occurred while fetching quizzes" },
      { status: 500 }
    );
  }
} 