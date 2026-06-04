import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { signInWithGoogle } from '../utils/googleAuth';
import { FiUser, FiMail, FiLock } from 'react-icons/fi';

const Register = () => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    const res = await register(formData.name, formData.email, formData.password);
    setIsLoading(false);
    if (res.success && !res.requiresEmailConfirmation) {
      navigate('/student/dashboard');
    } else if (res.requiresEmailConfirmation) {
      navigate('/login');
    }
  };

  const handleGoogleLogin = async () => {
    await signInWithGoogle();
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[var(--color-dark-bg)] flex animate-fade-in flex-row-reverse">

      {/* Right Side / Form */}
      <div className="flex-1 flex flex-col justify-center px-4 sm:px-6 lg:flex-none lg:w-1/2 lg:px-20 xl:px-24 border-l border-gray-100 dark:border-gray-800">
        <div className="mx-auto w-full max-w-sm">

          <div className="mb-10 text-center lg:text-left">
            <Link to="/" className="inline-flex items-center gap-2 mb-8">
              <div className="w-8 h-8 rounded bg-primary-600 flex items-center justify-center text-white font-bold text-lg">
                ((•))
              </div>
              <span className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">CampusCast</span>
            </Link>

            <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
              Create an Account
            </h2>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Join the student community today.
            </p>
          </div>

          <div className="mt-8">
            <form className="space-y-5" onSubmit={handleSubmit}>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Full Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <FiUser />
                  </div>
                  <input
                    type="text"
                    name="name"
                    required
                    className="input-field pl-10 h-11"
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Email address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <FiMail />
                  </div>
                  <input
                    type="email"
                    name="email"
                    required
                    className="input-field pl-10 h-11"
                    placeholder="student@college.edu"
                    value={formData.email}
                    onChange={handleChange}
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
                    name="password"
                    required
                    minLength={6}
                    className="input-field pl-10 h-11"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <button type="submit" className="btn btn-primary w-full py-3 mt-4 text-base shadow-lg shadow-primary-600/20" disabled={isLoading}>
                {isLoading ? 'Creating account...' : 'Create account'}
              </button>
            </form>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200 dark:border-gray-700"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white dark:bg-[var(--color-dark-bg)] text-gray-500">Or integrate with</span>
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
                  Sign up with Google
                </button>
              </div>
            </div>

            <div className="mt-8 text-center text-sm">
              <span className="text-gray-600 dark:text-gray-400">Already have an account? </span>
              <Link to="/login" className="font-semibold text-primary-600 hover:text-primary-500">
                Log in
              </Link>
            </div>

          </div>
        </div>
      </div>

      {/* Left Side: Image/Banner */}
      <div className="hidden lg:block relative w-1/2 bg-gray-900 border-r border-gray-800">
        <div className="absolute inset-0 z-0">
          <img
            className="w-full h-full object-cover opacity-60 mix-blend-overlay"
            src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80"
            alt="Students"
          />
        </div>
        <div className="absolute inset-0 z-10 bg-gradient-to-tr from-purple-900/90 to-primary-900/80"></div>
        <div className="absolute inset-0 z-20 flex flex-col justify-center p-16">
          <div className="max-w-md ml-auto">
            <div className="w-16 h-1 bg-white/30 mb-6 rounded-full"></div>
            <h1 className="text-4xl font-bold text-white mb-4 leading-tight">
              A community built for students, by students.
            </h1>
            <p className="text-lg text-white/80 leading-relaxed font-medium">
              Start your journey today and never miss out on any opportunities on campus.
            </p>
          </div>
        </div>
      </div>

    </div>
  );
};

export default Register;
