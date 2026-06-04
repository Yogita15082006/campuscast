import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { FiCalendar, FiClock, FiMapPin, FiAward, FiUsers } from 'react-icons/fi';
import toast from 'react-hot-toast';

const StudentDashboard = () => {
  const { user } = useAuth();
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [attendanceCode, setAttendanceCode] = useState('');

  useEffect(() => {
    fetchMyData();
  }, []);

  const fetchMyData = async () => {
    try {
      const res = await api.get('/registrations/my');
      setRegistrations(res.data.data.registrations);
    } catch (error) {
      toast.error('Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAttendance = async (e) => {
    e.preventDefault();
    if (!attendanceCode) return;
    
    try {
      const res = await api.post('/attendance/mark', { code: attendanceCode });
      toast.success(res.data.message);
      setAttendanceCode('');
      fetchMyData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to mark attendance');
    }
  };

  const upcomingEvents = registrations.filter(r => new Date(r.event?.date) >= new Date());
  const pastEvents = registrations.filter(r => new Date(r.event?.date) < new Date());

  if (loading) return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div></div>;

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Welcome back, {user?.name}! 👋</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Here's your event overview for today.</p>
        </div>
        
        <form onSubmit={handleMarkAttendance} className="flex gap-2 w-full md:w-auto">
          <input
            type="text"
            placeholder="Enter Attendance Code"
            className="input-field max-w-[200px]"
            value={attendanceCode}
            onChange={(e) => setAttendanceCode(e.target.value)}
          />
          <button type="submit" className="btn btn-primary whitespace-nowrap">
            Mark Present
          </button>
        </form>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card p-6 flex items-center gap-4 border-l-4 border-l-blue-500">
          <div className="p-3 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-lg">
            <FiCalendar size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Registered Events</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{registrations.length}</p>
          </div>
        </div>
        
        <div className="card p-6 flex items-center gap-4 border-l-4 border-l-green-500">
          <div className="p-3 bg-green-100 dark:bg-green-900/30 text-green-600 rounded-lg">
            <FiCheckCircle size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Events Attended</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {registrations.filter(r => r.status === 'attended').length}
            </p>
          </div>
        </div>

        <div className="card p-6 flex items-center gap-4 border-l-4 border-l-purple-500">
          <div className="p-3 bg-purple-100 dark:bg-purple-900/30 text-purple-600 rounded-lg">
            <FiAward size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Certificates Earned</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {registrations.filter(r => r.status === 'attended').length} {/* Approximation for dashboard */}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Upcoming Events</h2>
            <Link to="/events" className="text-sm text-primary-600 hover:underline font-medium">Browse All</Link>
          </div>
          
          <div className="space-y-4">
            {upcomingEvents.length === 0 ? (
              <div className="card p-8 text-center text-gray-500 dark:text-gray-400">
                You haven't registered for any upcoming events yet.
              </div>
            ) : (
              upcomingEvents.slice(0, 3).map((reg) => (
                <div key={reg._id} className="card p-4 flex flex-col sm:flex-row gap-4">
                  {reg.event?.posterImage ? (
                    <img src={`${import.meta.env.VITE_API_URL?.replace('/api', '')}${reg.event.posterImage}`} alt="Event" className="w-full sm:w-24 h-24 object-cover rounded-lg" />
                  ) : (
                    <div className="w-full sm:w-24 h-24 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center text-gray-400">
                      <FiCalendar size={32} />
                    </div>
                  )}
                  <div className="flex-1">
                    <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-1">{reg.event?.title}</h3>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-600 dark:text-gray-400">
                      <span className="flex items-center gap-1"><FiClock /> {new Date(reg.event?.date).toLocaleDateString()} {reg.event?.time}</span>
                      <span className="flex items-center gap-1"><FiMapPin /> {reg.event?.venue}</span>
                    </div>
                    {reg.team && (
                      <span className="inline-flex items-center gap-1 mt-2 px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300">
                        <FiUsers /> Team: {reg.team.teamName}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-col justify-center sm:items-end gap-2">
                    <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                      {reg.status}
                    </span>
                    <Link to={`/events/${reg.event?._id}`} className="text-sm font-medium text-primary-600 hover:text-primary-700">View Details</Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Recent Past Events</h2>
          <div className="space-y-4">
            {pastEvents.length === 0 ? (
              <div className="card p-8 text-center text-gray-500 dark:text-gray-400">
                No past events history found.
              </div>
            ) : (
              pastEvents.slice(0, 3).map((reg) => (
                <div key={reg._id} className="card p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-gray-900 dark:text-white">{reg.event?.title}</h3>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                      reg.status === 'attended' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' 
                      : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                    }`}>
                      {reg.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 flex items-center gap-1 mb-3">
                    <FiCalendar /> {new Date(reg.event?.date).toLocaleDateString()}
                  </p>
                  
                  {reg.status === 'attended' && (
                    <div className="flex gap-2">
                      <Link to="/certificates" className="btn btn-secondary text-xs py-1.5 px-3">
                        <FiAward className="mr-1"/> Certificate
                      </Link>
                      <button className="text-xs font-medium text-primary-600 hover:underline px-2">
                        Leave Feedback
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Also import FiCheckCircle for icon
import { FiCheckCircle } from 'react-icons/fi';

export default StudentDashboard;
