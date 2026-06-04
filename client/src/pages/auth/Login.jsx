import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, Radio, Loader2, GraduationCap, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { mockData } from '../../data/mockData';
import DarkModeToggle from '../../components/DarkModeToggle';
import toast from 'react-hot-toast';

const DEMO = {
  student: { email: 'alex@university.edu', password: 'student123' },
  admin:   { email: 'admin@university.edu', password: 'admin123' },
};

const inp = (err) => ({
  width: '100%', height: '40px', padding: '0 12px', borderRadius: '10px',
  border: `1px solid ${err ? '#F43F5E' : 'var(--border)'}`,
  background: 'var(--card)', color: 'var(--foreground)', fontSize: '14px', outline: 'none',
  transition: 'border-color 0.2s', boxSizing: 'border-box'
});

export default function Login() {
  const [tab, setTab] = useState('student');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const { login } = useAuth();
  const navigate = useNavigate();

  const fillDemo = () => { setEmail(DEMO[tab].email); setPassword(DEMO[tab].password); setErrors({}); };

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
    await new Promise(r => setTimeout(r, 900));
    login(tab); setLoading(false);
    navigate(tab === 'admin' ? '/admin/dashboard' : '/student/dashboard');
    setTimeout(() => {
      const ann = mockData.announcements[0];
      toast.custom(() => (
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '14px', padding: '14px 16px', display: 'flex', gap: '12px', maxWidth: '340px', boxShadow: '0 8px 24px rgba(0,0,0,0.1)' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(79,70,229,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Radio size={16} color="var(--primary)" />
          </div>
          <div>
            <p style={{ fontSize: '13px', fontWeight: 700, color: 'var(--foreground)' }}>{ann.title}</p>
            <p style={{ fontSize: '12px', color: 'var(--muted-foreground)', marginTop: '2px' }}>{ann.message.slice(0, 70)}…</p>
          </div>
        </div>
      ), { duration: 5000 });
    }, 5000);
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

          {/* Demo banner */}
          <div style={{ background: 'rgba(79,70,229,0.06)', border: '1px solid rgba(79,70,229,0.2)', borderRadius: '10px', padding: '10px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
            <div>
              <p style={{ fontSize: '11px', fontWeight: 700, color: 'var(--primary)' }}>Demo Account</p>
              <p style={{ fontSize: '11px', color: 'var(--muted-foreground)', marginTop: '1px' }}>{DEMO[tab].email} / {DEMO[tab].password}</p>
            </div>
            <button onClick={fillDemo} style={{ padding: '5px 12px', borderRadius: '8px', border: '1px solid rgba(79,70,229,0.3)', background: 'transparent', color: 'var(--primary)', fontWeight: 700, fontSize: '12px', cursor: 'pointer' }}>Auto-fill</button>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label style={label}>Email</label>
              <input type="email" placeholder={DEMO[tab].email} value={email} onChange={e => setEmail(e.target.value)} style={inp(errors.email)} />
              {errors.email && <p style={errTxt}>{errors.email}</p>}
            </div>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <label style={{ ...label, marginBottom: 0 }}>Password</label>
                <button type="button" onClick={() => toast('Password reset link sent! (demo)', { icon: '📧' })} style={{ fontSize: '12px', color: 'var(--primary)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>Forgot password?</button>
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
