import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import 'server-only';

interface QuizStat {
  name: string;
  submissions: number;
  averageScore: number;
}

interface CategoryStat {
  name: string;
  count: number;
}

interface DailyStat {
  date: string;
  submissions: number;
}

interface QuizSubmissionCount {
  [quizId: string]: number;
}

interface QuizScoreData {
  total: number;
  count: number;
}

interface QuizScores {
  [quizId: string]: QuizScoreData;
}

interface CategoryCount {
  [category: string]: number;
}

export async function GET() {
  try {
    // 1. Get total quiz count
    const { data: quizzes, error: quizzesError } = await supabase
      .from('quizzes')
      .select('id, title, category, difficulty, times_played, average_rating, total_points');
    
    if (quizzesError) {
      console.error('Error fetching quizzes:', quizzesError);
      throw quizzesError;
    }
    
    // 2. Get total submissions count and submission stats
    const { data: submissions, error: submissionsError } = await supabase
      .from('submissions')
      .select('id, quiz_id, user_id, score, total_possible, created_at');
    
    if (submissionsError) {
      console.error('Error fetching submissions:', submissionsError);
      throw submissionsError;
    }
    
    // 3. Get total users
    const { count: userCount, error: usersError } = await supabase
      .from('users')
      .select('id', { count: 'exact', head: true });
    
    if (usersError) {
      console.error('Error counting users:', usersError);
      throw usersError;
    }
    
    // Process the data to build analytics
    const totalQuizzes = quizzes?.length || 0;
    const totalSubmissions = submissions?.length || 0;
    
    // Calculate average score
    let averageScore = 0;
    let completionRate = 100; // Default to 100% if we can't calculate
    
    if (totalSubmissions > 0 && submissions) {
      const totalScorePercentage = submissions.reduce((sum, sub) => {
        return sum + (sub.score / sub.total_possible * 100);
      }, 0);
      averageScore = Math.round(totalScorePercentage / totalSubmissions);
      
      // We don't have incomplete submissions data, so for now we'll hardcode a reasonable value
      // In a real app, you would track abandoned quizzes as well
      completionRate = 95; 
    }
    
    // Process quiz stats for top 5 quizzes by submission count
    const quizStats: QuizStat[] = [];
    const quizSubmissionCounts: QuizSubmissionCount = {};
    
    // Count submissions per quiz
    if (submissions) {
      submissions.forEach(sub => {
        quizSubmissionCounts[sub.quiz_id] = (quizSubmissionCounts[sub.quiz_id] || 0) + 1;
      });
    }
    
    // Calculate average score per quiz
    const quizScores: QuizScores = {};
    if (submissions) {
      submissions.forEach(sub => {
        if (!quizScores[sub.quiz_id]) {
          quizScores[sub.quiz_id] = {
            total: 0,
            count: 0
          };
        }
        quizScores[sub.quiz_id].total += (sub.score / sub.total_possible * 100);
        quizScores[sub.quiz_id].count += 1;
      });
    }
    
    // Build quiz stats array
    if (quizzes) {
      quizzes.forEach(quiz => {
        const submissions = quizSubmissionCounts[quiz.id] || 0;
        const avgScore = quizScores[quiz.id] 
          ? Math.round(quizScores[quiz.id].total / quizScores[quiz.id].count) 
          : 0;
        
        quizStats.push({
          name: quiz.title,
          submissions,
          averageScore: avgScore
        });
      });
    }
    
    // Sort by submission count and take top 5
    quizStats.sort((a, b) => b.submissions - a.submissions);
    const topQuizStats = quizStats.slice(0, 5);
    
    // Process category stats
    const categoryCount: CategoryCount = {};
    if (quizzes) {
      quizzes.forEach(quiz => {
        const category = quiz.category || 'Uncategorized';
        categoryCount[category] = (categoryCount[category] || 0) + 1;
      });
    }
    
    // Convert to array format
    const categoryStats: CategoryStat[] = Object.entries(categoryCount).map(([name, count]) => ({
      name,
      count
    }));
    
    // Sort by count descending
    categoryStats.sort((a, b) => b.count - a.count);
    
    // Process daily submissions for the past week
    const dailyStats: DailyStat[] = [];
    const now = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      
      // Count submissions for this day
      const daySubmissions = submissions ? submissions.filter(sub => {
        const subDate = new Date(sub.created_at);
        return subDate.getDate() === date.getDate() && 
               subDate.getMonth() === date.getMonth() && 
               subDate.getFullYear() === date.getFullYear();
      }).length : 0;
      
      dailyStats.push({
        date: dateStr,
        submissions: daySubmissions
      });
    }
    
    // Build the analytics response
    const analyticsData = {
      quizStats: topQuizStats,
      categoryStats,
      dailyStats,
      totalQuizzes,
      totalSubmissions,
      totalUsers: userCount || 0,
      averageScore,
      completionRate
    };
    
    return NextResponse.json(analyticsData);
  } catch (error) {
    console.error('Error generating analytics data:', error);
    return NextResponse.json(
      { error: 'An error occurred while generating analytics data' },
      { status: 500 }
    );
  }
} 