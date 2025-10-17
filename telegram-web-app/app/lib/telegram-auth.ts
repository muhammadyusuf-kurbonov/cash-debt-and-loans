// lib/telegram-auth.ts
import type { AuthResponseDto } from '~/api/api-client';
import { ApiClient } from './api-client';

/**
 * Authenticate with Telegram through the backend using initData
 */
export async function authenticateWithTelegram(initData: string): Promise<AuthResponseDto> {
  const response = await ApiClient.getOpenAPIClient().auth.authControllerTelegramSignUp({
    initData,
  });

  if (!response.ok) {
    throw new Error(`Telegram auth failed: ${response.statusText}`);
  }
  // Store the token in localStorage for future API requests
  localStorage.setItem('token', response.data.token);
  return response.data;
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