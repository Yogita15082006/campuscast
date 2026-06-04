import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, MapPin, Calendar, Users } from 'lucide-react';
import StudentLayout from '../../layouts/StudentLayout';
import EventCard from '../../components/EventCard';
import { PageSkeleton } from '../../components/LoadingSkeleton';
import { mockData } from '../../data/mockData';

const CATS = ['All', 'Technical', 'Cultural', 'Sports', 'Workshop'];

export default function EventList() {
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [cat, setCat] = useState('All');
  const [sort, setSort] = useState('date');
  useEffect(() => { const t = setTimeout(() => setLoading(false), 800); return () => clearTimeout(t); }, []);
  if (loading) return <StudentLayout><PageSkeleton /></StudentLayout>;

  const filtered = mockData.events
    .filter(e => (cat === 'All' || e.category === cat) && (e.title.toLowerCase().includes(search.toLowerCase()) || e.venue.toLowerCase().includes(search.toLowerCase())))
    .sort((a, b) => sort === 'seats' ? b.seatsRemaining - a.seatsRemaining : sort === 'capacity' ? b.capacity - a.capacity : a.date.localeCompare(b.date));

  return (
    <StudentLayout>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h1 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--foreground)' }}>Browse Events</h1>
            <p style={{ fontSize: '13px', color: 'var(--muted-foreground)', marginTop: '2px' }}>{filtered.length} events available</p>
          </div>
          <div style={{ position: 'relative' }}>
            <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--muted-foreground)' }} />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search events…" style={{ height: '38px', paddingLeft: '32px', paddingRight: '12px', borderRadius: '10px', border: '1px solid var(--border)', background: 'var(--card)', color: 'var(--foreground)', fontSize: '13px', outline: 'none', width: '240px' }} />
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {CATS.map(c => (
              <button key={c} onClick={() => setCat(c)} style={{
                padding: '6px 14px', borderRadius: '20px', border: `1px solid ${cat === c ? 'var(--primary)' : 'var(--border)'}`,
                background: cat === c ? 'var(--primary)' : 'var(--card)', color: cat === c ? '#fff' : 'var(--muted-foreground)',
                fontWeight: 600, fontSize: '12px', cursor: 'pointer', transition: 'all 0.15s'
              }}>{c}</button>
            ))}
          </div>
          <div style={{ marginLeft: 'auto' }}>
            <select value={sort} onChange={e => setSort(e.target.value)} style={{ height: '34px', padding: '0 12px', borderRadius: '10px', border: '1px solid var(--border)', background: 'var(--card)', color: 'var(--foreground)', fontSize: '13px', cursor: 'pointer', outline: 'none' }}>
              <option value="date">Sort: Date</option>
              <option value="seats">Sort: Seats</option>
              <option value="capacity">Sort: Capacity</option>
            </select>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <p style={{ fontSize: '36px' }}>🔍</p>
            <p style={{ fontWeight: 700, fontSize: '16px', color: 'var(--foreground)', marginTop: '12px' }}>No events found</p>
            <p style={{ fontSize: '13px', color: 'var(--muted-foreground)', marginTop: '4px' }}>Try adjusting your search or filter</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
            {filtered.map(event => <EventCard key={event.id} event={event} />)}
          </div>
        )}
      </div>
    </StudentLayout>
  );
}
