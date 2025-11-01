import { retrieveLaunchParams } from '@tma.js/sdk';
import { useEffect, useState } from 'react';

/**
 * Custom hook to safely access Telegram Mini Apps data
 * Returns undefined when not in Telegram environment, or mock data in development
 */
export function useTelegramData() {
  const [initDataRaw, setInitDataRaw] = useState<string | undefined>(undefined);
  const [isTelegram, setIsTelegram] = useState(false);

  useEffect(() => {
    try {
      const launchParams = retrieveLaunchParams();
  
      if (launchParams) {
        setIsTelegram(true);
        setInitDataRaw(launchParams.initDataRaw);
      }
    } catch (error) {
      console.log('We are not in TG');
    }
  }, []);

  return { initDataRaw, isTelegram };
}