import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { userService } from '@/lib/services';
import { toast } from '@/hooks/use-toast';
import type { 
  UserFilters, 
  ChangeRoleForm, 
  CreateUserForm, 
  UpdateUserForm 
} from '@/types';

// Query keys
export const userKeys = {
  all: ['users'] as const,
  lists: () => [...userKeys.all, 'list'] as const,
  list: (filters: UserFilters) => [...userKeys.lists(), filters] as const,
  details: () => [...userKeys.all, 'detail'] as const,
  detail: (id: string) => [...userKeys.details(), id] as const,
};

// Queries
export const useUsers = (filters?: UserFilters) => {
  return useQuery({
    queryKey: userKeys.list(filters || {}),
    queryFn: () => userService.getUsers(filters),
    retry: 1,
  });
};

export const useUser = (id: string, enabled = true) => {
  return useQuery({
    queryKey: userKeys.detail(id),
    queryFn: () => userService.getUserById(id),
    enabled: enabled && !!id,
    retry: 1,
  });
};

// Mutations
export const useCreateUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: userService.createUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      toast({
        title: 'Success',
        description: 'User created successfully',
      });
    },
    retry: 0,
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateUserForm }) =>
      userService.updateUser(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      queryClient.invalidateQueries({ queryKey: userKeys.detail(variables.id) });
      toast({
        title: 'Success',
        description: 'User updated successfully',
      });
    },
    retry: 0,
  });
};

export const useUpdateUserRole = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ userId, data }: { userId: string; data: ChangeRoleForm }) =>
      userService.updateUserRole(userId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      queryClient.invalidateQueries({ queryKey: userKeys.detail(variables.userId) });
      toast({
        title: 'Success',
        description: 'User role updated successfully',
      });
    },
    retry: 0,
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: userService.deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      toast({
        title: 'Success',
        description: 'User deleted successfully',
      });
    },
    retry: 0,
  });
};
