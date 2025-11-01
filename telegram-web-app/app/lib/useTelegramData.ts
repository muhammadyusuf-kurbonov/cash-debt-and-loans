import { useEffect, useState } from 'react';
import { initializeTMA, isRunningInTelegram } from './tma-initializer';

/**
 * Custom hook to safely access Telegram Mini Apps data
 * Returns undefined when not in Telegram environment, or mock data in development
 */
export function useTelegramData() {
  const [initDataRaw, setInitDataRaw] = useState<string | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [isTelegram, setIsTelegram] = useState(false);

  useEffect(() => {
    const checkAndSetTelegramData = async () => {
      try {
        const inTelegram = isRunningInTelegram();
        setIsTelegram(inTelegram);

        if (inTelegram) {
          const { initDataRaw: raw } = await initializeTMA();
          setInitDataRaw(raw);
          setIsTelegram(true);
        }
      } catch (error) {
        console.warn('Error initializing Telegram data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAndSetTelegramData();

    // Clean up in case we need to reset the state
    return () => {
      setIsLoading(true);
    };
  }, []);

  return { initDataRaw, isLoading, isTelegram };
}