import api from '@/lib/api';
import type { 
  ApiResponse, 
  AuthResponse, 
  RefreshResponse, 
  SignInForm, 
  SignUpForm 
} from '@/types';

export const authService = {
  signUp: async (data: SignUpForm): Promise<AuthResponse> => {
    const response = await api.post<ApiResponse<AuthResponse>>('/api/v1/auth/sign-up', data);
    
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to create account');
    }
    
    return response.data.data!;
  },

  signIn: async (data: SignInForm): Promise<AuthResponse> => {
    const response = await api.post<ApiResponse<AuthResponse>>('/api/v1/auth/sign-in', data);
    
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to sign in');
    }
    
    return response.data.data!;
  },

  refresh: async (refreshToken: string): Promise<RefreshResponse> => {
    const response = await api.post<ApiResponse<RefreshResponse>>('/api/v1/auth/refresh', {
      refreshToken
    });
    
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to refresh token');
    }
    
    return response.data.data!;
  },

  signOut: async (refreshToken?: string): Promise<void> => {
    const body = refreshToken ? { refreshToken } : undefined;
    const response = await api.post<ApiResponse>('/api/v1/auth/sign-out', body);
    
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to sign out');
    }
  },

  signOutAll: async (): Promise<void> => {
    const response = await api.post<ApiResponse>('/api/v1/auth/sign-out-all');
    
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to sign out from all devices');
    }
  }
};
