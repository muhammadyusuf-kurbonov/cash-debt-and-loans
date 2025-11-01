import { retrieveLaunchParams, type LaunchParams } from '@tma.js/sdk';

/**
 * Initializes the Telegram Mini Apps SDK with error handling
 * This function will only initialize when run inside Telegram
 */
export async function initializeTMA(): Promise<{ initDataRaw: string | undefined }> {
  // Check if we're in a browser environment
  if (typeof window === 'undefined') {
    return { initDataRaw: undefined };
  }

  try {
    // Attempt to retrieve launch parameters
    const retrievedParams: LaunchParams = retrieveLaunchParams();

    // Return raw init data if available
    return { initDataRaw: retrievedParams.initDataRaw || undefined };
  } catch (error) {
    console.warn('Telegram Mini Apps SDK not initialized:', error);
    // Return undefined if we're not in a Telegram environment
    return { initDataRaw: undefined };
  }
}

/**
 * Check if the app is running inside Telegram
 */
export function isRunningInTelegram(): boolean {
  // Check for common Telegram environment indicators
  if (typeof window === 'undefined') {
    return false;
  }

  // Check if the Telegram Web App script is available
  const tg = (window as any).Telegram?.WebApp;
  if (tg) {
    return true;
  }

  // Check for tgWebAppData in URL params or in the window.Telegram object
  try {
    const urlParams = new URLSearchParams(window.location.search);
    const tgWebAppData = urlParams.get('tgWebAppData');

    if (tgWebAppData) {
      return true;
    }
  } catch (e) {
    // If there's an error accessing URL, we might be in an unexpected environment
    console.warn('Could not access URL for Telegram check', e);
  }

  return false;
}