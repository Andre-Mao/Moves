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
      <h2>My Groups</h2>
      
      <button onClick={() => setShowCreateForm(!showCreateForm)}>
        {showCreateForm ? 'Cancel' : 'Create New Group'}
      </button>
      <button onClick={() => setShowJoinForm(!showJoinForm)}>
        {showJoinForm ? 'Cancel' : 'Join Group'}
      </button>
      {groupInvitations.length > 0 && (
        <button onClick={() => setShowInvitations(!showInvitations)}>
          Invitations ({groupInvitations.length})
        </button>
      )}

      {showCreateForm && (
        <div>
          <h3>Create Group</h3>
          <form onSubmit={handleCreateGroup}>
            <div>
              <label>Group Name:</label>
              <input 
                type="text" 
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
                required
              />
            </div>
            <button type="submit">Create</button>
          </form>
          {createdGroupKey && (
            <div>
              <p><strong>Save this join key to share with others:</strong></p>
              <p style={{fontSize: '20px', fontWeight: 'bold'}}>{createdGroupKey}</p>
            </div>
          )}
        </div>
      )}

      {showJoinForm && (
        <div>
          <h3>Join Group</h3>
          <form onSubmit={handleJoinGroup}>
            <div>
              <label>Enter Join Key:</label>
              <input 
                type="text" 
                value={joinKey}
                onChange={(e) => setJoinKey(e.target.value)}
                required
              />
            </div>
            <button type="submit">Join</button>
          </form>
        </div>
      )}

      {showInvitations && (
        <div style={{ marginTop: '10px', backgroundColor: '#f0f0f0', padding: '10px' }}>
          <h3>Group Invitations</h3>
          {groupInvitations.map(invite => (
            <div key={invite.id} style={{ marginBottom: '10px', borderBottom: '1px solid #ccc', paddingBottom: '10px' }}>
              <p><strong>{invite.group.name}</strong></p>
              <p>Invited by: {invite.invited_by.username}</p>
              <button onClick={() => handleAcceptInvitation(invite.id)}>Accept</button>
              <button onClick={() => handleDeclineInvitation(invite.id)}>Decline</button>
            </div>
          ))}
        </div>
      )}

      {userGroups.length === 0 ? (
        <p>You're not in any groups yet! Create one or join with a key.</p>
      ) : (
        <ul>
          {userGroups.map(group => (
            <li key={group.id}>
              <strong>{group.name}</strong>
              <p>Join Key: {group.join_key}</p>
              <button onClick={() => onGroupSelected(group)}>View Moves</button>
              {group.created_by === user.id && (
                <button onClick={() => setShowSettings(group)}>Settings</button>
              )} 
            </li>
          ))}
        </ul>
      )}

      {showSettings && (
        <>
          <div 
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0,0,0,0.5)',
              zIndex: 999
            }}
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