import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, Radio, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import DarkModeToggle from '../../components/DarkModeToggle';

function strengthBar(pw) {
  let s = 0;
  if (pw.length >= 8) s++;
  if (/[A-Z]/.test(pw)) s++;
  if (/[0-9]/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  return s;
}

const inp = (err) => ({
  width: '100%', height: '40px', padding: '0 12px', borderRadius: '10px',
  border: `1px solid ${err ? '#F43F5E' : 'var(--border)'}`,
  background: 'var(--card)', color: 'var(--foreground)', fontSize: '14px', outline: 'none',
  transition: 'border-color 0.2s', boxSizing: 'border-box'
});
const label = { fontSize: '13px', fontWeight: 600, color: 'var(--foreground)', display: 'block', marginBottom: '6px' };
const errTxt = { fontSize: '11px', color: '#F43F5E', marginTop: '4px' };

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 48 48">
    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
  </svg>
);

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [showCPw, setShowCPw] = useState(false);
  const [terms, setTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const { register, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  const strength = strengthBar(pw);
  const strColors = ['', '#F43F5E', '#F59E0B', '#10B981', '#10B981'];
  const strLabels = ['', 'Weak', 'Fair', 'Good', 'Strong'];

  const validate = () => {
    const e = {};
    if (!name.trim()) e.name = 'Full name is required';
    if (!email) e.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) e.email = 'Invalid email address';
    if (!pw) e.pw = 'Password is required';
    else if (pw.length < 8) e.pw = 'At least 8 characters required';
    if (!confirmPw) e.confirmPw = 'Please confirm your password';
    else if (pw !== confirmPw) e.confirmPw = 'Passwords do not match';
    if (!terms) e.terms = 'You must accept the terms & conditions';
    setErrors(e); return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); if (!validate()) return;
    setLoading(true);
    const result = await register(name, email, pw);
    setLoading(false);
    if (result.success && !result.requiresEmailConfirmation) {
      navigate('/student/dashboard');
    } else if (result.requiresEmailConfirmation) {
      navigate('/login');
    }
  };

  const handleGoogleSignUp = async () => {
    setGoogleLoading(true);
    await loginWithGoogle();
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--background)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px', position: 'relative' }}>
      <div style={{ position: 'absolute', top: '16px', right: '16px' }}><DarkModeToggle /></div>

      <div style={{ width: '100%', maxWidth: '420px' }}>
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', boxShadow: '0 8px 24px rgba(79,70,229,0.3)' }}>
            <Radio size={22} color="#fff" />
          </div>
          <h1 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--foreground)' }}>Create an account</h1>
          <p style={{ fontSize: '13px', color: 'var(--muted-foreground)', marginTop: '4px' }}>Join CampusCast today</p>
        </div>

        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '20px', padding: '24px' }}>

          {/* Google Sign-Up */}
          <button onClick={handleGoogleSignUp} disabled={googleLoading} style={{
            width: '100%', padding: '11px', borderRadius: '10px',
            border: '1px solid var(--border)', background: 'var(--card)',
            color: 'var(--foreground)', fontWeight: 600, fontSize: '14px',
            cursor: googleLoading ? 'not-allowed' : 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
            transition: 'all 0.15s', opacity: googleLoading ? 0.7 : 1,
            boxShadow: '0 1px 3px rgba(0,0,0,0.08)', marginBottom: '16px',
          }}
            onMouseEnter={e => { if (!googleLoading) e.currentTarget.style.background = 'var(--muted)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'var(--card)'; }}
          >
            {googleLoading ? <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> : <GoogleIcon />}
            {googleLoading ? 'Redirecting to Google…' : 'Sign up with Google'}
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
            <span style={{ fontSize: '12px', color: 'var(--muted-foreground)', fontWeight: 500 }}>or register with email</span>
            <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label style={label}>Full Name</label>
              <input placeholder="Alex Johnson" value={name} onChange={e => setName(e.target.value)} style={inp(errors.name)} />
              {errors.name && <p style={errTxt}>{errors.name}</p>}
            </div>
            <div>
              <label style={label}>Email</label>
              <input type="email" placeholder="alex@university.edu" value={email} onChange={e => setEmail(e.target.value)} style={inp(errors.email)} />
              {errors.email && <p style={errTxt}>{errors.email}</p>}
            </div>
            <div>
              <label style={label}>Password</label>
              <div style={{ position: 'relative' }}>
                <input type={showPw ? 'text' : 'password'} placeholder="Min 8 characters" value={pw} onChange={e => setPw(e.target.value)} style={{ ...inp(errors.pw), paddingRight: '40px' }} />
                <button type="button" onClick={() => setShowPw(!showPw)} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted-foreground)', display: 'flex' }}>
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {pw && (
                <div style={{ marginTop: '8px' }}>
                  <div style={{ display: 'flex', gap: '4px', marginBottom: '4px' }}>
                    {[1, 2, 3, 4].map(i => (
                      <div key={i} style={{ flex: 1, height: '4px', borderRadius: '99px', background: i <= strength ? strColors[strength] : 'var(--muted)', transition: 'background 0.3s' }} />
                    ))}
                  </div>
                  <p style={{ fontSize: '11px', color: strColors[strength], fontWeight: 600 }}>{strLabels[strength]}</p>
                </div>
              )}
              {errors.pw && <p style={errTxt}>{errors.pw}</p>}
            </div>
            <div>
              <label style={label}>Confirm Password</label>
              <div style={{ position: 'relative' }}>
                <input type={showCPw ? 'text' : 'password'} placeholder="Repeat your password" value={confirmPw} onChange={e => setConfirmPw(e.target.value)} style={{ ...inp(errors.confirmPw), paddingRight: '40px' }} />
                <button type="button" onClick={() => setShowCPw(!showCPw)} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted-foreground)', display: 'flex' }}>
                  {showCPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.confirmPw && <p style={errTxt}>{errors.confirmPw}</p>}
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
              <input type="checkbox" id="terms" checked={terms} onChange={e => setTerms(e.target.checked)} style={{ marginTop: '2px', accentColor: 'var(--primary)', cursor: 'pointer' }} />
              <label htmlFor="terms" style={{ fontSize: '13px', color: 'var(--muted-foreground)', cursor: 'pointer', lineHeight: 1.5 }}>
                I agree to the <span style={{ color: 'var(--primary)', fontWeight: 700 }}>Terms & Conditions</span> and <span style={{ color: 'var(--primary)', fontWeight: 700 }}>Privacy Policy</span>
              </label>
            </div>
            {errors.terms && <p style={errTxt}>{errors.terms}</p>}

            <button type="submit" disabled={loading} style={{
              width: '100%', padding: '11px', borderRadius: '10px', border: 'none',
              background: 'var(--primary)', color: '#fff', fontWeight: 700, fontSize: '14px',
              cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.8 : 1,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '4px'
            }}>
              {loading && <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />}
              {loading ? 'Creating account…' : 'Create Account'}
            </button>
          </form>

          <p style={{ textAlign: 'center', fontSize: '13px', color: 'var(--muted-foreground)', marginTop: '16px' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 700, textDecoration: 'none' }}>Sign in</Link>
          </p>
        </div>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg);}}`}</style>
    </div>
  );
}
