import { useState, useEffect } from 'react';
import api from '../utils/api';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import { FiUsers, FiCalendar, FiCheckCircle, FiAward, FiActivity } from 'react-icons/fi';
import toast from 'react-hot-toast';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [regData, setRegData] = useState(null);
  const [attendanceData, setAttendanceData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, regRes, attRes] = await Promise.all([
        api.get('/analytics/dashboard'),
        api.get('/analytics/registrations'),
        api.get('/analytics/attendance')
      ]);

      setStats(statsRes.data.data);
      
      // Format Chart Data
      if (regRes.data.data.chartData) {
        setRegData({
          labels: regRes.data.data.chartData.map(d => d.eventTitle.substring(0, 15) + '...'),
          datasets: [{
            label: 'Registrations',
            data: regRes.data.data.chartData.map(d => d.registrations),
            backgroundColor: 'rgba(59, 130, 246, 0.6)',
            borderColor: 'rgb(59, 130, 246)',
            borderWidth: 1
          }]
        });
      }

      if (attRes.data.data) {
        setAttendanceData({
          labels: ['Present', 'Absent'],
          datasets: [{
            data: [attRes.data.data.totalPresent, attRes.data.data.totalAbsent],
            backgroundColor: ['rgba(16, 185, 129, 0.6)', 'rgba(239, 68, 68, 0.6)'],
            borderColor: ['rgb(16, 185, 129)', 'rgb(239, 68, 68)'],
            borderWidth: 1
          }]
        });
      }
    } catch (error) {
      toast.error('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div></div>;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">Platform overview and analytics</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
        <StatCard icon={<FiCalendar />} title="Total Events" value={stats?.totalEvents} color="blue" />
        <StatCard icon={<FiUsers />} title="Registrations" value={stats?.totalRegistrations} color="purple" />
        <StatCard icon={<FiCheckCircle />} title="Attendance Rate" value={`${stats?.attendanceRate}%`} color="green" />
        <StatCard icon={<FiUsers />} title="Total Teams" value={stats?.totalTeams} color="orange" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart */}
        <div className="lg:col-span-2 card p-6">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Registrations per Event</h2>
          <div className="h-72">
            {regData && <Bar data={regData} options={{ maintainAspectRatio: false }} />}
          </div>
        </div>

        {/* Doughnut Chart */}
        <div className="card p-6 flex flex-col">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Overall Attendance</h2>
          <div className="flex-1 min-h-[200px] flex items-center justify-center">
            {attendanceData && <Doughnut data={attendanceData} options={{ maintainAspectRatio: false, cutout: '70%' }} />}
          </div>
        </div>
      </div>

      {/* Activity Log */}
      <div className="card p-6">
        <div className="flex items-center gap-2 mb-4">
          <FiActivity className="text-gray-400" />
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">Recent Admin Activity</h2>
        </div>
        <div className="space-y-4">
          {stats?.recentActivity?.length > 0 ? (
            stats.recentActivity.map((log) => (
              <div key={log._id} className="flex items-start gap-4 pb-4 border-b border-gray-100 dark:border-gray-800 last:border-0 last:pb-0">
                <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center flex-shrink-0 text-gray-500">
                  <FiUsers size={14} />
                </div>
                <div>
                  <p className="text-sm text-gray-900 dark:text-white">
                    <span className="font-semibold">{log.admin?.name}</span> {log.action} <span className="font-medium">"{log.details}"</span>
                  </p>
                  <p className="text-xs text-gray-500 mt-1">{new Date(log.createdAt).toLocaleString()}</p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-sm">No recent activity.</p>
          )}
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ icon, title, value, color }) => {
  const colors = {
    blue: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 border-l-blue-500',
    purple: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400 border-l-purple-500',
    green: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400 border-l-green-500',
    orange: 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400 border-l-orange-500',
  };

  return (
    <div className={`card p-4 sm:p-6 flex flex-col justify-center border-l-4 ${colors[color].split(' ')[4]}`}>
      <div className="flex items-center gap-3 mb-2">
        <div className={`p-2 rounded-lg ${colors[color].split(' ').slice(0, 4).join(' ')}`}>
          {icon}
        </div>
        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">{title}</h3>
      </div>
      <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">{value}</p>
    </div>
  );
};

export default AdminDashboard;
