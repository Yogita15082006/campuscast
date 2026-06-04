const STATUS_STYLES = {
  Present:   { bg: '#D1FAE5', color: '#065F46' },
  Absent:    { bg: '#FFE4E6', color: '#9F1239' },
  Confirmed: { bg: '#EDE9FE', color: '#5B21B6' },
  Pending:   { bg: '#FEF3C7', color: '#92400E' },
  Upcoming:  { bg: '#DBEAFE', color: '#1E40AF' },
  Completed: { bg: '#F0FDF4', color: '#166534' },
  Full:      { bg: '#FFE4E6', color: '#9F1239' },
  Open:      { bg: '#D1FAE5', color: '#065F46' },
};

export default function StatusBadge({ status }) {
  const style = STATUS_STYLES[status] || { bg: '#F1F5F9', color: '#475569' };
  return (
    <span style={{
      background: style.bg,
      color: style.color,
      fontSize: '11px',
      fontWeight: 600,
      padding: '3px 10px',
      borderRadius: '20px',
      whiteSpace: 'nowrap',
      display: 'inline-flex',
      alignItems: 'center',
      gap: '4px'
    }}>
      {status}
    </span>
  );
}
