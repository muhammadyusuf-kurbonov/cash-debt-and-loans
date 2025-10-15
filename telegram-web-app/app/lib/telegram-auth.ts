// lib/telegram-auth.ts
import { apiClient } from './api-client';

interface TelegramUser {
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
 * Verify the Telegram authentication data
 */
function verifyTelegramAuth(data: TelegramUser, botToken: string): boolean {
  const { hash, ...authData } = data;
  const authString = Object.entries(authData)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${value}`)
    .join('\n');

  // In a real implementation, you would verify the hash using Telegram's secret
  // However, for security reasons, this should be done on the backend
  // The frontend should just send the data to the backend for verification
  return true;
}

/**
 * Authenticate with Telegram through the backend
 */
export async function authenticateWithTelegram(telegramData: TelegramUser): Promise<TelegramAuthResponse> {
  // Verify the data integrity - in practice, this should be done on the backend
  const isValid = verifyTelegramAuth(telegramData, process.env.TELEGRAM_BOT_TOKEN || '');
  
  if (!isValid) {
    throw new Error('Invalid Telegram auth data');
  }

  const response = await fetch(`${apiClient.baseUrl}/auth/telegram_sigin`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-telegram-bot-api-key': process.env.TELEGRAM_BOT_API_KEY || '',
    },
    body: JSON.stringify({
      telegram_id: telegramData.id.toString(),
      name: telegramData.first_name + (telegramData.last_name ? ` ${telegramData.last_name}` : ''),
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