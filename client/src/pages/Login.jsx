import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { signInWithGoogle } from '../utils/googleAuth';
import { FiMail, FiLock } from 'react-icons/fi';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // If Supabase redirects here after Google OAuth
  useEffect(() => {
    const hash = window.location.hash;
    if (hash && hash.includes('access_token')) {
      const params = new URLSearchParams(hash.substring(1));
      const accessToken = params.get('access_token');
      if (accessToken) {
        // Automatically save the token and login
        localStorage.setItem('token', accessToken);
        // A real app would fetch user profile here. For now just reload to trigger AuthContext validation
        window.location.hash = '';
        window.location.href = '/student/dashboard';
      }
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    const res = await login(email, password, false);
    setIsLoading(false);
    if (res.success) {
      navigate('/student/dashboard');
    }
  };

  const handleGoogleLogin = async () => {
    await signInWithGoogle();
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[var(--color-dark-bg)] flex animate-fade-in">

      {/* Left Side: Form */}
      <div className="flex-1 flex flex-col justify-center px-4 sm:px-6 lg:flex-none lg:w-1/2 lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm">

          <div className="mb-10 text-center lg:text-left">
            <Link to="/" className="inline-flex items-center gap-2 mb-8">
              <div className="w-8 h-8 rounded bg-primary-600 flex items-center justify-center text-white font-bold text-lg">
                ((•))
              </div>
              <span className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">CampusCast</span>
            </Link>

            <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
              Welcome back!
            </h2>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Please enter your details to sign in.
            </p>
          </div>

          <div className="mt-8">
            <form className="space-y-5" onSubmit={handleSubmit}>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Email address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <FiMail />
                  </div>
                  <input
                    type="email"
                    required
                    className="input-field pl-10 h-11"
                    placeholder="student@college.edu"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <FiLock />
                  </div>
                  <input
                    type="password"
                    required
                    className="input-field pl-10 h-11"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between mt-2">
                <div className="flex items-center">
                  <input id="remember-me" name="remember-me" type="checkbox" className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded dark:bg-[var(--color-dark-card)] dark:border-gray-600" />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-600 dark:text-gray-400">
                    Remember me
                  </label>
                </div>
                <div className="text-sm">
                  <a href="#" className="font-semibold text-primary-600 hover:text-primary-500">
                    Forgot password?
                  </a>
                </div>
              </div>

              <button type="submit" className="btn btn-primary w-full py-3 mt-4 text-base shadow-lg shadow-primary-600/20" disabled={isLoading}>
                {isLoading ? 'Signing in...' : 'Sign in'}
              </button>
            </form>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200 dark:border-gray-700"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white dark:bg-[var(--color-dark-bg)] text-gray-500">Or continue with</span>
                </div>
              </div>

              <div className="mt-6">
                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm bg-white dark:bg-[var(--color-dark-card)] text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                  </svg>
                  Log in with Google
                </button>
              </div>
            </div>

            <div className="mt-8 text-center text-sm">
              <span className="text-gray-600 dark:text-gray-400">Don't have an account? </span>
              <Link to="/register" className="font-semibold text-primary-600 hover:text-primary-500">
                Sign up
              </Link>
            </div>

            <div className="mt-4 text-center">
              <Link to="/admin/login" className="text-xs font-medium text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                Admin Area
              </Link>
            </div>

          </div>
        </div>
      </div>

      {/* Right Side: Image/Banner */}
      <div className="hidden lg:block relative w-1/2 bg-gray-900 border-l border-gray-800">
        <div className="absolute inset-0 z-0">
          <img
            className="w-full h-full object-cover opacity-60 mix-blend-overlay"
            src="https://images.unsplash.com/photo-1541339907198-e08756dedf3f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80"
            alt="Campus"
          />
        </div>
        <div className="absolute inset-0 z-10 bg-gradient-to-br from-primary-900/80 to-black/90"></div>
        <div className="absolute inset-0 z-20 flex flex-col justify-between p-16">
          <div></div>
          <div className="max-w-md">
            <div className="w-16 h-1 bg-primary-500 mb-6 rounded-full"></div>
            <h1 className="text-4xl font-bold text-white mb-4 leading-tight">
              Manage your campus life in one secure platform.
            </h1>
            <p className="text-lg text-gray-300 leading-relaxed font-medium">
              Join thousands of students registering for events, forming hackathon teams, and tracking their academic journey effortlessly.
            </p>
          </div>
        </div>
      </div>

    </div>
  );
};

export default Login;
