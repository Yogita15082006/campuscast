import { useState, useEffect } from 'react';
import { Download, Users, Calendar, BarChart3 } from 'lucide-react';
import AdminLayout from '../../layouts/AdminLayout';
import AttendanceCodeBox from '../../components/AttendanceCodeBox';
import StatusBadge from '../../components/StatusBadge';
import { PageSkeleton } from '../../components/LoadingSkeleton';
import api from '../../utils/api';
import toast from 'react-hot-toast';

export default function AdminAttendance() {
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState([]);
  const [event, setEvent] = useState('');
  const [filter, setFilter] = useState('All');
  const [attData, setAttData] = useState([]);
  const [stats, setStats] = useState({ totalRegistered: 0, totalPresent: 0 });

  // Fetch events list once
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await api.get('/events?limit=200');
        const evts = res.data.data.events || [];
        setEvents(evts);
        if (evts.length > 0) setEvent(evts[0].id || evts[0]._id);
      } catch (err) {
        toast.error('Failed to load events');
      }
    };
    fetchEvents();
  }, []);

  // Fetch attendance records for selected event
  useEffect(() => {
    if (!event) return;
    const fetchAttendance = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/attendance/event/${event}`);
        setAttData(res.data.data.attendance || []);
        setStats({
          totalRegistered: res.data.data.totalRegistered || 0,
          totalPresent: res.data.data.totalPresent || 0,
        });
      } catch (err) {
        toast.error('Failed to load attendance records');
      } finally {
        setLoading(false);
      }
    };
    fetchAttendance();
  }, [event]);

  if (events.length === 0 && loading) return <AdminLayout><PageSkeleton /></AdminLayout>;

  const currEvent = events.find(e => (e.id || e._id) === event) || {};
  const filtered = attData.filter(a => filter === 'All' || (a.status || 'present').toLowerCase() === filter.toLowerCase());
  const present = stats.totalPresent;
  const pct = stats.totalRegistered > 0 ? Math.round((present / stats.totalRegistered) * 100) : 0;

  const statBoxes = [
    { label: 'Total Registered', val: stats.totalRegistered, icon: <Users size={16} />, color: '#4F46E5', bg: 'rgba(79,70,229,0.1)' },
    { label: 'Present', val: present, icon: <Calendar size={16} />, color: '#10B981', bg: 'rgba(16,185,129,0.1)' },
    { label: 'Absent', val: Math.max(0, stats.totalRegistered - present), icon: <Users size={16} />, color: '#F43F5E', bg: 'rgba(244,63,94,0.1)' },
    { label: 'Attendance %', val: `${pct}%`, icon: <BarChart3 size={16} />, color: '#F59E0B', bg: 'rgba(245,158,11,0.1)' }
  ];

  const handleExport = async () => {
    if (!event) return;
    try {
      toast.success('Generating export...');
      const response = await api.get(`/attendance/export/${event}`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `attendance-${currEvent.title || event}.csv`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (e) {
      toast.error('Failed to export data');
    }
  };

  return (
    <AdminLayout>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h1 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--foreground)' }}>Attendance Management</h1>
            <p style={{ fontSize: '13px', color: 'var(--muted-foreground)', marginTop: '4px' }}>Manage attendance codes and track records</p>
          </div>
          <select value={event} onChange={e => setEvent(e.target.value)} style={{ height: '40px', padding: '0 16px', borderRadius: '10px', border: '1px solid var(--border)', background: 'var(--card)', color: 'var(--foreground)', fontSize: '14px', fontWeight: 600, outline: 'none', cursor: 'pointer', minWidth: '240px' }}>
            {events.map(e => <option key={e.id || e._id} value={e.id || e._id}>{e.title}</option>)}
          </select>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
          {statBoxes.map(s => (
            <div key={s.label} style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '16px', padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: s.bg, color: s.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{s.icon}</div>
              <div>
                <p style={{ fontSize: '12px', color: 'var(--muted-foreground)', fontWeight: 500 }}>{s.label}</p>
                <p style={{ fontSize: '20px', fontWeight: 800, color: 'var(--foreground)' }}>{s.val}</p>
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '24px', alignItems: 'start', '@media (max-width: 768px)': { gridTemplateColumns: '1fr' } }}>
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
              {loading && filtered.length === 0 ? <div style={{ height: '150px' }} className="skeleton" /> : filtered.length === 0 ? (
                <div style={{ padding: '20px', textAlign: 'center', fontSize: '13px', color: 'var(--muted-foreground)' }}>No records found.</div>
              ) : filtered.map((r, i) => (
                <div key={r.id || r._id} style={{ display: 'grid', gridTemplateColumns: '2fr 2fr 1fr 1fr', padding: '14px 20px', alignItems: 'center', borderBottom: i < filtered.length - 1 ? '1px solid var(--border)' : 'none', transition: 'background 0.15s' }} onMouseEnter={e => e.currentTarget.style.background = 'var(--muted)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'rgba(79,70,229,0.1)', color: '#4F46E5', fontSize: '11px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{(r.student?.name || '?').slice(0, 2).toUpperCase()}</div>
                    <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--foreground)' }}>{r.student?.name || 'Unknown'}</span>
                  </div>
                  <span style={{ fontSize: '13px', color: 'var(--muted-foreground)' }}>{r.student?.email || '-'}</span>
                  <StatusBadge status={r.status || 'present'} />
                  <span style={{ fontSize: '12px', color: 'var(--muted-foreground)', fontFamily: 'monospace' }}>{new Date(r.markedAt || r.marked_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right sidebar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {event && <AttendanceCodeBox eventId={event} />}
            <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '16px', padding: '24px' }}>
              <h3 style={{ fontWeight: 700, fontSize: '15px', color: 'var(--foreground)', marginBottom: '16px' }}>Export Data</h3>
              <p style={{ fontSize: '13px', color: 'var(--muted-foreground)', marginBottom: '16px', lineHeight: 1.6 }}>Download the full attendance report for {currEvent.title || 'the selected event'} as a CSV file.</p>
              <button onClick={handleExport} style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid var(--border)', background: 'transparent', color: 'var(--foreground)', fontWeight: 600, fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}><Download size={16} /> Export to CSV</button>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
