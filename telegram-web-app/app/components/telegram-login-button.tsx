import React, { useEffect } from 'react';
import { authenticateWithTelegram, isAuthenticated } from '~/lib/telegram-auth';
import { useLaunchParams, useRawInitData } from '@telegram-apps/sdk-react';

interface TelegramLoginButtonProps {
  onAuthSuccess?: () => void;
  onAuthError?: (error: Error) => void;
}

const TelegramLoginButton: React.FC<TelegramLoginButtonProps> = ({
  onAuthSuccess,
  onAuthError,
}) => {
  const initData = useRawInitData();

  const handleAuth = async () => {
    try {
      // Get the init data (this contains the authentication data)
      if (!initData) {
        throw new Error('No init data available');
      }

      // Authenticate with our backend
      const result = await authenticateWithTelegram(initData);
      
      if (result.token) {
        if (onAuthSuccess) {
          onAuthSuccess();
        }
      }
    } catch (error) {
      console.error('Telegram auth error:', error);
      if (onAuthError) {
        onAuthError(error as Error);
      }
    }
  };

  // Check if user is already authenticated on component mount
  useEffect(() => {
    if (isAuthenticated()) {
      onAuthSuccess?.();
    }
  }, []);

  // If already authenticated, we can return a different component or just null
  if (isAuthenticated()) {
    return null;
  }

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <p className="text-lg mb-4">Please open this app in Telegram to continue</p>
      {initData ? (
        <button 
          onClick={handleAuth}
          className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg transition duration-200"
        >
          Continue in Telegram
        </button>
      ) : (
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Note: </strong>
          <span className="block sm:inline">This app is designed to work inside Telegram. Please open this link in the Telegram app.</span>
        </div>
      )}
    </div>
  );
};

export default TelegramLoginButton;