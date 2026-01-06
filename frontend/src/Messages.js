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
    return <div style={{ padding: '20px' }}>Select a friend to start messaging</div>;
  }

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      padding: '20px'
    }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '2px solid #ccc',
        paddingBottom: '10px',
        marginBottom: '10px'
      }}>
        <h2>Chat with {selectedFriend.username}</h2>
        <button onClick={onClose}>Close</button>
      </div>

      <div style={{
        flex: 1,
        overflowY: 'auto',
        marginBottom: '10px',
        border: '1px solid #ccc',
        padding: '10px',
        borderRadius: '5px'
      }}>
        {messages.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#888' }}>No messages yet. Start the conversation!</p>
        ) : (
          messages.map(msg => (
            <div 
              key={msg.id}
              style={{
                marginBottom: '10px',
                padding: '10px',
                borderRadius: '10px',
                maxWidth: '70%',
                backgroundColor: msg.sender_id === user.id ? '#007bff' : '#e9ecef',
                color: msg.sender_id === user.id ? 'white' : 'black',
                marginLeft: msg.sender_id === user.id ? 'auto' : '0',
                marginRight: msg.sender_id === user.id ? '0' : 'auto'
              }}
            >
              <p style={{ margin: 0 }}>{msg.content}</p>
              <small style={{ 
                fontSize: '0.75em',
                opacity: 0.7
              }}>
                {new Date(msg.created_at).toLocaleTimeString()}
              </small>
            </div>
          ))
        )}
      </div>

      <form onSubmit={handleSendMessage} style={{ display: 'flex' }}>
        <input 
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          style={{
            flex: 1,
            padding: '10px',
            borderRadius: '5px',
            border: '1px solid #ccc',
            marginRight: '10px'
          }}
        />
        <button type="submit">Send</button>
      </form>
    </div>
  );
}

export default Messages; 