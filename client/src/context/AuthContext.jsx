import { createContext, useState, useEffect, useContext } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { isSupabaseConfigured, supabase } from '../config/supabase';

const AuthContext = createContext();
const AUTH_CHECK_TIMEOUT_MS = 5000;

const withTimeout = (promise, ms, message) => {
  return Promise.race([
    promise,
    new Promise((_, reject) => {
      setTimeout(() => reject(new Error(message)), ms);
    }),
  ]);
};

export const useAuth = () => useContext(AuthContext);

const getStoredUser = () => {
  try {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  } catch {
    localStorage.removeItem('user');
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(getStoredUser);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkLoggedIn = async () => {
      let tokenToValidate = localStorage.getItem('token');
      try {
        let token = tokenToValidate;

        // First try to grab session from Supabase (Google OAuth flow), but never
        // let an unavailable Supabase project block the app shell from rendering.
        if (isSupabaseConfigured) {
          try {
            const { data: { session } } = await withTimeout(
              supabase.auth.getSession(),
              AUTH_CHECK_TIMEOUT_MS,
              'Supabase session check timed out'
            );
            token = session?.access_token || token;
            tokenToValidate = token;
          } catch (error) {
            console.warn('Supabase session check skipped:', error.message);
          }
        }

        if (token) {
          // Keep our custom local storage in sync
          localStorage.setItem('token', token);
          const res = await api.get('/auth/me');
          setUser(res.data.data.user);
          localStorage.setItem('user', JSON.stringify(res.data.data.user));
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        const activeToken = localStorage.getItem('token');
        if (!activeToken || activeToken === tokenToValidate || activeToken === error.config?._authToken) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setUser(null);
        }
      } finally {
        setLoading(false);
      }
    };

    checkLoggedIn();

    // Subscribe to Supabase Auth State changes for OAuth redirects
    if (!isSupabaseConfigured) return;

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        localStorage.setItem('token', session.access_token);
        setTimeout(async () => {
          try {
            const res = await api.get('/auth/me');
            setUser(res.data.data.user);
            localStorage.setItem('user', JSON.stringify(res.data.data.user));
          } catch (error) {
            console.error('Auth profile fetch failed:', error);
          }
        }, 0);
      } else if (event === 'SIGNED_OUT') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email, password, isAdmin = false) => {
    try {
      const endpoint = isAdmin ? '/auth/admin/login' : '/auth/login';
      const res = await api.post(endpoint, { email, password }, { skipAuth: true });

      const { user, token } = res.data.data;
      if (token) localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      setUser(user);

      toast.success(res.data.message);
      return { success: true, role: user.role };
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed';
      toast.error(message);
      return { success: false, message };
    }
  };

  const register = async (name, email, password) => {
    try {
      const res = await api.post('/auth/register', { name, email, password }, { skipAuth: true });

      const { user, token, requiresEmailConfirmation } = res.data.data;
      if (requiresEmailConfirmation || !token) {
        toast.success(res.data.message);
        return { success: true, requiresEmailConfirmation: true };
      }

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      setUser(user);

      toast.success(res.data.message);
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed';
      toast.error(message);
      return { success: false, message };
    }
  };

  const loginWithGoogle = async () => {
    try {
      if (!isSupabaseConfigured) {
        const message = 'Google sign-in is not configured yet.';
        toast.error(message);
        return { success: false, message };
      }

      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/student/dashboard`,
        },
      });
      if (error) {
        toast.error(error.message);
        return { success: false, message: error.message };
      }
      // The redirect will happen automatically; onAuthStateChange handles the rest
      return { success: true };
    } catch (err) {
      toast.error('Google sign-in failed');
      return { success: false, message: err.message };
    }
  };

  const logout = async () => {
    if (isSupabaseConfigured) {
      await supabase.auth.signOut();
    }
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    toast.success('Logged out successfully');
  };

  return (
    <AuthContext.Provider value={{ user, currentUser: user, loading, login, register, loginWithGoogle, logout }}>
      {loading ? (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--background, #F8FAFC)',
          color: 'var(--foreground, #0F172A)',
          fontFamily: 'Plus Jakarta Sans, sans-serif',
        }}>
          Loading CampusCast...
        </div>
      ) : children}
    </AuthContext.Provider>
  );
};
