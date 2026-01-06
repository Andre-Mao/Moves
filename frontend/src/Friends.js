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
    <div style={{ 
      width: '250px', 
      borderRight: '1px solid #ccc', 
      padding: '20px',
      height: '100vh',
      overflowY: 'auto'
    }}>
      <h2>Friends</h2>
      
      <button onClick={() => setShowAddForm(!showAddForm)}>
        {showAddForm ? 'Cancel' : '+ Add Friend'}
      </button>
      
      {friendRequests.length > 0 && (
        <button onClick={() => setShowRequests(!showRequests)}>
          Requests ({friendRequests.length})
        </button>
      )}

      {showAddForm && (
        <form onSubmit={handleSendRequest} style={{ marginTop: '10px' }}>
          <input 
            type="text" 
            placeholder="Username"
            value={friendUsername}
            onChange={(e) => setFriendUsername(e.target.value)}
            required
          />
          <button type="submit">Send</button>
        </form>
      )}

      {showRequests && (
        <div style={{ marginTop: '10px', backgroundColor: '#f0f0f0', padding: '10px' }}>
          <h3>Pending Requests</h3>
          {friendRequests.map(req => (
            <div key={req.id} style={{ marginBottom: '10px' }}>
              <p><strong>{req.user.username}</strong></p>
              <button onClick={() => handleAcceptRequest(req.id)}>Accept</button>
              <button onClick={() => handleDeclineRequest(req.id)}>Decline</button>
            </div>
          ))}
        </div>
      )}

      <div style={{ marginTop: '20px' }}>
        <h3>My Friends</h3>
        {friends.length === 0 ? (
          <p>No friends yet</p>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {friends.map(friend => (
              <li 
                key={friend.id} 
                style={{ 
                  padding: '10px', 
                  cursor: 'pointer',
                  borderBottom: '1px solid #eee'
                }}
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