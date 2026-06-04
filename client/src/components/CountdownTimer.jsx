import { useState, useEffect } from 'react';

export default function CountdownTimer({ initialSeconds = 900, onExpire }) {
  const [seconds, setSeconds] = useState(initialSeconds);

  useEffect(() => {
    if (seconds <= 0) { onExpire?.(); return; }
    const id = setInterval(() => {
      setSeconds(s => {
        if (s <= 1) { onExpire?.(); clearInterval(id); return 0; }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, []);

  const mm = String(Math.floor(seconds / 60)).padStart(2, '0');
  const ss = String(seconds % 60).padStart(2, '0');
  const urgent = seconds < 120;

  return (
    <span style={{
      fontFamily: 'monospace', fontWeight: 700, fontSize: '14px',
      color: urgent ? '#F43F5E' : '#10B981',
      transition: 'color 0.3s'
    }}>
      {mm}:{ss}
    </span>
  );
}
