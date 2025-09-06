import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { authService } from '@/lib/services';
import { useAuth } from '@/contexts/AuthContext';
import type { SignInForm, SignUpForm } from '@/types';

// Query keys
export const authKeys = {
  all: ['auth'] as const,
  me: () => [...authKeys.all, 'me'] as const,
};

// Mutations
export const useSignIn = () => {
  const { signIn } = useAuth();
  
  return useMutation({
    mutationFn: signIn,
    retry: 0, // Don't retry auth failures
  });
};

export const useSignUp = () => {
  const { signUp } = useAuth();
  
  return useMutation({
    mutationFn: signUp,
    retry: 0, // Don't retry auth failures
  });
};

export const useSignOut = () => {
  const { signOut } = useAuth();
  
  return useMutation({
    mutationFn: signOut,
    retry: 0,
  });
};

export const useSignOutAll = () => {
  const { signOutAll } = useAuth();
  
  return useMutation({
    mutationFn: signOutAll,
    retry: 0,
  });
};
