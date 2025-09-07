import React, { useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useUserSubscriptions, useCreateSubscription, useUpdateSubscription, useCancelSubscription, useDeleteSubscription } from '@/hooks/subscription.hooks';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Edit, Trash2, Ban, ArrowLeft, Home as HomeIcon, Wallet, TrendingUp } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import type { SubscriptionFilters, SubscriptionStatus, SubscriptionFrequency } from '@/types';
import { toast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';
import { Layout } from '@/components/layout/Layout';

const FREQUENCIES: SubscriptionFrequency[] = ['daily', 'weekly', 'monthly', 'yearly'];
const CURRENCIES = ['USD', 'EUR', 'INR'] as const;
const CATEGORIES = ['sports','news','entertainment','technology','education','lifestyle','finance','political','other'] as const;

const subscriptionSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  price: z.number().min(0, 'Price must be non-negative'),
  currency: z.string().min(1, 'Currency is required'),
  frequency: z.enum(['daily', 'weekly', 'monthly', 'yearly']),
  category: z.string().min(1, 'Category is required'),
  startDate: z.string().min(1, 'Start date is required'),
  paymentMethod: z.string().min(1, 'Payment method is required'),
});

type SubscriptionFormData = z.infer<typeof subscriptionSchema>;

export const UserSubscriptionsPage: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();
  const todayStr = new Date().toISOString().split('T')[0];
  const [filters, setFilters] = useState<Omit<SubscriptionFilters, 'user'>>({
    page: 1,
    limit: 20,
  });
  const [search, setSearch] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingSubscription, setEditingSubscription] = useState<any>(null);

  const { data: subscriptionsData, isLoading, error } = useUserSubscriptions(
    user?._id || '',
    filters,
    !!user?._id
  );

  const createMutation = useCreateSubscription();
  const updateMutation = useUpdateSubscription();
  const cancelMutation = useCancelSubscription();
  const deleteMutation = useDeleteSubscription();

  const form = useForm<SubscriptionFormData>({
    resolver: zodResolver(subscriptionSchema),
    defaultValues: {
      currency: 'USD',
      frequency: 'monthly',
    },
  });

  // Animations
  const container = {
    hidden: { opacity: 0, y: 6 },
    show: { opacity: 1, y: 0, transition: { staggerChildren: 0.05 } }
  };
  const item = {
    hidden: { opacity: 0, y: 8 },
    show: { opacity: 1, y: 0 }
  };

  // Derived stats
  const stats = useMemo(() => {
    const items = subscriptionsData?.items ?? [];
    const total = items.length;
    const active = items.filter(s => s.status === 'active').length;
    const cancelled = items.filter(s => s.status === 'cancelled').length;
    const estMonthly = items.reduce((sum, s) => {
      const p = typeof s.price === 'number' ? s.price : Number(s.price || 0);
      const mult = s.frequency === 'daily' ? 30 : s.frequency === 'weekly' ? 52/12 : s.frequency === 'monthly' ? 1 : s.frequency === 'yearly' ? 1/12 : 0;
      return sum + p * mult;
    }, 0);
    return { total, active, cancelled, estMonthly };
  }, [subscriptionsData]);

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

  const onSubmit = async (data: SubscriptionFormData) => {
    try {
      // Basic client-side validation to avoid server 400s
      if (!data.name?.trim()) {
        toast({ title: 'Name required', description: 'Please enter a name.', variant: 'destructive' });
        return;
      }
      const priceNum = Number(data.price);
      if (!Number.isFinite(priceNum) || priceNum <= 0) {
        toast({ title: 'Invalid price', description: 'Price must be a positive number.', variant: 'destructive' });
        return;
      }
      if (!data.frequency) {
        toast({ title: 'Frequency required', description: 'Please select a frequency.', variant: 'destructive' });
        return;
      }
      if (!data.startDate) {
        toast({ title: 'Start date required', description: 'Please choose a start date.', variant: 'destructive' });
        return;
      }
      // Prevent future start dates (backend will reject)
      const start = new Date(data.startDate);
      const endOfToday = new Date();
      endOfToday.setHours(23, 59, 59, 999);
      if (start > endOfToday) {
        toast({ title: 'Invalid start date', description: 'Start date cannot be in the future.', variant: 'destructive' });
        return;
      }

      // Normalize payment method to likely enum format (e.g., CREDIT_CARD)
      const normalizePaymentMethod = (pm?: string) =>
        (pm || '').trim().replace(/\s+/g, '_').toUpperCase();

      // Parse date inputs like YYYY-MM-DD or MM/DD/YYYY safely to ISO
      const toISODate = (value: string) => {
        const v = value.trim();
        let dt: Date | null = null;
        if (/^\d{4}-\d{2}-\d{2}$/.test(v)) {
          // Treat as local date; construct via UTC to avoid TZ shift
          const [y, m, d] = v.split('-').map(Number);
          dt = new Date(Date.UTC(y, m - 1, d));
        } else if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(v)) {
          const [mm, dd, yyyy] = v.split('/').map(Number);
          dt = new Date(Date.UTC(yyyy, (mm || 1) - 1, dd || 1));
        } else {
          const parsed = new Date(v);
          dt = isNaN(parsed.getTime()) ? null : parsed;
        }
        return (dt ?? new Date()).toISOString();
      };

      // Ensure startDate is ISO string as backend expects
      const payload = {
        name: data.name?.trim(),
        price: priceNum,
  currency: (data.currency || 'USD').trim().toUpperCase(),
        frequency: data.frequency,
  category: (data.category?.trim() || 'entertainment').toLowerCase(),
        startDate: toISODate(data.startDate),
        paymentMethod: normalizePaymentMethod(data.paymentMethod) || 'CREDIT_CARD',
      };
      if (editingSubscription) {
        await updateMutation.mutateAsync({
          id: editingSubscription._id,
          data: payload,
        });
        setEditingSubscription(null);
      } else {
        await createMutation.mutateAsync(payload);
        setIsCreateDialogOpen(false);
      }
      form.reset();
    } catch (error: any) {
      const msg = error?.response?.data?.message || 'Failed to save subscription';
      console.error('Failed to save subscription:', error);
      toast({
        title: 'Create failed',
        description: typeof msg === 'string' ? msg : 'Please check your inputs and try again.',
        variant: 'destructive',
      });
    }
  };

  const handleEdit = (subscription: any) => {
    setEditingSubscription(subscription);
    form.reset({
      name: subscription.name,
      price: subscription.price,
      currency: subscription.currency,
      frequency: subscription.frequency,
      category: subscription.category,
      startDate: subscription.startDate.split('T')[0], // Convert to YYYY-MM-DD format
      paymentMethod: subscription.paymentMethod,
    });
  };

  const handleCancel = async (id: string) => {
    try {
      await cancelMutation.mutateAsync(id);
    } catch (error) {
      console.error('Failed to cancel subscription:', error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteMutation.mutateAsync(id);
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
      <Layout>
        <div className="p-6">
          <Card>
            <CardContent className="p-6">
              <p className="text-red-600">Error loading subscriptions: {error.message}</p>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  // Auto-open create dialog on /subscriptions/new
  useEffect(() => {
    if (location.pathname.endsWith('/new')) {
      setIsCreateDialogOpen(true);
    }
  }, [location.pathname]);

  return (
    <Layout>
    <motion.div className="p-6 space-y-6" initial="hidden" animate="show" variants={container}>
      {/* Simple render guard to prevent white-screen on unexpected nulls */}
      {!user && (
        <motion.div variants={item}>
          <Card>
            <CardContent className="p-6">
              <p className="text-muted-foreground">You need to sign in to manage subscriptions.</p>
            </CardContent>
          </Card>
        </motion.div>
      )}
      <motion.div className="flex justify-between items-center" variants={item}>
        <div className="flex items-center gap-3">
          <Link to="/dashboard">
            <Button variant="ghost" className="hover:translate-x-[-1px] transition-transform text-red-600 hover:text-red-700">
              <ArrowLeft className="mr-2 h-4 w-4" /> Dashboard
            </Button>
          </Link>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-red-500 to-red-700 bg-clip-text text-transparent">My Subscriptions</h1>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="transition-transform hover:scale-[1.02] bg-red-500 hover:bg-red-600 text-white">
              <Plus className="mr-2 h-4 w-4" />
              Add Subscription
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px] bg-zinc-900 text-zinc-100 border-white/10">
            <DialogHeader>
              <DialogTitle>Add New Subscription</DialogTitle>
              <DialogDescription>
                Add a new subscription to track your recurring payments.
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Netflix, Spotify, etc." {...field} className="rounded-2xl bg-zinc-800/70 border-white/10 text-zinc-100 placeholder:text-zinc-400 shadow-inner" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Price</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            placeholder="9.99"
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                            className="rounded-2xl bg-zinc-800/70 border-white/10 text-zinc-100 placeholder:text-zinc-400 shadow-inner"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="currency"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Currency</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="rounded-2xl bg-zinc-800/70 border-white/10 text-zinc-100">
                              <SelectValue placeholder="Select currency" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-zinc-900 text-zinc-100 border-white/10">
                            {CURRENCIES.map((cur) => (
                              <SelectItem key={cur} value={cur}>{cur}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="frequency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Frequency</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="rounded-2xl bg-zinc-800/70 border-white/10 text-zinc-100">
                            <SelectValue placeholder="Select frequency" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-zinc-900 text-zinc-100 border-white/10">
                          {FREQUENCIES.map((frequency) => (
                            <SelectItem key={frequency} value={frequency}>
                              {frequency.charAt(0).toUpperCase() + frequency.slice(1)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="rounded-2xl bg-zinc-800/70 border-white/10 text-zinc-100">
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-zinc-900 text-zinc-100 border-white/10">
                          {CATEGORIES.map((cat) => (
                            <SelectItem key={cat} value={cat}>
                              {cat.charAt(0).toUpperCase() + cat.slice(1)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="startDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Start Date</FormLabel>
                      <FormControl>
                        <Input type="date" max={todayStr} {...field} className="rounded-2xl bg-zinc-800/70 border-white/10 text-zinc-100 shadow-inner" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="paymentMethod"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Payment Method</FormLabel>
                      <FormControl>
                        <Input placeholder="Credit Card, PayPal, etc." {...field} className="rounded-2xl bg-zinc-800/70 border-white/10 text-zinc-100 placeholder:text-zinc-400 shadow-inner" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button 
                    type="submit" 
                    disabled={createMutation.isPending}
                    className="bg-red-500 hover:bg-red-600 text-white"
                  >
                    {createMutation.isPending ? 'Creating...' : 'Create Subscription'}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </motion.div>

      {/* Quick stats */}
  <motion.div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" variants={item}>
    <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-4 flex items-center gap-3">
            <Wallet className="h-5 w-5 text-primary" />
            <div>
      <div className="text-sm text-muted-foreground">Est. Monthly Spend</div>
              <div className="text-lg font-semibold">{stats.estMonthly.toFixed(2)}</div>
            </div>
          </CardContent>
        </Card>
    <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-4 flex items-center gap-3">
            <TrendingUp className="h-5 w-5 text-red-500" />
            <div>
      <div className="text-sm text-muted-foreground">Active</div>
              <div className="text-lg font-semibold">{stats.active}</div>
            </div>
          </CardContent>
        </Card>
    <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
    <div className="text-sm text-muted-foreground">Cancelled</div>
            <div className="text-lg font-semibold">{stats.cancelled}</div>
          </CardContent>
        </Card>
    <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
    <div className="text-sm text-muted-foreground">Total</div>
            <div className="text-lg font-semibold">{stats.total}</div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Filters */}
      <motion.div variants={item}>
        <Card>
          <CardHeader>
            <CardTitle className="text-red-600">Filters</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search subscriptions..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="rounded-2xl bg-white text-zinc-900 placeholder:text-zinc-500 shadow-sm"
              />
            </div>
            <Button onClick={handleSearch} className="bg-red-600 hover:bg-red-700 text-white rounded-2xl">Search</Button>
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
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
              </SelectContent>
            </Select>
              {/* Quick filter pills */}
              <div className="flex items-center gap-2">
                {(['all','active','cancelled'] as const).map(s => (
                  <Button
                    key={s}
                    variant={filters.status === (s as any) || (!filters.status && s==='all') ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleStatusFilter(s === 'all' ? 'all' : (s as any))}
                    className={`rounded-full ${filters.status === (s as any) || (!filters.status && s==='all') ? 'bg-red-500 hover:bg-red-600 text-white' : 'border-red-300 text-red-600 hover:bg-red-50'}`}
                  >
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                  </Button>
                ))}
              </div>
          </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Subscriptions Table */}
      <motion.div variants={item}>
        <Card>
          <CardHeader>
              <CardTitle className="text-red-600">Your Subscriptions</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="py-4 space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="h-10 w-full rounded-md bg-muted animate-pulse" />
                ))}
              </div>
            ) : (subscriptionsData?.items?.length ? (
              <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Frequency</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Next Renewal</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <motion.tbody variants={container} initial="hidden" animate="show" className="contents">
                {(subscriptionsData?.items ?? []).map((subscription) => (
                  <motion.tr key={subscription._id} variants={item} className="hover:bg-muted/50 transition-colors">
                    <TableCell className="font-medium">{subscription.name}</TableCell>
                    <TableCell>
                      {`${subscription.currency ?? ''} ${(
                        typeof subscription.price === 'number'
                          ? subscription.price
                          : Number(subscription.price ?? 0)
                      ).toFixed(2)}`}
                    </TableCell>
                    <TableCell>
                      {subscription.frequency
                        ? subscription.frequency.charAt(0).toUpperCase() + subscription.frequency.slice(1)
                        : '-'}
                    </TableCell>
                    <TableCell>
                      {subscription.category
                        ? subscription.category.charAt(0).toUpperCase() + subscription.category.slice(1)
                        : '-'}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className={getStatusColor(subscription.status)}>
                        {subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {subscription.status === 'active' && subscription.renewalDate
                        ? formatDistanceToNow(new Date(subscription.renewalDate), { addSuffix: true })
                        : '-'
                      }
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(subscription)}
                          className="transition-transform hover:scale-[1.02] border-red-300 text-red-600 hover:bg-red-50"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        
                        {subscription.status === 'active' && (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button 
                                variant="outline" 
                                size="sm"
                                disabled={cancelMutation.isPending}
                                className="transition-transform hover:scale-[1.02] border-red-300 text-red-600 hover:bg-red-50"
                              >
                                <Ban className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="bg-zinc-900 text-zinc-100 border-white/10">
                              <AlertDialogHeader>
                                <AlertDialogTitle>Cancel Subscription</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to cancel {subscription.name}?
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleCancel(subscription._id)}
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
                              disabled={deleteMutation.isPending}
                              className="transition-transform hover:scale-[1.02] bg-red-500 hover:bg-red-600 text-white border-0"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent className="bg-zinc-900 text-zinc-100 border-white/10">
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Subscription</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete {subscription.name}? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(subscription._id)}
                                className="bg-destructive hover:bg-destructive/90"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </motion.tr>
                ))}
                </motion.tbody>
              </TableBody>
            </Table>
            ) : (
              <div className="py-12 text-center space-y-4">
                <div className="mx-auto h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                  <HomeIcon className="h-6 w-6 text-muted-foreground" />
                </div>
                <div className="text-lg font-semibold">No subscriptions yet</div>
                <div className="text-sm text-muted-foreground">Get started by adding your first subscription.</div>
                <Button onClick={() => setIsCreateDialogOpen(true)} className="transition-transform hover:scale-[1.02] bg-red-500 hover:bg-red-600 text-white">
                  <Plus className="mr-2 h-4 w-4" /> Add Subscription
                </Button>
              </div>
            ))}

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
                  className="border-red-300 text-red-600 hover:bg-red-50"
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setFilters(prev => ({ ...prev, page: (prev.page || 1) + 1 }))}
                  disabled={subscriptionsData.items.length < (subscriptionsData.pagination.limit || 20)}
                  className="border-red-300 text-red-600 hover:bg-red-50"
                >
                  Next
                </Button>
              </div>
            </div>
          )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Edit Dialog */}
  <Dialog open={!!editingSubscription} onOpenChange={() => setEditingSubscription(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Subscription</DialogTitle>
            <DialogDescription>
              Update your subscription details.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {/* Same form fields as create dialog but pre-filled */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Netflix, Spotify, etc." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder="9.99"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="currency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Currency</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select currency" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {CURRENCIES.map((cur) => (
                            <SelectItem key={cur} value={cur}>{cur}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="frequency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Frequency</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select frequency" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {FREQUENCIES.map((frequency) => (
                          <SelectItem key={frequency} value={frequency}>
                            {frequency.charAt(0).toUpperCase() + frequency.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {CATEGORIES.map((cat) => (
                          <SelectItem key={cat} value={cat}>
                            {cat.charAt(0).toUpperCase() + cat.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="paymentMethod"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Payment Method</FormLabel>
                    <FormControl>
                      <Input placeholder="Credit Card, PayPal, etc." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button 
                  type="submit" 
                  disabled={updateMutation.isPending}
                  className="bg-red-500 hover:bg-red-600 text-white"
                >
                  {updateMutation.isPending ? 'Updating...' : 'Update Subscription'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
  </motion.div>
  </Layout>
  );
};
