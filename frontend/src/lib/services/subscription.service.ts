import api from '@/lib/api';
import type { 
  ApiResponse, 
  Subscription, 
  SubscriptionFilters, 
  PaginationData,
  SubscriptionForm,
  UpcomingRenewal
} from '@/types';

export const subscriptionService = {
  // Get all subscriptions (SUPER_ADMIN | ADMIN | MANAGER only)
  getSubscriptions: async (filters?: SubscriptionFilters): Promise<PaginationData<Subscription>> => {
    const params = new URLSearchParams();
    
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());
    if (filters?.sort) params.append('sort', filters.sort);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.frequency) params.append('frequency', filters.frequency);
    if (filters?.category) params.append('category', filters.category);
    if (filters?.user) params.append('user', filters.user);
    if (filters?.q) params.append('q', filters.q);
    
    const response = await api.get<ApiResponse<PaginationData<Subscription>>>(
      `/api/v1/subscriptions?${params.toString()}`
    );
    
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to fetch subscriptions');
    }

    // Normalize: support both PaginationData and raw array
    const payload = response.data.data as any;
    if (Array.isArray(payload)) {
      return { items: payload, pagination: { page: 1, limit: payload.length, total: payload.length } };
    }
    return payload as PaginationData<Subscription>;
  },

  // Get user subscriptions
  getUserSubscriptions: async (userId: string, filters?: Omit<SubscriptionFilters, 'user'>): Promise<PaginationData<Subscription>> => {
    const params = new URLSearchParams();
    
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());
    if (filters?.status) params.append('status', filters.status);
    if (filters?.frequency) params.append('frequency', filters.frequency);
    if (filters?.category) params.append('category', filters.category);
    
    const response = await api.get<ApiResponse<PaginationData<Subscription>>>(
      `/api/v1/subscriptions/user/${userId}?${params.toString()}`
    );
    
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to fetch user subscriptions');
    }

    // Normalize: support both PaginationData and raw array
    const payload = response.data.data as any;
    if (Array.isArray(payload)) {
      return { items: payload, pagination: { page: 1, limit: payload.length, total: payload.length } };
    }
    return payload as PaginationData<Subscription>;
  },

  // Get upcoming renewals
  getUpcomingRenewals: async (): Promise<UpcomingRenewal[]> => {
    const response = await api.get<ApiResponse<UpcomingRenewal[]>>('/api/v1/subscriptions/upcoming-renewals');
    
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to fetch upcoming renewals');
    }
    
    return response.data.data!;
  },

  // Get subscription by ID
  getSubscriptionById: async (id: string): Promise<Subscription> => {
    const response = await api.get<ApiResponse<Subscription>>(`/api/v1/subscriptions/${id}`);
    
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to fetch subscription');
    }
    
    return response.data.data!;
  },

  // Create subscription
  createSubscription: async (data: SubscriptionForm): Promise<Subscription> => {
    const response = await api.post<ApiResponse<Subscription>>('/api/v1/subscriptions', data);
    
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to create subscription');
    }
    
    return response.data.data!;
  },

  // Update subscription
  updateSubscription: async (id: string, data: Partial<SubscriptionForm>): Promise<Subscription> => {
    const response = await api.put<ApiResponse<Subscription>>(`/api/v1/subscriptions/${id}`, data);
    
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to update subscription');
    }
    
    return response.data.data!;
  },

  // Cancel subscription
  cancelSubscription: async (id: string): Promise<Subscription> => {
    const response = await api.put<ApiResponse<Subscription>>(`/api/v1/subscriptions/${id}/cancel`);
    
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to cancel subscription');
    }
    
    return response.data.data!;
  },

  // Delete subscription
  deleteSubscription: async (id: string): Promise<void> => {
    const response = await api.delete<ApiResponse>(`/api/v1/subscriptions/${id}`);
    
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to delete subscription');
    }
  }
};
