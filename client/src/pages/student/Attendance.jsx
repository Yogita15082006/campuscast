import { useState, useEffect } from 'react';
import { Send, CheckCircle, XCircle } from 'lucide-react';
import StudentLayout from '../../layouts/StudentLayout';
import StatusBadge from '../../components/StatusBadge';
import api from '../../utils/api';
import toast from 'react-hot-toast';

export default function Attendance() {
  const [loading, setLoading] = useState(true);
  const [code, setCode] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [attendance, setAttendance] = useState([]);

  const fetchAttendance = async () => {
    try {
      setLoading(true);
      const res = await api.get('/attendance/my');
      setAttendance(res.data.data.attendance || []);
    } catch (error) {
      toast.error('Failed to load attendance');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAttendance(); }, []);

  // For students, absent isn't really tracked usually unless specifically logged... but if marked it will be in the DB.
  const present = attendance.filter(a => a.status === 'present' || a.status === 'Present').length;
  const absent = attendance.filter(a => a.status === 'absent' || a.status === 'Absent').length;
  const total = attendance.length;
  const pct = total > 0 ? Math.round((present / total) * 100) : 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!code.trim()) return toast.error('Please enter an attendance code');
    try {
      setSubmitting(true);
      await api.post('/attendance/mark', { code });
      toast.success('Attendance marked successfully!');
      setCode('');
      fetchAttendance();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Invalid or expired attendance code');
    } finally {
      setSubmitting(false);
    }
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
          {loading ? <div style={{ height: '200px' }} className="skeleton" /> : attendance.length === 0 ? (
            <div style={{ padding: '20px', textAlign: 'center', fontSize: '13px', color: 'var(--muted-foreground)' }}>No attendance history found.</div>
          ) : attendance.map((att, i) => (
            <div key={att.id || att._id} style={{
              display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', padding: '14px 20px', alignItems: 'center',
              borderBottom: i < attendance.length - 1 ? '1px solid var(--border)' : 'none', transition: 'background 0.15s'
            }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--muted)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {(att.status === 'present' || att.status === 'Present') ? <CheckCircle size={15} color="#10B981" /> : <XCircle size={15} color="#F43F5E" />}
                <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--foreground)' }}>{att.event?.title}</span>
              </div>
              <span style={{ fontSize: '12px', color: 'var(--muted-foreground)' }}>{new Date(att.event?.date || att.markedAt).toLocaleDateString()}</span>
              <StatusBadge status={att.status || 'present'} />
              <span style={{ fontSize: '12px', color: 'var(--muted-foreground)', fontFamily: 'monospace' }}>{new Date(att.markedAt || att.marked_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
          ))}
        </div>
      </div>
    </StudentLayout>
  );
}
