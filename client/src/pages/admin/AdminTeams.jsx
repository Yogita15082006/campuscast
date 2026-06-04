import { useState, useEffect } from 'react';
import api from '../../utils/api';
import { FiUsers, FiTrash2, FiSearch, FiFilter } from 'react-icons/fi';
import toast from 'react-hot-toast';

const AdminTeams = () => {
  const [events, setEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState('');
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingEvents, setLoadingEvents] = useState(true);

  useEffect(() => {
    fetchTeamEvents();
  }, []);

  useEffect(() => {
    if (selectedEventId) {
      fetchTeamsForEvent(selectedEventId);
    } else {
      setTeams([]);
    }
  }, [selectedEventId]);

  const fetchTeamEvents = async () => {
    try {
      setLoadingEvents(true);
      const res = await api.get('/events?limit=100');
      // Filter only team events
      const tEvents = res.data.data.events.filter(e => e.isTeamEvent);
      setEvents(tEvents);
      if (tEvents.length > 0) {
        setSelectedEventId(tEvents[0]._id);
      }
    } catch (error) {
      toast.error('Failed to load events');
    } finally {
      setLoadingEvents(false);
    }
  };

  const fetchTeamsForEvent = async (eventId) => {
    try {
      setLoading(true);
      const res = await api.get(`/teams/event/${eventId}`);
      setTeams(res.data.data.teams);
    } catch (error) {
      toast.error('Failed to load teams');
    } finally {
      setLoading(false);
    }
  };

  const handleDisbandTeam = async (teamId) => {
    if (!window.confirm('Are you sure you want to disband this team? This action cannot be undone.')) return;
    
    try {
      await api.delete(`/teams/${teamId}`);
      toast.success('Team disbanded successfully');
      fetchTeamsForEvent(selectedEventId);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to disband team');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Manage Teams</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">View and manage participant teams for events.</p>
        </div>
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
            <option value="">-- Choose a team event --</option>
            {events.map(event => (
              <option key={event._id} value={event._id}>{event.title}</option>
            ))}
          </select>
        )}
      </div>

      {!selectedEventId && !loadingEvents ? (
        <div className="text-center py-16 card">
          <FiUsers className="mx-auto text-gray-400 mb-4" size={48} />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">No Event Selected</h3>
          <p className="text-gray-500 mt-1">Please select an event to view its teams.</p>
        </div>
      ) : loading ? (
        <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div></div>
      ) : teams.length === 0 ? (
        <div className="text-center py-16 card">
          <FiUsers className="mx-auto text-gray-400 mb-4" size={48} />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">No Teams Found</h3>
          <p className="text-gray-500 mt-1">No teams have been created for this event yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {teams.map(team => (
            <div key={team._id} className="card p-5">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    {team.teamName || team.name}
                  </h3>
                  <div className="text-xs text-gray-500 font-mono mt-1">Code: {team.teamCode || team.joinCode}</div>
                </div>
                <button 
                  onClick={() => handleDisbandTeam(team._id)}
                  className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                  title="Disband Team"
                >
                  <FiTrash2 />
                </button>
              </div>

              <div className="space-y-3">
                <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Members ({team.members.length} / {team.maxSize})
                </div>
                <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg divide-y divide-gray-100 dark:divide-gray-700 border border-gray-100 dark:border-gray-700">
                  {team.members.map(member => (
                    <div key={member._id} className="p-3 flex justify-between items-center text-sm">
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">{member.name}</div>
                        <div className="text-xs text-gray-500">{member.email}</div>
                      </div>
                      {member._id === team.leader._id && (
                        <span className="bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 px-2 py-1 rounded text-xs font-semibold">
                          Leader
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminTeams;
