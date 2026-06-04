import { useState, useEffect } from 'react';
import { BarChart3, Download, TrendingUp } from 'lucide-react';
import AdminLayout from '../../layouts/AdminLayout';
import { PageSkeleton } from '../../components/LoadingSkeleton';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import { Line } from 'react-chartjs-2';
import toast from 'react-hot-toast';
import api from '../../utils/api';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

export default function Analytics() {
  const [loading, setLoading] = useState(true);
  const [regData, setRegData] = useState([]);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const res = await api.get('/analytics/registrations');
        setRegData(res.data.data.chartData || []);
      } catch (error) {
        toast.error('Failed to load analytics');
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) return <AdminLayout><PageSkeleton /></AdminLayout>;

  // Convert event-based registration data into a pseudo-trend graph so that Line chart has points
  const lineChartData = {
    labels: regData.map(d => d.eventTitle).slice(0, 7), // up to 7 events for display
    datasets: [{
      label: 'Registrations',
      data: regData.map(d => d.registrations).slice(0, 7),
      borderColor: '#4F46E5',
      backgroundColor: 'rgba(79, 70, 229, 0.1)',
      fill: true,
      tension: 0.4
    }]
  };

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
              <h3 style={{ fontWeight: 700, fontSize: '16px', color: 'var(--foreground)' }}>Registration Trend (Events)</h3>
            </div>
          </div>
          <div style={{ height: '350px' }}>
            <Line data={lineChartData} options={{ maintainAspectRatio: false, plugins: { legend: { position: 'top' } }, scales: { y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.05)' } }, x: { grid: { display: false }, ticks: { callback: function (val, idx) { const l = this.getLabelForValue(val); return l.length > 8 ? l.substr(0, 8) + '...' : l; } } } }, elements: { line: { tension: 0.4 } } }} />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
          <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '16px', padding: '24px' }}>
            <h3 style={{ fontWeight: 700, fontSize: '15px', color: 'var(--foreground)', marginBottom: '16px' }}>Quick Stats</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {regData.slice(0, 4).map((item, idx) => (
                <div key={idx}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '6px' }}>
                    <span style={{ fontWeight: 600, color: 'var(--foreground)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.eventTitle}</span>
                    <span style={{ color: 'var(--muted-foreground)' }}>{item.registrations} regs</span>
                  </div>
                  <div style={{ height: '6px', background: 'var(--muted)', borderRadius: '99px' }}>
                    <div style={{ height: '100%', width: `${Math.min(100, item.registrations)}%`, background: 'var(--primary)', borderRadius: '99px' }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)', borderRadius: '16px', padding: '28px', color: '#fff', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <BarChart3 size={32} color="rgba(255,255,255,0.8)" style={{ marginBottom: '16px' }} />
            <h3 style={{ fontWeight: 800, fontSize: '24px', marginBottom: '8px' }}>Insight Summary</h3>
            <p style={{ fontSize: '14px', lineHeight: 1.6, opacity: 0.9 }}>
              Dashboard connections are live. You can fetch and analyze detailed event feedback, attendance, and interactions by tapping into the comprehensive analytics endpoints available in the API.
            </p>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
