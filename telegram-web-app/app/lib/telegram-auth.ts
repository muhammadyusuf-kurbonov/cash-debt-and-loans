// lib/telegram-auth.ts
import type { JwtPayload } from 'jwt-decode';
import { jwtDecode } from 'jwt-decode';
import type { AuthResponseDto } from '~/api/api-client';
import { ApiClient } from './api-client';

/**
 * Authenticate with Telegram through the backend using initData
 */
export async function authenticateWithTelegram(initData: string): Promise<AuthResponseDto> {
  const response = await ApiClient.getOpenAPIClient().auth.authControllerTelegramSignUp({
    initData,
  });

  if (response.status >= 400) {
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
  const token = localStorage.getItem('token');
  if (!token) {
    return false;
  }

  try {
    const decodedToken = jwtDecode<JwtPayload>(token);
    
    // Check if token has expired
    const currentTime = Math.floor(Date.now() / 1000);
    if (decodedToken.exp && currentTime >= decodedToken.exp) {
      return false;
    }

    // Check if token is not yet valid (nbf field)
    if (decodedToken.nbf && currentTime < decodedToken.nbf) {
      return false;
    }

    return true;
  } catch (error) {
    // If there's any error parsing the token, it's invalid
    console.error("Error validating JWT token:", error);
    return false;
  }
}

/**
 * Get the current user's token
 */
export function getToken(): string | null {
  const token = localStorage.getItem('token');
  
  // Only return the token if it's still valid
  if (token && isAuthenticated()) {
    return token;
  }
  
  return null;
}

/**
 * Log out the current user
 */
export function logout(): void {
  localStorage.removeItem('token');
}