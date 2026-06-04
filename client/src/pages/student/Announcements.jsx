import { useState, useEffect } from 'react';
import { Bell, CheckCheck } from 'lucide-react';
import StudentLayout from '../../layouts/StudentLayout';
import { mockData } from '../../data/mockData';
import toast from 'react-hot-toast';

export default function Announcements() {
  const [loading, setLoading] = useState(true);
  const [anns, setAnns] = useState(mockData.announcements);
  useEffect(() => { const t = setTimeout(() => setLoading(false), 800); return () => clearTimeout(t); }, []);
  const markAllRead = () => { setAnns(a => a.map(x => ({ ...x, unread: false }))); toast.success('All announcements marked as read'); };
  return (
    <StudentLayout>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h1 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--foreground)' }}>Announcements</h1>
            <p style={{ fontSize: '13px', color: 'var(--muted-foreground)', marginTop: '4px' }}>{anns.filter(a => a.unread).length} unread</p>
          </div>
          {anns.some(a => a.unread) && (
            <button onClick={markAllRead} style={{ padding: '8px 16px', borderRadius: '10px', border: '1px solid var(--border)', background: 'transparent', color: 'var(--foreground)', fontWeight: 700, fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <CheckCheck size={15} /> Mark all read
            </button>
          )}
        </div>
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[1,2,3,4].map(i => <div key={i} style={{ height: '80px', borderRadius: '14px' }} className="skeleton" />)}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {anns.map(ann => (
              <div key={ann.id} onClick={() => setAnns(a => a.map(x => x.id === ann.id ? { ...x, unread: false } : x))} style={{
                padding: '16px 18px', borderRadius: '14px', cursor: 'pointer',
                background: ann.unread ? 'rgba(79,70,229,0.06)' : 'var(--card)',
                border: `1px solid ${ann.unread ? 'rgba(79,70,229,0.25)' : 'var(--border)'}`,
                borderLeft: ann.unread ? '4px solid var(--primary)' : '4px solid transparent',
                display: 'flex', gap: '14px', alignItems: 'flex-start', transition: 'all 0.15s'
              }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: ann.unread ? 'rgba(79,70,229,0.1)' : 'var(--muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Bell size={16} color={ann.unread ? '#4F46E5' : 'var(--muted-foreground)'} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <p style={{ fontSize: '14px', fontWeight: ann.unread ? 700 : 600, color: 'var(--foreground)' }}>{ann.title}</p>
                    <span style={{ fontSize: '11px', color: 'var(--muted-foreground)', flexShrink: 0 }}>{ann.date}</span>
                  </div>
                  <p style={{ fontSize: '13px', color: 'var(--muted-foreground)', lineHeight: 1.6 }}>{ann.message}</p>
                </div>
                {ann.unread && <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#4F46E5', flexShrink: 0, marginTop: '6px' }} />}
              </div>
            ))}
          </div>
        )}
      </div>
    </StudentLayout>
  );
}
