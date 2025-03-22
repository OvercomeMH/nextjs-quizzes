"use client"

import { getUserById } from './users'

// In a real app, you would use a secure library for session management
// This is a very simplified version for testing

const SESSION_COOKIE_NAME = 'quiz-master-session'

// Client-side cookie utilities
export function setClientCookie(name: string, value: string) {
  document.cookie = `${name}=${value}; path=/; max-age=${60 * 60 * 24 * 7}`; // 1 week
}

export function getClientCookie(name: string): string | null {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    const cookieValue = parts.pop()?.split(';').shift();
    return cookieValue || null;
  }
  return null;
}

export function deleteClientCookie(name: string) {
  document.cookie = `${name}=; path=/; max-age=0`;
}

// Session management functions
export function createUserSession(userId: string) {
  setClientCookie(SESSION_COOKIE_NAME, userId);
}

export function getCurrentUserId(): string | null {
  return getClientCookie(SESSION_COOKIE_NAME);
}

export function getCurrentUser() {
  const userId = getCurrentUserId();
  if (!userId) return null;
  return getUserById(userId);
}

export function logout() {
  deleteClientCookie(SESSION_COOKIE_NAME);
} 