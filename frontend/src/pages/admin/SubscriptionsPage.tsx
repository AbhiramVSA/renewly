import React, { useState } from 'react';
import { useSubscriptions, useDeleteSubscription, useCancelSubscription } from '@/hooks/subscription.hooks';
import { ManagerAndUp } from '@/components/auth/RoleGuard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { formatDistanceToNow } from 'date-fns';
import type { SubscriptionFilters, SubscriptionStatus, SubscriptionFrequency } from '@/types';

const STATUSES: SubscriptionStatus[] = ['active', 'pending', 'cancelled', 'expired'];
const FREQUENCIES: SubscriptionFrequency[] = ['daily', 'weekly', 'monthly', 'yearly'];

export const SubscriptionsPage: React.FC = () => {
  const [filters, setFilters] = useState<SubscriptionFilters>({
    page: 1,
    limit: 20,
  });
  const [search, setSearch] = useState('');

  const { data: subscriptionsData, isLoading, error } = useSubscriptions(filters);
  const deleteSubscriptionMutation = useDeleteSubscription();
  const cancelSubscriptionMutation = useCancelSubscription();

  const handleSearch = () => {
    setFilters(prev => ({ ...prev, q: search, page: 1 }));
  };

  const handleStatusFilter = (status: SubscriptionStatus | 'all') => {
    setFilters(prev => ({
      ...prev,
      status: status === 'all' ? undefined : status,
      page: 1,
    }));
  };

  const handleFrequencyFilter = (frequency: SubscriptionFrequency | 'all') => {
    setFilters(prev => ({
      ...prev,
      frequency: frequency === 'all' ? undefined : frequency,
      page: 1,
    }));
  };

  const handleCancelSubscription = async (id: string) => {
    try {
      await cancelSubscriptionMutation.mutateAsync(id);
    } catch (error) {
      console.error('Failed to cancel subscription:', error);
    }
  };

  const handleDeleteSubscription = async (id: string) => {
    try {
      await deleteSubscriptionMutation.mutateAsync(id);
    } catch (error) {
      console.error('Failed to delete subscription:', error);
    }
  };

  const getStatusColor = (status: SubscriptionStatus) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'cancelled':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'expired':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400';
    }
  };

  if (error) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="p-6">
            <p className="text-red-600">Error loading subscriptions: {error.message}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <ManagerAndUp fallback={
      <div className="p-6">
        <Card>
          <CardContent className="p-6">
            <p className="text-muted-foreground">You do not have permission to view this page.</p>
          </CardContent>
        </Card>
      </div>
    }>
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Subscriptions Management</h1>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Filters</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Search subscriptions..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
              </div>
              <Button onClick={handleSearch}>Search</Button>
            </div>
            
            <div className="flex gap-4">
              <Select
                value={filters.status || 'all'}
                onValueChange={handleStatusFilter}
              >
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  {STATUSES.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={filters.frequency || 'all'}
                onValueChange={handleFrequencyFilter}
              >
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by frequency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Frequencies</SelectItem>
                  {FREQUENCIES.map((frequency) => (
                    <SelectItem key={frequency} value={frequency}>
                      {frequency.charAt(0).toUpperCase() + frequency.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Subscriptions Table */}
        <Card>
          <CardHeader>
            <CardTitle>Subscriptions</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">Loading subscriptions...</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Frequency</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Next Renewal</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {subscriptionsData?.items.map((subscription) => (
                    <TableRow key={subscription._id}>
                      <TableCell className="font-medium">{subscription.name}</TableCell>
                      <TableCell>
                        {typeof subscription.user === 'object' 
                          ? subscription.user.name 
                          : subscription.user}
                      </TableCell>
                      <TableCell>
                        {subscription.currency} {subscription.price.toFixed(2)}
                      </TableCell>
                      <TableCell>
                        {subscription.frequency.charAt(0).toUpperCase() + subscription.frequency.slice(1)}
                      </TableCell>
                      <TableCell>
                        {subscription.category.charAt(0).toUpperCase() + subscription.category.slice(1)}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className={getStatusColor(subscription.status)}>
                          {subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {subscription.status === 'active' 
                          ? formatDistanceToNow(new Date(subscription.renewalDate), { addSuffix: true })
                          : '-'
                        }
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          {subscription.status === 'active' && (
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  disabled={cancelSubscriptionMutation.isPending}
                                >
                                  Cancel
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Cancel Subscription</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to cancel {subscription.name}?
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleCancelSubscription(subscription._id)}
                                  >
                                    Confirm
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          )}
                          
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button 
                                variant="destructive" 
                                size="sm"
                                disabled={deleteSubscriptionMutation.isPending}
                              >
                                Delete
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Subscription</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete {subscription.name}? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeleteSubscription(subscription._id)}
                                  className="bg-destructive hover:bg-destructive/90"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}

            {/* Pagination */}
            {subscriptionsData?.pagination && (
              <div className="flex justify-between items-center mt-4">
                <p className="text-sm text-muted-foreground">
                  Showing {subscriptionsData.items.length} of {subscriptionsData.pagination.total} subscriptions
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setFilters(prev => ({ ...prev, page: (prev.page || 1) - 1 }))}
                    disabled={!subscriptionsData.pagination.page || subscriptionsData.pagination.page <= 1}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setFilters(prev => ({ ...prev, page: (prev.page || 1) + 1 }))}
                    disabled={subscriptionsData.items.length < (subscriptionsData.pagination.limit || 20)}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </ManagerAndUp>
  );
};
