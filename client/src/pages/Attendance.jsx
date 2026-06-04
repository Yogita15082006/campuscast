import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { FiCheckSquare, FiClock, FiCalendar, FiCheckCircle } from 'react-icons/fi';
import toast from 'react-hot-toast';

const Attendance = () => {
    const [attendanceCode, setAttendanceCode] = useState('');
    const [marking, setMarking] = useState(false);
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchHistory();
    }, []);

    const fetchHistory = async () => {
        try {
            setLoading(true);
            const res = await api.get('/registrations/my');
            // For attendance history, use registrations that have logic (attended vs registered)
            const data = res.data.data.registrations || [];
            const pastEvents = data.filter(r => new Date(r.event?.date) < new Date());
            setHistory(pastEvents);
        } catch (error) {
            toast.error('Failed to load attendance history');
        } finally {
            setLoading(false);
        }
    };

    const handleMarkAttendance = async (e) => {
        e.preventDefault();
        if (!attendanceCode) return toast.error('Please enter a code');

        try {
            setMarking(true);
            const res = await api.post('/attendance/mark', { code: attendanceCode });
            toast.success(res.data.message || 'Attendance marked successfully!');
            setAttendanceCode('');
            fetchHistory(); // Refresh history
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to mark attendance. Invalid code.');
        } finally {
            setMarking(false);
        }
    };

    // Calculating stats based on past events history (since frontend model differs slightly, use registered ones that are past date)
    const attended = history.filter(r => r.status === 'attended').length;
    const missed = history.filter(r => r.status === 'registered' || r.status === 'absent').length; // passed date but not attended
    const total = history.length;
    const rate = total > 0 ? Math.round((attended / total) * 100) : 0;

    return (
        <div className="space-y-8 max-w-5xl mx-auto pb-10 animate-fade-in">

            <div className="flex flex-col md:flex-row gap-6">
                {/* Left Side: Submit Code Card */}
                <div className="md:w-1/3">
                    <div className="card p-6 md:p-8 border-none bg-white dark:bg-[var(--color-dark-card)] shadow-lg shadow-black/5 sticky top-24">
                        <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-500 flex items-center justify-center mb-6">
                            <FiCheckSquare size={24} />
                        </div>

                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Submit Attendance Code</h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                            Enter the unique 6-character code provided by the event organizer.
                        </p>

                        <form onSubmit={handleMarkAttendance} className="space-y-4">
                            <div>
                                <input
                                    type="text"
                                    className="input-field text-center tracking-widest text-lg font-mono uppercase bg-gray-50 border-gray-200 dark:bg-[var(--color-dark-bg)] dark:border-[var(--color-dark-border)] py-4 outline-none"
                                    placeholder="******"
                                    maxLength={6}
                                    value={attendanceCode}
                                    onChange={(e) => setAttendanceCode(e.target.value.toUpperCase())}
                                    required
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={marking || attendanceCode.length === 0}
                                className="btn btn-primary w-full py-3 text-base shadow-md shadow-primary-500/20"
                            >
                                {marking ? 'Verifying...' : 'Mark Present'}
                            </button>
                        </form>
                    </div>
                </div>

                {/* Right Side: Stats & History */}
                <div className="md:w-2/3 space-y-6">

                    {/* Stats Row */}
                    <div className="grid grid-cols-3 gap-4">
                        <div className="card p-5 border-none bg-white dark:bg-[var(--color-dark-card)]">
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Total Present</p>
                            <h3 className="text-3xl font-bold text-emerald-500">{attended}</h3>
                        </div>
                        <div className="card p-5 border-none bg-white dark:bg-[var(--color-dark-card)]">
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Total Absent</p>
                            <h3 className="text-3xl font-bold text-red-500">{missed}</h3>
                        </div>
                        <div className="card p-5 border-none bg-white dark:bg-[var(--color-dark-card)]">
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Attendance Rate</p>
                            <h3 className="text-3xl font-bold text-indigo-500">{rate}%</h3>
                        </div>
                    </div>

                    {/* History List */}
                    <div className="card overflow-hidden border-none bg-white dark:bg-[var(--color-dark-card)]">
                        <div className="px-6 py-4 border-b border-gray-100 dark:border-[var(--color-dark-border)]">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Attendance History</h3>
                        </div>

                        {loading ? (
                            <div className="flex justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div></div>
                        ) : history.length === 0 ? (
                            <div className="p-10 text-center text-gray-500">
                                <FiClock className="mx-auto mb-3 text-gray-400" size={32} />
                                No attendance history yet.
                            </div>
                        ) : (
                            <ul className="divide-y divide-gray-100 dark:divide-[var(--color-dark-border)]">
                                {history.map((item) => {
                                    const isPresent = item.status === 'attended';
                                    return (
                                        <li key={item._id} className="p-4 sm:p-6 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors flex items-center justify-between">
                                            <div className="flex items-start gap-4">
                                                <div className={`mt-1 p-2 rounded-full ${isPresent ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400' : 'bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-400'}`}>
                                                    {isPresent ? <FiCheckCircle size={16} /> : <FiClock size={16} />}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-gray-900 dark:text-white">{item.event?.title || 'Unknown Event'}</p>
                                                    <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                                                        <span className="flex items-center gap-1">
                                                            <FiCalendar /> {item.event?.date ? new Date(item.event.date).toLocaleDateString() : 'N/A'}
                                                        </span>
                                                        {isPresent && (
                                                            <span className="flex items-center gap-1">
                                                                <FiClock /> {item.updatedAt ? new Date(item.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--'}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            <span className={`text-sm font-semibold ${isPresent ? 'text-emerald-500' : 'text-red-500'}`}>
                                                {isPresent ? 'Present' : 'Absent'}
                                            </span>
                                        </li>
                                    )
                                })}
                            </ul>
                        )}
                    </div>
                </div>
            </div>

        </div>
    );
};

export default Attendance;
