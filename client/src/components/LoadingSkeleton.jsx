function Bone({ width = '100%', height = 16, borderRadius = 8, style = {} }) {
  return (
    <div className="skeleton" style={{ width, height, borderRadius, ...style }} />
  );
}

export function CardSkeleton() {
  return (
    <div style={{
      background: 'var(--card)', border: '1px solid var(--border)',
      borderRadius: '16px', overflow: 'hidden'
    }}>
      <Bone height={180} borderRadius={0} />
      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <Bone height={16} width="70%" />
        <Bone height={12} width="50%" />
        <Bone height={12} width="90%" />
        <Bone height={32} borderRadius={8} style={{ marginTop: '8px' }} />
      </div>
    </div>
  );
}

export function StatSkeleton() {
  return (
    <div style={{
      background: 'var(--card)', border: '1px solid var(--border)',
      borderRadius: '16px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <Bone height={13} width="50%" />
        <Bone height={36} width={36} borderRadius={10} />
      </div>
      <Bone height={28} width="40%" />
    </div>
  );
}

export function PageSkeleton() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header skeleton */}
      <Bone height={120} borderRadius={16} />
      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
        {[1, 2, 3, 4].map(i => <StatSkeleton key={i} />)}
      </div>
      {/* Content */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '16px', height: 300 }} className="skeleton" />
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '16px', height: 300 }} className="skeleton" />
      </div>
    </div>
  );
}

export function TableSkeleton({ rows = 5 }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} style={{
          display: 'flex', alignItems: 'center', gap: '16px',
          padding: '16px', background: 'var(--card)',
          borderBottom: '1px solid var(--border)'
        }}>
          <Bone width={40} height={40} borderRadius={10} />
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <Bone height={13} width="60%" />
            <Bone height={11} width="40%" />
          </div>
          <Bone height={24} width={80} borderRadius={20} />
        </div>
      ))}
    </div>
  );
}
