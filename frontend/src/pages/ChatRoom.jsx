import { useContext, useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import io from 'socket.io-client';
import axios from 'axios';
import './ChatRoom.css';

// Initialize socket connection
const socket = io('https://talkingme-lh3n.onrender.com', {
  transports: ['websocket'],
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
});

// SVG Icons (all self-contained)
const SearchIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>;
const MoreVerticalIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/></svg>;
const PaperclipIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>;
const MicIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>;
const SmileIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>;
const CheckIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>;
const CheckDoubleIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="17 6 12 11 7 6"/><polyline points="17 13 12 18 7 13"/></svg>;
const ReplyIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 17 4 12 9 7"/><path d="M20 18v-2a4 4 0 0 0-4-4H4"/></svg>;
const SendIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>;
const MessageIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>;

export default function ChatRoom() {
  const { user, logout } = useContext(AuthContext);
  const { id: receiverId } = useParams();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [newMsg, setNewMsg] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [typingUser, setTypingUser] = useState('');
  const [receiver, setReceiver] = useState(null);
  const [onlineStatus, setOnlineStatus] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  // Socket connection setup
  useEffect(() => {
    const handleConnect = () => {
      console.log('✅ Socket connected:', socket.id);
      socket.emit('register', user.id);
    };

    const handleUserStatus = ({ userId, isOnline }) => {
      if (userId === receiverId) setOnlineStatus(isOnline);
    };

    socket.on('connect', handleConnect);
    socket.on('user-status', handleUserStatus);

    return () => {
      socket.off('connect', handleConnect);
      socket.off('user-status', handleUserStatus);
    };
  }, [receiverId, user.id]);

  // Chat room setup
  useEffect(() => {
    socket.emit('join-room', { userId: user.id, otherUserId: receiverId });

    const handleReceiveMessage = (msg) => {
      setMessages(prev => [...prev, { ...msg, status: 'delivered' }]);
    };

    const handleTypingStart = (userId) => {
      if (userId !== user.id) {
        setIsTyping(true);
        setTypingUser(receiver?.name || 'Someone');
      }
    };

    const handleTypingStop = () => setIsTyping(false);
    const handleMessageRead = (messageId) => {
      setMessages(prev => prev.map(msg => 
        msg._id === messageId ? { ...msg, status: 'read' } : msg
      ));
    };

    socket.on('receive-message', handleReceiveMessage);
    socket.on('typing-start', handleTypingStart);
    socket.on('typing-stop', handleTypingStop);
    socket.on('message-read', handleMessageRead);

    fetchMessages();
    fetchReceiver();

    return () => {
      socket.off('receive-message', handleReceiveMessage);
      socket.off('typing-start', handleTypingStart);
      socket.off('typing-stop', handleTypingStop);
      socket.off('message-read', handleMessageRead);
    };
  }, [receiverId, user.id, receiver?.name]);

  // Data fetching functions
  const fetchMessages = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`https://talkingme-lh3n.onrender.com/api/chat/${receiverId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessages(res.data.messages || []);
      markMessagesAsRead(res.data.messages);
    } catch (err) {
      console.error('Failed to load messages:', err);
    }
  };

  const fetchReceiver = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`https://talkingme-lh3n.onrender.com/api/users/${receiverId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setReceiver(res.data.user);
      checkOnlineStatus(res.data.user._id);
    } catch (err) {
      console.error('Failed to fetch receiver:', err);
    }
  };

  const checkOnlineStatus = (userId) => {
    socket.emit('check-status', userId, (isOnline) => {
      setOnlineStatus(isOnline);
    });
  };

  const markMessagesAsRead = (messages) => {
    const unreadMessages = messages?.filter(
      msg => msg.receiverId === user.id && msg.status !== 'read'
    ) || [];
    
    if (unreadMessages.length > 0) {
      socket.emit('mark-read', {
        messageIds: unreadMessages.map(msg => msg._id),
        senderId: receiverId
      });
    }
  };

  // Message handling functions
  const handleTyping = () => {
    if (!socket.connected) return;
    newMsg.trim() 
      ? socket.emit('typing-start', receiverId)
      : socket.emit('typing-stop', receiverId);
  };

  const sendMessage = () => {
    if (!newMsg.trim()) return;

    const msgData = {
      senderId: user.id,
      receiverId,
      content: newMsg,
      status: 'sent',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, msgData]);
    socket.emit('send-message', msgData);
    socket.emit('typing-stop', receiverId);
    setNewMsg('');
    inputRef.current.focus();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Auto-scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Render function for message status
  const renderMessageStatus = (status) => {
    switch (status) {
      case 'sent': return <CheckIcon className="status-icon" />;
      case 'delivered': return <CheckDoubleIcon className="status-icon" />;
      case 'read': return <CheckDoubleIcon className="status-icon read" />;
      default: return null;
    }
  };

  return (
    <div className="chat-container">
      {/* Chat Header */}
      <div className="chat-header">
        <div className="header-left">
          <button className="back-button" onClick={() => navigate(-1)}>
            &larr;
          </button>
          <div className="chat-avatar">
            {receiver?.name.charAt(0).toUpperCase()}
            {onlineStatus && <span className="online-badge"></span>}
          </div>
          <div className="chat-info">
            <h3>{receiver?.name || 'Loading...'}</h3>
            <p>
              {isTyping ? (
                <span className="typing-indicator">
                  <span className="typing-dot"></span>
                  <span className="typing-dot"></span>
                  <span className="typing-dot"></span>
                  {typingUser} is typing...
                </span>
              ) : onlineStatus ? 'online' : 'offline'}
            </p>
          </div>
        </div>
        <div className="header-right">
          <button className="icon-button">
            <SearchIcon />
          </button>
          <button className="icon-button" onClick={() => setShowMenu(!showMenu)}>
            <MoreVerticalIcon />
          </button>
          {showMenu && (
            <div className="dropdown-menu">
              <button onClick={() => navigate(`/profile/${receiverId}`)}>View Profile</button>
              <button onClick={() => alert('Notifications muted')}>Mute</button>
              <button onClick={logout}>Logout</button>
            </div>
          )}
        </div>
      </div>

      {/* Chat Messages */}
      <div className="chat-messages">
        {messages.length > 0 ? (
          messages.map((msg, index) => (
            <div
              key={index}
              className={`message ${msg.senderId === user.id ? 'sent' : 'received'}`}
            >
              <div className="message-content">
                {msg.content}
                <div className="message-footer">
                  <span className="message-time">
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  {msg.senderId === user.id && (
                    <span className="message-status">
                      {renderMessageStatus(msg.status)}
                    </span>
                  )}
                </div>
              </div>
              <button className="message-options">
                <ReplyIcon />
              </button>
            </div>
          ))
        ) : (
          <div className="empty-chat">
            <div className="empty-icon">
              <MessageIcon />
            </div>
            <h3>No messages yet</h3>
            <p>Say hello to start the conversation</p>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Chat Input */}
      <div className="chat-input-container">
        <button className="attachment-button">
          <PaperclipIcon />
        </button>
        <button className="emoji-button">
          <SmileIcon />
        </button>
        <div className="input-wrapper">
          <textarea
            ref={inputRef}
            value={newMsg}
            onChange={(e) => {
              setNewMsg(e.target.value);
              handleTyping();
            }}
            onKeyDown={handleKeyDown}
            onBlur={() => socket.emit('typing-stop', receiverId)}
            placeholder="Type a message"
            rows="1"
          />
        </div>
        {newMsg.trim() ? (
          <button className="send-button" onClick={sendMessage}>
            <SendIcon />
          </button>
        ) : (
          <button className="voice-button">
            <MicIcon />
          </button>
        )}
      </div>
    </div>
  );
}