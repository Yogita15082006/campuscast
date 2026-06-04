import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Calendar, Users, Check, ArrowRight } from 'lucide-react';
import { mockData } from '../data/mockData';
import toast from 'react-hot-toast';

const CAT_COLORS = {
  Technical: { bg: 'rgba(59,130,246,0.9)', text: '#fff' },
  Cultural:  { bg: 'rgba(124,58,237,0.9)', text: '#fff' },
  Sports:    { bg: 'rgba(16,185,129,0.9)', text: '#fff' },
  Workshop:  { bg: 'rgba(245,158,11,0.9)', text: '#fff' },
};

export default function EventCard({ event }) {
  const navigate = useNavigate();
  const [registered, setRegistered] = useState(
    mockData.registrations.some(r => r.eventId === event.id)
  );
  const [imgLoaded, setImgLoaded] = useState(false);

  const isFull = event.seatsRemaining === 0;
  const isLow = event.seatsRemaining > 0 && event.seatsRemaining <= 20;
  const fillPct = Math.round((event.registered / event.capacity) * 100);
  const cat = CAT_COLORS[event.category] || { bg: '#64748B', text: '#fff' };

  const handleRegister = (e) => {
    e.stopPropagation();
    setRegistered(true);
    toast.success(`Registered for ${event.title}!`);
  };

  return (
    <div style={{
      background: 'var(--card)', border: '1px solid var(--border)',
      borderRadius: '16px', overflow: 'hidden',
      display: 'flex', flexDirection: 'column',
      transition: 'all 0.3s', cursor: 'pointer'
    }}
    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.1)'; }}
    onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
    >
      {/* Image */}
      <div style={{ position: 'relative', height: '180px', overflow: 'hidden', background: 'var(--muted)' }}
        onClick={() => navigate(`/events/${event.id}`)}>
        {!imgLoaded && (
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(135deg, rgba(79,70,229,0.2), rgba(124,58,237,0.1))'
          }} />
        )}
        <img src={event.posterUrl} alt={event.title} onLoad={() => setImgLoaded(true)}
          style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: imgLoaded ? 1 : 0, transition: 'opacity 0.5s' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.5), transparent)' }} />

        {/* Category */}
        <span style={{
          position: 'absolute', top: '10px', left: '10px',
          background: cat.bg, color: cat.text, fontSize: '11px', fontWeight: 700,
          padding: '3px 10px', borderRadius: '20px', backdropFilter: 'blur(4px)'
        }}>{event.category}</span>

        {/* Seats */}
        <span style={{
          position: 'absolute', top: '10px', right: '10px',
          background: isFull ? 'rgba(244,63,94,0.9)' : isLow ? 'rgba(245,158,11,0.9)' : 'rgba(16,185,129,0.9)',
          color: '#fff', fontSize: '11px', fontWeight: 700,
          padding: '3px 10px', borderRadius: '20px', backdropFilter: 'blur(4px)'
        }}>
          {isFull ? 'Full' : isLow ? `${event.seatsRemaining} left!` : `${event.seatsRemaining} seats`}
        </span>

        {event.isTeamEvent && (
          <span style={{
            position: 'absolute', bottom: '10px', left: '10px',
            background: 'rgba(124,58,237,0.85)', color: '#fff', fontSize: '11px', fontWeight: 600,
            padding: '3px 8px', borderRadius: '20px',
            display: 'flex', alignItems: 'center', gap: '4px'
          }}>
            <Users size={11} /> Team Event
          </span>
        )}
      </div>

      {/* Content */}
      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px', flex: 1 }}>
        <div onClick={() => navigate(`/events/${event.id}`)}>
          <h3 style={{ fontWeight: 700, fontSize: '14px', color: 'var(--foreground)', lineHeight: 1.4, marginBottom: '2px' }}>
            {event.title}
          </h3>
          <p style={{ fontSize: '12px', color: 'var(--muted-foreground)' }}>{event.organizer}</p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--muted-foreground)' }}>
            <Calendar size={13} color="rgba(79,70,229,0.6)" />
            <span>{event.date} · {event.time}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--muted-foreground)' }}>
            <MapPin size={13} color="rgba(79,70,229,0.6)" />
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{event.venue}</span>
          </div>
        </div>

        {/* Capacity bar */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--muted-foreground)', marginBottom: '4px' }}>
            <span>{event.registered} registered</span>
            <span>{fillPct}% full</span>
          </div>
          <div style={{ height: '5px', background: 'var(--muted)', borderRadius: '99px', overflow: 'hidden' }}>
            <div style={{
              height: '100%', borderRadius: '99px',
              background: isFull ? '#F43F5E' : fillPct > 80 ? '#F59E0B' : '#10B981',
              width: `${fillPct}%`, transition: 'width 0.6s ease'
            }} />
          </div>
        </div>

        {/* Action */}
        <div style={{ marginTop: 'auto', paddingTop: '4px' }}>
          {registered ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 600, color: '#10B981' }}>
                <Check size={14} /> Registered
              </span>
              <button onClick={() => navigate(`/events/${event.id}`)} style={{
                fontSize: '12px', color: 'var(--primary)', background: 'none', border: 'none',
                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '2px', fontWeight: 600
              }}>View <ArrowRight size={12} /></button>
            </div>
          ) : (
            <button onClick={isFull ? null : handleRegister} disabled={isFull} style={{
              width: '100%', padding: '9px', borderRadius: '10px', border: 'none',
              background: isFull ? 'var(--muted)' : 'var(--primary)',
              color: isFull ? 'var(--muted-foreground)' : '#fff',
              fontWeight: 700, fontSize: '13px', cursor: isFull ? 'not-allowed' : 'pointer',
              transition: 'opacity 0.2s'
            }}>
              {isFull ? 'Event Full' : 'Register Now'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
