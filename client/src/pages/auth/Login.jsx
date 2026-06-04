import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, Radio, Loader2, GraduationCap, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import DarkModeToggle from '../../components/DarkModeToggle';
import toast from 'react-hot-toast';

const inp = (err) => ({
  width: '100%', height: '40px', padding: '0 12px', borderRadius: '10px',
  border: `1px solid ${err ? '#F43F5E' : 'var(--border)'}`,
  background: 'var(--card)', color: 'var(--foreground)', fontSize: '14px', outline: 'none',
  transition: 'border-color 0.2s', boxSizing: 'border-box'
});

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 48 48">
    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
  </svg>
);

export default function Login() {
  const [tab, setTab] = useState('student');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const { currentUser, login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!currentUser) return;
    navigate(currentUser.role === 'admin' ? '/admin/dashboard' : '/student/dashboard', { replace: true });
  }, [currentUser, navigate]);

  const validate = () => {
    const e = {};
    if (!email) e.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) e.email = 'Invalid email address';
    if (!password) e.password = 'Password is required';
    else if (password.length < 6) e.password = 'Must be at least 6 characters';
    setErrors(e); return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); if (!validate()) return;
    setLoading(true);
    const result = await login(email, password, tab === 'admin');
    setLoading(false);
    if (result.success) {
      navigate(result.role === 'admin' ? '/admin/dashboard' : '/student/dashboard', { replace: true });
    }
  };

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    const result = await loginWithGoogle();
    if (!result.success) setGoogleLoading(false);
    // Redirect happens via Supabase; setGoogleLoading stays true until page unloads
  };

  const label = { fontSize: '13px', fontWeight: 600, color: 'var(--foreground)', display: 'block', marginBottom: '6px' };
  const errTxt = { fontSize: '11px', color: '#F43F5E', marginTop: '4px' };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--background)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px', position: 'relative' }}>
      <div style={{ position: 'absolute', top: '16px', right: '16px' }}><DarkModeToggle /></div>

      <div style={{ width: '100%', maxWidth: '420px' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', boxShadow: '0 8px 24px rgba(79,70,229,0.3)' }}>
            <Radio size={22} color="#fff" />
          </div>
          <h1 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--foreground)' }}>Welcome to CampusCast</h1>
          <p style={{ fontSize: '13px', color: 'var(--muted-foreground)', marginTop: '4px' }}>Your campus event management portal</p>
        </div>

        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '20px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {/* Tabs */}
          <div style={{ display: 'flex', background: 'var(--muted)', borderRadius: '12px', padding: '4px' }}>
            {['student', 'admin'].map(t => (
              <button key={t} onClick={() => { setTab(t); setErrors({}); setEmail(''); setPassword(''); }} style={{
                flex: 1, padding: '8px', borderRadius: '9px', border: 'none', cursor: 'pointer',
                background: tab === t ? 'var(--card)' : 'transparent',
                color: tab === t ? 'var(--foreground)' : 'var(--muted-foreground)',
                fontWeight: 600, fontSize: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                boxShadow: tab === t ? '0 1px 4px rgba(0,0,0,0.1)' : 'none', transition: 'all 0.15s'
              }}>
                {t === 'student' ? <GraduationCap size={14} /> : <ShieldCheck size={14} />}
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>

          {/* Google Sign-In (student tab only) */}
          {tab === 'student' && (
            <>
              <button onClick={handleGoogleLogin} disabled={googleLoading} style={{
                width: '100%', padding: '11px', borderRadius: '10px',
                border: '1px solid var(--border)', background: 'var(--card)',
                color: 'var(--foreground)', fontWeight: 600, fontSize: '14px',
                cursor: googleLoading ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                transition: 'all 0.15s', opacity: googleLoading ? 0.7 : 1,
                boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
              }}
                onMouseEnter={e => { if (!googleLoading) e.currentTarget.style.background = 'var(--muted)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'var(--card)'; }}
              >
                {googleLoading ? <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> : <GoogleIcon />}
                {googleLoading ? 'Redirecting to Google…' : 'Continue with Google'}
              </button>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
                <span style={{ fontSize: '12px', color: 'var(--muted-foreground)', fontWeight: 500 }}>or sign in with email</span>
                <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
              </div>
            </>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label style={label}>Email</label>
              <input type="email" placeholder={tab === 'admin' ? 'admin@campuscast.com' : 'student@college.edu'} value={email} onChange={e => setEmail(e.target.value)} style={inp(errors.email)} />
              {errors.email && <p style={errTxt}>{errors.email}</p>}
            </div>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <label style={{ ...label, marginBottom: 0 }}>Password</label>
                <button type="button" onClick={() => toast('Password reset is not configured yet.', { icon: '📧' })} style={{ fontSize: '12px', color: 'var(--primary)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>Forgot password?</button>
              </div>
              <div style={{ position: 'relative' }}>
                <input type={showPw ? 'text' : 'password'} placeholder="Enter your password" value={password} onChange={e => setPassword(e.target.value)} style={{ ...inp(errors.password), paddingRight: '40px' }} />
                <button type="button" onClick={() => setShowPw(!showPw)} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted-foreground)', display: 'flex' }}>
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <p style={errTxt}>{errors.password}</p>}
            </div>
            <button type="submit" disabled={loading} style={{
              width: '100%', padding: '11px', borderRadius: '10px', border: 'none',
              background: 'var(--primary)', color: '#fff', fontWeight: 700, fontSize: '14px',
              cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.8 : 1,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '4px'
            }}>
              {loading && <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />}
              {loading ? 'Signing in…' : `Sign in as ${tab.charAt(0).toUpperCase() + tab.slice(1)}`}
            </button>
          </form>

          <p style={{ textAlign: 'center', fontSize: '13px', color: 'var(--muted-foreground)' }}>
            Don't have an account?{' '}
            <Link to="/register" style={{ color: 'var(--primary)', fontWeight: 700, textDecoration: 'none' }}>Register</Link>
          </p>
        </div>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg);}}`}</style>
    </div>
  );
}
