import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userService } from '../services/user.service.js';
import { useAuth } from '../context/AuthContext.js';
import { UserReminderSettings } from '../types/auth.types.js';

export const useUserProfile = () => {
  const { isAuthenticated } = useAuth();

  return useQuery({
    queryKey: ['user-profile'],
    queryFn: () => userService.getProfile(),
    enabled: isAuthenticated,
    staleTime: 1000 * 60 * 3,
  });
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  const { refreshUser } = useAuth();

  return useMutation({
    mutationFn: (data: { name?: string; avatar?: string }) => userService.updateProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-profile'] });
      refreshUser();
    },
  });
};

export const useUpdateReminders = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<UserReminderSettings>) => userService.updateReminders(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-profile'] });
    },
  });
};
