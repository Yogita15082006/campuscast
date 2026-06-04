import { useState, useEffect } from 'react';
import { BarChart3, Download, TrendingUp } from 'lucide-react';
import AdminLayout from '../../layouts/AdminLayout';
import { PageSkeleton } from '../../components/LoadingSkeleton';
import { mockData } from '../../data/mockData';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import { Line } from 'react-chartjs-2';
import toast from 'react-hot-toast';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

export default function Analytics() {
  const [loading, setLoading] = useState(true);
  useEffect(() => { const t = setTimeout(() => setLoading(false), 800); return () => clearTimeout(t); }, []);
  if (loading) return <AdminLayout><PageSkeleton /></AdminLayout>;

  return (
    <AdminLayout>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h1 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--foreground)' }}>Analytics & Reports</h1>
            <p style={{ fontSize: '13px', color: 'var(--muted-foreground)', marginTop: '4px' }}>Detailed insights into platform usage</p>
          </div>
          <button onClick={() => toast.success('Report generation started')} style={{ padding: '10px 20px', borderRadius: '10px', border: '1px solid var(--border)', background: 'var(--card)', color: 'var(--foreground)', fontWeight: 700, fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
            <Download size={16} /> Export Full Report
          </button>
        </div>

        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '16px', padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(79,70,229,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <TrendingUp size={18} color="#4F46E5" />
              </div>
              <h3 style={{ fontWeight: 700, fontSize: '16px', color: 'var(--foreground)' }}>Registration Growth</h3>
            </div>
            <select style={{ height: '34px', padding: '0 12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--muted)', color: 'var(--foreground)', fontSize: '12px', outline: 'none' }}>
              <option>Last 6 Months</option>
              <option>This Year</option>
            </select>
          </div>
          <div style={{ height: '350px' }}>
            <Line data={mockData.chartData.engagementTrends} options={{ maintainAspectRatio: false, plugins: { legend: { position: 'top' } }, scales: { y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.05)' } }, x: { grid: { display: false } } }, elements: { line: { tension: 0.4 } } }} />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
          <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '16px', padding: '24px' }}>
            <h3 style={{ fontWeight: 700, fontSize: '15px', color: 'var(--foreground)', marginBottom: '16px' }}>Top Performing Categories</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {[{ c: 'Technical', v: 45 }, { c: 'Cultural', v: 30 }, { c: 'Sports', v: 15 }, { c: 'Workshop', v: 10 }].map(item => (
                <div key={item.c}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '6px' }}>
                    <span style={{ fontWeight: 600, color: 'var(--foreground)' }}>{item.c}</span>
                    <span style={{ color: 'var(--muted-foreground)' }}>{item.v}%</span>
                  </div>
                  <div style={{ height: '6px', background: 'var(--muted)', borderRadius: '99px' }}>
                    <div style={{ height: '100%', width: `${item.v}%`, background: 'var(--primary)', borderRadius: '99px' }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)', borderRadius: '16px', padding: '28px', color: '#fff', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <BarChart3 size={32} color="rgba(255,255,255,0.8)" style={{ marginBottom: '16px' }} />
            <h3 style={{ fontWeight: 800, fontSize: '24px', marginBottom: '8px' }}>Insight Summary</h3>
            <p style={{ fontSize: '14px', lineHeight: 1.6, opacity: 0.9 }}>
              Overall engagement is up <strong>15%</strong> this month. Technical events are seeing the highest attendance rates (88% avg). Recommend increasing capacity for upcoming workshops.
            </p>
            <button style={{ marginTop: '24px', alignSelf: 'flex-start', padding: '8px 16px', borderRadius: '8px', background: 'rgba(255,255,255,0.2)', color: '#fff', fontWeight: 600, fontSize: '13px', border: '1px solid rgba(255,255,255,0.3)', cursor: 'pointer', backdropFilter: 'blur(4px)' }}>
              View Detailed Breakdown
            </button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
