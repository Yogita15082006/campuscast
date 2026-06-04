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

  const categories = [
    { id: 'all', label: 'All' },
    { id: 'technical', label: 'Technical' },
    { id: 'cultural', label: 'Cultural' },
    { id: 'sports', label: 'Sports' },
    { id: 'workshop', label: 'Workshop' },
    { id: 'hackathon', label: 'Hackathon' }
  ];

  useEffect(() => {
    fetchEvents();
  }, [category]);

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
    <div className="space-y-6 max-w-7xl mx-auto pb-10 animate-fade-in">
      {/* Hero Section */}
      <div className="relative rounded-3xl overflow-hidden bg-[var(--color-dark-card)] border border-[var(--color-dark-border)] p-8 md:p-12 text-center md:text-left flex flex-col md:flex-row items-center justify-between shadow-2xl overflow-visible">
        {/* Decorative Gradients */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary-600/20 rounded-full blur-3xl -translate-y-1/3 translate-x-1/3 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-secondary-900/40 rounded-full blur-3xl translate-y-1/3 -translate-x-1/3 pointer-events-none"></div>

        <div className="relative z-10 max-w-2xl">
          <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-purple-400 mb-4 drop-shadow-md">
            Discover Campus Events
          </h1>
          <p className="text-gray-400 text-lg mb-8">
            Explore workshops, hackathons, and cultural fests happening around campus. Register now and secure your spot!
          </p>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3 w-full max-w-xl">
            <div className="relative flex-1">
              <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search for events, workshops..."
                className="w-full pl-12 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all backdrop-blur-md shadow-inner"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <button type="submit" className="btn btn-primary py-3.5 px-8 text-base shadow-lg shadow-primary-600/30">
              Search
            </button>
          </form>
        </div>
      </div>

      {/* Category Pills & Filters */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mt-8">
        <div className="flex flex-wrap gap-2">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setCategory(cat.id)}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-300 ${category === cat.id
                  ? 'bg-primary-600 text-white shadow-md shadow-primary-500/30'
                  : 'bg-white dark:bg-[var(--color-dark-card)] border border-gray-200 dark:border-[var(--color-dark-border)] text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5'
                }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-[var(--color-dark-card)] border border-gray-200 dark:border-[var(--color-dark-border)] rounded-lg text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5">
          <FiFilter /> Filter
        </button>
      </div>

      {/* Events Grid */}
      {loading ? (
        <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div></div>
      ) : events.length === 0 ? (
        <div className="text-center py-20 card border-none bg-white dark:bg-[var(--color-dark-card)]">
          <FiCalendar className="mx-auto text-gray-500 mb-5" size={56} />
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">No events found</h3>
          <p className="text-gray-500 mt-2">Try adjusting your search or categories.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pt-4">
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
    <Link
      to={`/events/${event._id}`}
      className="card group relative flex flex-col h-[380px] rounded-2xl overflow-hidden border border-gray-200 dark:border-[var(--color-dark-border)] bg-gray-900 cursor-pointer shadow-lg hover:shadow-primary-500/10 hover:border-primary-500/50 transition-all duration-300 hover:-translate-y-1.5"
    >
      {/* Background Image Container */}
      <div className="absolute inset-0 w-full h-full">
        {event.posterImage ? (
          <img
            src={`${import.meta.env.VITE_API_URL?.replace('/api', '')}${event.posterImage}`}
            alt={event.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-indigo-900 to-purple-900 flex items-center justify-center">
            <FiCalendar size={64} className="text-white/20" />
          </div>
        )}
      </div>

      {/* Dark gradient overlay for text readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#090b14] via-[#090b14]/80 to-transparent z-10 transition-opacity duration-300"></div>

      {/* Badges container (Top) */}
      <div className="relative z-20 flex justify-between p-4 mix-blend-normal">
        <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest bg-white/10 backdrop-blur-md text-white border border-white/20 shadow-sm">
          {event.category}
        </span>
        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest backdrop-blur-md border shadow-sm ${seatsFull
            ? 'bg-red-500/20 text-red-300 border-red-500/30'
            : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
          }`}>
          {seatsFull ? 'Full' : `${event.remainingSeats} Seats Left`}
        </span>
      </div>

      {/* Content container (Bottom) */}
      <div className="relative z-20 mt-auto p-5 flex flex-col pt-12">
        <h3 className="text-xl font-bold text-white mb-2 line-clamp-2 leading-tight group-hover:text-primary-400 transition-colors">
          {event.title}
        </h3>

        <div className="flex flex-col gap-2 mt-2">
          <div className="flex items-center gap-2 text-sm text-gray-300">
            <FiCalendar className="text-primary-400" />
            <span>{new Date(event.date).toLocaleDateString()} • {event.time}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-300">
            <FiMapPin className="text-primary-400" />
            <span className="truncate">{event.venue}</span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default Events;
