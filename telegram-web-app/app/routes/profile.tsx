import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft } from 'lucide-react';
import { ApiClient } from '~/lib/api-client';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { toast } from 'sonner';

export function meta() {
  return [
    { title: "Profile Settings - Qarz.uz" },
    { name: "description", content: "Update your profile information and password" },
  ];
}

export default function Profile() {
  const api = ApiClient.getOpenAPIClient();
  const queryClient = useQueryClient();
  
  // Fetch user profile
  const { data: profile, isLoading, isError, refetch } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const response = await api.users.usersControllerGetProfile();
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async ({ name, email }: { name?: string; email?: string }) => {
      const response = await api.users.usersControllerUpdateProfile({
        name,
        email,
      });
      return response.data;
    },
    onSuccess: (updatedProfile) => {
      queryClient.setQueryData(['profile'], updatedProfile);
      toast.success('Профиль обновлён');
    },
    onError: (error) => {
      console.error('Error updating profile:', error);
      toast.error('Не удалось обновить профиль');
    }
  });

  // Update password mutation
  const updatePasswordMutation = useMutation({
    mutationFn: async ({ currentPassword, newPassword }: { currentPassword?: string; newPassword: string }) => {
      const response = await api.users.usersControllerUpdatePassword({
        currentPassword: currentPassword || '', // For users without a password
        newPassword,
      });
      return response.data;
    },
    onSuccess: (updatedProfile) => {
      queryClient.setQueryData(['profile'], updatedProfile);
      toast.success('Пароль обновлён');
    },
    onError: (error) => {
      console.error('Error updating password:', error);
      toast.error(`Не удалось обновить пароль: ${error}`);
    }
  });

  // State for form inputs
  const [name, setName] = useState(profile?.name || '');
  const [email, setEmail] = useState(profile?.email || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  // Update form state when profile data loads
  useEffect(() => {
    if (profile) {
      setName(profile.name || '');
      setEmail(profile.email || '');
    }
  }, [profile]);

  const handleProfileSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    updateProfileMutation.mutate({ name, email });
  }, [name, email, updateProfileMutation]);

  const navigate = useNavigate();

  const handlePasswordSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmNewPassword) {
      toast.error('Пароли не совпадают');
      return;
    }

    if (newPassword.length < 6) {
      toast.error('Пароль должен быть не менее 6 символов');
      return;
    }

    updatePasswordMutation.mutate({ 
      currentPassword: currentPassword || undefined, 
      newPassword 
    });
    
    // Reset password fields after submission
    setCurrentPassword('');
    setNewPassword('');
    setConfirmNewPassword('');
  }, [currentPassword, newPassword, confirmNewPassword, updatePasswordMutation]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (isError || !profile) {
    return (
      <div className="flex flex-col items-center justify-center h-screen px-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6 text-center max-w-sm w-full">
          <span className="material-symbols-outlined text-4xl text-rose-500 mb-2">error</span>
          <h2 className="text-lg font-semibold mb-1">Ошибка</h2>
          <p className="text-sm text-muted-foreground mb-4">Не удалось загрузить профиль</p>
          <Button onClick={() => refetch()} className="w-full h-12 rounded-xl">Повторить</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <header className="sticky top-0 z-50 flex items-center gap-3 px-4 py-3 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
        <button onClick={() => navigate(-1)} className="p-1 -ml-1 cursor-pointer">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-[17px] font-semibold tracking-tight">Настройки</h1>
      </header>

      <main className="flex-1 px-4 py-6 space-y-6">
        {/* Profile Section */}
        <section>
          <p className="text-[13px] font-medium text-muted-foreground uppercase tracking-wider mb-2 ml-1">Профиль</p>
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden">
            <form onSubmit={handleProfileSubmit}>
              <div className="p-4 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm text-muted-foreground">Имя</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ваше имя"
                    className="h-12 rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm text-muted-foreground">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your.email@example.com"
                    className="h-12 rounded-xl"
                  />
                </div>
              </div>
              <div className="px-4 pb-4">
                <Button
                  type="submit"
                  className="w-full h-12 rounded-xl"
                  disabled={updateProfileMutation.isPending}
                >
                  {updateProfileMutation.isPending ? 'Сохранение...' : 'Сохранить'}
                </Button>
              </div>
            </form>
          </div>
        </section>

        {/* Password Section */}
        <section>
          <p className="text-[13px] font-medium text-muted-foreground uppercase tracking-wider mb-2 ml-1">Безопасность</p>
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden">
            <form onSubmit={handlePasswordSubmit}>
              <div className="p-4 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword" className="text-sm text-muted-foreground">Текущий пароль</Label>
                  <Input
                    id="currentPassword"
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Оставьте пустым, если не задан"
                    className="h-12 rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newPassword" className="text-sm text-muted-foreground">Новый пароль</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Новый пароль"
                    minLength={6}
                    className="h-12 rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmNewPassword" className="text-sm text-muted-foreground">Подтвердите пароль</Label>
                  <Input
                    id="confirmNewPassword"
                    type="password"
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    placeholder="Подтвердите новый пароль"
                    minLength={6}
                    className="h-12 rounded-xl"
                  />
                </div>
              </div>
              <div className="px-4 pb-4">
                <Button
                  type="submit"
                  className="w-full h-12 rounded-xl"
                  disabled={updatePasswordMutation.isPending}
                >
                  {updatePasswordMutation.isPending ? 'Сохранение...' : 'Сменить пароль'}
                </Button>
              </div>
            </form>
          </div>
        </section>
      </main>
    </div>
  );
}