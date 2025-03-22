-- Add created_at column to submissions table if it doesn't exist
ALTER TABLE submissions
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Make sure the submissions table has all the required columns
-- If you're running this directly in Supabase SQL editor, execute statements one by one

-- Check if submissions table exists, if not create it
CREATE TABLE IF NOT EXISTS submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  quiz_id UUID NOT NULL,
  score INTEGER NOT NULL,
  total_possible INTEGER NOT NULL,
  time_spent INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add other missing columns if needed
ALTER TABLE submissions 
ADD COLUMN IF NOT EXISTS time_spent INTEGER;

-- Check if user_answers table exists, if not create it
CREATE TABLE IF NOT EXISTS user_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id UUID REFERENCES submissions(id) ON DELETE CASCADE,
  question_id UUID NOT NULL,
  selected_option INTEGER,
  is_correct BOOLEAN,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Make sure users table has all required fields
ALTER TABLE users
ADD COLUMN IF NOT EXISTS quizzes_taken INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_points INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS average_score DECIMAL DEFAULT 0;

-- Add an index to improve query performance
CREATE INDEX IF NOT EXISTS idx_submissions_user_id ON submissions(user_id);
CREATE INDEX IF NOT EXISTS idx_submissions_quiz_id ON submissions(quiz_id); 