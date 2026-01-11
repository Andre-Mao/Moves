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
    axios.get(`http://localhost:5000/groups/${group.id}/member-count`)
      .then(response => {
        setGroupMemberCount(response.data.count);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching member count:', error);
        setGroupMemberCount(10);
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

  if (loading) {
    return (
      <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-8 rounded-xl shadow-2xl z-50">
        <p className="text-gray-600">Loading settings...</p>
      </div>
    );
  }

  const voteOptions = [];
  for (let i = 1; i <= groupMemberCount; i++) {
    voteOptions.push(i);
  }

  return (
    <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-xl shadow-2xl z-50 w-full max-w-lg border-2 border-gray-200">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-6 rounded-t-xl relative">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-white hover:text-gray-200 text-2xl font-bold w-8 h-8 flex items-center justify-center rounded-full hover:bg-white hover:bg-opacity-20 transition-all"
        >
          ✕
        </button>
        
        <h2 className="text-3xl font-bold text-white">⚙️ Group Settings</h2>
        <p className="text-purple-100 mt-1">Configure voting rules for {group.name}</p>
      </div>

      {/* Content */}
      <form onSubmit={handleSave} className="p-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-yellow-800">
            <strong>Note:</strong> Only the group owner can modify these settings
          </p>
        </div>

        <div className="space-y-6">
          {/* Minimum Votes */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Minimum Votes Required
            </label>
            <select 
              value={minVotesRequired}
              onChange={(e) => setMinVotesRequired(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-lg font-semibold"
            >
              {voteOptions.map(num => (
                <option key={num} value={num}>
                  {num} vote{num > 1 ? 's' : ''}
                </option>
              ))}
            </select>
            <p className="text-sm text-gray-500 mt-2">
              📊 Group has {groupMemberCount} member{groupMemberCount !== 1 ? 's' : ''}
            </p>
          </div>

          {/* Vote Deadline */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Vote Deadline (hours)
            </label>
            <input 
              type="number"
              min="1"
              max="168"
              value={voteDeadlineHours}
              onChange={(e) => setVoteDeadlineHours(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-lg font-semibold"
            />
            <p className="text-sm text-gray-500 mt-2">
              ⏰ Moves will be deleted if they don't reach {minVotesRequired} vote{minVotesRequired > 1 ? 's' : ''} within {voteDeadlineHours} hour{voteDeadlineHours > 1 ? 's' : ''}
            </p>
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-bold text-blue-900 mb-2">How it works:</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Moves need <strong>{minVotesRequired}</strong> votes to be approved</li>
              <li>• Deadline: <strong>{voteDeadlineHours}</strong> hours from creation</li>
              <li>• Failed moves are automatically removed</li>
            </ul>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-3 mt-8">
          <button 
            type="submit"
            className="flex-1 bg-gradient-to-r from-purple-500 to-purple-600 text-white px-6 py-3 rounded-lg hover:from-purple-600 hover:to-purple-700 transition-all font-semibold shadow-md"
          >
            Save Settings
          </button>
          <button 
            type="button" 
            onClick={onClose}
            className="flex-1 bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600 transition-colors font-semibold"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

export default GroupSettings; 