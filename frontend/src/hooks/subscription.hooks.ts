import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { subscriptionService } from '@/lib/services';
import { toast } from '@/hooks/use-toast';
import type { 
  SubscriptionFilters, 
  SubscriptionForm 
} from '@/types';

// Query keys
export const subscriptionKeys = {
  all: ['subscriptions'] as const,
  lists: () => [...subscriptionKeys.all, 'list'] as const,
  list: (filters: SubscriptionFilters) => [...subscriptionKeys.lists(), filters] as const,
  userLists: () => [...subscriptionKeys.all, 'userList'] as const,
  userList: (userId: string, filters?: Omit<SubscriptionFilters, 'user'>) => 
    [...subscriptionKeys.userLists(), userId, filters] as const,
  details: () => [...subscriptionKeys.all, 'detail'] as const,
  detail: (id: string) => [...subscriptionKeys.details(), id] as const,
  upcomingRenewals: () => [...subscriptionKeys.all, 'upcomingRenewals'] as const,
};

// Queries
export const useSubscriptions = (filters?: SubscriptionFilters) => {
  return useQuery({
    queryKey: subscriptionKeys.list(filters || {}),
    queryFn: () => subscriptionService.getSubscriptions(filters),
    retry: 1,
  });
};

export const useUserSubscriptions = (
  userId: string, 
  filters?: Omit<SubscriptionFilters, 'user'>,
  enabled = true
) => {
  return useQuery({
    queryKey: subscriptionKeys.userList(userId, filters),
    queryFn: () => subscriptionService.getUserSubscriptions(userId, filters),
    enabled: enabled && !!userId,
    retry: 1,
  });
};

export const useSubscription = (id: string, enabled = true) => {
  return useQuery({
    queryKey: subscriptionKeys.detail(id),
    queryFn: () => subscriptionService.getSubscriptionById(id),
    enabled: enabled && !!id,
    retry: 1,
  });
};

export const useUpcomingRenewals = () => {
  return useQuery({
    queryKey: subscriptionKeys.upcomingRenewals(),
    queryFn: subscriptionService.getUpcomingRenewals,
    retry: 1,
  });
};

// Mutations
export const useCreateSubscription = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: subscriptionService.createSubscription,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: subscriptionKeys.lists() });
      queryClient.invalidateQueries({ queryKey: subscriptionKeys.userLists() });
      queryClient.invalidateQueries({ queryKey: subscriptionKeys.upcomingRenewals() });
      toast({
        title: 'Success',
        description: 'Subscription created successfully',
      });
    },
    retry: 0,
  });
};

export const useUpdateSubscription = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<SubscriptionForm> }) =>
      subscriptionService.updateSubscription(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: subscriptionKeys.lists() });
      queryClient.invalidateQueries({ queryKey: subscriptionKeys.userLists() });
      queryClient.invalidateQueries({ queryKey: subscriptionKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: subscriptionKeys.upcomingRenewals() });
      toast({
        title: 'Success',
        description: 'Subscription updated successfully',
      });
    },
    retry: 0,
  });
};

export const useCancelSubscription = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: subscriptionService.cancelSubscription,
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: subscriptionKeys.lists() });
      queryClient.invalidateQueries({ queryKey: subscriptionKeys.userLists() });
      queryClient.invalidateQueries({ queryKey: subscriptionKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: subscriptionKeys.upcomingRenewals() });
      toast({
        title: 'Success',
        description: 'Subscription cancelled successfully',
      });
    },
    retry: 0,
  });
};

export const useDeleteSubscription = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: subscriptionService.deleteSubscription,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: subscriptionKeys.lists() });
      queryClient.invalidateQueries({ queryKey: subscriptionKeys.userLists() });
      queryClient.invalidateQueries({ queryKey: subscriptionKeys.upcomingRenewals() });
      toast({
        title: 'Success',
        description: 'Subscription deleted successfully',
      });
    },
    retry: 0,
  });
};
