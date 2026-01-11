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
        fetchProfile();
      })
      .catch(error => {
        alert(error.response?.data?.error || 'Failed to add to group');
      });
  };

  if (loading) {
    return (
      <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-8 rounded-xl shadow-2xl z-50">
        <p className="text-gray-600">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-xl shadow-2xl z-50 w-full max-w-lg max-h-[85vh] overflow-y-auto border-2 border-gray-200">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 rounded-t-xl relative">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-white hover:text-gray-200 text-2xl font-bold w-8 h-8 flex items-center justify-center rounded-full hover:bg-white hover:bg-opacity-20 transition-all"
        >
          ✕
        </button>
        
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center text-4xl font-bold text-blue-600 shadow-lg">
            {profileData.user.username.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="text-3xl font-bold text-white">{profileData.user.username}</h2>
            <p className="text-blue-100">{profileData.user.email}</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 p-6 bg-gray-50 border-b border-gray-200">
        <div className="text-center">
          <div className="text-3xl font-bold text-blue-600">{profileData.friend_count}</div>
          <div className="text-sm text-gray-600">Friends</div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold text-green-600">{profileData.group_count}</div>
          <div className="text-sm text-gray-600">Groups</div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold text-purple-600">{profileData.mutual_groups.length}</div>
          <div className="text-sm text-gray-600">Mutual</div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="mb-6">
          <p className="text-sm text-gray-500 mb-1">Member Since</p>
          <p className="text-lg font-semibold text-gray-800">
            {new Date(profileData.user.created_at).toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
        </div>

        {profileData.mutual_groups.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-bold text-gray-800 mb-3">
              Mutual Groups ({profileData.mutual_groups.length})
            </h3>
            <div className="space-y-2">
              {profileData.mutual_groups.map(group => (
                <div key={group.id} className="bg-blue-50 px-4 py-3 rounded-lg border border-blue-200">
                  <p className="font-semibold text-gray-800">{group.name}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="space-y-3">
          {!showGroupSelect ? (
            <>
              <button 
                onClick={() => setShowGroupSelect(true)}
                className="w-full bg-green-500 text-white px-5 py-3 rounded-lg hover:bg-green-600 transition-colors font-semibold"
              >
                + Add to Group
              </button>
              <button 
                onClick={() => onSendMessage(user)}
                className="w-full bg-blue-500 text-white px-5 py-3 rounded-lg hover:bg-blue-600 transition-colors font-semibold"
              >
                💬 Send Message
              </button>
            </>
          ) : (
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <h4 className="font-bold text-gray-800 mb-3">Select a group:</h4>
              <select 
                value={selectedGroupId}
                onChange={(e) => setSelectedGroupId(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 mb-3"
              >
                <option value="">-- Choose Group --</option>
                {userGroups.map(group => (
                  <option key={group.id} value={group.id}>
                    {group.name}
                  </option>
                ))}
              </select>
              <div className="flex gap-2">
                <button 
                  onClick={handleAddToGroup}
                  className="flex-1 bg-green-500 text-white px-4 py-2.5 rounded-lg hover:bg-green-600 transition-colors font-semibold"
                >
                  Send Invite
                </button>
                <button 
                  onClick={() => setShowGroupSelect(false)}
                  className="flex-1 bg-gray-500 text-white px-4 py-2.5 rounded-lg hover:bg-gray-600 transition-colors font-semibold"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default UserProfile; 