// lib/telegram-auth.ts
import type { JwtPayload } from 'jwt-decode';
import { jwtDecode } from 'jwt-decode';


export const TOKEN_STORAGE_KEY = 'dl_auth_token';

/**
 * Get the current user's auth token from session storage
 */
export function getUserToken(): string | null {
  return sessionStorage.getItem(TOKEN_STORAGE_KEY);
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
  const token = sessionStorage.getItem(TOKEN_STORAGE_KEY);
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
