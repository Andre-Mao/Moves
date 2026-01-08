import React, { useState, useEffect } from 'react';
import axios from 'axios';

function Friends({ user, onFriendClick }) {
  const [friends, setFriends] = useState([]);
  const [friendRequests, setFriendRequests] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showRequests, setShowRequests] = useState(false);
  const [friendUsername, setFriendUsername] = useState('');

  useEffect(() => {
    fetchFriends();
    fetchFriendRequests();
  }, []);

  const fetchFriends = () => {
    axios.get(`http://localhost:5000/friends/user/${user.id}`)
      .then(response => {
        setFriends(response.data);
      })
      .catch(error => {
        console.error('Error fetching friends:', error);
      });
  };

  const fetchFriendRequests = () => {
    axios.get(`http://localhost:5000/friends/user/${user.id}/requests`)
      .then(response => {
        setFriendRequests(response.data);
      })
      .catch(error => {
        console.error('Error fetching requests:', error);
      });
  };

  const handleSendRequest = (e) => {
    e.preventDefault();
    
    axios.post('http://localhost:5000/friends/request', {
      user_id: user.id,
      friend_username: friendUsername
    })
      .then(response => {
        alert('Friend request sent!');
        setFriendUsername('');
        setShowAddForm(false);
      })
      .catch(error => {
        alert(error.response?.data?.error || 'Failed to send request');
      });
  };

  const handleAcceptRequest = (friendshipId) => {
    axios.post(`http://localhost:5000/friends/accept/${friendshipId}`)
      .then(response => {
        alert('Friend request accepted!');
        fetchFriends();
        fetchFriendRequests();
      })
      .catch(error => {
        alert('Failed to accept request');
      });
  };

  const handleDeclineRequest = (friendshipId) => {
    axios.delete(`http://localhost:5000/friends/remove/${friendshipId}`)
      .then(response => {
        alert('Friend request declined');
        fetchFriendRequests();
      })
      .catch(error => {
        alert('Failed to decline request');
      });
  };

  return (
    <div className="w-64 border-r border-gray-300 p-5 h-screen overflow-y-auto bg-gray-50">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Friends</h2>
      
      <div className="space-y-2 mb-4">
        <button 
          onClick={() => setShowAddForm(!showAddForm)}
          className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
        >
          {showAddForm ? 'Cancel' : '+ Add Friend'}
        </button>
        
        {friendRequests.length > 0 && (
          <button 
            onClick={() => setShowRequests(!showRequests)}
            className="w-full bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors relative"
          >
            Requests ({friendRequests.length})
          </button>
        )}
      </div>

      {showAddForm && (
        <form onSubmit={handleSendRequest} className="mb-4 space-y-2">
          <input 
            type="text" 
            placeholder="Username"
            value={friendUsername}
            onChange={(e) => setFriendUsername(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button 
            type="submit"
            className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
          >
            Send
          </button>
        </form>
      )}

      {showRequests && (
        <div className="mb-4 bg-gray-100 p-3 rounded">
          <h3 className="font-bold mb-2 text-gray-700">Pending Requests</h3>
          {friendRequests.map(req => (
            <div key={req.id} className="mb-3 pb-3 border-b border-gray-300 last:border-b-0">
              <p className="font-semibold mb-2">{req.user.username}</p>
              <div className="space-x-2">
                <button 
                  onClick={() => handleAcceptRequest(req.id)}
                  className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600"
                >
                  Accept
                </button>
                <button 
                  onClick={() => handleDeclineRequest(req.id)}
                  className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
                >
                  Decline
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-5">
        <h3 className="font-bold mb-3 text-gray-700">My Friends</h3>
        {friends.length === 0 ? (
          <p className="text-gray-500 text-sm">No friends yet</p>
        ) : (
          <ul className="space-y-1">
            {friends.map(friend => (
              <li 
                key={friend.id} 
                className="p-3 cursor-pointer border-b border-gray-200 hover:bg-gray-200 rounded transition-colors"
                onClick={() => onFriendClick(friend)}
              >
                {friend.username}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default Friends; 