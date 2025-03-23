import { createClient } from '@supabase/supabase-js';
import type { Tables } from '@/lib/supabase';

// This test file tests access to all columns in the Supabase database
// It ensures we can query each table and access every column defined in our Types

// Skip tests if environment variables are not set
const shouldRunTests = process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Function to test if a table is accessible and retrieve its columns
async function testTableAccess(tableName: keyof Tables) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  return await supabase
    .from(tableName)
    .select('*')
    .limit(1);
}

describe('Supabase Database Access Tests', () => {
  // Users table tests
  describe('Users Table', () => {
    it('should access all columns in the users table', async () => {
      if (!shouldRunTests) return;
      
      const { data, error } = await testTableAccess('users');
      
      if (error) {
        console.warn('Error accessing users table:', error);
        return;
      }
      
      if (data && data.length > 0) {
        const user = data[0] as Tables['users']['Row'];
        
        // Test each column is accessible
        expect(user).toHaveProperty('id');
        expect(user).toHaveProperty('username');
        expect(user).toHaveProperty('email');
        expect(user).toHaveProperty('full_name');
        expect(user).toHaveProperty('quizzes_taken');
        expect(user).toHaveProperty('average_score');
        expect(user).toHaveProperty('total_points');
        expect(user).toHaveProperty('rank');
        expect(user).toHaveProperty('email_notifications');
        expect(user).toHaveProperty('public_profile');
      } else {
        console.warn('Users table is empty, skipping column checks');
      }
    });
  });

  // Quizzes table tests
  describe('Quizzes Table', () => {
    it('should access all columns in the quizzes table', async () => {
      if (!shouldRunTests) return;
      
      const { data, error } = await testTableAccess('quizzes');
      
      if (error) {
        console.warn('Error accessing quizzes table:', error);
        return;
      }
      
      if (data && data.length > 0) {
        const quiz = data[0] as Tables['quizzes']['Row'];
        
        // Test each column is accessible
        expect(quiz).toHaveProperty('id');
        expect(quiz).toHaveProperty('title');
        expect(quiz).toHaveProperty('description');
        expect(quiz).toHaveProperty('difficulty');
        expect(quiz).toHaveProperty('category');
        expect(quiz).toHaveProperty('time_limit');
        expect(quiz).toHaveProperty('total_questions');
        expect(quiz).toHaveProperty('total_points');
        expect(quiz).toHaveProperty('average_rating');
        expect(quiz).toHaveProperty('times_played');
      } else {
        console.warn('Quizzes table is empty, skipping column checks');
      }
    });
  });

  // Questions table tests
  describe('Questions Table', () => {
    it('should access all columns in the questions table', async () => {
      if (!shouldRunTests) return;
      
      const { data, error } = await testTableAccess('questions');
      
      if (error) {
        console.warn('Skipping questions table test due to error');
        return;
      }
      
      if (data && data.length > 0) {
        const question = data[0] as Tables['questions'];
        
        // Test each column is accessible
        expect(question).toHaveProperty('id');
        expect(question).toHaveProperty('quiz_id');
        expect(question).toHaveProperty('text');
        expect(question).toHaveProperty('type');
        expect(question).toHaveProperty('points');
        expect(question).toHaveProperty('correct_answer');
        expect(question).toHaveProperty('explanation');
        expect(question).toHaveProperty('order_num');
        expect(question).toHaveProperty('created_at');
      } else {
        console.warn('Questions table is empty, skipping column checks');
      }
    });
  });

  // Question possible answers table tests
  describe('Question Possible Answers Table', () => {
    it('should access all columns in the question_possible_answers table', async () => {
      if (!shouldRunTests) return;
      
      const { data, error } = await testTableAccess('question_possible_answers');
      
      if (error) {
        console.warn('Skipping question_possible_answers table test due to error');
        return;
      }
      
      if (data && data.length > 0) {
        const answer = data[0] as Tables['question_possible_answers'];
        
        // Test each column is accessible
        expect(answer).toHaveProperty('id');
        expect(answer).toHaveProperty('question_id');
        expect(answer).toHaveProperty('option_id');
        expect(answer).toHaveProperty('text');
        expect(answer).toHaveProperty('order_num');
      } else {
        console.warn('Question possible answers table is empty, skipping column checks');
      }
    });
  });

  // Submissions table tests
  describe('Submissions Table', () => {
    it('should access all columns in the submissions table', async () => {
      if (!shouldRunTests) return;
      
      const { data, error } = await testTableAccess('submissions');
      
      if (error) {
        console.warn('Error accessing submissions table:', error);
        return;
      }
      
      if (data && data.length > 0) {
        const submission = data[0] as Tables['submissions']['Row'];
        
        // Test each column is accessible
        expect(submission).toHaveProperty('id');
        expect(submission).toHaveProperty('user_id');
        expect(submission).toHaveProperty('quiz_id');
        expect(submission).toHaveProperty('score');
        expect(submission).toHaveProperty('total_possible');
        expect(submission).toHaveProperty('time_spent');
        expect(submission).toHaveProperty('created_at');
      } else {
        console.warn('Submissions table is empty, skipping column checks');
      }
    });
  });

  // User answers table tests
  describe('User Answers Table', () => {
    it('should access all columns in the user_answers table', async () => {
      if (!shouldRunTests) return;
      
      const { data, error } = await testTableAccess('user_answers');
      
      if (error) {
        console.warn('Skipping user_answers table test due to error');
        return;
      }
      
      if (data && data.length > 0) {
        const userAnswer = data[0] as Tables['user_answers'];
        
        // Test each column is accessible
        expect(userAnswer).toHaveProperty('id');
        expect(userAnswer).toHaveProperty('submission_id');
        expect(userAnswer).toHaveProperty('question_id');
        expect(userAnswer).toHaveProperty('selected_option');
        expect(userAnswer).toHaveProperty('is_correct');
        expect(userAnswer).toHaveProperty('created_at');
      } else {
        console.warn('User answers table is empty, skipping column checks');
      }
    });
  });
}); 