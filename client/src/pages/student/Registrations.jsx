import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, MapPin, Eye } from 'lucide-react';
import StudentLayout from '../../layouts/StudentLayout';
import StatusBadge from '../../components/StatusBadge';
import { TableSkeleton } from '../../components/LoadingSkeleton';
import api from '../../utils/api';
import toast from 'react-hot-toast';

export default function Registrations() {
  const [loading, setLoading] = useState(true);
  const [registrations, setRegistrations] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRegistrations = async () => {
      try {
        setLoading(true);
        const res = await api.get('/registrations/my');
        setRegistrations(res.data.data.registrations || []);
      } catch (error) {
        toast.error('Failed to fetch registrations');
      } finally {
        setLoading(false);
      }
    };
    fetchRegistrations();
  }, []);

  return (
    <StudentLayout>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--foreground)' }}>My Registrations</h1>
          <p style={{ fontSize: '13px', color: 'var(--muted-foreground)', marginTop: '4px' }}>{registrations.length} registered events</p>
        </div>

        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '16px', overflow: 'hidden' }}>
          {loading ? <TableSkeleton rows={5} /> : (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 100px', padding: '12px 20px', borderBottom: '1px solid var(--border)', background: 'var(--muted)' }}>
                {['Event Name', 'Date', 'Venue', 'Status', 'Actions'].map(h => (
                  <span key={h} style={{ fontSize: '11px', fontWeight: 700, color: 'var(--muted-foreground)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{h}</span>
                ))}
              </div>
              {registrations.length === 0 ? (
                <div style={{ padding: '20px', textAlign: 'center', color: 'var(--muted-foreground)', fontSize: '13px' }}>No registrations found.</div>
              ) : registrations.map((reg, i) => {
                const event = reg.event || {};
                return (
                  <div key={reg.id || reg._id} style={{
                    display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 100px',
                    padding: '16px 20px', alignItems: 'center',
                    borderBottom: i < registrations.length - 1 ? '1px solid var(--border)' : 'none',
                    transition: 'background 0.15s'
                  }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--muted)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ width: '34px', height: '34px', borderRadius: '10px', background: 'rgba(79,70,229,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Calendar size={15} color="#4F46E5" />
                      </div>
                      <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--foreground)' }}>{event.title}</span>
                    </div>
                    <span style={{ fontSize: '12px', color: 'var(--muted-foreground)' }}>{new Date(event.date).toLocaleDateString()}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <MapPin size={12} color="var(--muted-foreground)" />
                      <span style={{ fontSize: '12px', color: 'var(--muted-foreground)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{event.venue}</span>
                    </div>
                    <StatusBadge status={reg.status || 'registered'} />
                    <button onClick={() => navigate(`/events/${event.id || event._id}`)} style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '6px 10px', borderRadius: '8px', border: '1px solid var(--border)', background: 'transparent', color: 'var(--foreground)', cursor: 'pointer', fontSize: '12px', fontWeight: 600 }}>
                      <Eye size={13} /> View
                    </button>
                  </div>
                );
              })}
            </>
          )}
        </div>
      </div>
    </StudentLayout>
  );
}
