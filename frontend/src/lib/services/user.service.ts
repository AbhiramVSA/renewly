import api from '@/lib/api';
import type { 
  ApiResponse, 
  User, 
  UserFilters, 
  PaginationData,
  ChangeRoleForm,
  CreateUserForm,
  UpdateUserForm
} from '@/types';

export const userService = {
  // Get all users (SUPER_ADMIN | ADMIN only)
  getUsers: async (filters?: UserFilters): Promise<PaginationData<User>> => {
    const params = new URLSearchParams();
    
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());
    if (filters?.sort) params.append('sort', filters.sort);
    if (filters?.q) params.append('q', filters.q);
    
    const response = await api.get<ApiResponse<PaginationData<User>>>(
      `/api/v1/user/users?${params.toString()}`
    );
    
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to fetch users');
    }
    
    return response.data.data!;
  },

  // Get user by ID
  getUserById: async (id: string): Promise<User> => {
    const response = await api.get<ApiResponse<User>>(`/api/v1/user/${id}`);
    
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to fetch user');
    }
    
    return response.data.data!;
  },

  // Update user role (SUPER_ADMIN | ADMIN only)
  updateUserRole: async (userId: string, data: ChangeRoleForm): Promise<User> => {
    const response = await api.patch<ApiResponse<User>>(`/api/v1/user/${userId}/role`, data);
    
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to update user role');
    }
    
    return response.data.data!;
  },

  // Create user (SUPER_ADMIN | ADMIN only)
  createUser: async (data: CreateUserForm): Promise<User> => {
    const response = await api.post<ApiResponse<User>>('/api/v1/user/', data);
    
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to create user');
    }
    
    return response.data.data!;
  },

  // Update user
  updateUser: async (id: string, data: UpdateUserForm): Promise<User> => {
    const response = await api.put<ApiResponse<User>>(`/api/v1/user/${id}`, data);
    
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to update user');
    }
    
    return response.data.data!;
  },

  // Delete user (SUPER_ADMIN only)
  deleteUser: async (id: string): Promise<void> => {
    const response = await api.delete<ApiResponse>(`/api/v1/user/${id}`);
    
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to delete user');
    }
  }
};
