import { useState, useEffect } from 'react';
import { Send, CheckCircle, XCircle } from 'lucide-react';
import StudentLayout from '../../layouts/StudentLayout';
import StatusBadge from '../../components/StatusBadge';
import { mockData } from '../../data/mockData';
import toast from 'react-hot-toast';

export default function Attendance() {
  const [loading, setLoading] = useState(true);
  const [code, setCode] = useState('');
  const [submitting, setSubmitting] = useState(false);
  useEffect(() => { const t = setTimeout(() => setLoading(false), 800); return () => clearTimeout(t); }, []);

  const present = mockData.attendance.filter(a => a.status === 'Present').length;
  const absent = mockData.attendance.filter(a => a.status === 'Absent').length;
  const pct = Math.round((present / mockData.attendance.length) * 100);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!code.trim()) return toast.error('Please enter an attendance code');
    setSubmitting(true);
    await new Promise(r => setTimeout(r, 800));
    if (code.toUpperCase().startsWith('EVT-')) toast.success('Attendance marked successfully!');
    else toast.error('Invalid attendance code. Try EVT-XXXXXX format.');
    setCode(''); setSubmitting(false);
  };

  return (
    <StudentLayout>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--foreground)' }}>My Attendance</h1>
          <p style={{ fontSize: '13px', color: 'var(--muted-foreground)', marginTop: '4px' }}>Track and submit your event attendance</p>
        </div>

        {/* Submit code */}
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '16px', padding: '24px' }}>
          <h3 style={{ fontWeight: 700, fontSize: '15px', color: 'var(--foreground)', marginBottom: '4px' }}>Submit Attendance Code</h3>
          <p style={{ fontSize: '13px', color: 'var(--muted-foreground)', marginBottom: '16px' }}>Enter the code provided by the event organizer.</p>
          <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '10px' }}>
            <input value={code} onChange={e => setCode(e.target.value)} placeholder="Enter code e.g. EVT-X92K8A" style={{
              flex: 1, height: '48px', padding: '0 16px', borderRadius: '12px',
              border: '1px solid var(--border)', background: 'var(--muted)', color: 'var(--foreground)',
              fontSize: '16px', fontFamily: 'monospace', fontWeight: 600, outline: 'none', letterSpacing: '2px'
            }} />
            <button type="submit" disabled={submitting} style={{ padding: '0 24px', height: '48px', borderRadius: '12px', border: 'none', background: 'var(--primary)', color: '#fff', fontWeight: 700, fontSize: '14px', cursor: submitting ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '8px', opacity: submitting ? 0.8 : 1 }}>
              <Send size={16} /> {submitting ? 'Submitting…' : 'Submit'}
            </button>
          </form>
        </div>

        {/* Summary bar */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
          {[
            { label: 'Present', value: present, color: '#10B981', bg: 'rgba(16,185,129,0.1)' },
            { label: 'Absent', value: absent, color: '#F43F5E', bg: 'rgba(244,63,94,0.1)' },
            { label: 'Attendance Rate', value: `${pct}%`, color: '#4F46E5', bg: 'rgba(79,70,229,0.1)' },
          ].map(({ label, value, color, bg }) => (
            <div key={label} style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '14px', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <span style={{ fontSize: '16px', fontWeight: 800, color }}>{value}</span>
              </div>
              <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--muted-foreground)' }}>{label}</span>
            </div>
          ))}
        </div>

        {/* History table */}
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '16px', overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
            <h3 style={{ fontWeight: 700, fontSize: '15px', color: 'var(--foreground)' }}>Attendance History</h3>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', padding: '10px 20px', background: 'var(--muted)', borderBottom: '1px solid var(--border)' }}>
            {['Event Name', 'Date', 'Status', 'Time Marked'].map(h => (
              <span key={h} style={{ fontSize: '11px', fontWeight: 700, color: 'var(--muted-foreground)', textTransform: 'uppercase' }}>{h}</span>
            ))}
          </div>
          {loading ? <div style={{ height: '200px' }} className="skeleton" /> : mockData.attendance.map((att, i) => (
            <div key={att.id} style={{
              display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', padding: '14px 20px', alignItems: 'center',
              borderBottom: i < mockData.attendance.length - 1 ? '1px solid var(--border)' : 'none', transition: 'background 0.15s'
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--muted)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {att.status === 'Present' ? <CheckCircle size={15} color="#10B981" /> : <XCircle size={15} color="#F43F5E" />}
                <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--foreground)' }}>{att.eventName}</span>
              </div>
              <span style={{ fontSize: '12px', color: 'var(--muted-foreground)' }}>{att.date}</span>
              <StatusBadge status={att.status} />
              <span style={{ fontSize: '12px', color: 'var(--muted-foreground)', fontFamily: 'monospace' }}>{att.timeMarked}</span>
            </div>
          ))}
        </div>
      </div>
    </StudentLayout>
  );
}
