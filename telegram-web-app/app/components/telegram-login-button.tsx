import React from 'react';
import { isAuthenticated } from '~/lib/telegram-auth';
import { useTelegramData } from '~/lib/useTelegramData';
import { Button } from '~/components/ui/button';

interface TelegramLoginButtonProps {
  handleAuthClick?: () => void;
  isLoading: boolean;
}

const TelegramLoginButton: React.FC<TelegramLoginButtonProps> = ({
  handleAuthClick,
  isLoading,
}) => {
  const { initDataRaw, isTelegram } = useTelegramData();

  if (isAuthenticated()) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center">
        <Button disabled className="w-full h-12 rounded-xl bg-[#2481cc] hover:bg-[#1a6db3] text-white">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
          Подключение...
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center">
      {isTelegram ? (
        <>
          {initDataRaw ? (
            <Button 
              onClick={handleAuthClick}
              className="w-full h-12 rounded-xl bg-[#2481cc] hover:bg-[#1a6db3] text-white font-semibold"
            >
              <span className="material-symbols-outlined mr-2">send</span>
              Войти через Telegram
            </Button>
          ) : (
            <div className="w-full p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <span className="material-symbols-outlined text-amber-600 dark:text-amber-400">warning</span>
                <span className="font-semibold text-amber-800 dark:text-amber-200">Нет данных авторизации</span>
              </div>
              <p className="text-sm text-amber-700 dark:text-amber-300">Перезапустите бота в Telegram.</p>
            </div>
          )}
        </>
      ) : (
        <div className="w-full p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="material-symbols-outlined text-[#2481cc]">smart_toy</span>
            <span className="font-semibold text-blue-800 dark:text-blue-200">Откройте в Telegram</span>
          </div>
          <p className="text-sm text-blue-700 dark:text-blue-300 mb-3">
            Для лучшего опыта откройте приложение в Telegram
          </p>
          <a 
            href="https://t.me/qarzuz_bot"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#2481cc] hover:bg-[#1a6db3] text-white rounded-lg font-medium transition-colors"
          >
            <span className="material-symbols-outlined text-sm">open_in_new</span>
            Открыть @qarzuz_bot
          </a>
        </div>
      )}
    </div>
  );
};

export default TelegramLoginButton;
