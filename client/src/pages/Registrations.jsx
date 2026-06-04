import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { FiCalendar, FiMapPin, FiEye, FiCheckSquare, FiAward, FiClipboard } from 'react-icons/fi';
import toast from 'react-hot-toast';

const Registrations = () => {
    const [registrations, setRegistrations] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchRegistrations();
    }, []);

    const fetchRegistrations = async () => {
        try {
            setLoading(true);
            const res = await api.get('/registrations/my');
            setRegistrations(res.data.data.registrations);
        } catch (error) {
            toast.error('Failed to load registrations');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6 max-w-7xl mx-auto pb-10 animate-fade-in">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Registrations</h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">View and manage all your event registrations.</p>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div></div>
            ) : registrations.length === 0 ? (
                <div className="text-center py-20 card border-none bg-white dark:bg-[var(--color-dark-card)]">
                    <FiClipboard className="mx-auto text-gray-500 mb-5" size={56} />
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">No registrations found</h3>
                    <p className="text-gray-500 mt-2">You haven't registered for any events yet!</p>
                    <Link to="/events" className="btn btn-primary mt-6">Browse Events</Link>
                </div>
            ) : (
                <div className="card overflow-hidden border-none bg-white dark:bg-[var(--color-dark-card)] shadow-lg shadow-black/5">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left whitespace-nowrap">
                            <thead className="bg-gray-50 dark:bg-white/5 text-gray-600 dark:text-gray-300 border-b border-gray-100 dark:border-[var(--color-dark-border)]">
                                <tr>
                                    <th className="px-6 py-4 font-semibold text-sm">Event</th>
                                    <th className="px-6 py-4 font-semibold text-sm">Date</th>
                                    <th className="px-6 py-4 font-semibold text-sm">Venue</th>
                                    <th className="px-6 py-4 font-semibold text-sm">Status</th>
                                    <th className="px-6 py-4 font-semibold text-sm text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-[var(--color-dark-border)]">
                                {registrations.map((reg) => (
                                    <tr key={reg._id} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-lg bg-primary-50 dark:bg-primary-900/20 text-primary-600 flex items-center justify-center shrink-0">
                                                    {reg.event?.posterImage ? (
                                                        <img src={`${import.meta.env.VITE_API_URL?.replace('/api', '')}${reg.event.posterImage}`} alt="" className="w-full h-full object-cover rounded-lg" />
                                                    ) : (
                                                        <FiCalendar />
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-gray-900 dark:text-white line-clamp-1 max-w-[250px]">
                                                        {reg.event?.title || 'Unknown Event'}
                                                    </p>
                                                    <p className="text-xs text-gray-500 max-w-[250px] truncate">
                                                        {reg.team ? `Team: ${reg.team.teamName}` : 'Individual'}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                                <FiCalendar className="text-gray-400" />
                                                {reg.event?.date ? new Date(reg.event.date).toLocaleDateString() : 'N/A'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                                <FiMapPin className="text-gray-400" />
                                                <span className="truncate max-w-[150px]">{reg.event?.venue || 'Online'}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${reg.status === 'registered' ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-400' :
                                                    reg.status === 'attended' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400' :
                                                        'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400'
                                                }`}>
                                                {reg.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Link
                                                    to={`/events/${reg.event?._id}`}
                                                    className="p-2 text-gray-500 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/30 rounded-lg transition-colors"
                                                    title="View Details"
                                                >
                                                    <FiEye />
                                                </Link>

                                                {/* If status is registered, go to attendance */}
                                                {reg.status === 'registered' && (
                                                    <Link
                                                        to="/attendance"
                                                        className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition-colors"
                                                        title="Mark Attendance"
                                                    >
                                                        <FiCheckSquare />
                                                    </Link>
                                                )}

                                                {/* If status is attended, go to certificates */}
                                                {reg.status === 'attended' && (
                                                    <Link
                                                        to="/certificates"
                                                        className="p-2 text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 rounded-lg transition-colors"
                                                        title="View Certificate"
                                                    >
                                                        <FiAward />
                                                    </Link>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Registrations;
