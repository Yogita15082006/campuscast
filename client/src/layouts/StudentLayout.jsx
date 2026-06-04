import SidebarNav from '../components/SidebarNav';
import TopNavbar from '../components/TopNavbar';
import { Toaster } from 'react-hot-toast';

export default function StudentLayout({ children }) {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--background)' }}>
      <SidebarNav role="student" />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'hidden' }}>
        <TopNavbar />
        <main style={{ flex: 1, padding: '28px 32px', overflowY: 'auto' }}>
          {children}
        </main>
      </div>
      <Toaster position="top-right" toastOptions={{
        style: { background: 'var(--card)', color: 'var(--foreground)', border: '1px solid var(--border)', borderRadius: '12px', fontSize: '13px', fontWeight: 600 }
      }} />
    </div>
  );
}
