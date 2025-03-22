// add-user.js - Standalone script to add a user to Supabase
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Error: Supabase credentials missing from .env.local file');
  console.error('Make sure you have NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY set');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Generate a unique username with timestamp
const timestamp = new Date().getTime().toString().slice(-4);
const userData = {
  username: `admin${timestamp}`,
  email: `admin${timestamp}@gmail.com`,
  full_name: 'Admin User',
  rank: 'Admin',
  email_notifications: true,
  public_profile: false,
};

async function addUser() {
  console.log('Adding user to Supabase with username:', userData.username);
  
  try {
    // First, let's create an auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: userData.email,
      password: 'Password123!', // Use a secure password in production
      options: {
        data: {
          username: userData.username,
          full_name: userData.full_name,
        }
      }
    });

    if (authError) {
      console.error('Error creating auth user:', authError.message);
      return;
    }

    console.log('Auth user created:', authData.user.id);

    // Now add the user to our users table
    const { data, error } = await supabase
      .from('users')
      .insert({
        id: authData.user.id, // Use the Auth user ID
        ...userData
      })
      .select()
      .single();

    if (error) {
      console.error('Error adding user to users table:', error.message);
      return;
    }

    console.log('User successfully added to Supabase!');
    console.log(data);
    
    console.log('\nSAVE THESE CREDENTIALS:');
    console.log('------------------------');
    console.log('Username:', userData.username);
    console.log('Email:', userData.email);
    console.log('Password: Password123!');
    console.log('------------------------');
  } catch (error) {
    console.error('Unexpected error:', error.message);
  }
}

// Run the function
addUser()
  .then(() => console.log('Script completed'))
  .catch(err => console.error('Script failed:', err))
  .finally(() => process.exit(0)); 