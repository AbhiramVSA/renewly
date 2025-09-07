import { useQuery } from '@tanstack/react-query';
import { Calendar, CreditCard, TrendingUp, AlertCircle, Plus, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useUpcomingRenewals, useUserSubscriptions } from '@/hooks/subscription.hooks';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDistanceToNow } from 'date-fns';
import type { DashboardStats } from '@/types';

const formatCurrency = (amount: number, currency: string = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
};

const formatDate = (date: string) => {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
  }).format(new Date(date));
};

const getDaysUntilRenewal = (renewalDate: string) => {
  const today = new Date();
  const renewal = new Date(renewalDate);
  const diffTime = renewal.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

const StatCard = ({ 
  title, 
  value, 
  description, 
  icon: Icon, 
  trend,
  isLoading = false 
}: {
  title: string;
  value: string | number;
  description: string;
  icon: React.ElementType;
  trend?: string;
  isLoading?: boolean;
}) => (
  <Card className="hover-lift">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      <Icon className="h-4 w-4 text-muted-foreground" />
    </CardHeader>
    <CardContent>
      {isLoading ? (
        <div className="space-y-2">
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-4 w-32" />
        </div>
      ) : (
        <>
          <div className="text-2xl font-bold">{value}</div>
          <p className="text-xs text-muted-foreground">{description}</p>
          {trend && (
            <div className="flex items-center pt-1">
              <TrendingUp className="h-3 w-3 text-red-500 mr-1" />
              <span className="text-xs text-red-500">{trend}</span>
            </div>
          )}
        </>
      )}
    </CardContent>
  </Card>
);

export const Dashboard = () => {
  const { user } = useAuth();
  const { data: upcomingRenewals, isLoading: renewalsLoading } = useUpcomingRenewals();
  const { data: userSubscriptions, isLoading: subscriptionsLoading } = useUserSubscriptions(
    user?._id || '',
    { limit: 100 }, // Get all subscriptions for stats
    !!user?._id
  );

  // Calculate dashboard stats from user subscriptions (guard against undefined)
  const subs = userSubscriptions?.items ?? [];
  const activeSubs = subs.filter((sub) => sub.status === 'active');
  const stats: DashboardStats = {
    totalSubscriptions: subs.length,
    activeSubscriptions: activeSubs.length,
    totalSpend: activeSubs.reduce((total, sub) => total + (sub.price || 0), 0),
    upcomingRenewals: upcomingRenewals?.length || 0,
  };

  const statsLoading = subscriptionsLoading;

  return (
    <Layout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Welcome back, {(user?.name || user?.email || 'User').split(' ')[0]}!
            </h1>
            <p className="text-muted-foreground">
              Here's an overview of your subscription management.
            </p>
          </div>
          <Button asChild className="bg-red-500 hover:bg-red-600 text-white">
            <Link to="/subscriptions/new">
              <Plus className="mr-2 h-4 w-4" />
              Add Subscription
            </Link>
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Subscriptions"
            value={stats?.totalSubscriptions || 0}
            description="All your subscriptions"
            icon={CreditCard}
            isLoading={statsLoading}
          />
          <StatCard
            title="Active Subscriptions"
            value={stats?.activeSubscriptions || 0}
            description="Currently active"
            icon={TrendingUp}
            trend="+2 from last month"
            isLoading={statsLoading}
          />
          <StatCard
            title="Monthly Spend"
            value={formatCurrency(stats?.totalSpend || 0)}
            description="Total monthly cost"
            icon={CreditCard}
            isLoading={statsLoading}
          />
          <StatCard
            title="Upcoming Renewals"
            value={stats?.upcomingRenewals || 0}
            description="Next 30 days"
            icon={Calendar}
            isLoading={statsLoading}
          />
        </div>

        {/* Upcoming Renewals */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-red-500" />
                Upcoming Renewals
              </CardTitle>
              <CardDescription>
                Subscriptions renewing in the next 30 days
              </CardDescription>
            </div>
            <Button variant="outline" asChild className="border-red-300 text-red-600 hover:bg-red-50">
              <Link to="/subscriptions?filter=upcoming">
                View All
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {renewalsLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center space-x-4">
                    <Skeleton className="h-12 w-12 rounded-lg" />
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                    <Skeleton className="h-6 w-16" />
                  </div>
                ))}
              </div>
            ) : upcomingRenewals && upcomingRenewals.length > 0 ? (
              <div className="space-y-4">
                {upcomingRenewals.map((subscription) => {
                  const daysUntil = getDaysUntilRenewal(subscription.renewalDate);
                  return (
                    <div
                      key={subscription._id}
                      className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="h-12 w-12 rounded-lg bg-red-500/10 flex items-center justify-center">
                          <CreditCard className="h-6 w-6 text-red-500" />
                        </div>
                        <div>
                          <p className="font-medium">{subscription.name}</p>
                          <p className="text-sm text-muted-foreground">
                            Renewing soon • {formatDistanceToNow(new Date(subscription.renewalDate), { addSuffix: true })}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge 
                          variant={daysUntil <= 7 ? "destructive" : daysUntil <= 14 ? "secondary" : "outline"}
                          className="mb-1"
                        >
                          {daysUntil === 0 ? 'Today' : 
                           daysUntil === 1 ? 'Tomorrow' : 
                           `${daysUntil} days`}
                        </Badge>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(subscription.renewalDate)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No upcoming renewals in the next 30 days</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="hover-lift interactive">
            <Link to="/subscriptions" className="block p-6">
              <div className="flex items-center space-x-4">
                <div className="h-12 w-12 rounded-lg bg-red-500/10 flex items-center justify-center">
                  <CreditCard className="h-6 w-6 text-red-500" />
                </div>
                <div>
                  <h3 className="font-semibold">Manage Subscriptions</h3>
                  <p className="text-sm text-muted-foreground">
                    View and manage all your subscriptions
                  </p>
                </div>
              </div>
            </Link>
          </Card>

          <Card className="hover-lift interactive">
            <Link to="/subscriptions/new" className="block p-6">
              <div className="flex items-center space-x-4">
                <div className="h-12 w-12 rounded-lg bg-red-500/10 flex items-center justify-center">
                  <Plus className="h-6 w-6 text-red-500" />
                </div>
                <div>
                  <h3 className="font-semibold">Add Subscription</h3>
                  <p className="text-sm text-muted-foreground">
                    Track a new subscription
                  </p>
                </div>
              </div>
            </Link>
          </Card>

          <Card className="hover-lift interactive">
            <Link to="/analytics" className="block p-6">
              <div className="flex items-center space-x-4">
                <div className="h-12 w-12 rounded-lg bg-red-500/10 flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-red-500" />
                </div>
                <div>
                  <h3 className="font-semibold">View Analytics</h3>
                  <p className="text-sm text-muted-foreground">
                    Analyze your spending patterns
                  </p>
                </div>
              </div>
            </Link>
          </Card>
        </div>
      </div>
    </Layout>
  );
};