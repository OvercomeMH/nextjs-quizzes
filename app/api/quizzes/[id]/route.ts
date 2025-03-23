import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import 'server-only';

interface QuizOption {
  id: string;
  text: string;
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Initialize Supabase client with cookies
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
        },
      }
    );

    // Check if user is authenticated
    const { data: { session }, error: authError } = await supabase.auth.getSession();
    if (authError || !session) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const quizId = params.id;
    console.log(`Fetching quiz with ID: ${quizId}`);
    
    // Fetch the quiz data
    const { data: quiz, error: quizError } = await supabase
      .from('quizzes')
      .select('*')
      .eq('id', quizId)
      .single();
      
    if (quizError) {
      console.error('Error fetching quiz:', quizError);
      if (quizError.code === 'PGRST116') {
        return NextResponse.json({ error: 'Quiz not found' }, { status: 404 });
      }
      throw quizError;
    }
    
    console.log('Quiz data fetched successfully:', quiz.title);
    
    // Fetch the quiz questions
    const { data: questions, error: questionsError } = await supabase
      .from('questions')
      .select('*')
      .eq('quiz_id', quizId)
      .order('order_num', { ascending: true });
      
    if (questionsError) {
      console.error('Error fetching questions:', questionsError);
      throw questionsError;
    }
    
    console.log(`Fetched ${questions.length} questions for quiz`);
    
    // For each question, fetch its possible answers from the question_possible_answers table
    const formattedQuestions = await Promise.all(questions.map(async (question, index) => {
      console.log(`Processing question ${index + 1}: "${question.text.substring(0, 20)}..."`);
      
      // Fetch possible answers for this question
      const { data: possibleAnswers, error: answersError } = await supabase
        .from('question_possible_answers')
        .select('*')
        .eq('question_id', question.id)
        .order('order_num', { ascending: true });
        
      if (answersError) {
        console.error(`Error fetching options for question ${index + 1}:`, answersError);
      }
      
      // Format options from the possible answers
      const options = possibleAnswers?.map(answer => ({
        id: answer.option_id,
        text: answer.text
      })) || [];
      
      console.log(`Found ${options.length} options for question ${index + 1}`);
      
      // If no options were found in the database, create defaults
      if (options.length === 0) {
        console.warn(`No options found in database for question ${index + 1}, creating defaults`);
        ['a', 'b', 'c', 'd'].forEach(id => {
          options.push({
            id,
            text: `Option ${id.toUpperCase()} (Default)`
          });
        });
      }
      
      // Get the correct answer ID
      console.log('Correct answer value from DB:', question.correct_answer);
      let correctAnswerId = '';
      
      // The correct_answer field might be storing different formats
      if (typeof question.correct_answer === 'number' && options[question.correct_answer]) {
        // It's an index into the options array
        correctAnswerId = options[question.correct_answer].id;
      } else if (typeof question.correct_answer === 'string') {
        // It's directly the option ID
        correctAnswerId = question.correct_answer;
      }
      
      console.log('Determined correct answer ID:', correctAnswerId);
      
      return {
        id: question.id,
        text: question.text,
        type: 'multiple-choice',
        points: question.points || 10,
        correctAnswer: correctAnswerId,
        options: options,
        explanation: question.explanation || ''
      };
    }));
    
    // Format the quiz to match the expected frontend structure
    const formattedQuiz = {
      id: quiz.id,
      title: quiz.title,
      description: quiz.description,
      difficulty: quiz.difficulty,
      category: quiz.category,
      timeLimit: quiz.time_limit || 600, // Default to 10 minutes if not set
      questions: formattedQuestions,
      metadata: {
        createdAt: quiz.created_at,
        updatedAt: quiz.updated_at || quiz.created_at,
        totalQuestions: formattedQuestions.length,
        totalPoints: formattedQuestions.reduce((sum, q) => sum + (q.points || 10), 0),
        averageRating: 0, // You could calculate this from ratings if you add that feature
        timesPlayed: quiz.times_played || 0
      }
    };
    
    console.log('Successfully formatted quiz for frontend');
    return NextResponse.json(formattedQuiz);
  } catch (error) {
    console.error('Error fetching quiz:', error);
    return NextResponse.json(
      { error: 'An error occurred while fetching the quiz' },
      { status: 500 }
    );
  }
} 