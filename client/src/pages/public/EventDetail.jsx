import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapPin, Calendar, Users, Clock, ChevronLeft, Check, User } from 'lucide-react';
import StudentLayout from '../../layouts/StudentLayout';
import { mockData } from '../../data/mockData';
import StatusBadge from '../../components/StatusBadge';
import toast from 'react-hot-toast';

export default function EventDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [registered, setRegistered] = useState(false);
  const [seats, setSeats] = useState(0);
  const [loading, setLoading] = useState(true);

  const event = mockData.events.find(e => e.id === id);
  useEffect(() => {
    const t = setTimeout(() => {
      if (event) {
        setSeats(event.seatsRemaining);
        setRegistered(mockData.registrations.some(r => r.eventId === id));
      }
      setLoading(false);
    }, 500);
    return () => clearTimeout(t);
  }, [id]);

  if (loading) return <StudentLayout><div style={{ height: '400px', background: 'var(--muted)', borderRadius: '16px' }} className="skeleton" /></StudentLayout>;
  if (!event) return <StudentLayout><div style={{ textAlign: 'center', padding: '80px' }}><p style={{ fontSize: '48px' }}>🔍</p><h2 style={{ color: 'var(--foreground)', marginTop: '16px' }}>Event not found</h2><button onClick={() => navigate('/events')} style={{ marginTop: '16px', padding: '10px 20px', borderRadius: '10px', background: 'var(--primary)', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 700 }}>Back to Events</button></div></StudentLayout>;

  const isFull = seats === 0;
  const fillPct = Math.round(((event.capacity - seats) / event.capacity) * 100);

  const handleRegister = () => {
    if (isFull || registered) return;
    setRegistered(true);
    setSeats(s => Math.max(0, s - 1));
    toast.success(`Successfully registered for ${event.title}!`);
  };

  const CAT_COLORS = { Technical: '#3B82F6', Cultural: '#7C3AED', Sports: '#10B981', Workshop: '#F59E0B' };

  return (
    <StudentLayout>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        <button onClick={() => navigate(-1)} style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '20px', background: 'none', border: 'none', color: 'var(--muted-foreground)', cursor: 'pointer', fontWeight: 600, fontSize: '13px', padding: '8px 0' }}>
          <ChevronLeft size={16} /> Back to Events
        </button>

        {/* Poster */}
        <div style={{ position: 'relative', height: '300px', borderRadius: '20px', overflow: 'hidden', marginBottom: '28px' }}>
          <img src={event.posterUrl} alt={event.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.2) 50%, transparent 100%)' }} />
          <div style={{ position: 'absolute', bottom: '24px', left: '24px' }}>
            <span style={{ display: 'inline-block', padding: '4px 12px', borderRadius: '20px', background: CAT_COLORS[event.category] || '#64748B', color: '#fff', fontSize: '12px', fontWeight: 700, marginBottom: '10px' }}>{event.category}</span>
            <h1 style={{ fontSize: '26px', fontWeight: 800, color: '#fff', lineHeight: 1.2 }}>{event.title}</h1>
            <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '13px', marginTop: '4px' }}>by {event.organizer}</p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '24px', alignItems: 'start' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Info grid */}
            <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '16px', padding: '20px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              {[
                { icon: <Calendar size={16} />, label: 'Date', value: event.date },
                { icon: <Clock size={16} />, label: 'Time', value: event.time },
                { icon: <MapPin size={16} />, label: 'Venue', value: event.venue },
                { icon: <Users size={16} />, label: 'Capacity', value: `${event.capacity} seats` },
                { icon: <Calendar size={16} />, label: 'Deadline', value: event.deadline },
                { icon: <Users size={16} />, label: 'Team Size', value: event.isTeamEvent ? `Up to ${event.teamSizeLimit}` : 'Individual' },
              ].map(({ icon, label, value }) => (
                <div key={label} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(79,70,229,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4F46E5', flexShrink: 0 }}>{icon}</div>
                  <div>
                    <p style={{ fontSize: '11px', color: 'var(--muted-foreground)', fontWeight: 500 }}>{label}</p>
                    <p style={{ fontSize: '13px', color: 'var(--foreground)', fontWeight: 700, marginTop: '1px' }}>{value}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Description */}
            <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '16px', padding: '20px' }}>
              <h3 style={{ fontWeight: 700, fontSize: '15px', color: 'var(--foreground)', marginBottom: '12px' }}>About this Event</h3>
              <p style={{ fontSize: '14px', color: 'var(--muted-foreground)', lineHeight: 1.7 }}>{event.description}</p>
            </div>

            {event.isTeamEvent && (
              <div style={{ background: 'rgba(124,58,237,0.06)', border: '1px solid rgba(124,58,237,0.2)', borderRadius: '16px', padding: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                  <Users size={18} color="#7C3AED" />
                  <h3 style={{ fontWeight: 700, fontSize: '15px', color: 'var(--foreground)' }}>Team Event</h3>
                </div>
                <p style={{ fontSize: '13px', color: 'var(--muted-foreground)', marginBottom: '16px', lineHeight: 1.6 }}>This is a team event with a max team size of {event.teamSizeLimit}. Create a team or join an existing one.</p>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button onClick={() => toast('Create Team modal (demo)')} style={{ padding: '9px 20px', borderRadius: '10px', border: 'none', background: '#7C3AED', color: '#fff', fontWeight: 700, fontSize: '13px', cursor: 'pointer' }}>Create Team</button>
                  <button onClick={() => toast('Join Team modal (demo)')} style={{ padding: '9px 20px', borderRadius: '10px', border: '1px solid var(--border)', background: 'transparent', color: 'var(--foreground)', fontWeight: 700, fontSize: '13px', cursor: 'pointer' }}>Join Team</button>
                </div>
              </div>
            )}
          </div>

          {/* Register sidebar */}
          <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '16px', padding: '20px', position: 'sticky', top: '80px' }}>
            <div style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--muted-foreground)', marginBottom: '6px' }}>
                <span>{event.registered} registered</span>
                <span style={{ fontWeight: 700, color: isFull ? '#F43F5E' : seats <= 20 ? '#F59E0B' : '#10B981' }}>{isFull ? 'Full' : `${seats} left`}</span>
              </div>
              <div style={{ height: '8px', background: 'var(--muted)', borderRadius: '99px', overflow: 'hidden' }}>
                <div style={{ height: '100%', background: isFull ? '#F43F5E' : fillPct > 80 ? '#F59E0B' : '#10B981', width: `${fillPct}%`, borderRadius: '99px', transition: 'width 0.5s ease' }} />
              </div>
            </div>

            {registered ? (
              <div style={{ textAlign: 'center', padding: '16px 0' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(16,185,129,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px' }}>
                  <Check size={24} color="#10B981" />
                </div>
                <p style={{ fontWeight: 700, fontSize: '15px', color: '#10B981' }}>You're Registered!</p>
                <p style={{ fontSize: '12px', color: 'var(--muted-foreground)', marginTop: '4px' }}>See you at the event</p>
              </div>
            ) : (
              <button onClick={handleRegister} disabled={isFull} style={{
                width: '100%', padding: '12px', borderRadius: '12px', border: 'none',
                background: isFull ? 'var(--muted)' : 'var(--primary)', color: isFull ? 'var(--muted-foreground)' : '#fff',
                fontWeight: 700, fontSize: '15px', cursor: isFull ? 'not-allowed' : 'pointer', transition: 'opacity 0.2s'
              }}>
                {isFull ? 'Event Full' : 'Register Now'}
              </button>
            )}

            <div style={{ marginTop: '16px', padding: '12px', background: 'var(--muted)', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <User size={14} color="var(--muted-foreground)" />
              <span style={{ fontSize: '12px', color: 'var(--muted-foreground)' }}>Organized by <strong style={{ color: 'var(--foreground)' }}>{event.organizer}</strong></span>
            </div>
          </div>
        </div>
      </div>
    </StudentLayout>
  );
}
