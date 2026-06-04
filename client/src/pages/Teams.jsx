import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { FiUsers, FiPlus, FiLogOut, FiCalendar, FiCopy, FiCheck } from 'react-icons/fi';
import toast from 'react-hot-toast';

const Teams = () => {
  const { user } = useAuth();
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Create Team state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createData, setCreateData] = useState({ name: '', eventId: '' });
  const [teamEvents, setTeamEvents] = useState([]); // events user registered for that are team events
  const [creating, setCreating] = useState(false);

  // Join Team state
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [joinCode, setJoinCode] = useState('');
  const [joining, setJoining] = useState(false);

  const [copiedCode, setCopiedCode] = useState(null);

  useEffect(() => {
    fetchMyTeams();
    fetchTeamEvents();
  }, []);

  const fetchMyTeams = async () => {
    try {
      setLoading(true);
      const res = await api.get('/teams/my-teams');
      setTeams(res.data.data.teams);
    } catch (error) {
      toast.error('Failed to load teams');
    } finally {
      setLoading(false);
    }
  };

  const fetchTeamEvents = async () => {
    try {
      // First get all user registrations
      const regRes = await api.get('/registrations/my-registrations');
      const registrations = regRes.data.data.registrations;
      
      // Filter out events that are team events
      const tEvents = registrations
        .map(reg => reg.event)
        .filter(event => event.isTeamEvent);
        
      setTeamEvents(tEvents);
    } catch (error) {
      console.error('Failed to fetch team events for creating a team', error);
    }
  };

  const handleCreateTeam = async (e) => {
    e.preventDefault();
    try {
      setCreating(true);
      await api.post('/teams/create', createData);
      toast.success('Team created successfully!');
      setShowCreateModal(false);
      setCreateData({ name: '', eventId: '' });
      fetchMyTeams();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create team');
    } finally {
      setCreating(false);
    }
  };

  const handleJoinTeam = async (e) => {
    e.preventDefault();
    try {
      setJoining(true);
      await api.post('/teams/join', { joinCode });
      toast.success('Successfully joined team!');
      setShowJoinModal(false);
      setJoinCode('');
      fetchMyTeams();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to join team');
    } finally {
      setJoining(false);
    }
  };

  const handleLeaveTeam = async (teamId) => {
    if (!window.confirm('Are you sure you want to leave this team?')) return;
    try {
      await api.delete(`/teams/${teamId}/leave`);
      toast.success('Left the team');
      fetchMyTeams();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to leave team');
    }
  };

  const copyToClipboard = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    toast.success('Join code copied to clipboard!');
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Teams</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Manage your teams or join new ones.</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => setShowJoinModal(true)} className="btn btn-outline">
            Join Team
          </button>
          <button onClick={() => setShowCreateModal(true)} className="btn btn-primary flex items-center gap-2">
            <FiPlus /> Create Team
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div></div>
      ) : teams.length === 0 ? (
        <div className="text-center py-16 card">
          <FiUsers className="mx-auto text-gray-400 mb-4" size={48} />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">No teams yet</h3>
          <p className="text-gray-500 mt-1">Create or join a team to participate in team events.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {teams.map((team) => (
            <div key={team._id} className="card p-5 flex flex-col h-full">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">{team.name}</h3>
                  <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
                    <FiCalendar />
                    <span className="truncate">{team.event?.title || 'Unknown Event'}</span>
                  </div>
                </div>
                <div className="bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 px-3 py-1 rounded-full text-sm font-medium">
                  {team.members.length} / {team.event?.teamSizeLimit || '?'} Members
                </div>
              </div>

              <div className="flex-1">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Members:</p>
                <div className="space-y-2 mb-4">
                  {team.members.map(member => (
                    <div key={member._id} className="flex items-center justify-between bg-gray-50 dark:bg-gray-800/50 p-2 rounded-lg text-sm">
                      <span className="text-gray-700 dark:text-gray-300">
                        {member.name} {member._id === team.leader._id ? '(Leader)' : ''}
                      </span>
                      {member._id === user._id && <span className="text-xs bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded text-gray-600 dark:text-gray-400">You</span>}
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 space-y-3">
                <div className="flex items-center justify-between bg-gray-100 dark:bg-gray-800 p-2 rounded-lg">
                  <div className="text-sm">
                    <span className="text-gray-500 block text-xs">Join Code</span>
                    <span className="font-mono font-bold text-gray-900 dark:text-white tracking-wider">{team.joinCode}</span>
                  </div>
                  <button 
                    onClick={() => copyToClipboard(team.joinCode)}
                    className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors text-gray-500"
                  >
                    {copiedCode === team.joinCode ? <FiCheck className="text-green-500" /> : <FiCopy />}
                  </button>
                </div>

                <div className="flex gap-2">
                  <Link to={`/events/${team.event?._id}`} className="btn btn-outline flex-1 text-center py-2 text-sm">
                    View Event
                  </Link>
                  <button 
                    onClick={() => handleLeaveTeam(team._id)}
                    className="btn border-red-200 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 py-2 text-sm"
                  >
                    <FiLogOut />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Team Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Create a Team</h2>
            
            {teamEvents.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-gray-500 mb-4">You are not registered for any team events.</p>
                <button onClick={() => setShowCreateModal(false)} className="btn btn-primary">Close</button>
              </div>
            ) : (
              <form onSubmit={handleCreateTeam} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Select Event</label>
                  <select 
                    required
                    className="input-field w-full"
                    value={createData.eventId}
                    onChange={(e) => setCreateData({...createData, eventId: e.target.value})}
                  >
                    <option value="">-- Choose an event --</option>
                    {teamEvents.map(event => (
                      <option key={event._id} value={event._id}>{event.title}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Team Name</label>
                  <input 
                    type="text" 
                    required
                    className="input-field w-full"
                    placeholder="E.g., Code Ninjas"
                    value={createData.name}
                    onChange={(e) => setCreateData({...createData, name: e.target.value})}
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setShowCreateModal(false)} className="btn btn-outline flex-1">Cancel</button>
                  <button type="submit" disabled={creating} className="btn btn-primary flex-1">
                    {creating ? 'Creating...' : 'Create Team'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Join Team Modal */}
      {showJoinModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Join a Team</h2>
            <form onSubmit={handleJoinTeam} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Join Code</label>
                <input 
                  type="text" 
                  required
                  className="input-field w-full font-mono uppercase"
                  placeholder="Enter 6-character code"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  maxLength={6}
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowJoinModal(false)} className="btn btn-outline flex-1">Cancel</button>
                <button type="submit" disabled={joining || joinCode.length < 6} className="btn btn-primary flex-1">
                  {joining ? 'Joining...' : 'Join Team'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Teams;
