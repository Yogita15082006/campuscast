import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { FiCalendar, FiMapPin, FiUsers, FiClock, FiTag, FiArrowLeft, FiCheckCircle } from 'react-icons/fi';
import toast from 'react-hot-toast';

const EventDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [hasRegistered, setHasRegistered] = useState(false);

  useEffect(() => {
    fetchEventDetails();
  }, [id]);

  const fetchEventDetails = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/events/${id}`);
      setEvent(res.data.data.event);
      
      // Check if user is already registered (if possible from the event data, or we could fetch user's registrations)
      // Since it might not be directly in event data unless populated, we fetch user's registrations
      if (user?.role === 'student') {
        const regRes = await api.get('/registrations/my-registrations');
        const registrations = regRes.data.data.registrations;
        const isRegistered = registrations.some(reg => reg.event._id === id);
        setHasRegistered(isRegistered);
      }
    } catch (error) {
      toast.error('Failed to load event details');
      navigate('/events');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (user?.role !== 'student') {
      toast.error('Only students can register for events');
      return;
    }
    
    try {
      setRegistering(true);
      await api.post(`/registrations/${id}`);
      toast.success('Successfully registered for event!');
      setHasRegistered(true);
      
      // Update local event seat count
      setEvent(prev => ({
        ...prev,
        remainingSeats: prev.remainingSeats - 1
      }));
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to register for event');
    } finally {
      setRegistering(false);
    }
  };

  const handleCancelRegistration = async () => {
    try {
      setRegistering(true);
      // We might need registration ID, or a specific endpoint to cancel by event ID
      await api.delete(`/registrations/event/${id}`);
      toast.success('Registration cancelled');
      setHasRegistered(false);
      
      // Update local event seat count
      setEvent(prev => ({
        ...prev,
        remainingSeats: prev.remainingSeats + 1
      }));
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to cancel registration');
    } finally {
      setRegistering(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary-600"></div></div>;
  }

  if (!event) return null;

  const isUpcoming = event.status === 'upcoming';
  const seatsFull = event.remainingSeats === 0;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <button 
        onClick={() => navigate('/events')}
        className="flex items-center gap-2 text-gray-500 hover:text-primary-600 transition-colors"
      >
        <FiArrowLeft /> Back to Events
      </button>

      <div className="card overflow-hidden">
        {/* Banner */}
        <div className="h-64 sm:h-80 w-full bg-gray-200 dark:bg-gray-700 relative">
          {event.posterImage ? (
            <img 
              src={`${import.meta.env.VITE_API_URL?.replace('/api', '')}${event.posterImage}`} 
              alt={event.title} 
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="flex items-center justify-center w-full h-full text-gray-400">
              <FiCalendar size={64} />
            </div>
          )}
          
          <div className="absolute top-4 right-4 flex gap-2">
            <span className={`px-3 py-1.5 rounded-md text-sm font-bold uppercase tracking-wider shadow-lg ${
              isUpcoming ? 'bg-green-500 text-white' : 'bg-gray-500 text-white'
            }`}>
              {event.status}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 md:p-8">
          <div className="flex flex-col md:flex-row gap-8">
            <div className="flex-1 space-y-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{event.title}</h1>
                <div className="flex gap-2 mt-3">
                  <span className="px-3 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 rounded-full text-sm font-medium flex items-center gap-1.5">
                    <FiTag /> {event.category}
                  </span>
                  {event.isTeamEvent && (
                    <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded-full text-sm font-medium flex items-center gap-1.5">
                      <FiUsers /> Team Event (Max: {event.teamSizeLimit})
                    </span>
                  )}
                </div>
              </div>

              <div className="prose prose-blue dark:prose-invert max-w-none">
                <h3 className="text-xl font-semibold mb-2">About this event</h3>
                <p className="whitespace-pre-line text-gray-600 dark:text-gray-300">
                  {event.description}
                </p>
              </div>
            </div>

            {/* Sidebar info */}
            <div className="w-full md:w-80 space-y-6">
              <div className="bg-gray-50 dark:bg-gray-800/50 p-5 rounded-xl border border-gray-100 dark:border-gray-700 space-y-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm text-primary-500">
                    <FiCalendar size={20} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Date</p>
                    <p className="text-gray-900 dark:text-white font-medium">{new Date(event.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm text-primary-500">
                    <FiClock size={20} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Time</p>
                    <p className="text-gray-900 dark:text-white font-medium">{event.time}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm text-primary-500">
                    <FiMapPin size={20} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Location</p>
                    <p className="text-gray-900 dark:text-white font-medium">{event.venue}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm text-primary-500">
                    <FiUsers size={20} />
                  </div>
                  <div className="w-full">
                    <div className="flex justify-between items-end">
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Availability</p>
                        <p className="text-gray-900 dark:text-white font-medium">
                          {event.remainingSeats} / {event.capacity} seats left
                        </p>
                      </div>
                    </div>
                    {/* Progress bar */}
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-2">
                      <div 
                        className={`h-2 rounded-full ${seatsFull ? 'bg-red-500' : 'bg-primary-500'}`} 
                        style={{ width: `${((event.capacity - event.remainingSeats) / event.capacity) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              {user?.role === 'student' && isUpcoming && (
                <div className="space-y-3">
                  {hasRegistered ? (
                    <div className="space-y-3">
                      <div className="bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 p-4 rounded-xl flex items-center justify-center gap-2 border border-green-200 dark:border-green-800/30">
                        <FiCheckCircle size={20} />
                        <span className="font-semibold">You are registered</span>
                      </div>
                      <button 
                        onClick={handleCancelRegistration}
                        disabled={registering}
                        className="w-full py-3 rounded-lg border-2 border-red-500 text-red-500 font-bold hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors disabled:opacity-50"
                      >
                        {registering ? 'Cancelling...' : 'Cancel Registration'}
                      </button>
                    </div>
                  ) : (
                    <button 
                      onClick={handleRegister}
                      disabled={registering || seatsFull}
                      className="btn btn-primary w-full py-3 text-lg"
                    >
                      {registering ? 'Registering...' : seatsFull ? 'Event Full' : 'Register Now'}
                    </button>
                  )}
                  
                  {hasRegistered && event.isTeamEvent && (
                    <button 
                      onClick={() => navigate('/teams')}
                      className="btn btn-outline w-full py-3"
                    >
                      Manage Team
                    </button>
                  )}
                </div>
              )}
              
              {user?.role === 'student' && !isUpcoming && (
                <div className="bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 p-4 rounded-xl text-center font-medium">
                  This event has ended
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetails;
