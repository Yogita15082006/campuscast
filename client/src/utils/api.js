import axios from 'axios';
import { isSupabaseConfigured, supabase } from '../config/supabase';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: 10000,
});

const SESSION_TIMEOUT_MS = 3000;

const withTimeout = (promise, ms) => {
  return Promise.race([
    promise,
    new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Supabase session lookup timed out')), ms);
    }),
  ]);
};

// Add a request interceptor
api.interceptors.request.use(
  async (config) => {
    if (config.skipAuth) {
      delete config.headers.Authorization;
      config._authToken = null;
      return config;
    }

    let token = localStorage.getItem('token');

    if (isSupabaseConfigured) {
      try {
        const { data: { session } } = await withTimeout(
          supabase.auth.getSession(),
          SESSION_TIMEOUT_MS
        );
        token = session?.access_token || token;
      } catch (error) {
        console.warn('Supabase session lookup skipped:', error.message);
      }
    }

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    config._authToken = token || null;
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      const requestUrl = error.config?.url || '';
      const isAuthEndpoint = requestUrl.includes('/auth/login') ||
        requestUrl.includes('/auth/admin/login') ||
        requestUrl.includes('/auth/register');
      const requestToken = error.config?._authToken;
      const currentToken = localStorage.getItem('token');
      const shouldClearSession = !isAuthEndpoint && requestToken && requestToken === currentToken;

      if (shouldClearSession) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }

      if (shouldClearSession && !window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
