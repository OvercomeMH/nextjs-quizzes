import { cookies } from 'next/headers';
import { getUserById } from './users';
import 'server-only';

export const SESSION_COOKIE_NAME = 'quiz-master-session';

// Get the user ID from server-side cookies
export async function getSessionUserId(): Promise<string | null> {
  // In Next.js 15, cookies() is now an async function
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);
  return sessionCookie?.value || null;
}

// Get the current user from the session
export async function getCurrentUser() {
  const userId = await getSessionUserId();
  if (!userId) return null;
  
  return await getUserById(userId);
}

// Verify if the user is authenticated
export async function isAuthenticated(): Promise<boolean> {
  const userId = await getSessionUserId();
  return userId !== null;
} 