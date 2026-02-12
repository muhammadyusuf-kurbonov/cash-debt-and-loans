import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft } from 'lucide-react';
import { ApiClient } from '~/lib/api-client';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card';
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
      <div className="p-4 max-w-md mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Ошибка</CardTitle>
            <CardDescription>Не удалось загрузить профиль</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => refetch()}>Повторить</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-md mx-auto space-y-6">
      <div className="mb-4">
        <Button
          variant="outline"
          onClick={() => navigate(-1)}
          className="flex items-center"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Назад
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Профиль</CardTitle>
          <CardDescription>Обновите имя и email</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleProfileSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Имя</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ваше имя"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your.email@example.com"
              />
            </div>
            
            <Button 
              type="submit" 
              disabled={updateProfileMutation.isPending}
            >
              {updateProfileMutation.isPending ? 'Сохранение...' : 'Сохранить'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Сменить пароль</CardTitle>
          <CardDescription>Установите или обновите пароль</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Текущий пароль</Label>
              <Input
                id="currentPassword"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Оставьте пустым, если не задан"
                // Disable if user doesn't have a password set yet
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="newPassword">Новый пароль</Label>
              <Input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Новый пароль"
                minLength={6}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="confirmNewPassword">Подтвердите пароль</Label>
              <Input
                id="confirmNewPassword"
                type="password"
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                placeholder="Подтвердите новый пароль"
                minLength={6}
              />
            </div>
            
            <Button 
              type="submit" 
              disabled={updatePasswordMutation.isPending}
            >
              {updatePasswordMutation.isPending ? 'Сохранение...' : 'Сменить пароль'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}