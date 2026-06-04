import { X } from 'lucide-react';

export default function Modal({ open, onClose, title, children, footer }) {
  if (!open) return null;
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '16px'
    }}>
      <div
        style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
        onClick={onClose}
      />
      <div style={{
        position: 'relative', background: 'var(--card)', border: '1px solid var(--border)',
        borderRadius: '20px', width: '100%', maxWidth: '520px',
        boxShadow: '0 25px 50px rgba(0,0,0,0.15)', zIndex: 1
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '20px 24px', borderBottom: '1px solid var(--border)'
        }}>
          <h3 style={{ fontWeight: 700, fontSize: '16px', color: 'var(--foreground)' }}>{title}</h3>
          <button onClick={onClose} style={{
            width: '32px', height: '32px', borderRadius: '8px', border: 'none',
            background: 'var(--muted)', color: 'var(--muted-foreground)', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <X size={16} />
          </button>
        </div>
        <div style={{ padding: '24px' }}>{children}</div>
        {footer && (
          <div style={{
            padding: '16px 24px', borderTop: '1px solid var(--border)',
            display: 'flex', gap: '8px', justifyContent: 'flex-end'
          }}>
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
