import { useRawInitData } from '@tma.js/sdk-react';
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import TelegramLoginButton from "~/components/telegram-login-button";
import { authenticateWithTelegram, isAuthenticated } from "~/lib/telegram-auth";

export default function WelcomePage() {
  const navigate = useNavigate();
  const [authenticating, setAuthenticating] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const initDataRaw = useRawInitData();

  useEffect(() => {
    // If user is already authenticated, redirect to home
    if (isAuthenticated()) {
      navigate("/home");
      return;
    }

    // Auto-authenticate if in Telegram Web App
    const autoAuthenticate = async () => {
      if (initDataRaw) {
        setAuthenticating(true);
        setAuthError(null);
        
        try {
          // Authenticate with our backend
          await authenticateWithTelegram(initDataRaw);
          
          // Redirect to home after successful authentication
          navigate("/home");
        } catch (error: any) {
          console.error('Auto-authentication failed:', error);
          setAuthError(error.message || 'Authentication failed');
          setAuthenticating(false);
        }
      }
    };

    autoAuthenticate();
  }, [navigate, initDataRaw]);

  const handleAuthSuccess = () => {
    // Redirect to home after successful authentication
    navigate("/home");
  };

  // If authenticated, don't show the welcome page
  if (isAuthenticated()) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-indigo-100 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="p-8">
          <div className="text-center">
            <div className="mx-auto bg-blue-100 rounded-full p-4 w-24 h-24 flex items-center justify-center mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Qarz.uz</h1>
            <p className="text-gray-600 mb-8">Track your debts and loans efficiently</p>
            
            {authenticating ? (
              <div className="flex flex-col items-center">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500 mb-4"></div>
                <p className="text-gray-600">Authenticating with Telegram...</p>
              </div>
            ) : authError ? (
              <div className="mb-6 p-4 bg-red-50 rounded-lg">
                <p className="text-red-600 text-sm">{authError}</p>
                <p className="text-gray-600 text-sm mt-2">
                  Please make sure you're opening this in the Telegram app.
                </p>
              </div>
            ) : (
              <div className="mt-6">
                <TelegramLoginButton 
                  onAuthSuccess={handleAuthSuccess}
                  onAuthError={(error) => {
                    console.error("Authentication error:", error);
                    setAuthError(error.message || 'Authentication failed');
                  }}
                />
              </div>
            )}
          </div>
        </div>
        
        <div className="bg-gray-50 px-8 py-6 text-center">
          <p className="text-gray-600 text-sm">
            This app works inside Telegram. Open this link in the Telegram app to get started.
          </p>
        </div>
      </div>
    </div>
  );
}