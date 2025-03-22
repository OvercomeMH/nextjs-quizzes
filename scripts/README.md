# Database Migration Scripts

This directory contains SQL scripts to fix database schema issues or add new features.

## How to Run the SQL Scripts

### Option 1: Using Supabase SQL Editor

1. Login to your Supabase dashboard at [https://app.supabase.com/](https://app.supabase.com/)
2. Select your project
3. Go to the "SQL Editor" tab in the left sidebar
4. Create a new query
5. Copy and paste the contents of the SQL file you want to run
6. Execute the statements one by one
7. Check the output for any errors

### Option 2: Using Supabase CLI

If you have the Supabase CLI installed, you can run:

```
supabase db execute --file scripts/fix-submissions-table.sql
```

## Available Scripts

### fix-submissions-table.sql

This script fixes the submissions table by:
- Adding a `created_at` column if it doesn't exist
- Creating the submissions table if it doesn't exist
- Adding the `time_spent` column if it doesn't exist
- Creating the user_answers table if it doesn't exist
- Adding necessary columns to the users table
- Creating indexes for better performance

Run this if you're seeing errors like "column submissions.created_at does not exist". 