import { useState, useEffect } from 'react';
import { Calendar, ClipboardList, Users, CheckSquare, Award, ArrowRight } from 'lucide-react';
import AdminLayout from '../../layouts/AdminLayout';
import StatCard from '../../components/StatCard';
import { PageSkeleton } from '../../components/LoadingSkeleton';
import { mockData } from '../../data/mockData';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  useEffect(() => { const t = setTimeout(() => setLoading(false), 800); return () => clearTimeout(t); }, []);

  if (loading) return <AdminLayout><PageSkeleton /></AdminLayout>;

  return (
    <AdminLayout>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--foreground)' }}>Admin Dashboard</h1>
          <p style={{ fontSize: '13px', color: 'var(--muted-foreground)', marginTop: '4px' }}>Overview of all campus events</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '16px' }}>
          <StatCard label="Total Events" value={mockData.adminStats.totalEvents} icon={<Calendar size={16} />} iconBg="rgba(79,70,229,0.1)" iconColor="#4F46E5" />
          <StatCard label="Registrations" value={mockData.adminStats.totalRegistrations} icon={<ClipboardList size={16} />} iconBg="rgba(124,58,237,0.1)" iconColor="#7C3AED" trend={{ value: 15, label: 'vs last month' }} />
          <StatCard label="Active Teams" value={mockData.adminStats.totalTeams} icon={<Users size={16} />} iconBg="rgba(245,158,11,0.1)" iconColor="#F59E0B" />
          <StatCard label="Avg Attendance" value={`${mockData.adminStats.avgAttendance}%`} icon={<CheckSquare size={16} />} iconBg="rgba(16,185,129,0.1)" iconColor="#10B981" trend={{ value: 2, label: 'vs last month' }} />
          <StatCard label="Pending Certs" value={mockData.adminStats.pendingCerts} icon={<Award size={16} />} iconBg="rgba(244,63,94,0.1)" iconColor="#F43F5E" />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
          {/* Charts */}
          <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '16px', padding: '24px' }}>
            <h3 style={{ fontWeight: 700, fontSize: '15px', color: 'var(--foreground)', marginBottom: '16px' }}>Recent Registrations</h3>
            <div style={{ height: '300px' }}>
              <Bar data={mockData.chartData.registrationsByEvent} options={{ maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.05)' } }, x: { grid: { display: false } } } }} />
            </div>
          </div>
          <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '16px', padding: '24px' }}>
            <h3 style={{ fontWeight: 700, fontSize: '15px', color: 'var(--foreground)', marginBottom: '16px' }}>Overall Attendance</h3>
            <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Doughnut data={mockData.chartData.attendanceBreakdown} options={{ maintainAspectRatio: false, cutout: '75%', plugins: { legend: { position: 'bottom' } } }} />
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
          {/* Recent Activity Feed */}
          <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '16px', overflow: 'hidden' }}>
            <div style={{ padding: '20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between' }}>
              <h3 style={{ fontWeight: 700, fontSize: '15px', color: 'var(--foreground)' }}>Recent Activity</h3>
              <button style={{ background: 'none', border: 'none', color: 'var(--primary)', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>View All</button>
            </div>
            <div>
              {mockData.activityLog.map((log, i) => (
                <div key={log.id} style={{ padding: '16px 20px', display: 'flex', gap: '16px', borderBottom: i < mockData.activityLog.length - 1 ? '1px solid var(--border)' : 'none' }}>
                  <div style={{ position: 'relative' }}>
                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--primary)', marginTop: '4px' }} />
                    {i < mockData.activityLog.length - 1 && <div style={{ position: 'absolute', top: '14px', left: '4px', width: '2px', height: '100%', background: 'var(--border)' }} />}
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: '13px', color: 'var(--foreground)', fontWeight: 500 }}>{log.action}</p>
                    <div style={{ display: 'flex', gap: '8px', marginTop: '4px', fontSize: '11px', color: 'var(--muted-foreground)' }}>
                      <span>{log.time}</span>
                      <span>·</span>
                      <span>{log.admin}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Live Events Widget */}
          <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '16px', padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10B981', boxShadow: '0 0 0 4px rgba(16,185,129,0.2)' }} />
              <h3 style={{ fontWeight: 700, fontSize: '15px', color: 'var(--foreground)' }}>Active Now</h3>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {mockData.events.slice(0, 2).map(e => (
                <div key={e.id} style={{ background: 'var(--muted)', borderRadius: '12px', padding: '16px' }}>
                  <h4 style={{ fontWeight: 700, fontSize: '13px', color: 'var(--foreground)', marginBottom: '8px' }}>{e.title}</h4>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--muted-foreground)', marginBottom: '4px' }}>
                    <span>Live Attendance</span>
                    <span style={{ fontWeight: 700, color: 'var(--foreground)' }}>{e.registered - e.seatsRemaining}/{e.capacity}</span>
                  </div>
                  <div style={{ height: '6px', background: 'var(--border)', borderRadius: '99px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${(e.registered / e.capacity) * 100}%`, background: '#10B981', borderRadius: '99px' }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
