import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function DarkModeToggle() {
  const { dark, toggle } = useTheme();
  return (
    <button
      onClick={toggle}
      style={{
        width: '36px', height: '36px', borderRadius: '10px',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'var(--muted)', border: '1px solid var(--border)',
        color: 'var(--muted-foreground)', cursor: 'pointer',
        transition: 'all 0.2s'
      }}
      title={dark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {dark ? <Sun size={16} /> : <Moon size={16} />}
    </button>
  );
}
