import { useState, useEffect } from 'react';
import api from '../utils/api';
import { FiBell, FiClock, FiCalendar } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const Announcements = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const res = await api.get('/announcements');
      setAnnouncements(res.data.data.announcements);
    } catch (error) {
      toast.error('Failed to load announcements');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <FiBell className="text-primary-500" /> Announcements
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Stay updated with the latest event news and notifications.</p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div></div>
      ) : announcements.length === 0 ? (
        <div className="text-center py-16 card">
          <FiBell className="mx-auto text-gray-400 mb-4" size={48} />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">No announcements yet</h3>
          <p className="text-gray-500 mt-1">Check back later for updates.</p>
        </div>
      ) : (
        <div className="space-y-4 max-w-4xl">
          {announcements.map((announcement) => (
            <div key={announcement._id} className="card p-5 md:p-6 flex flex-col md:flex-row gap-4 md:gap-6 items-start">
              <div className="bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 p-3 rounded-full shrink-0">
                <FiBell size={24} />
              </div>
              
              <div className="flex-1 space-y-2">
                <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-2">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">{announcement.title}</h3>
                  <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400 font-medium">
                    <span className="flex items-center gap-1">
                      <FiCalendar /> {new Date(announcement.createdAt).toLocaleDateString()}
                    </span>
                    <span className="flex items-center gap-1">
                      <FiClock /> {new Date(announcement.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
                
                <p className="text-gray-600 dark:text-gray-300 whitespace-pre-line">
                  {announcement.message}
                </p>

                {announcement.event && (
                  <div className="mt-4 inline-block bg-gray-100 dark:bg-gray-800 rounded-lg px-3 py-2 text-sm text-gray-700 dark:text-gray-300">
                    <span className="text-gray-500 dark:text-gray-400">Related Event: </span>
                    <span className="font-semibold">{announcement.event.title}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Announcements;
