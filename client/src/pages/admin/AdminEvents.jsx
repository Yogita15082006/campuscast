import { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2 } from 'lucide-react';
import AdminLayout from '../../layouts/AdminLayout';
import StatusBadge from '../../components/StatusBadge';
import ConfirmDialog from '../../components/ConfirmDialog';
import { PageSkeleton } from '../../components/LoadingSkeleton';
import { mockData } from '../../data/mockData';
import toast from 'react-hot-toast';

export default function AdminEvents() {
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [targetEvt, setTargetEvt] = useState(null);
  useEffect(() => { const t = setTimeout(() => setLoading(false), 800); return () => clearTimeout(t); }, []);
  if (loading) return <AdminLayout><PageSkeleton /></AdminLayout>;

  const filtered = mockData.events.filter(e => e.title.toLowerCase().includes(search.toLowerCase()));

  const handleDelete = async () => {
    toast.loading('Deleting event…', { id: 'del' });
    await new Promise(r => setTimeout(r, 1000));
    toast.success('Event deleted', { id: 'del' });
    setDeleteOpen(false);
  };

  return (
    <AdminLayout>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h1 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--foreground)' }}>Manage Events</h1>
            <p style={{ fontSize: '13px', color: 'var(--muted-foreground)', marginTop: '4px' }}>{mockData.events.length} total events</p>
          </div>
          <button onClick={() => toast('Create Event modal coming soon')} style={{ padding: '10px 20px', borderRadius: '10px', border: 'none', background: 'var(--primary)', color: '#fff', fontWeight: 700, fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Plus size={16} /> New Event
          </button>
        </div>

        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '16px', overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
            <div style={{ position: 'relative', maxWidth: '300px' }}>
              <Search size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--muted-foreground)' }} />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search events…" style={{ width: '100%', height: '36px', paddingLeft: '34px', paddingRight: '12px', borderRadius: '10px', border: '1px solid var(--border)', background: 'var(--muted)', color: 'var(--foreground)', fontSize: '13px', outline: 'none' }} />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 100px', padding: '12px 20px', background: 'var(--muted)', borderBottom: '1px solid var(--border)' }}>
            {['Event', 'Date', 'Capacity', 'Status', 'Actions'].map(h => <span key={h} style={{ fontSize: '11px', fontWeight: 700, color: 'var(--muted-foreground)', textTransform: 'uppercase' }}>{h}</span>)}
          </div>
          <div>
            {filtered.map((e, i) => (
              <div key={e.id} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 100px', padding: '16px 20px', alignItems: 'center', borderBottom: i < filtered.length - 1 ? '1px solid var(--border)' : 'none', transition: 'background 0.15s' }} onMouseEnter={ev => ev.currentTarget.style.background = 'var(--muted)'} onMouseLeave={ev => ev.currentTarget.style.background = 'transparent'}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <img src={e.posterUrl} alt={e.title} style={{ width: '40px', height: '40px', borderRadius: '8px', objectFit: 'cover' }} />
                  <div>
                    <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--foreground)' }}>{e.title}</p>
                    <p style={{ fontSize: '11px', color: 'var(--muted-foreground)', marginTop: '2px' }}>{e.category}</p>
                  </div>
                </div>
                <span style={{ fontSize: '13px', color: 'var(--muted-foreground)' }}>{e.date}</span>
                <div style={{ width: '80%' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--muted-foreground)', marginBottom: '4px' }}>
                    <span>{e.registered}/{e.capacity}</span>
                  </div>
                  <div style={{ height: '4px', background: 'var(--border)', borderRadius: '99px' }}>
                    <div style={{ height: '100%', width: `${(e.registered / e.capacity) * 100}%`, background: 'var(--primary)', borderRadius: '99px' }} />
                  </div>
                </div>
                <StatusBadge status={e.status.charAt(0).toUpperCase() + e.status.slice(1)} />
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={() => toast('Edit mode')} style={{ padding: '6px', borderRadius: '8px', border: '1px solid var(--border)', background: 'transparent', color: 'var(--foreground)', cursor: 'pointer' }}><Edit2 size={14} /></button>
                  <button onClick={() => { setTargetEvt(e); setDeleteOpen(true); }} style={{ padding: '6px', borderRadius: '8px', border: '1px solid #F43F5E', background: 'transparent', color: '#F43F5E', cursor: 'pointer' }}><Trash2 size={14} /></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <ConfirmDialog open={deleteOpen} onClose={() => setDeleteOpen(false)} onConfirm={handleDelete} title="Delete Event?" message={`Are you sure you want to delete "${targetEvt?.title}"? All associated registrations and data will be permanently removed.`} />
    </AdminLayout>
  );
}
