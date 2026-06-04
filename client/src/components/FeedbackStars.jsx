import { useState } from 'react';
import { Star } from 'lucide-react';

export default function FeedbackStars({ value = 0, onChange }) {
  const [hover, setHover] = useState(0);

  return (
    <div style={{ display: 'flex', gap: '6px' }}>
      {[1, 2, 3, 4, 5].map(i => (
        <button key={i}
          type="button"
          onClick={() => onChange?.(i)}
          onMouseEnter={() => setHover(i)}
          onMouseLeave={() => setHover(0)}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            padding: '2px', transition: 'transform 0.1s'
          }}
          onMouseDown={e => e.currentTarget.style.transform = 'scale(0.85)'}
          onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
        >
          <Star size={28}
            fill={(hover || value) >= i ? '#F59E0B' : 'transparent'}
            color={(hover || value) >= i ? '#F59E0B' : 'var(--border)'}
            strokeWidth={1.5}
          />
        </button>
      ))}
    </div>
  );
}
