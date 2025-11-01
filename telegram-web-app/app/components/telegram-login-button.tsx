import React from 'react';
import { isAuthenticated } from '~/lib/telegram-auth';
import { useTelegramData } from '~/lib/useTelegramData';

interface TelegramLoginButtonProps {
  handleAuthClick?: () => void;
  isLoading: boolean;
}

const TelegramLoginButton: React.FC<TelegramLoginButtonProps> = ({
  handleAuthClick,
  isLoading,
}) => {
  const { initDataRaw, isTelegram } = useTelegramData();
  // If already authenticated, we can return a different component or just null
  if (isAuthenticated()) {
    return null;
  }

  // Show loading state while checking Telegram environment
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-4">
        <p className="text-lg mb-4">Checking environment...</p>
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center p-4">
      {isTelegram ? (
        <>
          <p className="text-lg mb-4">Continue with Telegram</p>
          {initDataRaw ? (
            <button 
              onClick={handleAuthClick}
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg transition duration-200"
            >
              Continue in Telegram
            </button>
          ) : (
            <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded relative" role="alert">
              <strong className="font-bold">Note: </strong>
              <span className="block sm:inline">No authentication data received. Please restart the bot.</span>
            </div>
          )}
        </>
      ) : (
        <>
          <p className="text-lg mb-4">This app can work inside Telegram</p>
          <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded relative" role="alert">
            <strong className="font-bold">Note: </strong>
            <span className="block sm:inline">Open this link in the Telegram app and pass auth.</span>
          </div>
        </>
      )}
    </div>
  );
};

export default TelegramLoginButton;