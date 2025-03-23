import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import 'server-only';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    const { 
      userId, 
      quizId, 
      score, 
      totalPossible, 
      timeSpent,
      answers 
    } = data;
    
    // Validate required fields
    if (!quizId || score === undefined || !totalPossible) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }
    
    // 1. Create a submission record
    const { data: submission, error: submissionError } = await supabase
      .from('submissions')
      .insert({
        user_id: userId || null, // Allow anonymous submissions
        quiz_id: quizId,
        score: score,
        total_possible: totalPossible,
        time_spent: timeSpent || null,
        created_at: new Date().toISOString()
      })
      .select()
      .single();
    
    if (submissionError) {
      console.error('Error creating submission:', submissionError);
      return NextResponse.json(
        { error: `Failed to save quiz submission: ${submissionError.message}` },
        { status: 500 }
      );
    }
    
    // 2. If we have answers and they're an array, store them
    if (answers && Array.isArray(answers) && answers.length > 0) {
      // Fetch questions for this quiz to compare answers
      const { data: questions, error: questionsError } = await supabase
        .from('questions')
        .select('*')
        .eq('quiz_id', quizId)
        .order('order_num', { ascending: true });
      
      if (questionsError) {
        console.error('Error fetching questions:', questionsError);
        // Continue without saving user answers
      } else if (questions) {
        // Map through answers and save each one
        const userAnswersData = answers.map((answer, index) => {
          const question = questions[index];
          return {
            submission_id: submission.id,
            question_id: question?.id,
            selected_option: answer || null,
            is_correct: question ? answer === question.correct_answer : null
          };
        });
        
        // Insert the user answers
        const { error: answersError } = await supabase
          .from('user_answers')
          .insert(userAnswersData);
        
        if (answersError) {
          console.error('Error saving user answers:', answersError);
          // Continue without failing the whole request
        }
      }
    }
    
    // 3. Update the quiz play count
    try {
      // Get the current times_played value
      const { data: quizData, error: quizFetchError } = await supabase
        .from('quizzes')
        .select('times_played')
        .eq('id', quizId)
        .single();
        
      if (quizFetchError) {
        console.error('Error fetching quiz play count:', quizFetchError);
      } else {
        // Increment the times_played value
        const currentCount = quizData.times_played || 0;
        const { error: quizUpdateError } = await supabase
          .from('quizzes')
          .update({ times_played: currentCount + 1 })
          .eq('id', quizId);
          
        if (quizUpdateError) {
          console.error('Error updating quiz play count:', quizUpdateError);
        }
      }
    } catch (err) {
      console.error('Error updating quiz play count:', err);
    }
    
    // 4. If we have a user ID, update their stats
    if (userId) {
      try {
        // Get current user stats
        const { data: userData, error: userFetchError } = await supabase
          .from('users')
          .select('quizzes_taken, total_points')
          .eq('id', userId)
          .single();
        
        if (userFetchError) {
          console.error('Error fetching user data:', userFetchError);
        } else {
          // Update user stats with incremented values
          const newQuizzesTaken = (userData.quizzes_taken || 0) + 1;
          const newTotalPoints = (userData.total_points || 0) + score;
          
          // Calculate new average
          const newAverage = newTotalPoints / newQuizzesTaken;
          
          const { error: userUpdateError } = await supabase
            .from('users')
            .update({ 
              quizzes_taken: newQuizzesTaken,
              total_points: newTotalPoints,
              average_score: newAverage
            })
            .eq('id', userId);
            
          if (userUpdateError) {
            console.error('Error updating user stats:', userUpdateError);
          }
        }
      } catch (err) {
        console.error('Error updating user stats:', err);
      }
    }
    
    return NextResponse.json({
      success: true,
      submission_id: submission.id
    });
  } catch (error) {
    console.error('Error submitting quiz:', error);
    return NextResponse.json(
      { error: "An error occurred while submitting the quiz" },
      { status: 500 }
    );
  }
} 