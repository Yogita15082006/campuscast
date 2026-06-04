import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { FiCalendar, FiClock, FiMapPin, FiAward, FiCheckSquare, FiClipboard, FiBell } from 'react-icons/fi';
import toast from 'react-hot-toast';

const StudentDashboard = () => {
  const { user } = useAuth();
  const [registrations, setRegistrations] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyData();
  }, []);

  const fetchMyData = async () => {
    try {
      const [regRes, annRes] = await Promise.all([
        api.get('/registrations/my'),
        api.get('/announcements')
      ]);
      setRegistrations(regRes.data.data.registrations);
      setAnnouncements(annRes.data.data.announcements || []);
    } catch (error) {
      toast.error('Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const upcomingEvents = registrations.filter(r => new Date(r.event?.date) >= new Date());

  // Calculate attendance rate (mocked logic or real based on available data)
  const attendedCount = registrations.filter(r => r.status === 'attended').length;
  const attendanceRate = registrations.length > 0 ? Math.round((attendedCount / registrations.length) * 100) : 0;
  // Approximate certificates based on attended events if explicit certificates endpoint is not fetched
  const certificatesCount = attendedCount;

  if (loading) return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div></div>;

  return (
    <div className="space-y-8 animate-fade-in pb-8">

      {/* Welcome Hero Banner */}
      <div className="rounded-3xl p-8 bg-gradient-to-r from-primary-600 via-primary-500 to-[#a855f7] shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
        <div className="absolute bottom-0 left-10 w-48 h-48 bg-black/10 rounded-full blur-2xl translate-y-1/3"></div>

        <div className="relative z-10">
          <p className="text-primary-100 font-medium mb-1">Good day,</p>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 flex items-center gap-2">
            {user?.name} <span className="text-3xl">👋</span>
          </h1>
          <p className="text-primary-100/90 text-sm md:text-base max-w-md mb-6">
            You have {registrations.length} registered events and {certificatesCount} certificates earned.
          </p>

          <div className="flex flex-wrap gap-3">
            <Link to="/events" className="btn bg-white/20 hover:bg-white/30 text-white border-none py-2.5 backdrop-blur-sm">
              <FiCalendar className="mr-2" /> Browse Events
            </Link>
            <Link to="/attendance" className="btn bg-transparent hover:bg-white/10 border border-white/30 text-white py-2.5">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
              Submit Code
            </Link>
          </div>
        </div>
      </div>

      {/* 4 Stat Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        <div className="card p-5 border-none bg-white dark:bg-[var(--color-dark-card)] dark:highlight-white/5">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-gray-500 dark:text-gray-400 font-medium text-sm">Upcoming Events</h3>
            <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 text-indigo-500">
              <FiCalendar size={18} />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{upcomingEvents.length}</p>
        </div>

        <div className="card p-5 border-none bg-white dark:bg-[var(--color-dark-card)] dark:highlight-white/5">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-gray-500 dark:text-gray-400 font-medium text-sm">Registrations</h3>
            <div className="p-2 rounded-lg bg-pink-50 dark:bg-pink-500/10 text-pink-500">
              <FiClipboard size={18} />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{registrations.length}</p>
          <p className="text-xs text-green-500 mt-2 font-medium">↗ 12% this month</p>
        </div>

        <div className="card p-5 border-none bg-white dark:bg-[var(--color-dark-card)] dark:highlight-white/5">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-gray-500 dark:text-gray-400 font-medium text-sm">Attendance</h3>
            <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 text-emerald-500">
              <FiCheckSquare size={18} />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{attendanceRate}%</p>
        </div>

        <div className="card p-5 border-none bg-white dark:bg-[var(--color-dark-card)] dark:highlight-white/5">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-gray-500 dark:text-gray-400 font-medium text-sm">Certificates</h3>
            <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-500/10 text-amber-500">
              <FiAward size={18} />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{certificatesCount}</p>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Left Side: My Registered Events */}
        <div className="lg:col-span-2">
          <div className="flex justify-between items-end mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">My Registered Events</h2>
            <Link to="/registrations" className="text-sm font-medium text-primary-600 hover:text-primary-500">
              View all →
            </Link>
          </div>

          <div className="space-y-4">
            {registrations.length === 0 ? (
              <div className="card p-8 border-none bg-white dark:bg-[var(--color-dark-card)] text-center text-gray-500">
                You haven't registered for any events yet.
              </div>
            ) : (
              registrations.slice(0, 4).map((reg) => (
                <div key={reg._id} className="card p-5 border-none bg-white dark:bg-[var(--color-dark-card)] hover:bg-gray-50 dark:hover:bg-[var(--color-dark-card)]/80 flex items-center gap-4 transition-colors">
                  <div className="w-12 h-12 rounded-xl bg-primary-50 dark:bg-primary-900/20 text-primary-600 flex items-center justify-center shrink-0">
                    <FiCalendar size={20} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <Link to={`/events/${reg.event?._id}`} className="font-bold text-base text-gray-900 dark:text-white hover:text-primary-500 truncate block">
                      {reg.event?.title}
                    </Link>
                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate flex items-center gap-2 mt-0.5">
                      {reg.event?.date && new Date(reg.event.date).toISOString().split('T')[0]} • {reg.event?.venue}
                    </p>
                  </div>

                  <div className="shrink-0 flex items-center justify-end w-24">
                    <span className={`text-xs font-semibold px-2 py-1 rounded-md ${reg.status === 'confirmed' || reg.status === 'registered' ? 'text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-500/10' :
                        reg.status === 'attended' ? 'text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-500/10' :
                          'text-amber-600 bg-amber-50 dark:text-amber-400 dark:bg-amber-500/10'
                      }`}>
                      {reg.status === 'registered' ? 'Confirmed' : (reg.status || 'Pending').charAt(0).toUpperCase() + (reg.status || 'pending').slice(1)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Side: Announcements */}
        <div className="lg:col-span-1">
          <div className="flex justify-between items-end mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Announcements</h2>
            <Link to="/announcements" className="text-sm font-medium text-primary-600 hover:text-primary-500">
              All →
            </Link>
          </div>

          <div className="space-y-4 relative">
            {/* The faded line connecting the dots */}
            <div className="absolute left-2.5 top-2 bottom-6 w-px bg-gray-200 dark:bg-[var(--color-dark-border)] z-0"></div>

            {announcements.length === 0 ? (
              <div className="text-sm text-gray-500 dark:text-gray-400 pl-8">No recent announcements.</div>
            ) : (
              announcements.slice(0, 4).map((ann, idx) => (
                <div key={ann._id} className="relative pl-8 pb-4 z-10 group">
                  {/* Dot */}
                  <div className={`absolute left-1 top-1.5 w-3 h-3 rounded-full border-2 border-white dark:border-[var(--color-dark-bg)] bg-primary-500 shadow-sm`}></div>

                  <div className="flex justify-between items-start gap-2">
                    <h4 className="text-sm font-bold text-gray-900 dark:text-white group-hover:text-primary-500 transition-colors">
                      {ann.message.split('.')[0] || 'Announcement'}
                    </h4>
                    <FiBell className="text-gray-400 shrink-0 mt-0.5" size={12} />
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {new Date(ann.createdAt).toLocaleDateString()}
                  </p>
                </div>
              ))
            )}

            {/* Build yours free popup element as shown in screenshot (optional floating ui) */}
            <div className="mt-8 ml-8 card p-3 border-none bg-white dark:bg-[var(--color-dark-card)] flex items-center justify-between text-sm shadow-md shadow-gray-200/20 dark:shadow-black/40">
              <span className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <span className="w-4 h-4 grid grid-cols-2 gap-0.5">
                  <span className="bg-gray-400 rounded-sm"></span><span className="bg-gray-400 rounded-sm"></span>
                  <span className="bg-gray-400 rounded-sm"></span><span className="bg-gray-400 bg-opacity-0"></span>
                </span>
                Build yours free →
              </span>
              <button className="text-gray-400 hover:text-gray-600">×</button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default StudentDashboard;
