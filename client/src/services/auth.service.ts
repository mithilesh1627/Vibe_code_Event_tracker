import { apiClient } from './api.js';
import { AuthResponse, User } from '../types/auth.types.js';

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export const authService = {
  register: (payload: RegisterPayload) => {
    return apiClient<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  login: (payload: LoginPayload) => {
    return apiClient<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  getCurrentUser: () => {
    return apiClient<User>('/auth/me', {
      method: 'GET',
    });
  },
};
