import { TrendingUp, TrendingDown } from 'lucide-react';

export default function StatCard({ label, value, icon, trend, iconBg = '#EDE9FE', iconColor = '#7C3AED' }) {
  return (
    <div style={{
      background: 'var(--card)', border: '1px solid var(--border)',
      borderRadius: '16px', padding: '20px',
      display: 'flex', flexDirection: 'column', gap: '16px',
      transition: 'all 0.2s',
      cursor: 'default'
    }}
    onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
    onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--muted-foreground)' }}>{label}</span>
        <div style={{
          width: '36px', height: '36px', borderRadius: '10px',
          background: iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: iconColor
        }}>
          {icon}
        </div>
      </div>
      <div>
        <span style={{ fontSize: '28px', fontWeight: 700, color: 'var(--foreground)', letterSpacing: '-0.5px' }}>
          {value}
        </span>
        {trend && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: '4px',
            marginTop: '4px', fontSize: '12px', fontWeight: 500,
            color: trend.value >= 0 ? '#10B981' : '#F43F5E'
          }}>
            {trend.value >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            {Math.abs(trend.value)}% {trend.label}
          </div>
        )}
      </div>
    </div>
  );
}
