import { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function Home() {
  const { user, logout } = useContext(AuthContext);
  const [users, setUsers] = useState([]);
  const [requests, setRequests] = useState([]);
  const [contacts, setContacts] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/users');
      setUsers(res.data.users);
      setRequests(res.data.pendingRequests);
      setContacts(res.data.contacts);
    } catch (err) {
      alert('Failed to fetch users');
    }
  };

  const sendRequest = async (targetId) => {
    try {
      await axios.post('http://localhost:5000/api/request/send', { targetUserId: targetId });
      alert('Request sent');
    } catch (err) {
      alert(err.response?.data?.message || 'Error sending request');
    }
  };

  const acceptRequest = async (senderId) => {
    await axios.post('http://localhost:5000/api/request/accept', { senderId });
    fetchAll();
  };

  const rejectRequest = async (senderId) => {
    await axios.post('http://localhost:5000/api/request/reject', { senderId });
    fetchAll();
  };

  const startChat = (id) => {
    navigate(`/chat/${id}`);
  };

  return (
    <div>
      <h2>Welcome, {user.name}</h2>
      <button onClick={logout}>Logout</button>

      <h3>All Users</h3>
      <ul>
        {users.map(u => (
          u._id !== user._id && (
            <li key={u._id}>
              {u.name} ({u.email}) <button onClick={() => sendRequest(u._id)}>Send Request</button>
            </li>
          )
        ))}
      </ul>

      <h3>Pending Requests</h3>
      <ul>
        {requests.map(req => (
          <li key={req._id}>
            {req.name} ({req.email})
            <button onClick={() => acceptRequest(req._id)}>Accept</button>
            <button onClick={() => rejectRequest(req._id)}>Reject</button>
          </li>
        ))}
      </ul>

      <h3>Your Contacts</h3>
      <ul>
        {contacts.map(c => (
          <li key={c._id}>
            {c.name} ({c.email}) <button onClick={() => startChat(c._id)}>Chat</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
