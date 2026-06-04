import { useState, useEffect } from 'react';
import { Calendar, ClipboardList, Users, CheckSquare, Award, ArrowRight } from 'lucide-react';
import AdminLayout from '../../layouts/AdminLayout';
import StatCard from '../../components/StatCard';
import { PageSkeleton } from '../../components/LoadingSkeleton';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import api from '../../utils/api';
import toast from 'react-hot-toast';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [regData, setRegData] = useState([]);
  const [attData, setAttData] = useState({ totalPresent: 0, totalAbsent: 0 });
  const [activeEvents, setActiveEvents] = useState([]);

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        setLoading(true);
        const [dashRes, regRes, attRes, eventsRes] = await Promise.allSettled([
          api.get('/analytics/dashboard'),
          api.get('/analytics/registrations'),
          api.get('/analytics/attendance'),
          api.get('/events?limit=3') // For active events widget
        ]);

        if (dashRes.status === 'fulfilled') setStats(dashRes.value.data.data);
        if (regRes.status === 'fulfilled') setRegData(regRes.value.data.data.chartData || []);
        if (attRes.status === 'fulfilled') {
          setAttData({
            totalPresent: attRes.value.data.data.totalPresent || 0,
            totalAbsent: attRes.value.data.data.totalAbsent || 0,
          });
        }
        if (eventsRes.status === 'fulfilled') setActiveEvents(eventsRes.value.data.data.events || []);

      } catch (error) {
        toast.error('Error fetching admin dashboard data');
      } finally {
        setLoading(false);
      }
    };
    fetchAdminData();
  }, []);

  if (loading) return <AdminLayout><PageSkeleton /></AdminLayout>;

  // Chart configs
  const barChartData = {
    labels: regData.map(d => d.eventTitle),
    datasets: [{
      label: 'Registrations',
      data: regData.map(d => d.registrations),
      backgroundColor: 'rgba(79, 70, 229, 0.8)',
      borderRadius: 6,
    }]
  };

  const doughnutData = {
    labels: ['Present', 'Absent'],
    datasets: [{
      data: [attData.totalPresent, attData.totalAbsent],
      backgroundColor: ['#10B981', '#F43F5E'],
      borderWidth: 0,
    }]
  };

  return (
    <AdminLayout>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--foreground)' }}>Admin Dashboard</h1>
          <p style={{ fontSize: '13px', color: 'var(--muted-foreground)', marginTop: '4px' }}>Overview of all campus events</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '16px' }}>
          <StatCard label="Total Events" value={stats?.totalEvents || 0} icon={<Calendar size={16} />} iconBg="rgba(79,70,229,0.1)" iconColor="#4F46E5" />
          <StatCard label="Registrations" value={stats?.totalRegistrations || 0} icon={<ClipboardList size={16} />} iconBg="rgba(124,58,237,0.1)" iconColor="#7C3AED" />
          <StatCard label="Active Teams" value={stats?.totalTeams || 0} icon={<Users size={16} />} iconBg="rgba(245,158,11,0.1)" iconColor="#F59E0B" />
          <StatCard label="Avg Attendance" value={`${stats?.attendanceRate || 0}%`} icon={<CheckSquare size={16} />} iconBg="rgba(16,185,129,0.1)" iconColor="#10B981" />
          <StatCard label="Total Attended" value={stats?.totalAttendance || 0} icon={<Award size={16} />} iconBg="rgba(244,63,94,0.1)" iconColor="#F43F5E" />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
          {/* Charts */}
          <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '16px', padding: '24px' }}>
            <h3 style={{ fontWeight: 700, fontSize: '15px', color: 'var(--foreground)', marginBottom: '16px' }}>Registrations By Event</h3>
            <div style={{ height: '300px' }}>
              <Bar data={barChartData} options={{ maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.05)' } }, x: { grid: { display: false }, ticks: { callback: function (val, idx) { const l = this.getLabelForValue(val); return l.length > 10 ? l.substr(0, 10) + '...' : l; } } } } }} />
            </div>
          </div>
          <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '16px', padding: '24px' }}>
            <h3 style={{ fontWeight: 700, fontSize: '15px', color: 'var(--foreground)', marginBottom: '16px' }}>Overall Attendance</h3>
            <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Doughnut data={doughnutData} options={{ maintainAspectRatio: false, cutout: '75%', plugins: { legend: { position: 'bottom' } } }} />
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
              {stats?.recentActivity?.length === 0 && <div style={{ padding: '20px', fontSize: '13px', color: 'var(--muted-foreground)' }}>No recent activity.</div>}
              {stats?.recentActivity?.map((log, i) => (
                <div key={log.id || log._id} style={{ padding: '16px 20px', display: 'flex', gap: '16px', borderBottom: i < stats.recentActivity.length - 1 ? '1px solid var(--border)' : 'none' }}>
                  <div style={{ position: 'relative' }}>
                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--primary)', marginTop: '4px' }} />
                    {i < stats.recentActivity.length - 1 && <div style={{ position: 'absolute', top: '14px', left: '4px', width: '2px', height: '100%', background: 'var(--border)' }} />}
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: '13px', color: 'var(--foreground)', fontWeight: 500 }}>{log.action}</p>
                    <div style={{ display: 'flex', gap: '8px', marginTop: '4px', fontSize: '11px', color: 'var(--muted-foreground)' }}>
                      <span>{new Date(log.createdAt).toLocaleString()}</span>
                      <span>·</span>
                      <span>{log.admin?.name || 'Admin'}</span>
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
              <h3 style={{ fontWeight: 700, fontSize: '15px', color: 'var(--foreground)' }}>Top Events</h3>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {activeEvents.length === 0 && <span style={{ fontSize: '12px', color: 'var(--muted-foreground)' }}>No events yet.</span>}
              {activeEvents.map(e => {
                const registered = e.capacity - e.remainingSeats;
                return (
                  <div key={e.id || e._id} style={{ background: 'var(--muted)', borderRadius: '12px', padding: '16px' }}>
                    <h4 style={{ fontWeight: 700, fontSize: '13px', color: 'var(--foreground)', marginBottom: '8px' }}>{e.title}</h4>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--muted-foreground)', marginBottom: '4px' }}>
                      <span>Registrations</span>
                      <span style={{ fontWeight: 700, color: 'var(--foreground)' }}>{registered}/{e.capacity}</span>
                    </div>
                    <div style={{ height: '6px', background: 'var(--border)', borderRadius: '99px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${(registered / e.capacity) * 100}%`, background: '#10B981', borderRadius: '99px' }} />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
