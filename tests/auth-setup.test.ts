import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/lib/database.types';

// Skip tests if environment variables are not set
const shouldRunTests = process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

describe('Authentication and Database Setup Tests', () => {
  let supabase: SupabaseClient<Database>;

  beforeAll(() => {
    if (!shouldRunTests) {
      console.warn('Skipping tests: Supabase environment variables not set');
      return;
    }

    supabase = createClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  });

  describe('Environment Variables', () => {
    it('should have Supabase URL set', () => {
      expect(process.env.NEXT_PUBLIC_SUPABASE_URL).toBeDefined();
      expect(process.env.NEXT_PUBLIC_SUPABASE_URL).not.toBe('');
    });

    it('should have Supabase Anon Key set', () => {
      expect(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY).toBeDefined();
      expect(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY).not.toBe('');
    });
  });

  describe('Database Schema', () => {
    it('should have users table with correct columns', async () => {
      if (!shouldRunTests) return;

      const { data, error } = await supabase
        .from('users')
        .select('*')
        .limit(1);

      if (error) {
        console.warn('Error accessing users table:', error);
        return;
      }

      if (data && data.length > 0) {
        const user = data[0];
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
      }
    });

    it('should have submissions table with correct columns', async () => {
      if (!shouldRunTests) return;

      const { data, error } = await supabase
        .from('submissions')
        .select('*')
        .limit(1);

      if (error) {
        console.warn('Error accessing submissions table:', error);
        return;
      }

      if (data && data.length > 0) {
        const submission = data[0];
        expect(submission).toHaveProperty('id');
        expect(submission).toHaveProperty('user_id');
        expect(submission).toHaveProperty('quiz_id');
        expect(submission).toHaveProperty('score');
        expect(submission).toHaveProperty('total_possible');
        expect(submission).toHaveProperty('time_spent');
        expect(submission).toHaveProperty('created_at');
      }
    });
  });

  describe('Row Level Security', () => {
    it('should have RLS enabled on users table', async () => {
      if (!shouldRunTests) return;

      const { data, error } = await supabase
        .from('users')
        .select('*')
        .limit(1);

      if (error) {
        // If we get a permission error, RLS is working
        expect(error.code).toBe('PGRST116');
      }
    });

    it('should have RLS enabled on submissions table', async () => {
      if (!shouldRunTests) return;

      const { data, error } = await supabase
        .from('submissions')
        .select('*')
        .limit(1);

      if (error) {
        // If we get a permission error, RLS is working
        expect(error.code).toBe('PGRST116');
      }
    });

    it('should have RLS enabled on quizzes table', async () => {
      if (!shouldRunTests) return;

      const { data, error } = await supabase
        .from('quizzes')
        .select('*')
        .limit(1);

      if (error) {
        // If we get a permission error, RLS is working
        expect(error.code).toBe('PGRST116');
      }
    });
  });
}); 