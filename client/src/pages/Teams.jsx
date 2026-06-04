import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { FiUsers, FiPlus, FiHash, FiLogOut, FiCalendar, FiCopy, FiCheck, FiChevronDown, FiUser } from 'react-icons/fi';
import toast from 'react-hot-toast';

const Teams = () => {
  const { user } = useAuth();
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);

  // Create Team state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createData, setCreateData] = useState({ name: '', eventId: '' });
  const [teamEvents, setTeamEvents] = useState([]);
  const [creating, setCreating] = useState(false);

  // Join Team state
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [joinCode, setJoinCode] = useState('');
  const [joining, setJoining] = useState(false);

  const [copiedCode, setCopiedCode] = useState(null);
  const [expandedTeam, setExpandedTeam] = useState(null);

  useEffect(() => {
    fetchMyTeams();
    fetchTeamEvents();
  }, []);

  const fetchMyTeams = async () => {
    try {
      setLoading(true);
      const res = await api.get('/teams/my');
      setTeams(res.data.data.teams);
    } catch (error) {
      toast.error('Failed to load teams');
    } finally {
      setLoading(false);
    }
  };

  const fetchTeamEvents = async () => {
    try {
      const regRes = await api.get('/registrations/my');
      const registrations = regRes.data.data.registrations;
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
      await api.post('/teams', { teamName: createData.name, eventId: createData.eventId });
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
      await api.post('/teams/join', { teamCode: joinCode });
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

  const copyToClipboard = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    toast.success('Join code copied to clipboard!');
    setTimeout(() => setCopiedCode(null), 2000);
  };

  // Helper colors for avatars
  const avatarColors = ['bg-primary-500', 'bg-blue-500', 'bg-emerald-500', 'bg-amber-500', 'bg-pink-500'];

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Teams</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Manage your event teams</p>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <button onClick={() => setShowJoinModal(true)} className="btn bg-gray-200 hover:bg-gray-300 text-gray-900 dark:bg-[var(--color-dark-card)] dark:hover:bg-white/5 dark:text-white dark:border dark:border-[var(--color-dark-border)] flex-1 md:flex-none flex items-center justify-center gap-2">
            <FiHash /> Join Team
          </button>
          <button onClick={() => setShowCreateModal(true)} className="btn btn-primary flex-1 md:flex-none flex items-center justify-center gap-2 shadow-lg shadow-primary-500/20">
            <FiPlus /> Create Team
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div></div>
      ) : teams.length === 0 ? (
        <div className="text-center py-16 card p-8 border-none bg-white dark:bg-[var(--color-dark-card)]">
          <FiUsers className="mx-auto text-gray-400 mb-4" size={48} />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">No teams yet</h3>
          <p className="text-gray-500 mt-1">Create or join a team to participate in team events.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {teams.map((team) => {
            const isLeader = team.leader._id === user._id;
            const maxSize = team.event?.teamSizeLimit || team.maxSize || 4;
            const currentSize = team.members.length;
            const percentage = (currentSize / maxSize) * 100;
            const openSlots = maxSize - currentSize;

            return (
              <div key={team._id} className="card p-6 border-none bg-white dark:bg-[var(--color-dark-card)] flex flex-col h-full shadow-md">

                {/* Header Profile */}
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-primary-900/40 text-primary-600 dark:text-primary-400 flex items-center justify-center shrink-0">
                      <FiUsers size={22} />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        {team.name} {isLeader && <span title="Leader">👑</span>}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5 max-w-[200px] truncate">
                        {team.event?.title || 'Unknown Event'}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-1">
                    <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${isLeader ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400' : 'bg-primary-100 text-primary-700 dark:bg-primary-900/40 dark:text-primary-300'}`}>
                      {isLeader ? 'Leader' : 'Member'}
                    </span>
                    <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
                      {openSlots > 0 ? `${openSlots} open` : 'Full'}
                    </span>
                  </div>
                </div>

                {/* Progress Group */}
                <div className="mb-6">
                  <div className="flex justify-between items-end mb-3">
                    <div className="flex -space-x-3">
                      {team.members.map((member, idx) => (
                        <div
                          key={member._id}
                          title={member.name}
                          className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold border-2 border-white dark:border-[var(--color-dark-card)] ${avatarColors[idx % avatarColors.length]}`}
                        >
                          {member.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                        </div>
                      ))}
                      {openSlots > 0 && Array.from({ length: Math.min(openSlots, 3) }).map((_, i) => (
                        <div key={`empty-${i}`} className="w-10 h-10 rounded-full flex items-center justify-center text-gray-400 bg-gray-100 dark:bg-gray-800 border-2 border-white dark:border-[var(--color-dark-card)] border-dashed">
                          <FiUser size={14} />
                        </div>
                      ))}
                    </div>
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      {currentSize}/{maxSize}
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-1.5 overflow-hidden">
                    <div
                      className={`h-full ${isLeader ? 'bg-amber-500' : 'bg-emerald-500'} rounded-full transition-all duration-500`}
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>

                {/* Team Code Area */}
                <div className="mt-auto mb-4 bg-gray-50 dark:bg-[var(--color-dark-bg)] rounded-xl p-3 border border-gray-100 dark:border-[var(--color-dark-border)] flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Team Code</span>
                    <span className="font-mono text-gray-900 dark:text-white font-medium">{team.joinCode || team.teamCode}</span>
                  </div>
                  <button
                    onClick={() => copyToClipboard(team.joinCode || team.teamCode)}
                    className="p-2 bg-white dark:bg-[var(--color-dark-card)] hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg border border-gray-200 dark:border-[var(--color-dark-border)] text-gray-500 transition-colors"
                  >
                    {copiedCode === (team.joinCode || team.teamCode) ? <FiCheck className="text-emerald-500" /> : <FiCopy />}
                  </button>
                </div>

                {/* View Members Accordion */}
                <div className="border-t border-gray-100 dark:border-[var(--color-dark-border)] pt-3">
                  <button
                    onClick={() => setExpandedTeam(expandedTeam === team._id ? null : team._id)}
                    className="flex items-center justify-between w-full text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                  >
                    View members
                    <FiChevronDown className={`transition-transform duration-200 ${expandedTeam === team._id ? 'rotate-180' : ''}`} />
                  </button>

                  {expandedTeam === team._id && (
                    <div className="mt-4 space-y-3 pb-2 animate-fade-in">
                      {team.members.map(member => (
                        <div key={member._id} className="flex justify-between items-center text-sm">
                          <span className="text-gray-800 dark:text-gray-200 flex items-center gap-2">
                            {member.name} {member._id === team.leader._id && '👑'} {member._id === user._id && <span className="text-[10px] bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300 px-1.5 py-0.5 rounded">You</span>}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Create Team Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm shadow-2xl">
          <div className="bg-white dark:bg-[var(--color-dark-card)] border dark:border-[var(--color-dark-border)] rounded-2xl max-w-md w-full p-6 animate-zoom-in">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Create a Team</h2>

            {teamEvents.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-gray-500 mb-6">You are not registered for any team events.</p>
                <button onClick={() => setShowCreateModal(false)} className="btn bg-gray-200 dark:bg-white/10 dark:text-white hover:bg-gray-300">Close</button>
              </div>
            ) : (
              <form onSubmit={handleCreateTeam} className="space-y-5">
                <div>
                  <label className="label">Select Event</label>
                  <select
                    required
                    className="input-field"
                    value={createData.eventId}
                    onChange={(e) => setCreateData({ ...createData, eventId: e.target.value })}
                  >
                    <option value="" disabled>-- Choose an event --</option>
                    {teamEvents.map(event => (
                      <option key={event._id} value={event._id}>{event.title}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label">Team Name</label>
                  <input
                    type="text"
                    required
                    className="input-field"
                    placeholder="E.g., Code Ninjas"
                    value={createData.name}
                    onChange={(e) => setCreateData({ ...createData, name: e.target.value })}
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <button type="button" onClick={() => setShowCreateModal(false)} className="btn bg-gray-200 text-gray-800 dark:bg-[var(--color-dark-bg)] dark:text-white hover:bg-gray-300 dark:hover:bg-white/5 flex-1">Cancel</button>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm shadow-2xl">
          <div className="bg-white dark:bg-[var(--color-dark-card)] border dark:border-[var(--color-dark-border)] rounded-2xl max-w-md w-full p-6 animate-zoom-in">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Join a Team</h2>
            <form onSubmit={handleJoinTeam} className="space-y-5">
              <div>
                <label className="label">Join Code</label>
                <input
                  type="text"
                  required
                  className="input-field font-mono uppercase text-center tracking-widest text-lg py-3"
                  placeholder="CODE"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  maxLength={8}
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowJoinModal(false)} className="btn bg-gray-200 text-gray-800 dark:bg-[var(--color-dark-bg)] dark:text-white hover:bg-gray-300 dark:hover:bg-white/5 flex-1">Cancel</button>
                <button type="submit" disabled={joining || joinCode.length < 3} className="btn btn-primary flex-1 flex items-center justify-center gap-2">
                  <FiHash /> {joining ? 'Joining...' : 'Join Team'}
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
