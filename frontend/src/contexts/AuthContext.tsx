import React, { createContext, useContext, useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import api, { setTokens, clearTokens, getAccessToken } from '@/lib/api';
import { decodeToken } from '@/lib/auth';
import type { User, SignInForm, SignUpForm, AuthResponse, ApiResponse } from '@/types';
import { toast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signIn: (data: SignInForm) => Promise<void>;
  signUp: (data: SignUpForm) => Promise<void>;
  signOut: () => Promise<void>;
  signOutAll: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const queryClient = useQueryClient();

  const isAuthenticated = !!user;

  // Initialize auth state from stored data
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = getAccessToken() || localStorage.getItem('accessToken');
        const storedUser = localStorage.getItem('user');
        
        if (token && storedUser) {
          const userData = JSON.parse(storedUser);
          
          // Verify token is still valid
          const decoded = decodeToken(token);
          if (decoded && decoded.exp > Date.now() / 1000) {
            setTokens(token);
            setUser(userData);
          } else {
            // Token expired, clear stored data
            clearTokens();
            localStorage.removeItem('accessToken');
            localStorage.removeItem('user');
          }
        }
      } catch (error) {
        console.error('Failed to initialize auth:', error);
        clearTokens();
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const signIn = async (data: SignInForm) => {
    try {
      const response = await api.post<ApiResponse<AuthResponse>>('/api/v1/auth/sign-in', data);

      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to sign in');
      }

      const { token, refreshToken, user: userData } = response.data.data!;

      setTokens(token, refreshToken);
      setUser(userData);

      // Store for persistence
      localStorage.setItem('accessToken', token);
      localStorage.setItem('user', JSON.stringify(userData));

      toast({
        title: 'Welcome back!',
        description: `Signed in as ${userData.name}`,
      });
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to sign in';
      throw new Error(message);
    }
  };

  const signUp = async (data: SignUpForm) => {
    try {
      const response = await api.post<ApiResponse<AuthResponse>>('/api/v1/auth/sign-up', data);

      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to create account');
      }

      const { token, refreshToken, user: userData } = response.data.data!;

      setTokens(token, refreshToken);
      setUser(userData);

      // Store for persistence
      localStorage.setItem('accessToken', token);
      localStorage.setItem('user', JSON.stringify(userData));

      toast({
        title: 'Account created!',
        description: `Welcome to Renewly, ${userData.name}`,
      });
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to create account';
      throw new Error(message);
    }
  };

  const signOut = async () => {
    try {
  const rt = localStorage.getItem('refreshToken') || undefined;
  await api.post('/api/v1/auth/sign-out', rt ? { refreshToken: rt } : undefined);
    } catch (error) {
      console.error('Sign out error:', error);
    } finally {
      clearTokens();
      localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      setUser(null);
      queryClient.clear();
      
      toast({
        title: 'Signed out',
        description: 'You have been signed out successfully',
      });
    }
  };

  const signOutAll = async () => {
    try {
      await api.post('/api/v1/auth/sign-out-all');
    } catch (error) {
      console.error('Sign out all error:', error);
    } finally {
      clearTokens();
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
      setUser(null);
      queryClient.clear();
      
      toast({
        title: 'Signed out from all devices',
        description: 'All active sessions have been terminated',
      });
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    signIn,
    signUp,
    signOut,
    signOutAll,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};