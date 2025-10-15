// lib/telegram-auth.ts
import { apiClient } from './api-client';

interface TelegramAuthData {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  auth_date: number;
  hash: string;
}

interface TelegramAuthResponse {
  token: string;
  user: {
    id: number;
    telegram_id?: string;
    name?: string;
  };
}

/**
 * Authenticate with Telegram through the backend using initData
 */
export async function authenticateWithTelegram(initData: string): Promise<TelegramAuthResponse> {
  const response = await fetch(`${apiClient.baseUrl}/auth/telegram_sigin`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      initData,
    }),
  });

  if (!response.ok) {
    throw new Error(`Telegram auth failed: ${response.statusText}`);
  }

  const result = await response.json();
  // Store the token in localStorage for future API requests
  localStorage.setItem('token', result.token);
  return result;
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
  return !!localStorage.getItem('token');
}

/**
 * Get the current user's token
 */
export function getToken(): string | null {
  return localStorage.getItem('token');
}

/**
 * Log out the current user
 */
export function logout(): void {
  localStorage.removeItem('token');
}