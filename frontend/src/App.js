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
    setSelectedFriend(null);
    setMessagingFriend(friend);
  };

  const handleCloseMessages = () => {
    setMessagingFriend(null);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {!user ? (
        <div className="flex flex-col items-center justify-center min-h-screen">
          <h1 className="text-4xl font-bold mb-4 text-gray-800">Moves App</h1>
          <p className="text-gray-600 mb-8">Welcome to your activity voting app!</p>
          <Login onLoginSuccess={handleLoginSuccess} />
        </div>
      ) : (
        <div className="flex h-screen">
          <Friends user={user} onFriendClick={handleFriendClick} />
          
          <div className="flex-1 p-6 overflow-y-auto bg-white">
            <div className="max-w-4xl mx-auto">
              <h1 className="text-3xl font-bold mb-2 text-gray-800">Moves App</h1>
              <div className="flex items-center justify-between mb-6">
                <p className="text-gray-600">Welcome, {user.username}!</p>
                <button 
                  onClick={handleLogout}
                  className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors"
                >
                  Logout
                </button>
              </div>
              
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
                  <button 
                    onClick={handleBackToGroups}
                    className="mb-4 bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition-colors"
                  >
                    ← Back to Groups
                  </button>
                  <h2 className="text-2xl font-bold mb-4 text-gray-700">
                    Moves for {selectedGroup.name}
                  </h2>
                  <MovesList user={user} groupId={selectedGroup.id} />
                </>
              )}
            </div>
          </div>

          {selectedFriend && (
            <>
              <div 
                className="fixed inset-0 bg-black bg-opacity-50 z-40"
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