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
        fetchVotes(); // Refresh vote counts
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

  if (loading) return <p>Loading...</p>;

  return (
    <div>
      <CreateMove groupId={groupId} onMoveCreated={() => { fetchMoves(); fetchVotes(); }} user={user} />
      {moves.length === 0 ? (
        <p>No moves yet!</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {moves.map(move => {
            const moveVotes = votesData[move.id] || { vote_count: 0, voter_ids: [] };
            const hasVoted = moveVotes.voter_ids.includes(user.id);

            return (
              <li key={move.id} style={{ 
                border: '1px solid #ccc', 
                padding: '15px', 
                marginBottom: '10px',
                borderRadius: '5px'
              }}>
                {editingMoveId === move.id ? (
                  <EditMove 
                    move={move} 
                    onMoveUpdated={handleUpdateComplete}
                    onCancel={() => setEditingMoveId(null)}
                  />
                ) : (
                  <div>
                    <h3>{move.name}</h3>
                    <p>{move.description}</p> 
                      <div style={{ marginTop: '10px' }}>
                      <button 
                        onClick={() => handleVote(move.id)}
                        style={{
                          backgroundColor: hasVoted ? '#28a745' : '#007bff',
                          color: 'white',
                          border: 'none',
                          padding: '8px 15px',
                          borderRadius: '5px',
                          cursor: 'pointer',
                          marginRight: '10px'
                        }}
                      >
                        {hasVoted ? '✓ Voted' : 'Vote'}
                      </button>
                      
                      <span style={{ 
                        fontWeight: 'bold',
                        color: moveVotes.vote_count >= (groupSettings?.min_votes_required || 3) ? '#28a745' : '#dc3545'
                      }}>
                        {moveVotes.vote_count} / {groupSettings?.min_votes_required || 3} votes
                      </span>
                      
                      {move.created_by === user.id && (
                        <>
                          <button onClick={() => handleEdit(move.id)} style={{ marginLeft: '10px' }}>Edit</button>
                          <button onClick={() => handleDelete(move.id)}>Delete</button>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export default MovesList; 