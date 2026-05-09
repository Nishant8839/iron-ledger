import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    try {
      const response = await axios.post('http://localhost:8081/api/auth/login', { username, password });
      login(response.data.token, response.data.username);
      navigate('/');
    } catch (err: any) {
      if (!err.response) {
        setError('Cannot connect to server. Is the backend running on port 8081?');
      } else {
        setError('Invalid username or password.');
      }
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '64px', margin: '0 0 8px 0', textTransform: 'uppercase' }}>
        IRON LEDGER
      </h1>
      <p style={{ fontFamily: 'var(--font-data)', fontSize: '12px', color: 'var(--color-text-muted)', letterSpacing: '2px', margin: '0 0 40px 0' }}>
        ENTER YOUR CREDENTIALS
      </p>

      {error && (
        <div style={{ border: '1px solid #ff3b3b', color: '#ff3b3b', padding: '12px', marginBottom: '20px', width: '100%', maxWidth: '320px', textAlign: 'center', backgroundColor: 'rgba(255,59,59,0.1)' }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', width: '100%', maxWidth: '320px', gap: '16px' }}>
        <input
          type="text"
          className="iron-input"
          placeholder="USERNAME"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <input
          type="password"
          className="iron-input"
          placeholder="PASSWORD"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit" className="iron-btn-primary" style={{ marginTop: '8px' }}>
          LOGIN
        </button>
      </form>

      <div style={{ marginTop: '32px' }}>
        <Link to="/signup" style={{ color: 'var(--color-text-muted)', textDecoration: 'none', fontFamily: 'var(--font-data)', fontSize: '14px' }}>
          No account? Sign up &rarr;
        </Link>
      </div>
    </div>
  );
};

export default Login;
