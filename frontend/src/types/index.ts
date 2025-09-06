// Core types for Renewly platform

export interface User {
  _id: string;
  name: string;
  email: string;
  role: Role;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  lastLogin?: string;
}

export interface Subscription {
  _id: string;
  user: string | User;
  name: string;
  price: number;
  currency: string;
  frequency: SubscriptionFrequency;
  category: string;
  startDate: string;
  renewalDate: string;
  status: SubscriptionStatus;
  paymentMethod: string;
  createdAt: string;
  updatedAt: string;
}

export type Role = 
  | 'SUPER_ADMIN' 
  | 'ADMIN' 
  | 'MANAGER' 
  | 'USER' 
  | 'READ_ONLY' 
  | 'SERVICE';

export type SubscriptionStatus = 
  | 'active' 
  | 'pending' 
  | 'cancelled' 
  | 'expired';

export type SubscriptionFrequency = 
  | 'daily'
  | 'weekly'
  | 'monthly' 
  | 'yearly';

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: object;
}

export interface AuthResponse {
  token: string;
  refreshToken: string;
  user: User;
}

export interface RefreshResponse {
  token: string;
  refreshToken: string;
}

export interface PaginationData<T> {
  items: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
}

export interface UpcomingRenewal {
  _id: string;
  name: string;
  renewalDate: string;
  status: SubscriptionStatus;
  user: {
    _id: string;
    name: string;
  };
}

// JWT Payload
export interface JWTPayload {
  sub: string;
  email: string;
  role: Role;
  iat: number;
  exp: number;
}

// Filter and pagination types
export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface SubscriptionFilters extends PaginationParams {
  status?: SubscriptionStatus;
  frequency?: SubscriptionFrequency;
  category?: string;
  user?: string;
  q?: string;
  sort?: string;
}

export interface UserFilters extends PaginationParams {
  role?: Role;
  isActive?: boolean;
  search?: string;
  sort?: string;
  q?: string;
}

// Form types
export interface SignInForm {
  email: string;
  password: string;
}

export interface SignUpForm {
  name: string;
  email: string;
  password: string;
}

export interface SubscriptionForm {
  name: string;
  price: number;
  currency: string;
  frequency: SubscriptionFrequency;
  category: string;
  startDate: string;
  paymentMethod: string;
}

export interface ProfileForm {
  name: string;
  email: string;
}

export interface ChangeRoleForm {
  role: Role;
}

export interface CreateUserForm {
  name: string;
  email: string;
  password: string;
  role?: Role;
}

export interface UpdateUserForm {
  name?: string;
  email?: string;
  isActive?: boolean;
}

// Dashboard analytics
export interface DashboardStats {
  totalSubscriptions: number;
  activeSubscriptions: number;
  totalSpend: number;
  upcomingRenewals: number;
}

// Navigation
export interface NavItem {
  title: string;
  href: string;
  icon?: React.ComponentType<any>;
  description?: string;
  disabled?: boolean;
  external?: boolean;
  roles?: Role[];
}