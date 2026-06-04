import { useState, useEffect } from 'react';
import { Users, Plus, LogIn, Crown, User } from 'lucide-react';
import StudentLayout from '../../layouts/StudentLayout';
import Modal from '../../components/Modal';
import AvatarGroup from '../../components/AvatarGroup';
import { mockData } from '../../data/mockData';
import toast from 'react-hot-toast';

export default function Teams() {
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [joinOpen, setJoinOpen] = useState(false);
  const [teamName, setTeamName] = useState('');
  const [teamCode, setTeamCode] = useState('');
  const [event, setEvent] = useState('');
  useEffect(() => { const t = setTimeout(() => setLoading(false), 800); return () => clearTimeout(t); }, []);

  const inp = { width: '100%', height: '40px', padding: '0 12px', borderRadius: '10px', border: '1px solid var(--border)', background: 'var(--card)', color: 'var(--foreground)', fontSize: '14px', outline: 'none', boxSizing: 'border-box' };
  const lb = { fontSize: '13px', fontWeight: 600, color: 'var(--foreground)', display: 'block', marginBottom: '6px' };

  return (
    <StudentLayout>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h1 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--foreground)' }}>My Teams</h1>
            <p style={{ fontSize: '13px', color: 'var(--muted-foreground)', marginTop: '4px' }}>Manage your event teams</p>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={() => setJoinOpen(true)} style={{ padding: '9px 18px', borderRadius: '10px', border: '1px solid var(--border)', background: 'transparent', color: 'var(--foreground)', fontWeight: 700, fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}><LogIn size={15} /> Join Team</button>
            <button onClick={() => setCreateOpen(true)} style={{ padding: '9px 18px', borderRadius: '10px', border: 'none', background: 'var(--primary)', color: '#fff', fontWeight: 700, fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}><Plus size={15} /> Create Team</button>
          </div>
        </div>

        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: '20px' }}>
            {[1,2].map(i => <div key={i} style={{ height: '200px', borderRadius: '16px' }} className="skeleton" />)}
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: '20px' }}>
            {mockData.teams.map(team => (
              <div key={team.id} style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '16px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <h3 style={{ fontWeight: 800, fontSize: '16px', color: 'var(--foreground)' }}>{team.name}</h3>
                      <span style={{ padding: '2px 8px', borderRadius: '20px', background: team.role === 'Leader' ? 'rgba(245,158,11,0.15)' : 'rgba(79,70,229,0.1)', color: team.role === 'Leader' ? '#F59E0B' : '#4F46E5', fontSize: '11px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '3px' }}>
                        {team.role === 'Leader' ? <Crown size={10} /> : <User size={10} />} {team.role}
                      </span>
                    </div>
                    <p style={{ fontSize: '12px', color: 'var(--muted-foreground)' }}>{team.eventName}</p>
                  </div>
                  <span style={{ fontFamily: 'monospace', fontSize: '12px', fontWeight: 700, padding: '4px 10px', borderRadius: '8px', background: 'var(--muted)', color: 'var(--foreground)' }}>{team.code}</span>
                </div>
                <div style={{ borderTop: '1px solid var(--border)', paddingTop: '14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <span style={{ fontSize: '12px', color: 'var(--muted-foreground)', fontWeight: 500 }}>Members ({team.members.length}/{team.maxSize})</span>
                    <span style={{ fontSize: '12px', color: '#10B981', fontWeight: 600 }}>{team.maxSize - team.members.length} slots open</span>
                  </div>
                  <AvatarGroup names={team.members} />
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '10px' }}>
                    {team.members.map((m, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: 'var(--muted-foreground)' }}>
                        <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--primary)', flexShrink: 0 }} />
                        {m} {i === 0 && team.role === 'Leader' && <span style={{ color: '#F59E0B', fontWeight: 600 }}>(You)</span>}
                        {i === 1 && team.role === 'Member' && <span style={{ color: '#4F46E5', fontWeight: 600 }}>(You)</span>}
                      </div>
                    ))}
                  </div>
                </div>
                <button onClick={() => toast(`Left team "${team.name}" (demo)`)} style={{ padding: '8px', borderRadius: '10px', border: '1px solid #F43F5E', background: 'transparent', color: '#F43F5E', fontWeight: 700, fontSize: '12px', cursor: 'pointer', transition: 'background 0.15s' }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(244,63,94,0.08)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}>
                  Leave Team
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Create New Team"
        footer={<>
          <button onClick={() => setCreateOpen(false)} style={{ padding: '8px 16px', borderRadius: '10px', border: '1px solid var(--border)', background: 'transparent', color: 'var(--foreground)', fontWeight: 600, fontSize: '13px', cursor: 'pointer' }}>Cancel</button>
          <button onClick={() => { if (!teamName || !event) return toast.error('Fill all fields'); toast.success('Team created!'); setCreateOpen(false); setTeamName(''); setEvent(''); }} style={{ padding: '8px 16px', borderRadius: '10px', border: 'none', background: 'var(--primary)', color: '#fff', fontWeight: 700, fontSize: '13px', cursor: 'pointer' }}>Create Team</button>
        </>}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div><label style={lb}>Team Name</label><input value={teamName} onChange={e => setTeamName(e.target.value)} placeholder="e.g. Code Warriors" style={inp} /></div>
          <div>
            <label style={lb}>Select Event</label>
            <select value={event} onChange={e => setEvent(e.target.value)} style={{ ...inp, height: '40px', cursor: 'pointer' }}>
              <option value="">Choose event…</option>
              {mockData.events.filter(e => e.isTeamEvent).map(e => <option key={e.id} value={e.id}>{e.title}</option>)}
            </select>
          </div>
        </div>
      </Modal>

      <Modal open={joinOpen} onClose={() => setJoinOpen(false)} title="Join a Team"
        footer={<>
          <button onClick={() => setJoinOpen(false)} style={{ padding: '8px 16px', borderRadius: '10px', border: '1px solid var(--border)', background: 'transparent', color: 'var(--foreground)', fontWeight: 600, fontSize: '13px', cursor: 'pointer' }}>Cancel</button>
          <button onClick={() => { if (!teamCode) return toast.error('Enter a team code'); toast.success('Joined team!'); setJoinOpen(false); setTeamCode(''); }} style={{ padding: '8px 16px', borderRadius: '10px', border: 'none', background: 'var(--primary)', color: '#fff', fontWeight: 700, fontSize: '13px', cursor: 'pointer' }}>Join Team</button>
        </>}>
        <div><label style={lb}>Team Code</label><input value={teamCode} onChange={e => setTeamCode(e.target.value)} placeholder="e.g. CW-4821" style={inp} /></div>
      </Modal>
    </StudentLayout>
  );
}
