export default function AvatarGroup({ names = [], max = 4 }) {
  const visible = names.slice(0, max);
  const extra = names.length - max;
  const colors = ['#4F46E5','#7C3AED','#10B981','#F59E0B','#F43F5E','#3B82F6'];

  return (
    <div style={{ display: 'flex' }}>
      {visible.map((name, i) => (
        <div key={i} title={name} style={{
          width: '28px', height: '28px', borderRadius: '50%',
          background: colors[i % colors.length],
          color: '#fff', fontSize: '11px', fontWeight: 700,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          border: '2px solid var(--card)',
          marginLeft: i > 0 ? '-8px' : '0',
          zIndex: max - i
        }}>
          {name.charAt(0).toUpperCase()}
        </div>
      ))}
      {extra > 0 && (
        <div style={{
          width: '28px', height: '28px', borderRadius: '50%',
          background: 'var(--muted)', color: 'var(--muted-foreground)',
          fontSize: '11px', fontWeight: 700,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          border: '2px solid var(--card)', marginLeft: '-8px'
        }}>+{extra}</div>
      )}
    </div>
  );
}
