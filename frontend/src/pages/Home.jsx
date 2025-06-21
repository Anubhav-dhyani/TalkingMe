import { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Home.css';

export default function Home() {
  const { user, logout } = useContext(AuthContext);
  const [users, setUsers] = useState([]);
  const [requests, setRequests] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [activeTab, setActiveTab] = useState('contacts');
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    try {
      setIsLoading(true);
      const res = await axios.get('https://talkingme-lh3n.onrender.com/api/users');
      setUsers(res.data.users);
      setRequests(res.data.pendingRequests);
      setContacts(res.data.contacts);
    } catch (err) {
      alert('Failed to fetch users');
    } finally {
      setIsLoading(false);
    }
  };

  const sendRequest = async (targetId) => {
    try {
      await axios.post('https://talkingme-lh3n.onrender.com/api/request/send', { targetUserId: targetId });
      fetchAll();
    } catch (err) {
      alert(err.response?.data?.message || 'Error sending request');
    }
  };

  const acceptRequest = async (senderId) => {
    try {
      await axios.post('https://talkingme-lh3n.onrender.com/api/request/accept', { senderId });
      fetchAll();
    } catch (err) {
      alert(err.response?.data?.message || 'Error accepting request');
    }
  };

  const rejectRequest = async (senderId) => {
    try {
      await axios.post('https://talkingme-lh3n.onrender.com/api/request/reject', { senderId });
      fetchAll();
    } catch (err) {
      alert(err.response?.data?.message || 'Error rejecting request');
    }
  };

  const startChat = (id) => {
    navigate(`/chat/${id}`);
  };

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <div className="dashboard-sidebar">
        <div className="sidebar-header">
          <div className="user-avatar">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div className="user-info">
            <h3>{user.name}</h3>
            <p>{user.email}</p>
          </div>
        </div>

        <nav className="sidebar-nav">
          <button 
            className={`nav-item ${activeTab === 'contacts' ? 'active' : ''}`}
            onClick={() => setActiveTab('contacts')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            </svg>
            Contacts
          </button>
          
          <button 
            className={`nav-item ${activeTab === 'requests' ? 'active' : ''}`}
            onClick={() => setActiveTab('requests')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
            </svg>
            Requests
            {requests.length > 0 && <span className="badge">{requests.length}</span>}
          </button>
          
          <button 
            className={`nav-item ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => setActiveTab('users')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            </svg>
            All Users
          </button>
        </nav>

        <button className="logout-button" onClick={logout}>
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
            <polyline points="16 17 21 12 16 7"></polyline>
            <line x1="21" y1="12" x2="9" y2="12"></line>
          </svg>
          Logout
        </button>
      </div>

      {/* Main Content */}
      <div className="dashboard-content">
        {isLoading ? (
          <div className="loading-spinner">
            <div className="spinner"></div>
          </div>
        ) : (
          <>
            <header className="content-header">
              <h2>
                {activeTab === 'contacts' && 'Your Contacts'}
                {activeTab === 'requests' && 'Pending Requests'}
                {activeTab === 'users' && 'All Users'}
              </h2>
            </header>

            <div className="content-body">
              {activeTab === 'contacts' && (
                <div className="contacts-grid">
                  {contacts.length > 0 ? (
                    contacts.map(c => (
                      <div key={c._id} className="contact-card">
                        <div className="contact-avatar">
                          {c.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="contact-info">
                          <h3>{c.name}</h3>
                          <p>{c.email}</p>
                        </div>
                        <button 
                          className="chat-button"
                          onClick={() => startChat(c._id)}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                          </svg>
                          Chat
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="empty-state">
                      <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                        <circle cx="9" cy="7" r="4"></circle>
                        <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                        <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                      </svg>
                      <h3>No contacts yet</h3>
                      <p>Connect with other users to start chatting</p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'requests' && (
                <div className="requests-list">
                  {requests.length > 0 ? (
                    requests.map(req => (
                      <div key={req._id} className="request-card">
                        <div className="request-avatar">
                          {req.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="request-info">
                          <h3>{req.name}</h3>
                          <p>{req.email}</p>
                        </div>
                        <div className="request-actions">
                          <button 
                            className="accept-button"
                            onClick={() => acceptRequest(req._id)}
                          >
                            Accept
                          </button>
                          <button 
                            className="reject-button"
                            onClick={() => rejectRequest(req._id)}
                          >
                            Reject
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="empty-state">
                      <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                        <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                      </svg>
                      <h3>No pending requests</h3>
                      <p>When you receive connection requests, they'll appear here</p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'users' && (
                <div className="users-grid">
                  {users.filter(u => u._id !== user._id).map(u => (
                    <div key={u._id} className="user-card">
                      <div className="user-avatar">
                        {u.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="user-info">
                        <h3>{u.name}</h3>
                        <p>{u.email}</p>
                      </div>
                      <button 
                        className="request-button"
                        onClick={() => sendRequest(u._id)}
                      >
                        Connect
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}