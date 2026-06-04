import { useState, useEffect } from 'react';
import api from '../../utils/api';
import { FiPlus, FiEdit2, FiTrash2, FiCalendar, FiMapPin, FiUsers } from 'react-icons/fi';
import toast from 'react-hot-toast';

const AdminEvents = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    venue: '',
    category: 'technical',
    capacity: '',
    isTeamEvent: false,
    teamSizeLimit: ''
  });
  const [posterFile, setPosterFile] = useState(null);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const res = await api.get('/events?limit=100'); // Fetch more for admin
      setEvents(res.data.data.events);
    } catch (error) {
      toast.error('Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleFileChange = (e) => {
    setPosterFile(e.target.files[0]);
  };

  const openCreateModal = () => {
    setIsEditing(false);
    setCurrentId(null);
    setFormData({
      title: '', description: '', date: '', time: '', venue: '',
      category: 'technical', capacity: '', isTeamEvent: false, teamSizeLimit: ''
    });
    setPosterFile(null);
    setShowModal(true);
  };

  const openEditModal = (event) => {
    setIsEditing(true);
    setCurrentId(event._id);
    setFormData({
      title: event.title,
      description: event.description,
      date: new Date(event.date).toISOString().split('T')[0],
      time: event.time,
      venue: event.venue,
      category: event.category,
      capacity: event.capacity,
      isTeamEvent: event.isTeamEvent,
      teamSizeLimit: event.teamSizeLimit || ''
    });
    setPosterFile(null);
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      
      const submitData = new FormData();
      Object.keys(formData).forEach(key => {
        submitData.append(key, formData[key]);
      });
      if (posterFile) {
        submitData.append('poster', posterFile);
      }

      if (isEditing) {
        await api.put(`/events/${currentId}`, submitData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        toast.success('Event updated successfully');
      } else {
        await api.post('/events', submitData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        toast.success('Event created successfully');
      }
      
      setShowModal(false);
      fetchEvents();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this event? This action cannot be undone.')) return;
    
    try {
      await api.delete(`/events/${id}`);
      toast.success('Event deleted');
      fetchEvents();
    } catch (error) {
      toast.error('Failed to delete event');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Manage Events</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Create, edit, and delete campus events.</p>
        </div>
        <button onClick={openCreateModal} className="btn btn-primary flex items-center gap-2">
          <FiPlus /> Create Event
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div></div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-800/50 text-gray-500 dark:text-gray-400 text-sm uppercase tracking-wider">
                  <th className="p-4 font-medium border-b border-gray-100 dark:border-gray-700">Event</th>
                  <th className="p-4 font-medium border-b border-gray-100 dark:border-gray-700">Date & Time</th>
                  <th className="p-4 font-medium border-b border-gray-100 dark:border-gray-700">Stats</th>
                  <th className="p-4 font-medium border-b border-gray-100 dark:border-gray-700">Status</th>
                  <th className="p-4 font-medium border-b border-gray-100 dark:border-gray-700 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {events.map(event => (
                  <tr key={event._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-lg bg-gray-200 dark:bg-gray-700 overflow-hidden shrink-0">
                          {event.posterImage ? (
                            <img src={`${import.meta.env.VITE_API_URL?.replace('/api', '')}${event.posterImage}`} alt={event.title} className="h-full w-full object-cover" />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center text-gray-400"><FiCalendar /></div>
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 dark:text-white line-clamp-1">{event.title}</p>
                          <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                            <FiMapPin size={12} /> <span className="truncate max-w-[150px]">{event.venue}</span>
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-sm text-gray-600 dark:text-gray-300">
                      <div>{new Date(event.date).toLocaleDateString()}</div>
                      <div className="text-gray-400 text-xs">{event.time}</div>
                    </td>
                    <td className="p-4 text-sm text-gray-600 dark:text-gray-300">
                      <div className="flex items-center gap-1"><FiUsers size={14} className="text-primary-500" /> {event.capacity - event.remainingSeats} / {event.capacity}</div>
                      {event.isTeamEvent && <div className="text-xs text-purple-500 mt-1">Team Event</div>}
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${event.status === 'upcoming' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'}`}>
                        {event.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => openEditModal(event)} className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors">
                          <FiEdit2 />
                        </button>
                        <button onClick={() => handleDelete(event._id)} className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors">
                          <FiTrash2 />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {events.length === 0 && (
                  <tr>
                    <td colSpan="5" className="p-8 text-center text-gray-500">No events found. Create one to get started.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-2xl w-full p-6 my-8">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
              {isEditing ? 'Edit Event' : 'Create New Event'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Event Title *</label>
                  <input type="text" name="title" required className="input-field w-full" value={formData.title} onChange={handleInputChange} />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description *</label>
                  <textarea name="description" required rows="3" className="input-field w-full" value={formData.description} onChange={handleInputChange}></textarea>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date *</label>
                  <input type="date" name="date" required className="input-field w-full" value={formData.date} onChange={handleInputChange} />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Time *</label>
                  <input type="time" name="time" required className="input-field w-full" value={formData.time} onChange={handleInputChange} />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Venue *</label>
                  <input type="text" name="venue" required className="input-field w-full" value={formData.venue} onChange={handleInputChange} />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category *</label>
                  <select name="category" required className="input-field w-full" value={formData.category} onChange={handleInputChange}>
                    <option value="technical">Technical</option>
                    <option value="cultural">Cultural</option>
                    <option value="sports">Sports</option>
                    <option value="workshop">Workshop</option>
                    <option value="hackathon">Hackathon</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Capacity (Total Seats) *</label>
                  <input type="number" name="capacity" min="1" required className="input-field w-full" value={formData.capacity} onChange={handleInputChange} />
                </div>

                <div className="md:col-span-2 p-4 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg space-y-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" name="isTeamEvent" className="w-4 h-4 text-primary-600 rounded" checked={formData.isTeamEvent} onChange={handleInputChange} />
                    <span className="text-sm font-medium text-gray-900 dark:text-white">This is a team event</span>
                  </label>
                  
                  {formData.isTeamEvent && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Maximum Team Size *</label>
                      <input type="number" name="teamSizeLimit" min="2" required={formData.isTeamEvent} className="input-field w-full md:w-1/2" value={formData.teamSizeLimit} onChange={handleInputChange} />
                    </div>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Poster Image {isEditing && '(Leave blank to keep current)'}</label>
                  <input type="file" accept="image/*" onChange={handleFileChange} className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100 dark:file:bg-primary-900/30 dark:file:text-primary-400" />
                </div>
              </div>
              
              <div className="flex gap-3 pt-6 border-t border-gray-200 dark:border-gray-700 mt-6">
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-outline flex-1">Cancel</button>
                <button type="submit" disabled={submitting} className="btn btn-primary flex-1">
                  {submitting ? 'Saving...' : isEditing ? 'Update Event' : 'Create Event'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminEvents;
