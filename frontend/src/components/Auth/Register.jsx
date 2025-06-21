import { useState, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Register.css'; // Import the CSS file

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await axios.post('https://talkingme-lh3n.onrender.com/auth/register', form);
      login(res.data.user, res.data.token);
      navigate('/');
    } catch (err) {
      alert(err.response?.data?.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="register-container">
      <div className="register-card">
        <div className="register-header">
          <h2>Create Account</h2>
          <p>Join our community by filling out the form below</p>
        </div>
        
        <form onSubmit={handleSubmit} className="register-form">
          <div className="input-group">
            <label htmlFor="name">Full Name</label>
            <input 
              id="name"
              name="name" 
              type="text" 
              placeholder="Enter your full name" 
              onChange={handleChange} 
              required 
            />
            <span className="input-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
            </span>
          </div>
          
          <div className="input-group">
            <label htmlFor="email">Email</label>
            <input 
              id="email"
              name="email" 
              type="email" 
              placeholder="Enter your email" 
              onChange={handleChange} 
              required 
            />
            <span className="input-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                <polyline points="22,6 12,13 2,6"></polyline>
              </svg>
            </span>
          </div>
          
          <div className="input-group">
            <label htmlFor="password">Password</label>
            <input 
              id="password"
              name="password" 
              type="password" 
              placeholder="Create a password" 
              onChange={handleChange} 
              required 
            />
            <span className="input-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
            </span>
          </div>
          
          <button type="submit" className="register-button" disabled={isLoading}>
            {isLoading ? (
              <span className="spinner"></span>
            ) : (
              'Create Account'
            )}
          </button>
          
          <div className="register-footer">
            <p>Already have an account? <a href="/login">Sign in</a></p>
          </div>
        </form>
      </div>
      
      <div className="register-decoration">
        <div className="deco-circle deco-1"></div>
        <div className="deco-circle deco-2"></div>
        <div className="deco-circle deco-3"></div>
      </div>
    </div>
  );
}