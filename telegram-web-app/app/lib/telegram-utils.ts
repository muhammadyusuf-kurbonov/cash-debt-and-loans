import { isTMA } from '@tma.js/sdk-react';

/**
 * Switch to inline query mode in Telegram
 * This allows the user to select a chat to send an inline query to
 * 
 * @param query - The inline query to send
 * @param chatTypes - Array of chat types to allow ('users', 'bots', 'groups', 'channels')
 * @returns boolean indicating if the operation was successful
 */
export function switchToInlineQuery(query: string, chatTypes?: ('users' | 'bots' | 'groups' | 'channels')[]): boolean {
  try {
    if (typeof window !== 'undefined' && (window as any).Telegram?.WebApp) {
      // Check if we're in a Telegram Mini App environment
      if (isTMA()) {
        (window as any).Telegram.WebApp.switchInlineQuery(query, chatTypes);
        return true;
      } else {
        console.warn('Not in Telegram Mini App environment');
        return false;
      }
    } else {
      console.warn('Telegram WebApp not available');
      return false;
    }
  } catch (error) {
    console.error('Error calling switchInlineQuery:', error);
    return false;
  }
}

/**
 * Request contact information from the user
 * Note: This only works in certain contexts and may not provide Telegram user ID directly
 * 
 * @param callback - Callback function that receives a boolean indicating success
 * @returns boolean indicating if the operation was initiated successfully
 */
export async function requestContact(callback?: (success: boolean) => void): Promise<boolean> {
  try {
    if (typeof window !== 'undefined' && (window as any).Telegram?.WebApp) {
      // Check if we're in a Telegram Mini App environment
      if (await isTMA()) {
        (window as any).Telegram.WebApp.requestContact(callback);
        return true;
      } else {
        console.warn('Not in Telegram Mini App environment');
        return false;
      }
    } else {
      console.warn('Telegram WebApp not available');
      return false;
    }
  } catch (error) {
    console.error('Error calling requestContact:', error);
    return false;
  }
}