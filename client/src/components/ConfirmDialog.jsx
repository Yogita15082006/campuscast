import Modal from './Modal';

export default function ConfirmDialog({ open, onClose, onConfirm, title = 'Are you sure?', message, confirmLabel = 'Delete', loading = false }) {
  return (
    <Modal open={open} onClose={onClose} title={title}
      footer={
        <>
          <button onClick={onClose} style={{
            padding: '8px 18px', borderRadius: '10px',
            border: '1px solid var(--border)', background: 'transparent',
            color: 'var(--foreground)', fontWeight: 600, cursor: 'pointer', fontSize: '14px'
          }}>Cancel</button>
          <button onClick={onConfirm} disabled={loading} style={{
            padding: '8px 18px', borderRadius: '10px', border: 'none',
            background: '#F43F5E', color: '#fff', fontWeight: 600,
            cursor: loading ? 'not-allowed' : 'pointer', fontSize: '14px', opacity: loading ? 0.7 : 1
          }}>{loading ? 'Deleting…' : confirmLabel}</button>
        </>
      }
    >
      <p style={{ color: 'var(--muted-foreground)', fontSize: '14px', lineHeight: 1.6 }}>
        {message || 'This action cannot be undone.'}
      </p>
    </Modal>
  );
}
