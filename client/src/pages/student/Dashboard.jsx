import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, ClipboardList, Award, CheckSquare, ArrowRight, Bell, Zap } from 'lucide-react';
import StudentLayout from '../../layouts/StudentLayout';
import StatCard from '../../components/StatCard';
import { PageSkeleton } from '../../components/LoadingSkeleton';
import StatusBadge from '../../components/StatusBadge';
import EventCard from '../../components/EventCard';
import { mockData } from '../../data/mockData';
import { useAuth } from '../../context/AuthContext';

export default function StudentDashboard() {
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();
  useEffect(() => { const t = setTimeout(() => setLoading(false), 800); return () => clearTimeout(t); }, []);
  if (loading) return <StudentLayout><PageSkeleton /></StudentLayout>;

  const present = mockData.attendance.filter(a => a.status === 'Present').length;
  const total = mockData.attendance.length;
  const pct = total > 0 ? Math.round((present / total) * 100) : 0;
  const upcoming = mockData.events.filter(e => e.status === 'upcoming').slice(0, 3);

  return (
    <StudentLayout>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
        {/* Welcome banner */}
        <div style={{ position: 'relative', borderRadius: '20px', padding: '28px', overflow: 'hidden', background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)', color: '#fff' }}>
          <div style={{ position: 'absolute', top: 0, right: 0, width: '300px', height: '100%', background: 'radial-gradient(ellipse at top right, rgba(255,255,255,0.15), transparent 60%)' }} />
          <div style={{ position: 'relative' }}>
            <p style={{ fontSize: '13px', opacity: 0.75, marginBottom: '4px', fontWeight: 500 }}>Good day,</p>
            <h1 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '6px' }}>{currentUser?.name} 👋</h1>
            <p style={{ fontSize: '13px', opacity: 0.75, marginBottom: '20px' }}>
              You have {mockData.registrations.length} registered events and {mockData.certificates.length} certificates earned.
            </p>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <Link to="/events" style={{ padding: '8px 16px', borderRadius: '10px', background: 'rgba(255,255,255,0.2)', color: '#fff', fontWeight: 700, fontSize: '13px', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px', border: '1px solid rgba(255,255,255,0.2)', backdropFilter: 'blur(4px)' }}>
                <Calendar size={14} /> Browse Events
              </Link>
              <Link to="/student/attendance" style={{ padding: '8px 16px', borderRadius: '10px', background: 'rgba(255,255,255,0.1)', color: '#fff', fontWeight: 700, fontSize: '13px', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px', border: '1px solid rgba(255,255,255,0.2)' }}>
                <Zap size={14} /> Submit Code
              </Link>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
          <StatCard label="Upcoming Events" value={mockData.events.filter(e => e.status === 'upcoming').length} icon={<Calendar size={16} />} iconBg="rgba(79,70,229,0.1)" iconColor="#4F46E5" />
          <StatCard label="Registrations" value={mockData.registrations.length} icon={<ClipboardList size={16} />} iconBg="rgba(124,58,237,0.1)" iconColor="#7C3AED" trend={{ value: 12, label: 'this month' }} />
          <StatCard label="Attendance" value={`${pct}%`} icon={<CheckSquare size={16} />} iconBg="rgba(16,185,129,0.1)" iconColor="#10B981" />
          <StatCard label="Certificates" value={mockData.certificates.length} icon={<Award size={16} />} iconBg="rgba(245,158,11,0.1)" iconColor="#F59E0B" />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
          {/* Registrations */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <h2 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--foreground)' }}>My Registered Events</h2>
              <Link to="/student/registrations" style={{ fontSize: '12px', color: 'var(--primary)', textDecoration: 'none', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '2px' }}>View all <ArrowRight size={12} /></Link>
            </div>
            <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '16px', overflow: 'hidden' }}>
              {mockData.registrations.slice(0, 4).map((reg, i) => (
                <div key={reg.id} style={{
                  display: 'flex', alignItems: 'center', gap: '14px', padding: '14px 18px',
                  borderBottom: i < 3 ? '1px solid var(--border)' : 'none',
                  transition: 'background 0.15s', cursor: 'pointer'
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--muted)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(79,70,229,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Calendar size={16} color="#4F46E5" />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--foreground)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{reg.eventName}</p>
                    <p style={{ fontSize: '12px', color: 'var(--muted-foreground)', marginTop: '2px' }}>{reg.date} · {reg.venue}</p>
                  </div>
                  <StatusBadge status={reg.status} />
                </div>
              ))}
            </div>
          </div>

          {/* Announcements */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <h2 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--foreground)' }}>Announcements</h2>
              <Link to="/student/announcements" style={{ fontSize: '12px', color: 'var(--primary)', textDecoration: 'none', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '2px' }}>All <ArrowRight size={12} /></Link>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {mockData.announcements.slice(0, 4).map(ann => (
                <Link key={ann.id} to="/student/announcements" style={{ textDecoration: 'none' }}>
                  <div style={{
                    padding: '12px 14px', borderRadius: '12px',
                    background: ann.unread ? 'rgba(79,70,229,0.06)' : 'var(--card)',
                    border: `1px solid ${ann.unread ? 'rgba(79,70,229,0.2)' : 'var(--border)'}`,
                    display: 'flex', gap: '10px', cursor: 'pointer', transition: 'opacity 0.15s'
                  }}>
                    <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: ann.unread ? 'var(--primary)' : 'var(--border)', marginTop: '5px', flexShrink: 0 }} />
                    <div style={{ minWidth: 0 }}>
                      <p style={{ fontSize: '12px', fontWeight: ann.unread ? 700 : 500, color: ann.unread ? 'var(--foreground)' : 'var(--muted-foreground)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ann.title}</p>
                      <p style={{ fontSize: '11px', color: 'var(--muted-foreground)', marginTop: '2px' }}>{ann.date}</p>
                    </div>
                    {ann.unread && <Bell size={13} color="#4F46E5" style={{ marginLeft: 'auto', flexShrink: 0, marginTop: '2px' }} />}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Upcoming events */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <h2 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--foreground)' }}>Upcoming Events</h2>
            <Link to="/events" style={{ fontSize: '12px', color: 'var(--primary)', textDecoration: 'none', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '2px' }}>Browse all <ArrowRight size={12} /></Link>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
            {upcoming.map(event => <EventCard key={event.id} event={event} />)}
          </div>
        </div>
      </div>
    </StudentLayout>
  );
}
