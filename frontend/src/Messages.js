import React, { useState, useEffect } from 'react';
import axios from 'axios';

function Messages({ user, selectedFriend, onClose }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');

  useEffect(() => {
    if (selectedFriend) {
      fetchConversation();
      const interval = setInterval(fetchConversation, 3000);
      return () => clearInterval(interval);
    }
  }, [selectedFriend]);

  const fetchConversation = () => {
    if (!selectedFriend) return;
    
    axios.get(`http://localhost:5000/messages/conversation/${user.id}/${selectedFriend.id}`)
      .then(response => {
        setMessages(response.data);
      })
      .catch(error => {
        console.error('Error fetching messages:', error);
      });
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    
    if (!newMessage.trim()) return;
    
    axios.post('http://localhost:5000/messages/send', {
      sender_id: user.id,
      recipient_id: selectedFriend.id,
      content: newMessage
    })
      .then(response => {
        setNewMessage('');
        fetchConversation();
      })
      .catch(error => {
        console.error('Error sending message:', error);
        alert('Failed to send message');
      });
  };

  if (!selectedFriend) {
    return (
      <div className="flex items-center justify-center h-96 bg-gray-50 rounded-lg">
        <p className="text-gray-500 text-lg">Select a friend to start messaging</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full max-h-[calc(100vh-12rem)] bg-white rounded-lg shadow-lg border border-gray-200">
      {/* Header */}
      <div className="flex justify-between items-center p-5 border-b-2 border-gray-200 bg-gradient-to-r from-blue-50 to-blue-100">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">
            💬 {selectedFriend.username}
          </h2>
          <p className="text-sm text-gray-600">Online</p>
        </div>
        <button 
          onClick={onClose}
          className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors font-medium"
        >
          Close
        </button>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-5 bg-gray-50 space-y-3">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <p className="text-gray-400 text-lg">No messages yet</p>
              <p className="text-gray-300 text-sm mt-2">Start the conversation!</p>
            </div>
          </div>
        ) : (
          messages.map(msg => (
            <div 
              key={msg.id}
              className={`flex ${msg.sender_id === user.id ? 'justify-end' : 'justify-start'}`}
            >
              <div 
                className={`max-w-[70%] px-4 py-3 rounded-2xl shadow-sm ${
                  msg.sender_id === user.id 
                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-br-none' 
                    : 'bg-white text-gray-800 border border-gray-200 rounded-bl-none'
                }`}
              >
                <p className="break-words">{msg.content}</p>
                <small className={`text-xs mt-1 block ${
                  msg.sender_id === user.id ? 'text-blue-100' : 'text-gray-500'
                }`}>
                  {new Date(msg.created_at).toLocaleTimeString([], { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </small>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Input Area */}
      <form onSubmit={handleSendMessage} className="p-4 border-t-2 border-gray-200 bg-white">
        <div className="flex gap-3">
          <input 
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 px-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button 
            type="submit"
            className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-8 py-3 rounded-full hover:from-blue-600 hover:to-blue-700 transition-all font-semibold shadow-md"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
}

export default Messages; 