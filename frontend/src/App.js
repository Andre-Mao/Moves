import './App.css';
import { useState } from 'react';
import Login from './Login';
import MovesList from './MovesList';
import Groups from './Groups';
import Friends from './Friends';
import UserProfile from './UserProfile';
import Messages from './Messages';

function App() {
  const [user, setUser] = useState(null);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [messagingFriend, setMessagingFriend] = useState(null);

  const handleLoginSuccess = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    setUser(null);
    setSelectedGroup(null);
    setSelectedFriend(null);
    setMessagingFriend(null);
  };

  const handleGroupSelected = (group) => {
    setSelectedGroup(group);
  };

  const handleBackToGroups = () => {
    setSelectedGroup(null);
  };

  const handleFriendClick = (friend) => {
    setSelectedFriend(friend);
  };

  const handleCloseProfile = () => {
    setSelectedFriend(null);
  };

  const handleSendMessage = (friend) => {
    setSelectedFriend(null); // Close profile
    setMessagingFriend(friend); // Open messages
  };

  const handleCloseMessages = () => {
    setMessagingFriend(null);
  };

  return (
    <div className="App">
      {!user ? (
        <>
          <h1>Moves App</h1>
          <p>Welcome to your activity voting app!</p>
          <Login onLoginSuccess={handleLoginSuccess} />
        </>
      ) : (
        <div style={{ display: 'flex', height: '100vh' }}>
          <Friends user={user} onFriendClick={handleFriendClick} />
          
          <div style={{ flex: 1, padding: '20px', overflowY: 'auto' }}>
            <h1>Moves App</h1>
            <p>Welcome, {user.username}!</p>
            <button onClick={handleLogout}>Logout</button>
            
            {messagingFriend ? (
              <Messages 
                user={user} 
                selectedFriend={messagingFriend}
                onClose={handleCloseMessages}
              />
            ) : !selectedGroup ? (
              <Groups user={user} onGroupSelected={handleGroupSelected} />
            ) : (
              <>
                <button onClick={handleBackToGroups}>Back to Groups</button>
                <h2>Moves for {selectedGroup.name}</h2>
                <MovesList user={user} groupId={selectedGroup.id} />
              </>
            )}
          </div>

          {selectedFriend && (
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
                onClick={handleCloseProfile}
              />
              <UserProfile 
                user={selectedFriend} 
                currentUser={user}
                onClose={handleCloseProfile}
                onSendMessage={handleSendMessage}
              />
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default App; 