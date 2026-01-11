import { useState } from 'react';
import Login from './Login';
import MovesList from './MovesList';
import Groups from './Groups';
import Friends from './Friends';
import UserProfile from './UserProfile';
import Messages from './Messages';
import Toast from './Toast';
import { setShowToast } from './ToastManager';

function App() {
  const [user, setUser] = useState(null);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [messagingFriend, setMessagingFriend] = useState(null);
  const [toasts, setToasts] = useState([]);

  // Set up global toast manager
  useState(() => {
    let toastId = 0;
    setShowToast((message, type) => {
      const id = toastId++;
      setToasts(prev => [...prev, { id, message, type }]);
    });
  }, []);

  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      {/* Toast Notifications */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {toasts.map((toast, index) => (
          <div key={toast.id} style={{ marginTop: `${index * 80}px` }}>
            <Toast
              message={toast.message}
              type={toast.type}
              onClose={() => removeToast(toast.id)}
            />
          </div>
        ))}
      </div>

      {!user ? (
        <div className="flex flex-col items-center justify-start min-h-screen px-4 pt-20">
          {/* Animated Fire Title */}
          <div className="mb-12 relative">
            <h1 className="text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-500 via-red-500 to-yellow-500 animate-pulse">
              MOVES
            </h1>
            <div className="absolute inset-0 text-8xl font-black text-transparent bg-clip-text bg-gradient-to-t from-red-600 via-orange-400 to-yellow-300 blur-sm animate-pulse" 
                 style={{ animationDelay: '0.3s' }}>
              MOVES
            </div>
          </div>
          
          <p className="text-gray-300 mb-12 text-xl">Make your move. Vote on what's next.</p>
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