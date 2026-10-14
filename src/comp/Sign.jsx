import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/Sign.css';
import { API_BASE_URL } from '../api';

async function readResponse(response) {
  const body = await response.text();

  if (!body) {
    return {};
  }

  try {
    return JSON.parse(body);
  } catch {
    return { message: body };
  }
}

export default function Sign({ isSignIn = true, initialAccountType = 'USER' }) {
  const navigate = useNavigate();
  const [showSignIn, setShowSignIn] = useState(isSignIn);
  const [accountType, setAccountType] = useState(initialAccountType);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSignIn = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    try {
      const response = await fetch(`${API_BASE_URL}/sign/in`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          username: formData.username,
          password: formData.password
        })
      });

      const data = await readResponse(response);

      if (response.ok) {
        if (!data.token) {
          throw new Error('The server did not return a JWT token');
        }
        if (data.category !== accountType) {
          throw new Error(`This account is not registered as ${accountType.toLowerCase()}`);
        }
        setMessage('Sign in successful! ' + data.message);
        // Store auth info in localStorage
        localStorage.setItem('user', formData.username);
        localStorage.setItem('signId', data.signId.toString());
        localStorage.setItem('token', data.token);
        // Clear form and redirect to the appropriate dashboard
        setFormData({ username: '', password: '' });
        setTimeout(() => navigate(accountType === 'ADMIN' ? '/admin-dashboard' : '/user-dashboard'), 700);
      } else {
        setError(data.message || 'Invalid username or password');
      }
    } catch (err) {
      setError('Error connecting to server: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    try {
      const response = await fetch(`${API_BASE_URL}/sign/up`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          username: formData.username,
          password: formData.password,
          category: 'USER'
        })
      });

      const data = await readResponse(response);

      if (response.ok) {
        setMessage('Sign up successful! ' + data.message);
        // Clear form
        setFormData({ username: '', password: '' });
        // Switch to sign in
        setTimeout(() => setShowSignIn(true), 2000);
      } else {
        setError(data.message || 'Unable to create account');
      }
    } catch (err) {
      setError('Error connecting to server: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="sign-container">
      <div className="sign-card">
        <button className="back-btn" onClick={() => navigate('/')}>
          ← Back to Home
        </button>
        <div className="account-type-tabs" aria-label="Account type">
          <button
            type="button"
            className={`tab ${accountType === 'USER' ? 'active' : ''}`}
            onClick={() => {
              setAccountType('USER');
              setShowSignIn(true);
            }}
          >
            User
          </button>
          <button
            type="button"
            className={`tab ${accountType === 'ADMIN' ? 'active' : ''}`}
            onClick={() => {
              setAccountType('ADMIN');
              setShowSignIn(true);
            }}
          >
            Admin
          </button>
        </div>
        <div className="sign-tabs">
          <button
            className={`tab ${showSignIn ? 'active' : ''}`}
            onClick={() => setShowSignIn(true)}
          >
            Sign In
          </button>
          {accountType === 'USER' && (
            <button
              className={`tab ${!showSignIn ? 'active' : ''}`}
              onClick={() => setShowSignIn(false)}
            >
              Sign Up
            </button>
          )}
        </div>

        <form onSubmit={showSignIn ? handleSignIn : handleSignUp} className="sign-form">
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              placeholder="Enter your username"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder="Enter your password"
              required
            />
          </div>

          <button
            type="submit"
            className="submit-btn"
            disabled={loading}
          >
            {loading ? 'Loading...' : (showSignIn ? 'Sign In' : 'Sign Up')}
          </button>
        </form>

        {message && <div className="message success">{message}</div>}
        {error && <div className="message error">{error}</div>}
      </div>
    </div>
  );
}
