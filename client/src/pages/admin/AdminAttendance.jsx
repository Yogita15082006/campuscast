import { useState, useEffect } from 'react';
import api from '../../utils/api';
import { FiCheckCircle, FiClock, FiDownload, FiUsers, FiFilter } from 'react-icons/fi';
import toast from 'react-hot-toast';

const AdminAttendance = () => {
  const [events, setEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState('');
  
  const [attendanceStats, setAttendanceStats] = useState(null);
  const [activeCode, setActiveCode] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingEvents, setLoadingEvents] = useState(true);
  
  const [generating, setGenerating] = useState(false);
  const [duration, setDuration] = useState(15);

  useEffect(() => {
    fetchEvents();
  }, []);

  useEffect(() => {
    if (selectedEventId) {
      fetchAttendanceData(selectedEventId);
      fetchActiveCode(selectedEventId);
    } else {
      setAttendanceStats(null);
      setActiveCode(null);
    }
  }, [selectedEventId]);

  const fetchEvents = async () => {
    try {
      setLoadingEvents(true);
      const res = await api.get('/events?limit=100');
      setEvents(res.data.data.events);
      if (res.data.data.events.length > 0) {
        setSelectedEventId(res.data.data.events[0]._id);
      }
    } catch (error) {
      toast.error('Failed to load events');
    } finally {
      setLoadingEvents(false);
    }
  };

  const fetchAttendanceData = async (eventId) => {
    try {
      setLoading(true);
      const res = await api.get(`/attendance/event/${eventId}`);
      setAttendanceStats(res.data.data);
    } catch (error) {
      toast.error('Failed to load attendance data');
    } finally {
      setLoading(false);
    }
  };

  const fetchActiveCode = async (eventId) => {
    try {
      const res = await api.get(`/attendance/active-code/${eventId}`);
      setActiveCode(res.data.data.code);
    } catch (error) {
      console.error('Failed to fetch active code', error);
    }
  };

  const generateCode = async (e) => {
    e.preventDefault();
    if (!selectedEventId) return;
    
    try {
      setGenerating(true);
      const res = await api.post('/attendance/generate-code', { 
        eventId: selectedEventId, 
        duration: Number(duration) 
      });
      toast.success('Attendance code generated!');
      setActiveCode(res.data.data.code);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to generate code');
    } finally {
      setGenerating(false);
    }
  };

  const downloadCsv = async () => {
    if (!selectedEventId) return;
    try {
      const res = await api.get(`/attendance/export/${selectedEventId}`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `attendance-${selectedEventId}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Export downloaded');
    } catch (error) {
      toast.error('Failed to export CSV');
    }
  };

  const calculateTimeRemaining = (expiresAt) => {
    const remaining = new Date(expiresAt) - new Date();
    if (remaining <= 0) return 'Expired';
    const minutes = Math.floor(remaining / 60000);
    const seconds = Math.floor((remaining % 60000) / 1000);
    return `${minutes}m ${seconds}s`;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Attendance Management</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Generate codes and track event attendance.</p>
        </div>
        {selectedEventId && attendanceStats && (
          <button onClick={downloadCsv} className="btn btn-outline flex items-center gap-2">
            <FiDownload /> Export CSV
          </button>
        )}
      </div>

      <div className="card p-4 flex flex-col sm:flex-row gap-4 items-center bg-gray-50 dark:bg-gray-800/50">
        <FiFilter className="text-gray-400 hidden sm:block" />
        <label className="whitespace-nowrap font-medium text-gray-700 dark:text-gray-300">Select Event:</label>
        {loadingEvents ? (
          <div className="animate-pulse h-10 bg-gray-200 dark:bg-gray-700 rounded w-full sm:w-64"></div>
        ) : (
          <select 
            className="input-field w-full sm:w-auto min-w-[250px]"
            value={selectedEventId}
            onChange={(e) => setSelectedEventId(e.target.value)}
          >
            <option value="">-- Choose an event --</option>
            {events.map(event => (
              <option key={event._id} value={event._id}>{event.title}</option>
            ))}
          </select>
        )}
      </div>

      {!selectedEventId && !loadingEvents ? (
        <div className="text-center py-16 card">
          <FiCheckCircle className="mx-auto text-gray-400 mb-4" size={48} />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">No Event Selected</h3>
          <p className="text-gray-500 mt-1">Please select an event to manage its attendance.</p>
        </div>
      ) : loading ? (
        <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div></div>
      ) : attendanceStats ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Active Code / Generation Panel */}
          <div className="lg:col-span-1 space-y-6">
            <div className="card p-6 border-t-4 border-primary-500">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <FiClock className="text-primary-500" /> Attendance Code
              </h3>
              
              {activeCode ? (
                <div className="text-center py-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-700">
                  <p className="text-sm text-gray-500 mb-2">Active Code</p>
                  <p className="text-4xl font-mono font-bold tracking-widest text-primary-600 dark:text-primary-400">
                    {activeCode.code}
                  </p>
                  <div className="mt-4 inline-block bg-white dark:bg-gray-800 px-3 py-1 rounded-full text-sm font-medium text-gray-600 dark:text-gray-300 shadow-sm border border-gray-100 dark:border-gray-700">
                    Expires: {new Date(activeCode.expiresAt).toLocaleTimeString()}
                  </div>
                  <button 
                    onClick={() => fetchActiveCode(selectedEventId)} 
                    className="mt-4 text-xs text-primary-500 hover:underline block w-full"
                  >
                    Refresh Status
                  </button>
                </div>
              ) : (
                <form onSubmit={generateCode} className="space-y-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    No active code. Generate a new one for students to mark attendance.
                  </p>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Duration (minutes)</label>
                    <select 
                      className="input-field w-full"
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                    >
                      <option value="5">5 Minutes</option>
                      <option value="10">10 Minutes</option>
                      <option value="15">15 Minutes</option>
                      <option value="30">30 Minutes</option>
                      <option value="60">1 Hour</option>
                    </select>
                  </div>
                  <button 
                    type="submit" 
                    disabled={generating}
                    className="btn btn-primary w-full"
                  >
                    {generating ? 'Generating...' : 'Generate New Code'}
                  </button>
                </form>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="card p-4 text-center">
                <FiUsers className="mx-auto text-blue-500 mb-2" size={24} />
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{attendanceStats.totalRegistered}</p>
                <p className="text-xs text-gray-500 mt-1">Total Registered</p>
              </div>
              <div className="card p-4 text-center">
                <FiCheckCircle className="mx-auto text-green-500 mb-2" size={24} />
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{attendanceStats.totalPresent}</p>
                <p className="text-xs text-gray-500 mt-1">Total Present</p>
              </div>
            </div>
          </div>

          {/* Attendance List */}
          <div className="lg:col-span-2 card overflow-hidden flex flex-col">
            <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-800/50">
              <h3 className="font-bold text-gray-900 dark:text-white">Present Students</h3>
              <span className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 px-3 py-1 rounded-full text-xs font-bold">
                {attendanceStats.attendance.length} Records
              </span>
            </div>
            
            <div className="overflow-x-auto flex-1">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider">
                    <th className="p-4 font-medium border-b border-gray-100 dark:border-gray-700">Student</th>
                    <th className="p-4 font-medium border-b border-gray-100 dark:border-gray-700">Email</th>
                    <th className="p-4 font-medium border-b border-gray-100 dark:border-gray-700">Time Marked</th>
                    <th className="p-4 font-medium border-b border-gray-100 dark:border-gray-700">Code Used</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {attendanceStats.attendance.map(record => (
                    <tr key={record._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <td className="p-4 font-medium text-gray-900 dark:text-white">
                        {record.student?.name || 'Unknown'}
                      </td>
                      <td className="p-4 text-sm text-gray-600 dark:text-gray-400">
                        {record.student?.email || 'N/A'}
                      </td>
                      <td className="p-4 text-sm text-gray-600 dark:text-gray-400">
                        {new Date(record.markedAt).toLocaleTimeString()}
                      </td>
                      <td className="p-4">
                        <span className="font-mono text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                          {record.codeUsed}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {attendanceStats.attendance.length === 0 && (
                    <tr>
                      <td colSpan="4" className="p-8 text-center text-gray-500">
                        No attendance records yet for this event.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      ) : null}
    </div>
  );
};

export default AdminAttendance;
