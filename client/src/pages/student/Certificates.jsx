import { useState, useEffect } from 'react';
import { Award } from 'lucide-react';
import StudentLayout from '../../layouts/StudentLayout';
import CertificateCard from '../../components/CertificateCard';
import { mockData } from '../../data/mockData';

export default function Certificates() {
  const [loading, setLoading] = useState(true);
  useEffect(() => { const t = setTimeout(() => setLoading(false), 800); return () => clearTimeout(t); }, []);
  return (
    <StudentLayout>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--foreground)' }}>My Certificates</h1>
          <p style={{ fontSize: '13px', color: 'var(--muted-foreground)', marginTop: '4px' }}>{mockData.certificates.length} certificates earned</p>
        </div>
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: '20px' }}>
            {[1,2,3].map(i => <div key={i} style={{ height: '180px', borderRadius: '16px' }} className="skeleton" />)}
          </div>
        ) : mockData.certificates.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <Award size={48} color="var(--muted-foreground)" style={{ margin: '0 auto 16px', display: 'block' }} />
            <h2 style={{ fontWeight: 700, fontSize: '16px', color: 'var(--foreground)', marginBottom: '8px' }}>No certificates yet</h2>
            <p style={{ fontSize: '13px', color: 'var(--muted-foreground)' }}>Attend events to earn certificates.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: '20px' }}>
            {mockData.certificates.map(cert => <CertificateCard key={cert.id} cert={cert} />)}
          </div>
        )}
      </div>
    </StudentLayout>
  );
}
