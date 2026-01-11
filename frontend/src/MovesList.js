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

  if (loading) return <p className="text-center text-gray-500 py-8">Loading moves...</p>;

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

            return (
              <div 
                key={move.id} 
                className={`p-6 rounded-lg border-2 transition-all ${
                  metThreshold 
                    ? 'bg-green-50 border-green-300 shadow-md' 
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
                        <span className="bg-green-500 text-white text-sm font-bold px-3 py-1 rounded-full ml-4">
                          ✓ Ready!
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-4 mt-4">
                      <button 
                        onClick={() => handleVote(move.id)}
                        className={`${
                          hasVoted 
                            ? 'bg-green-500 hover:bg-green-600' 
                            : 'bg-blue-500 hover:bg-blue-600'
                        } text-white font-semibold px-6 py-2.5 rounded-lg transition-colors shadow-sm`}
                      >
                        {hasVoted ? '✓ Voted' : 'Vote'}
                      </button>
                      
                      <div className="flex items-center gap-2">
                        <div className={`text-2xl font-bold ${
                          metThreshold ? 'text-green-600' : 'text-gray-700'
                        }`}>
                          {moveVotes.vote_count}
                        </div>
                        <div className="text-gray-500">
                          / {minVotes} votes
                        </div>
                      </div>

                      {/* Progress bar */}
                      <div className="flex-1 max-w-xs">
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div 
                            className={`h-2.5 rounded-full transition-all ${
                              metThreshold ? 'bg-green-500' : 'bg-blue-500'
                            }`}
                            style={{ width: `${Math.min((moveVotes.vote_count / minVotes) * 100, 100)}%` }}
                          ></div>
                        </div>
                      </div>
                      
                      {move.created_by === user.id && (
                        <div className="flex gap-2 ml-auto">
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
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
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