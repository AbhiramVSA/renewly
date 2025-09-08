import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { toast } from '@/hooks/use-toast';

// Create axios instance; prefer build-time VITE_API_BASE_URL, then runtime window.__API_BASE_URL, else same-origin
const buildTimeBase = (import.meta as any)?.env?.VITE_API_BASE_URL;
// @ts-ignore - allow optional global override set in index.html: <script>window.__API_BASE_URL='https://...'</script>
const runtimeBase = typeof window !== 'undefined' ? (window as any).__API_BASE_URL : '';
const resolvedBase = buildTimeBase || runtimeBase || '';
if (!buildTimeBase && runtimeBase && console) {
  console.info('[api] Using runtime window.__API_BASE_URL fallback:', runtimeBase);
}
if (!resolvedBase) {
  console.warn('[api] No API base URL set (VITE_API_BASE_URL or window.__API_BASE_URL). Requests will use same-origin.');
}
const api: AxiosInstance = axios.create({
  baseURL: resolvedBase,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

// Token management
let accessToken: string | null = null;
let refreshToken: string | null = null;
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value: any) => void;
  reject: (error: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(token);
    }
  });
  
  failedQueue = [];
};

// Set tokens
export const setTokens = (access: string, refresh?: string) => {
  accessToken = access;
  if (refresh) {
    refreshToken = refresh;
  }
  
  // Store refresh token in localStorage as fallback
  if (refresh) {
    localStorage.setItem('refreshToken', refresh);
  }
};

// Get tokens
export const getAccessToken = () => accessToken;
export const getRefreshToken = () => refreshToken || localStorage.getItem('refreshToken');

// Clear tokens
export const clearTokens = () => {
  accessToken = null;
  refreshToken = null;
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user');
};

// Request interceptor to add auth header
api.interceptors.request.use(
  (config) => {
    // If no global baseURL, let relative URLs hit same-origin
    if (!api.defaults.baseURL && typeof config.url === 'string' && config.url.startsWith('/')) {
      config.baseURL = '';
    }
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for token refresh
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // If a 401 occurs on auth endpoints, don't attempt refresh; just surface the error
    const reqUrl: string = originalRequest?.url || '';
    const isAuthEndpoint =
      reqUrl.includes('/api/v1/auth/sign-in') ||
      reqUrl.includes('/api/v1/auth/sign-up') ||
      reqUrl.includes('/api/v1/auth/refresh');

    if (error.response?.status === 401 && !originalRequest._retry && !isAuthEndpoint) {
      if (isRefreshing) {
        // If already refreshing, queue the request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        }).catch((err) => {
          return Promise.reject(err);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const currentRefreshToken = getRefreshToken();
        
        if (!currentRefreshToken) {
          throw new Error('No refresh token available');
        }

  const response = await api.post(
          '/api/v1/auth/refresh',
          { refreshToken: currentRefreshToken }
        );

        if (!response.data.success) {
          throw new Error(response.data.message || 'Failed to refresh token');
        }

        const { token: newAccessToken, refreshToken: newRefreshToken } = response.data.data;
        
        setTokens(newAccessToken, newRefreshToken);
        processQueue(null, newAccessToken);
        
        // Retry original request with new token
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);
        
      } catch (refreshError) {
        processQueue(refreshError, null);
        clearTokens();
        
        // Redirect to login
        window.location.href = '/auth/sign-in';
        
        toast({
          title: 'Session Expired',
          description: 'Please sign in again.',
          variant: 'destructive',
        });
        
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // Handle other errors
    if (error.response?.data?.message) {
      toast({
        title: 'Error',
        description: error.response.data.message,
        variant: 'destructive',
      });
    } else if (error.message) {
      toast({
        title: 'Network Error',
        description: error.message,
        variant: 'destructive',
      });
    }

    return Promise.reject(error);
  }
);

export default api;