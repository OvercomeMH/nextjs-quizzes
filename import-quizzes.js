// import-quizzes.js - Script to import quiz data from JSON files to Supabase
require('dotenv').config({ path: '.env.local' });
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
const { v4: uuidv4 } = require('uuid');

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Error: Supabase credentials missing from .env.local file');
  console.error('Make sure you have NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY set');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Function to read quiz JSON files
async function readQuizFiles() {
  const quizzesDir = path.join(__dirname, 'data', 'quizzes');
  const files = fs.readdirSync(quizzesDir);
  
  console.log(`Found ${files.length} quiz files to import`);
  
  const quizzes = [];
  
  for (const file of files) {
    if (file.endsWith('.json')) {
      const filePath = path.join(quizzesDir, file);
      const quizData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      quizzes.push(quizData);
      console.log(`Loaded quiz: ${quizData.title}`);
    }
  }
  
  return quizzes;
}

// Import quizzes to Supabase
async function importQuizzes(quizzes) {
  for (const quiz of quizzes) {
    console.log(`Importing quiz: ${quiz.title}`);
    
    try {
      // 1. Insert the quiz
      const quizId = uuidv4(); // Generate a UUID for the quiz
      
      const { data: quizData, error: quizError } = await supabase
        .from('quizzes')
        .insert({
          id: quizId,
          title: quiz.title,
          description: quiz.description,
          difficulty: quiz.difficulty,
          time_limit: quiz.timeLimit,
          created_at: new Date(quiz.metadata.createdAt).toISOString(),
          updated_at: new Date(quiz.metadata.updatedAt).toISOString(),
          total_questions: quiz.metadata.totalQuestions,
          total_points: quiz.metadata.totalPoints,
          average_rating: quiz.metadata.averageRating,
          times_played: quiz.metadata.timesPlayed
        })
        .select()
        .single();
      
      if (quizError) {
        console.error(`Error inserting quiz ${quiz.title}:`, quizError.message);
        continue;
      }
      
      console.log(`Quiz "${quiz.title}" inserted with ID: ${quizId}`);
      
      // 2. Insert questions for this quiz
      for (const question of quiz.questions) {
        const questionId = uuidv4(); // Generate a UUID for the question
        
        const { data: questionData, error: questionError } = await supabase
          .from('questions')
          .insert({
            id: questionId,
            quiz_id: quizId,
            text: question.text,
            type: question.type,
            points: question.points,
            correct_answer: question.correctAnswer,
            explanation: question.explanation,
            order_num: parseInt(question.id.replace('q', '')) // Convert 'q1' to 1
          })
          .select()
          .single();
        
        if (questionError) {
          console.error(`Error inserting question ${question.id}:`, questionError.message);
          continue;
        }
        
        console.log(`Question "${question.text.substring(0, 30)}..." inserted with ID: ${questionId}`);
        
        // 3. Insert options for this question
        for (const option of question.options) {
          const { data: optionData, error: optionError } = await supabase
            .from('question_possible_answers')
            .insert({
              id: uuidv4(),
              question_id: questionId,
              option_id: option.id,
              text: option.text,
              order_num: option.id.charCodeAt(0) - 96 // 'a'->1, 'b'->2, etc.
            });
          
          if (optionError) {
            console.error(`Error inserting option ${option.id}:`, optionError.message);
            continue;
          }
        }
        
        console.log(`Inserted ${question.options.length} options for question ID: ${questionId}`);
      }
      
      console.log(`Successfully imported quiz "${quiz.title}" with ${quiz.questions.length} questions`);
      console.log('--------------------------------------------------------------');
    } catch (error) {
      console.error(`Unexpected error importing quiz ${quiz.title}:`, error.message);
    }
  }
}

// Main execution
async function main() {
  try {
    const quizzes = await readQuizFiles();
    await importQuizzes(quizzes);
    console.log('Quiz import completed successfully!');
  } catch (error) {
    console.error('Error in import process:', error.message);
  }
}

// Run the script
main()
  .then(() => console.log('Import script finished'))
  .catch(err => console.error('Import script failed:', err))
  .finally(() => process.exit(0)); 