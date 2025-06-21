import { useContext, useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import io from 'socket.io-client';
import axios from 'axios';

const socket = io('https://your-backend.onrender.com' // deployed backend
);
// Backend URL


export default function ChatRoom() {
  const { user } = useContext(AuthContext);
  const { id: receiverId } = useParams(); // chatting with this user
  const [messages, setMessages] = useState([]);
  const [newMsg, setNewMsg] = useState('');
  const bottomRef = useRef(null);

  // ✅ Log socket connection once on component mount
useEffect(() => {
  socket.on('connect', () => {
    console.log('✅ Socket connected:', socket.id);
  });

  return () => {
    socket.off('connect');
  };
}, []);
  useEffect(() => {
    
    socket.emit('register', user.id); // Register current user
    socket.emit('join-room', { userId: user.id, otherUserId: receiverId }); // Join shared room

    socket.on('receive-message', msg => {
          console.log('📩 Received from socket:', msg); // ADD THIS

      setMessages(prev => [...prev, msg]);
    });

    fetchMessages();

    return () => socket.off('receive-message');
  }, [receiverId]);

  const fetchMessages = async () => {
  try {
    const token = localStorage.getItem('token'); // Assuming token is stored here

    const res = await axios.get(`http://localhost:5000/api/chat/${receiverId}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    setMessages(res.data.messages || []);
  } catch (err) {
    alert('Failed to load messages');
    console.error(err);
  }
};


  const sendMessage = () => {
    if (!newMsg.trim()) return;

    const msgData = {
      senderId: user.id,
      receiverId,
      content: newMsg
    };

    socket.emit('send-message', msgData);
    setMessages(prev => [...prev, { ...msgData, timestamp: new Date() }]);
    setNewMsg('');
  };

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div style={{ padding: '1rem' }}>
      <h2>Chat Room</h2>
      <div style={{ maxHeight: '400px', overflowY: 'auto', border: '1px solid #ccc', padding: '1rem' }}>
        {messages.map((msg, index) => (
          <div
            key={index}
            style={{
              textAlign: msg.senderId === user.id ? 'right' : 'left',
              margin: '0.5rem 0'
            }}
          >
            <div style={{
              display: 'inline-block',
              padding: '0.5rem 1rem',
              background: msg.senderId === user.id ? '#d1e7dd' : '#f8d7da',
              borderRadius: '10px'
            }}>
              {msg.content}
              <br />
              <small>{new Date(msg.timestamp).toLocaleTimeString()}</small>
            </div>
          </div>
        ))}
        <div ref={bottomRef}></div>
      </div>

      <div style={{ marginTop: '1rem' }}>
        <input
          type="text"
          value={newMsg}
          onChange={e => setNewMsg(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && sendMessage()}
          placeholder="Type your message..."
          style={{ width: '80%', padding: '0.5rem' }}
        />
        <button onClick={sendMessage} style={{ padding: '0.5rem 1rem' }}>Send</button>
      </div>
    </div>
  );
}
