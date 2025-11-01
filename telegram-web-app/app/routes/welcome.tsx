import { useMutation } from '@tanstack/react-query';
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import TelegramLoginButton from "~/components/telegram-login-button";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { ApiClient } from '~/lib/api-client';
import { isAuthenticated, TOKEN_STORAGE_KEY } from "~/lib/telegram-auth";
import { useTelegramData } from "~/lib/useTelegramData";

export default function WelcomePage() {
  const navigate = useNavigate();
  const [authenticating, setAuthenticating] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { initDataRaw } = useTelegramData();

  const telegramSignInMutation = useMutation({
    mutationFn: async (initData: string) => {
      const response = await ApiClient.getOpenAPIClient().auth.authControllerTelegramSignUp({
        initData,
      });

      if (response.status >= 400) {
        throw new Error(`Telegram auth failed: ${response.statusText}`);
      }

      return response.data;
    },
    onSuccess: (response) => {
      handleAuthSuccess(response.token);
    },
    onError: (error) => {
      console.error('Sign in failed:', error);
      setAuthError(error.message || 'Sign in failed');
    },
  });

  // Check if user is already authenticated
  useEffect(() => {
    if (isAuthenticated()) {
      navigate("/home");
    }
  }, [navigate]);

  // Auto-authenticate if in Telegram Web App
  useEffect(() => {
    if (isAuthenticated()) {
      return;
    }
    
    if (!initDataRaw) {
      console.log('No init data');
      return;
    }
    setAuthenticating(true);
    setAuthError(null);
    
    telegramSignInMutation.mutate(initDataRaw);
  }, [telegramSignInMutation, initDataRaw]);

  // Sign in mutation
  const signInMutation = useMutation({
    mutationFn: async ({ email, password }: { email: string; password: string }) => {
      const api = ApiClient.getOpenAPIClient();
      const response = await api.auth.authControllerSignIn({
        email,
        password,
      });
      return response.data;
    },
    onSuccess: (data) => {
      // Store the token in localStorage
      
      handleAuthSuccess(data.token);
    },
    onError: (error: any) => {
      console.error('Sign in failed:', error);
      setAuthError(error.message || 'Sign in failed');
    }
  });

  const handleAuthSuccess = (token: string) => {
    localStorage.setItem(TOKEN_STORAGE_KEY, token);

    // Set the token for future API requests
    ApiClient.getOpenAPIClient().setSecurityData(`Bearer ${token}`);
    
    // Redirect to home after successful authentication
    navigate("/home");
  };

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    signInMutation.mutate({ email, password });
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
              </div>
            ) : (
              <div className="space-y-6">
                {/* Telegram Login Section */}
                <div>
                  <div className="relative mb-4">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-300" />
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-white text-gray-500">Or continue with</span>
                    </div>
                  </div>
                  
                  <TelegramLoginButton 
                    handleAuthClick={() => telegramSignInMutation.mutate(initDataRaw!)}
                    isLoading={telegramSignInMutation.isPending}
                  />
                </div>
                
                {/* Email/Password Login Section */}
                <div>
                  <div className="relative mb-4">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-300" />
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-white text-gray-500">Or use email</span>
                    </div>
                  </div>
                  
                  <form onSubmit={handleSignIn} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="your.email@example.com"
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <Input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                      />
                    </div>
                    
                    <Button 
                      type="submit" 
                      className="w-full"
                      disabled={signInMutation.isPending}
                    >
                      {signInMutation.isPending ? 'Signing in...' : 'Sign In'}
                    </Button>
                  </form>
                </div>
              </div>
            )}
          </div>
        </div>
        
        <div className="bg-gray-50 px-8 py-6 text-center">
          <p className="text-gray-600 text-sm">
            Track your debts and loans with friends and contacts
          </p>
        </div>
      </div>
    </div>
  );
}