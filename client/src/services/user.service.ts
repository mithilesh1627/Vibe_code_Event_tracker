import { apiClient } from './api.js';
import { User, UserProfileResponse, UserReminderSettings } from '../types/auth.types.js';

export const userService = {
  getProfile: () => {
    return apiClient<UserProfileResponse>('/users/me', {
      method: 'GET',
    });
  },

  updateProfile: (data: { name?: string; avatar?: string }) => {
    return apiClient<User>('/users/me', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  updateReminders: (data: Partial<UserReminderSettings>) => {
    return apiClient<UserReminderSettings>('/users/me/reminders', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },
};
