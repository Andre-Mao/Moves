import React, { useState, useEffect } from 'react';
import axios from 'axios';

function UserProfile({ user, currentUser, onClose, onSendMessage }) {
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userGroups, setUserGroups] = useState([]);
  const [showGroupSelect, setShowGroupSelect] = useState(false);
  const [selectedGroupId, setSelectedGroupId] = useState(''); 

  useEffect(() => {
    fetchProfile();
    fetchUserGroups();
  }, [user.id]);

  const fetchProfile = () => {
    axios.get(`http://localhost:5000/friends/profile/${user.id}?current_user_id=${currentUser.id}`)
      .then(response => {
        setProfileData(response.data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching profile:', error);
        setLoading(false);
      });
  };

  const fetchUserGroups = () => {
    axios.get(`http://localhost:5000/groups/user/${currentUser.id}/groups`)
      .then(response => {
        setUserGroups(response.data);
      })
      .catch(error => {
        console.error('Error fetching groups:', error);
      });
  };

  const handleAddToGroup = () => {
    if(!selectedGroupId){
      alert('Please select a group');
      return;
    }

    axios.post(`http://localhost:5000/groups/${selectedGroupId}/add-member`, {
      user_id: user.id,
      added_by: currentUser.id
    })
      .then(response => {
        alert('Group invitation sent!');
        setShowGroupSelect(false);
        setSelectedGroupId('');
        fetchProfile(); // Refresh to update mutual groups
      })
      .catch(error => {
        alert(error.response?.data?.error || 'Failed to add to group');
      });
  };

  if (loading) return <div>Loading profile...</div>;

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
      minWidth: '400px',
      maxHeight: '80vh',
      overflowY: 'auto'
    }}>
      <button 
        onClick={onClose}
        style={{ float: 'right', cursor: 'pointer' }}
      >
        ✕
      </button>
      
      <h2>{profileData.user.username}'s Profile</h2>
      
      <div style={{ marginTop: '20px' }}>
        <p><strong>Email:</strong> {profileData.user.email}</p>
        <p><strong>Friends:</strong> {profileData.friend_count}</p>
        <p><strong>Groups:</strong> {profileData.group_count}</p>
        <p><strong>Member since:</strong> {new Date(profileData.user.created_at).toLocaleDateString()}</p>
      </div>

      {profileData.mutual_groups.length > 0 && (
        <div style={{ marginTop: '20px' }}>
          <h3>Mutual Groups ({profileData.mutual_groups.length})</h3>
          <ul>
            {profileData.mutual_groups.map(group => (
              <li key={group.id}>{group.name}</li>
            ))}
          </ul>
        </div>
      )}

      <div style={{ marginTop: '20px' }}>
        {!showGroupSelect ? (
          <button onClick={() => setShowGroupSelect(true)}>Add to Group</button>
        ) : (
          <div>
            <h4>Select a group:</h4>
            <select 
              value={selectedGroupId}
              onChange={(e) => setSelectedGroupId(e.target.value)}
            >
              <option value="">-- Choose Group --</option>
              {userGroups.map(group => (
                <option key={group.id} value={group.id}>
                  {group.name}
                </option>
              ))}
            </select>
            <button onClick={handleAddToGroup}>Add</button>
            <button onClick={() => setShowGroupSelect(false)}>Cancel</button>
          </div>
        )}
        <button style={{ marginLeft: '10px' }} onClick={() => onSendMessage(user)}>Send Message</button>
      </div>
    </div>
  ); 
}

export default UserProfile;