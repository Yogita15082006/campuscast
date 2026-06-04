import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { FiSearch, FiFilter, FiCalendar, FiMapPin, FiUsers } from 'react-icons/fi';
import toast from 'react-hot-toast';

const Events = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');

  useEffect(() => {
    fetchEvents();
  }, [category]); // Removed search from dependency array to use a search button

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/events?search=${search}&category=${category}`);
      setEvents(res.data.data.events);
    } catch (error) {
      toast.error('Failed to fetch events');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchEvents();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Campus Events</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Discover and register for upcoming events.</p>
        </div>
      </div>

      <div className="card p-4 flex flex-col md:flex-row gap-4">
        <form onSubmit={handleSearch} className="flex-1 relative">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search events by title or description..."
            className="input-field pl-10 w-full"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </form>
        
        <div className="flex items-center gap-2">
          <FiFilter className="text-gray-400" />
          <select 
            className="input-field w-full md:w-48"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="all">All Categories</option>
            <option value="technical">Technical</option>
            <option value="cultural">Cultural</option>
            <option value="sports">Sports</option>
            <option value="workshop">Workshop</option>
            <option value="hackathon">Hackathon</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div></div>
      ) : events.length === 0 ? (
        <div className="text-center py-16 card">
          <FiCalendar className="mx-auto text-gray-400 mb-4" size={48} />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">No events found</h3>
          <p className="text-gray-500 mt-1">Try adjusting your search or filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <EventCard key={event._id} event={event} />
          ))}
        </div>
      )}
    </div>
  );
};

const EventCard = ({ event }) => {
  const isUpcoming = event.status === 'upcoming';
  const seatsFull = event.remainingSeats === 0;

  return (
    <div className="card group flex flex-col h-full hover:-translate-y-1 transition-transform duration-300">
      <div className="relative h-48 bg-gray-200 dark:bg-gray-700 overflow-hidden">
        {event.posterImage ? (
          <img 
            src={`${import.meta.env.VITE_API_URL?.replace('/api', '')}${event.posterImage}`} 
            alt={event.title} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="flex items-center justify-center w-full h-full text-gray-400">
            <FiCalendar size={48} />
          </div>
        )}
        <div className="absolute top-3 right-3 flex gap-2">
          <span className={`px-2 py-1 rounded text-xs font-bold uppercase tracking-wider ${
            isUpcoming ? 'bg-green-500 text-white shadow-sm' : 'bg-gray-500 text-white'
          }`}>
            {event.status}
          </span>
          <span className="px-2 py-1 rounded text-xs font-bold uppercase tracking-wider bg-black/60 text-white backdrop-blur-sm">
            {event.category}
          </span>
        </div>
      </div>

      <div className="p-5 flex-1 flex flex-col">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 line-clamp-1">{event.title}</h3>
        <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2 mb-4 flex-1">
          {event.description}
        </p>

        <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400 mb-6">
          <div className="flex items-center gap-2">
            <FiCalendar className="text-primary-500" />
            <span>{new Date(event.date).toLocaleDateString()} at {event.time}</span>
          </div>
          <div className="flex items-center gap-2">
            <FiMapPin className="text-primary-500" />
            <span className="truncate">{event.venue}</span>
          </div>
          <div className="flex justify-between items-center mt-2 pt-2 border-t border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-2">
              <FiUsers className="text-primary-500" />
              <span className={seatsFull ? 'text-red-500 font-medium' : ''}>
                {event.remainingSeats} / {event.capacity} seats left
              </span>
            </div>
            {event.isTeamEvent && (
              <span className="text-xs font-medium text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/30 px-2 py-1 rounded">
                Team (Max {event.teamSizeLimit})
              </span>
            )}
          </div>
        </div>

        <Link 
          to={`/events/${event._id}`}
          className="btn btn-primary w-full py-2.5"
        >
          View Details
        </Link>
      </div>
    </div>
  );
};

export default Events;
