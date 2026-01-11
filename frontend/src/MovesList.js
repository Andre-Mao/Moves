import React, { useState, useEffect } from 'react';
import axios from 'axios';
import CreateMove from './CreateMove';
import EditMove from './EditMove';

function MovesList({ user, groupId }) {
  const [moves, setMoves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingMoveId, setEditingMoveId] = useState(null);
  const [votesData, setVotesData] = useState({});
  const [groupSettings, setGroupSettings] = useState(null);
  const [currentTime, setCurrentTime] = useState(Date.now());

  useEffect(() => {
    axios.post(`http://localhost:5000/groups/${groupId}/cleanup-moves`)
      .then(() => {
        fetchMoves();
        fetchVotes();
        fetchGroupSettings();
      })
      .catch(error => {
        console.error('Error cleaning up moves:', error);
        fetchMoves();
        fetchVotes();
        fetchGroupSettings();
      });

    // Update current time every second for countdown
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);

    return () => clearInterval(interval);
  }, [groupId]);

  const fetchMoves = () => {
    axios.get(`http://localhost:5000/api/groups/${groupId}/moves`)
      .then(response => {
        setMoves(response.data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching moves:', error);
        setLoading(false);
      });
  };

  const fetchVotes = () => {
    axios.get(`http://localhost:5000/votes/group/${groupId}`)
      .then(response => {
        setVotesData(response.data);
      })
      .catch(error => {
        console.error('Error fetching votes:', error);
      });
  };

  const fetchGroupSettings = () => {
    axios.get(`http://localhost:5000/groups/${groupId}/settings`)
      .then(response => {
        setGroupSettings(response.data);
      })
      .catch(error => {
        console.error('Error fetching group settings:', error);
      });
  };

  const handleVote = (moveId) => {
    axios.post(`http://localhost:5000/votes/move/${moveId}/vote`, {
      user_id: user.id
    })
      .then(response => {
        fetchVotes();
      })
      .catch(error => {
        console.error('Error voting:', error);
        alert('Failed to vote');
      });
  };

  const handleDelete = (moveId) => {
    if (window.confirm('Are you sure you want to delete this move?')) {
      axios.delete(`http://localhost:5000/api/moves/${moveId}`, {
        headers: {
          'Content-Type': 'application/json'
        }
      })
        .then(response => {
          alert('Move deleted successfully!');
          fetchMoves();
          fetchVotes();
        })
        .catch(error => {
          console.error('Error deleting move:', error);
          alert('Failed to delete move');
        });
    }
  };

  const handleEdit = (moveId) => {
    setEditingMoveId(moveId);
  };

  const handleUpdateComplete = () => {
    setEditingMoveId(null);
    fetchMoves();
  };

  const formatTimeRemaining = (seconds) => {
    if (seconds <= 0) return 'EXPIRED';
    
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  };

  if (loading) return <p className="text-center text-gray-500 py-8">Loading moves...</p>;

  // Check if current user is the group leader
  const isGroupLeader = groupSettings && groupSettings.created_by === user.id;

  return (
    <div>
      <CreateMove groupId={groupId} onMoveCreated={() => { fetchMoves(); fetchVotes(); }} user={user} />
      
      {moves.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 mt-6">
          <p className="text-gray-500 text-lg">No moves yet!</p>
          <p className="text-gray-400 text-sm mt-2">Create the first move to get started.</p>
        </div>
      ) : (
        <div className="space-y-4 mt-6">
          {moves.map(move => {
            const moveVotes = votesData[move.id] || { vote_count: 0, voter_ids: [] };
            const hasVoted = moveVotes.voter_ids.includes(user.id);
            const minVotes = groupSettings?.min_votes_required || 3;
            const metThreshold = moveVotes.vote_count >= minVotes;
            
            // Calculate time remaining
            const deadline = new Date(move.deadline);
            const timeRemainingSeconds = Math.max(0, (deadline - currentTime) / 1000);
            const isExpired = timeRemainingSeconds <= 0;
            const isUrgent = timeRemainingSeconds > 0 && timeRemainingSeconds < 3600; // Less than 1 hour

            // User can manage move if they created it OR if they're the group leader
            const canManageMove = move.created_by === user.id || isGroupLeader;

            return (
              <div 
                key={move.id} 
                className={`p-6 rounded-lg border-2 transition-all ${
                  metThreshold 
                    ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-400 shadow-lg' 
                    : isExpired
                    ? 'bg-red-50 border-red-300 opacity-75'
                    : 'bg-white border-gray-200 shadow-sm hover:shadow-md'
                }`}
              >
                {editingMoveId === move.id ? (
                  <EditMove 
                    move={move} 
                    onMoveUpdated={handleUpdateComplete}
                    onCancel={() => setEditingMoveId(null)}
                  />
                ) : (
                  <div>
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <h3 className="text-2xl font-bold text-gray-800 mb-2">{move.name}</h3>
                        {move.description && (
                          <p className="text-gray-600">{move.description}</p>
                        )}
                      </div>
                      {metThreshold && (
                        <div className="ml-4">
                          <span className="bg-gradient-to-r from-green-500 to-emerald-500 text-white text-lg font-bold px-5 py-2 rounded-full shadow-md flex items-center gap-2">
                            <span className="text-2xl">✓</span>
                            <span>APPROVED</span>
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Timer and voting section - only show if not approved */}
                    {!metThreshold && (
                      <>
                        {/* Countdown Timer */}
                        {!isExpired && (
                          <div className={`mb-4 p-4 rounded-lg ${
                            isUrgent 
                              ? 'bg-red-100 border-2 border-red-400' 
                              : 'bg-blue-50 border-2 border-blue-300'
                          }`}>
                            <div className="flex items-center justify-between">
                              <span className={`font-semibold ${isUrgent ? 'text-red-800' : 'text-blue-800'}`}>
                                ⏰ Time Remaining:
                              </span>
                              <span className={`text-2xl font-bold font-mono ${
                                isUrgent ? 'text-red-600 animate-pulse' : 'text-blue-600'
                              }`}>
                                {formatTimeRemaining(timeRemainingSeconds)}
                              </span>
                            </div>
                            <div className="mt-2 text-sm text-gray-600">
                              {isUrgent ? '⚠️ Hurry! This move will expire soon!' : 'Vote now to approve this move'}
                            </div>
                          </div>
                        )}

                        {isExpired && (
                          <div className="mb-4 p-4 rounded-lg bg-red-100 border-2 border-red-400">
                            <div className="text-red-800 font-bold text-center">
                              ⏰ EXPIRED - This move will be deleted
                            </div>
                          </div>
                        )}
                        
                        <div className="flex items-center gap-4 mt-4">
                          <button 
                            onClick={() => handleVote(move.id)}
                            disabled={isExpired}
                            className={`${
                              hasVoted 
                                ? 'bg-green-500 hover:bg-green-600' 
                                : 'bg-blue-500 hover:bg-blue-600'
                            } ${isExpired ? 'opacity-50 cursor-not-allowed' : ''} text-white font-semibold px-6 py-2.5 rounded-lg transition-colors shadow-sm`}
                          >
                            {hasVoted ? '✓ Voted' : 'Vote'}
                          </button>
                          
                          <div className="flex items-center gap-2">
                            <div className={`text-2xl font-bold ${
                              moveVotes.vote_count >= minVotes ? 'text-green-600' : 'text-gray-700'
                            }`}>
                              {moveVotes.vote_count}
                            </div>
                            <div className="text-gray-500">
                              / {minVotes} votes
                            </div>
                          </div>

                          {/* Progress bar */}
                          <div className="flex-1 max-w-xs">
                            <div className="w-full bg-gray-200 rounded-full h-3">
                              <div 
                                className={`h-3 rounded-full transition-all ${
                                  moveVotes.vote_count >= minVotes ? 'bg-green-500' : 'bg-blue-500'
                                }`}
                                style={{ width: `${Math.min((moveVotes.vote_count / minVotes) * 100, 100)}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      </>
                    )}

                    {/* Edit/Delete buttons - show for move creator OR group leader */}
                    {canManageMove && (
                      <div className="flex gap-2 mt-4 items-center">
                        <button 
                          onClick={() => handleEdit(move.id)}
                          className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors font-medium"
                        >
                          Edit
                        </button>
                        <button 
                          onClick={() => handleDelete(move.id)}
                          className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors font-medium"
                        >
                          {metThreshold ? 'Clear Approved Move' : 'Delete'}
                        </button>
                        {isGroupLeader && move.created_by !== user.id && (
                          <span className="text-xs text-gray-500 ml-2">
                            👑 Group Leader Controls
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default MovesList; 