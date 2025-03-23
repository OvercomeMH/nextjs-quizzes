import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import 'server-only';

export async function GET() {
  try {
    // Fetch users from Supabase
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select(`
        id,
        full_name,
        email,
        quizzes_taken,
        average_score,
        created_at
      `)
      .order('created_at', { ascending: false });
    
    if (usersError) {
      console.error('Error fetching users:', usersError);
      return NextResponse.json(
        { error: "An error occurred while fetching users" },
        { status: 500 }
      );
    }
    
    // If no users are found, return an empty array
    if (!users) {
      return NextResponse.json([]);
    }
    
    // Transform the data to match the format expected by the frontend
    const formattedUsers = users.map(user => ({
      id: user.id,
      name: user.full_name || 'Unknown User',
      email: user.email || 'No Email',
      quizzesTaken: user.quizzes_taken || 0,
      averageScore: user.average_score || 0
    }));
    
    return NextResponse.json(formattedUsers);
  } catch (error) {
    console.error('Error fetching admin users data:', error);
    return NextResponse.json(
      { error: 'An error occurred while fetching users data' },
      { status: 500 }
    );
  }
} 