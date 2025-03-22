import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import 'server-only';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Get quiz ID from params
    const { id: quizId } = await params;

    // Query the quiz from Supabase with all its questions and options
    const { data: quiz, error: quizError } = await supabase
      .from('quizzes')
      .select('*')
      .eq('id', quizId)
      .single();
    
    if (quizError) {
      console.error(`Error fetching quiz ${quizId}:`, quizError);
      return NextResponse.json(
        { error: "Quiz not found or database error" },
        { status: quizError.code === 'PGRST116' ? 404 : 500 }
      );
    }
    
    // Now get all questions for this quiz
    const { data: questions, error: questionsError } = await supabase
      .from('questions')
      .select('*')
      .eq('quiz_id', quizId)
      .order('order_num', { ascending: true });
    
    if (questionsError) {
      console.error(`Error fetching questions for quiz ${quizId}:`, questionsError);
      return NextResponse.json(
        { error: "Error fetching quiz questions" },
        { status: 500 }
      );
    }
    
    // For each question, get its options
    const questionsWithOptions = await Promise.all(
      questions.map(async (question) => {
        const { data: options, error: optionsError } = await supabase
          .from('question_possible_answers')
          .select('*')
          .eq('question_id', question.id)
          .order('order_num', { ascending: true });
        
        if (optionsError) {
          console.error(`Error fetching options for question ${question.id}:`, optionsError);
          return {
            ...question,
            options: []
          };
        }
        
        // Format options to match expected format
        const formattedOptions = options.map(option => ({
          id: option.option_id,
          text: option.text
        }));
        
        return {
          id: question.id,
          text: question.text,
          type: question.type,
          points: question.points,
          options: formattedOptions,
          correctAnswer: question.correct_answer,
          explanation: question.explanation
        };
      })
    );
    
    // Format the complete quiz data to match the expected format
    const formattedQuiz = {
      id: quiz.id,
      title: quiz.title,
      description: quiz.description,
      difficulty: quiz.difficulty,
      timeLimit: quiz.time_limit,
      questions: questionsWithOptions,
      metadata: {
        createdAt: quiz.created_at,
        updatedAt: quiz.updated_at,
        totalQuestions: quiz.total_questions,
        totalPoints: quiz.total_points,
        averageRating: quiz.average_rating,
        timesPlayed: quiz.times_played
      }
    };
    
    // Simulate a delay to mimic network latency
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Return the quiz data
    return NextResponse.json(formattedQuiz);
  } catch (error) {
    console.error('Error fetching quiz:', error);
    return NextResponse.json(
      { error: "An error occurred while fetching the quiz" },
      { status: 500 }
    );
  }
} 