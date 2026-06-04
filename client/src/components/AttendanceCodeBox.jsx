import { useState, useEffect } from 'react';
import { Copy, Check, Zap, ZapOff } from 'lucide-react';
import CountdownTimer from './CountdownTimer';
import api from '../utils/api';
import toast from 'react-hot-toast';

export default function AttendanceCodeBox({ eventId }) {
  const [code, setCode] = useState(null);
  const [copied, setCopied] = useState(false);
  const [active, setActive] = useState(false);
  const [key, setKey] = useState(0);
  const [initialSeconds, setInitialSeconds] = useState(900);
  const [loading, setLoading] = useState(false);

  // Check if there is an active code already
  useEffect(() => {
    if (!eventId) return;
    const fetchActiveCode = async () => {
      try {
        const res = await api.get(`/attendance/active-code/${eventId}`);
        const activeCode = res.data.data.code;
        if (activeCode) {
          const remainingSecs = Math.floor((new Date(activeCode.expires_at).getTime() - Date.now()) / 1000);
          if (remainingSecs > 0) {
            setCode(activeCode.code);
            setInitialSeconds(remainingSecs);
            setActive(true);
            setKey(k => k + 1);
          }
        } else {
          setActive(false);
          setCode(null);
        }
      } catch (err) {
        // ignore
      }
    };
    fetchActiveCode();
  }, [eventId]);

  const generate = async () => {
    if (!eventId) return toast.error('Please select an event first');
    try {
      setLoading(true);
      const res = await api.post('/attendance/generate-code', { eventId, duration: 15 });
      setCode(res.data.data.code.code);
      setInitialSeconds(900);
      setActive(true);
      setKey(k => k + 1);
      toast.success('New attendance code generated');
    } catch (error) {
      toast.error('Failed to generate code');
    } finally {
      setLoading(false);
    }
  };

  const copyCode = () => {
    if (!code) return;
    navigator.clipboard.writeText(code).catch(() => { });
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const deactivate = () => {
    // Usually there would be an endpoint to explicitly deactivate it,
    // but the backend handles overriding active codes anyway when generating a new one
    setActive(false);
    setCode(null);
  };

  return (
    <div style={{
      background: 'var(--card)', border: '1px solid var(--border)',
      borderRadius: '16px', padding: '24px'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
        <Zap size={20} color="var(--primary)" />
        <h3 style={{ fontWeight: 700, fontSize: '15px', color: 'var(--foreground)' }}>Attendance Code</h3>
      </div>

      {code && active ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{
            background: 'var(--muted)', borderRadius: '12px', padding: '20px',
            textAlign: 'center'
          }}>
            <p style={{
              fontFamily: 'monospace', fontSize: '32px', fontWeight: 700,
              letterSpacing: '6px', color: 'var(--foreground)'
            }}>{code}</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--muted-foreground)' }}>
            <span>Expires in:</span>
            <CountdownTimer key={key} initialSeconds={initialSeconds} onExpire={deactivate} />
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={copyCode} style={{
              flex: 1, padding: '10px', borderRadius: '10px',
              border: '1px solid var(--border)', background: 'transparent',
              color: 'var(--foreground)', cursor: 'pointer', fontWeight: 600,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '14px'
            }}>
              {copied ? <Check size={16} color="#10B981" /> : <Copy size={16} />}
              {copied ? 'Copied!' : 'Copy Code'}
            </button>
            <button onClick={deactivate} style={{
              padding: '10px 16px', borderRadius: '10px', border: 'none',
              background: '#F43F5E', color: '#fff', cursor: 'pointer', fontWeight: 600,
              display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px'
            }}>
              <ZapOff size={16} /> Deactivate
            </button>
          </div>
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '16px 0' }}>
          <p style={{ fontSize: '13px', color: 'var(--muted-foreground)', marginBottom: '16px', lineHeight: 1.6 }}>
            Generate a unique code for students to mark attendance. Code expires in 15 minutes.
          </p>
          <button onClick={generate} disabled={loading} style={{
            padding: '10px 24px', borderRadius: '10px', border: 'none',
            background: 'var(--primary)', color: '#fff', cursor: loading ? 'not-allowed' : 'pointer',
            fontWeight: 600, fontSize: '14px', opacity: loading ? 0.7 : 1,
            display: 'inline-flex', alignItems: 'center', gap: '8px'
          }}>
            <Zap size={16} /> {loading ? 'Generating...' : 'Generate Code'}
          </button>
        </div>
      )}
    </div>
  );
}
