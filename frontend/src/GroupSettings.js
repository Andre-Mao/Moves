import React, { useState, useEffect } from 'react';
import axios from 'axios';

function GroupSettings({ group, currentUser, onClose, onSettingsUpdated }) {
  const [minVotesRequired, setMinVotesRequired] = useState(group.min_votes_required || 3);
  const [voteDeadlineHours, setVoteDeadlineHours] = useState(group.vote_deadline_hours || 24);
  const [groupMemberCount, setGroupMemberCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGroupMemberCount();
  }, []);

  const fetchGroupMemberCount = () => {
    // We need to create an endpoint to get member count, or we can estimate
    // For now, let's add a simple count endpoint
    axios.get(`http://localhost:5000/groups/${group.id}/member-count`)
      .then(response => {
        setGroupMemberCount(response.data.count);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching member count:', error);
        setGroupMemberCount(10); // Default fallback
        setLoading(false);
      });
  };

  const handleSave = (e) => {
    e.preventDefault();

    axios.put(`http://localhost:5000/groups/${group.id}/settings`, {
      user_id: currentUser.id,
      min_votes_required: parseInt(minVotesRequired),
      vote_deadline_hours: parseInt(voteDeadlineHours)
    })
      .then(response => {
        alert('Settings updated successfully!');
        onSettingsUpdated();
        onClose();
      })
      .catch(error => {
        alert(error.response?.data?.error || 'Failed to update settings');
      });
  };

  if (loading) return <div>Loading...</div>;

  // Generate vote options from 1 to group member count
  const voteOptions = [];
  for (let i = 1; i <= groupMemberCount; i++) {
    voteOptions.push(i);
  }

  return (
    <div style={{
      position: 'fixed',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      backgroundColor: 'white',
      padding: '30px',
      border: '2px solid #333',
      borderRadius: '10px',
      zIndex: 1000,
      minWidth: '400px'
    }}>
      <button 
        onClick={onClose}
        style={{ float: 'right', cursor: 'pointer' }}
      >
        ✕
      </button>

      <h2>Group Settings</h2>
      <p style={{ color: '#666', fontSize: '14px' }}>
        Only the group owner can modify these settings
      </p>

      <form onSubmit={handleSave} style={{ marginTop: '20px' }}>
        <div style={{ marginBottom: '15px' }}>
          <label><strong>Minimum Votes Required:</strong></label>
          <select 
            value={minVotesRequired}
            onChange={(e) => setMinVotesRequired(e.target.value)}
            style={{ 
              width: '100%', 
              padding: '8px', 
              marginTop: '5px',
              fontSize: '16px'
            }}
          >
            {voteOptions.map(num => (
              <option key={num} value={num}>
                {num} vote{num > 1 ? 's' : ''}
              </option>
            ))}
          </select>
          <small style={{ color: '#666' }}>
            Group has {groupMemberCount} member{groupMemberCount !== 1 ? 's' : ''}
          </small>
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label><strong>Vote Deadline (hours):</strong></label>
          <input 
            type="number"
            min="1"
            max="168"
            value={voteDeadlineHours}
            onChange={(e) => setVoteDeadlineHours(e.target.value)}
            style={{ 
              width: '100%', 
              padding: '8px', 
              marginTop: '5px',
              fontSize: '16px'
            }}
          />
          <small style={{ color: '#666' }}>
            Moves will be deleted if they don't reach the vote threshold within this time
          </small>
        </div>

        <button type="submit" style={{ marginRight: '10px' }}>Save Settings</button>
        <button type="button" onClick={onClose}>Cancel</button>
      </form>
    </div>
  );
}

export default GroupSettings; 