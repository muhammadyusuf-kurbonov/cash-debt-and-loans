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

export function meta() {
  return [
    { title: "Welcome - Qarz.uz" },
    { name: "description", content: "Управление долгами и займами" },
  ];
}

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
      setAuthError(error.message || 'Ошибка авторизации');
    },
    onSettled() {
      setAuthenticating(false);
    },
  });

  useEffect(() => {
    if (isAuthenticated()) {
      navigate("/home");
    }
  }, [navigate]);

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
      handleAuthSuccess(data.token);
    },
    onError: (error: any) => {
      console.error('Sign in failed:', error);
      setAuthError(error.message || 'Ошибка авторизации');
    },
  });

  const handleAuthSuccess = (token: string) => {
    sessionStorage.setItem(TOKEN_STORAGE_KEY, token);
    ApiClient.getOpenAPIClient().setSecurityData(`Bearer ${token}`);
    navigate("/home");
  };

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    signInMutation.mutate({ email, password });
  };

  if (isAuthenticated()) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#efeff4] dark:bg-[#1c1c1d] flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 flex items-center justify-center px-4 py-3 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-primary text-2xl">account_balance_wallet</span>
          <h1 className="text-[19px] font-bold tracking-tight">Qarz.uz</h1>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-4 max-w-md mx-auto w-full">
        {/* Logo/Icon Section */}
        <div className="flex flex-col items-center mb-8">
          <div className="size-20 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
            <span className="material-symbols-outlined text-5xl text-primary">account_balance_wallet</span>
          </div>
          <p className="text-gray-500 dark:text-gray-400 text-center">
            Управляйте долгами и займами
          </p>
        </div>

        {/* Error Display */}
        {authError && (
          <div className="w-full mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl">
            <div className="flex items-start gap-3">
              <span className="material-symbols-outlined text-red-600 dark:text-red-400">error</span>
              <div>
                <p className="text-sm font-semibold text-red-800 dark:text-red-200">Ошибка авторизации</p>
                <p className="text-sm text-red-600 dark:text-red-300">{authError}</p>
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {authenticating ? (
          <div className="w-full bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-8">
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">Авторизация через Telegram...</p>
            </div>
          </div>
        ) : (
          <div className="w-full space-y-4">
            {/* Telegram Login Section */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6">
              <div className="flex items-center justify-center mb-4">
                <div className="size-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <span className="material-symbols-outlined text-2xl text-[#2481cc]">send</span>
                </div>
              </div>
              <TelegramLoginButton 
                handleAuthClick={() => telegramSignInMutation.mutate(initDataRaw!)}
                isLoading={telegramSignInMutation.isPending}
              />
            </div>

            {/* Divider */}
            <div className="relative py-2">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300 dark:border-gray-700" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-3 bg-[#efeff4] dark:bg-[#1c1c1d] text-gray-500 dark:text-gray-400">или войдите через email</span>
              </div>
            </div>

            {/* Email/Password Login Section */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6">
              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-gray-300">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your.email@example.com"
                    required
                    className="h-12 rounded-xl border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium text-gray-700 dark:text-gray-300">Пароль</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="h-12 rounded-xl border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900"
                  />
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full h-12 rounded-xl text-base font-semibold"
                  disabled={signInMutation.isPending}
                >
                  {signInMutation.isPending ? (
                    <span className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Вход...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <span className="material-symbols-outlined">login</span>
                      Войти
                    </span>
                  )}
                </Button>
              </form>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="py-4 text-center">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Управляйте долгами и займами с друзьями и контактами
        </p>
      </footer>
    </div>
  );
}
