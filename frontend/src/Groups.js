import React, { useState, useEffect } from 'react';
import GroupSettings from './GroupSettings'; 
import axios from 'axios';

function Groups({ user, onGroupSelected }) {
  const [userGroups, setUserGroups] = useState([]);
  const [groupInvitations, setGroupInvitations] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showJoinForm, setShowJoinForm] = useState(false);
  const [showInvitations, setShowInvitations] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [joinKey, setJoinKey] = useState('');
  const [createdGroupKey, setCreatedGroupKey] = useState('');
  const [showSettings, setShowSettings] = useState(null);

  useEffect(() => {
    fetchUserGroups();
    fetchGroupInvitations();
  }, []);

  const fetchUserGroups = () => {
    axios.get(`http://localhost:5000/groups/user/${user.id}/groups`)
      .then(response => {
        setUserGroups(response.data);
      })
      .catch(error => {
        console.error('Error fetching user groups:', error);
      });
  };

  const fetchGroupInvitations = () => {
    axios.get(`http://localhost:5000/groups/user/${user.id}/invitations`)
      .then(response => {
        setGroupInvitations(response.data);
      })
      .catch(error => {
        console.error('Error fetching invitations:', error);
      });
  };

  const handleCreateGroup = (e) => {
    e.preventDefault();
    
    axios.post('http://localhost:5000/groups/groups', {
      name: newGroupName,
      created_by: user.id
    })
      .then(response => {
        setCreatedGroupKey(response.data.join_key);
        alert(`Group created! Join key: ${response.data.join_key}`);
        setNewGroupName('');
        setShowCreateForm(false);
        fetchUserGroups();
      })
      .catch(error => {
        console.error('Error creating group:', error);
        alert('Failed to create group');
      });
  };

  const handleJoinGroup = (e) => {
    e.preventDefault();
    
    axios.post('http://localhost:5000/groups/join', {
      join_key: joinKey,
      user_id: user.id
    })
      .then(response => {
        alert('Joined group successfully!');
        setJoinKey('');
        setShowJoinForm(false);
        fetchUserGroups();
      })
      .catch(error => {
        alert(error.response?.data?.error || 'Failed to join group');
      });
  };

  const handleAcceptInvitation = (invitationId) => {
    axios.post(`http://localhost:5000/groups/invitations/${invitationId}/accept`)
      .then(response => {
        alert('Group invitation accepted!');
        fetchUserGroups();
        fetchGroupInvitations();
      })
      .catch(error => {
        alert('Failed to accept invitation');
      });
  };

  const handleDeclineInvitation = (invitationId) => {
    axios.post(`http://localhost:5000/groups/invitations/${invitationId}/decline`)
      .then(response => {
        alert('Group invitation declined');
        fetchGroupInvitations();
      })
      .catch(error => {
        alert('Failed to decline invitation');
      });
  };

  const handleSettingsUpdated = () => {
    fetchUserGroups(); 
    setShowSettings(null);
  };

  return (
    <div>
      <h2 className="text-3xl font-bold mb-6 text-gray-800">My Groups</h2>
      
      <div className="flex gap-3 mb-6">
        <button 
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="bg-blue-500 text-white px-5 py-2.5 rounded-lg hover:bg-blue-600 transition-colors font-medium"
        >
          {showCreateForm ? 'Cancel' : '+ Create Group'}
        </button>
        <button 
          onClick={() => setShowJoinForm(!showJoinForm)}
          className="bg-green-500 text-white px-5 py-2.5 rounded-lg hover:bg-green-600 transition-colors font-medium"
        >
          {showJoinForm ? 'Cancel' : 'Join Group'}
        </button>
        {groupInvitations.length > 0 && (
          <button 
            onClick={() => setShowInvitations(!showInvitations)}
            className="bg-purple-500 text-white px-5 py-2.5 rounded-lg hover:bg-purple-600 transition-colors font-medium relative"
          >
            Invitations ({groupInvitations.length})
          </button>
        )}
      </div>

      {showCreateForm && (
        <div className="mb-6 p-6 bg-gray-50 rounded-lg border border-gray-200">
          <h3 className="text-xl font-bold mb-4 text-gray-800">Create New Group</h3>
          <form onSubmit={handleCreateGroup} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Group Name</label>
              <input 
                type="text" 
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
                required
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button 
              type="submit"
              className="w-full bg-blue-500 text-white px-4 py-2.5 rounded-lg hover:bg-blue-600 transition-colors font-medium"
            >
              Create Group
            </button>
          </form>
          {createdGroupKey && (
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm font-medium text-gray-700 mb-2">Share this join key with others:</p>
              <p className="text-2xl font-bold text-blue-600 text-center">{createdGroupKey}</p>
            </div>
          )}
        </div>
      )}

      {showJoinForm && (
        <div className="mb-6 p-6 bg-gray-50 rounded-lg border border-gray-200">
          <h3 className="text-xl font-bold mb-4 text-gray-800">Join Group</h3>
          <form onSubmit={handleJoinGroup} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Enter Join Key</label>
              <input 
                type="text" 
                value={joinKey}
                onChange={(e) => setJoinKey(e.target.value)}
                required
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <button 
              type="submit"
              className="w-full bg-green-500 text-white px-4 py-2.5 rounded-lg hover:bg-green-600 transition-colors font-medium"
            >
              Join Group
            </button>
          </form>
        </div>
      )}

      {showInvitations && (
        <div className="mb-6 p-6 bg-purple-50 rounded-lg border border-purple-200">
          <h3 className="text-xl font-bold mb-4 text-gray-800">Group Invitations</h3>
          {groupInvitations.map(invite => (
            <div key={invite.id} className="mb-4 p-4 bg-white rounded-lg border border-gray-200 last:mb-0">
              <p className="font-bold text-lg text-gray-800 mb-1">{invite.group.name}</p>
              <p className="text-sm text-gray-600 mb-3">Invited by: {invite.invited_by.username}</p>
              <div className="flex gap-2">
                <button 
                  onClick={() => handleAcceptInvitation(invite.id)}
                  className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors text-sm font-medium"
                >
                  Accept
                </button>
                <button 
                  onClick={() => handleDeclineInvitation(invite.id)}
                  className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors text-sm font-medium"
                >
                  Decline
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {userGroups.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <p className="text-gray-500 text-lg">You're not in any groups yet!</p>
          <p className="text-gray-400 text-sm mt-2">Create one or join with a key to get started.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {userGroups.map(group => (
            <div key={group.id} className="p-5 bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-3">
                <h3 className="text-xl font-bold text-gray-800">{group.name}</h3>
                {group.created_by === user.id && (
                  <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-1 rounded">Owner</span>
                )}
              </div>
              <p className="text-sm text-gray-600 mb-4">
                <span className="font-medium">Join Key:</span> 
                <span className="ml-2 font-mono bg-gray-100 px-2 py-1 rounded">{group.join_key}</span>
              </p>
              <div className="flex gap-2">
                <button 
                  onClick={() => onGroupSelected(group)}
                  className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors font-medium"
                >
                  View Moves
                </button>
                {group.created_by === user.id && (
                  <button 
                    onClick={() => setShowSettings(group)}
                    className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors font-medium"
                  >
                    Settings
                  </button>
                )} 
              </div>
            </div>
          ))}
        </div>
      )}

      {showSettings && (
        <>
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={() => setShowSettings(null)}
          />
          <GroupSettings 
            group={showSettings}
            currentUser={user}
            onClose={() => setShowSettings(null)}
            onSettingsUpdated={handleSettingsUpdated}
          />
        </>
      )}
    </div>
  );
}

export default Groups; 