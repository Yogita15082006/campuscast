import { useState, useEffect } from 'react';
import { Download, Users, Calendar, BarChart3 } from 'lucide-react';
import AdminLayout from '../../layouts/AdminLayout';
import AttendanceCodeBox from '../../components/AttendanceCodeBox';
import StatusBadge from '../../components/StatusBadge';
import { PageSkeleton } from '../../components/LoadingSkeleton';
import { mockData } from '../../data/mockData';
import toast from 'react-hot-toast';

export default function AdminAttendance() {
  const [loading, setLoading] = useState(true);
  const [event, setEvent] = useState(mockData.events[0].id);
  const [filter, setFilter] = useState('All');

  useEffect(() => { const t = setTimeout(() => setLoading(false), 800); return () => clearTimeout(t); }, []);
  if (loading) return <AdminLayout><PageSkeleton /></AdminLayout>;

  const currEvent = mockData.events.find(e => e.id === event);
  const attData = mockData.adminAttendance;
  const filtered = attData.filter(a => filter === 'All' || a.status === filter);
  const present = attData.filter(a => a.status === 'Present').length;
  const pct = Math.round((present / attData.length) * 100);

  const stats = [
    { label: 'Total Registered', val: currEvent.registered, icon: <Users size={16}/>, color: '#4F46E5', bg: 'rgba(79,70,229,0.1)' },
    { label: 'Present', val: present, icon: <Calendar size={16}/>, color: '#10B981', bg: 'rgba(16,185,129,0.1)' },
    { label: 'Absent', val: attData.length - present, icon: <Users size={16}/>, color: '#F43F5E', bg: 'rgba(244,63,94,0.1)' },
    { label: 'Attendance %', val: `${pct}%`, icon: <BarChart3 size={16}/>, color: '#F59E0B', bg: 'rgba(245,158,11,0.1)' }
  ];

  return (
    <AdminLayout>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h1 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--foreground)' }}>Attendance Management</h1>
            <p style={{ fontSize: '13px', color: 'var(--muted-foreground)', marginTop: '4px' }}>Manage attendance codes and track records</p>
          </div>
          <select value={event} onChange={e => setEvent(e.target.value)} style={{ height: '40px', padding: '0 16px', borderRadius: '10px', border: '1px solid var(--border)', background: 'var(--card)', color: 'var(--foreground)', fontSize: '14px', fontWeight: 600, outline: 'none', cursor: 'pointer', minWidth: '240px' }}>
            {mockData.events.map(e => <option key={e.id} value={e.id}>{e.title}</option>)}
          </select>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
          {stats.map(s => (
            <div key={s.label} style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '16px', padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: s.bg, color: s.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{s.icon}</div>
              <div>
                <p style={{ fontSize: '12px', color: 'var(--muted-foreground)', fontWeight: 500 }}>{s.label}</p>
                <p style={{ fontSize: '20px', fontWeight: 800, color: 'var(--foreground)' }}>{s.val}</p>
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '24px', alignItems: 'start' }}>
          {/* Table */}
          <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '16px', overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h3 style={{ fontWeight: 700, fontSize: '15px', color: 'var(--foreground)' }}>Attendance Records</h3>
              <div style={{ display: 'flex', gap: '8px' }}>
                {['All', 'Present', 'Absent'].map(f => (
                  <button key={f} onClick={() => setFilter(f)} style={{ padding: '6px 12px', borderRadius: '8px', border: '1px solid var(--border)', background: filter === f ? 'var(--primary)' : 'transparent', color: filter === f ? '#fff' : 'var(--muted-foreground)', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>{f}</button>
                ))}
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 2fr 1fr 1fr', padding: '12px 20px', background: 'var(--muted)', borderBottom: '1px solid var(--border)' }}>
              {['Student Name', 'Email', 'Status', 'Time'].map(h => <span key={h} style={{ fontSize: '11px', fontWeight: 700, color: 'var(--muted-foreground)', textTransform: 'uppercase' }}>{h}</span>)}
            </div>
            <div>
              {filtered.map((r, i) => (
                <div key={r.id} style={{ display: 'grid', gridTemplateColumns: '2fr 2fr 1fr 1fr', padding: '14px 20px', alignItems: 'center', borderBottom: i < filtered.length - 1 ? '1px solid var(--border)' : 'none', transition: 'background 0.15s' }} onMouseEnter={e => e.currentTarget.style.background = 'var(--muted)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'rgba(79,70,229,0.1)', color: '#4F46E5', fontSize: '11px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{r.name.slice(0, 2).toUpperCase()}</div>
                    <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--foreground)' }}>{r.name}</span>
                  </div>
                  <span style={{ fontSize: '13px', color: 'var(--muted-foreground)' }}>{r.email}</span>
                  <StatusBadge status={r.status} />
                  <span style={{ fontSize: '12px', color: 'var(--muted-foreground)', fontFamily: 'monospace' }}>{r.timeMarked}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right sidebar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <AttendanceCodeBox />
            <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '16px', padding: '24px' }}>
              <h3 style={{ fontWeight: 700, fontSize: '15px', color: 'var(--foreground)', marginBottom: '16px' }}>Export Data</h3>
              <p style={{ fontSize: '13px', color: 'var(--muted-foreground)', marginBottom: '16px', lineHeight: 1.6 }}>Download the full attendance report for {currEvent.title} as a CSV file.</p>
              <button onClick={() => toast.success('Exporting CSV…')} style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid var(--border)', background: 'transparent', color: 'var(--foreground)', fontWeight: 600, fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}><Download size={16} /> Export to CSV</button>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
