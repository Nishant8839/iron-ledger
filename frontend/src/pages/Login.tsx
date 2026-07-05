import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const MAX_RETRIES = 6;
const RETRY_DELAY_MS = 8000;

const sleep = (ms: number) => new Promise((res) => setTimeout(res, ms));

const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setStatus('');
    setLoading(true);

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        const response = await axios.post(
          'https://iron-ledger-twy4.onrender.com/api/auth/login',
          { username, password },
          { timeout: 20000 }
        );
        login(response.data.token, response.data.username);
        navigate('/');
        return;
      } catch (err: any) {
        if (err.response) {
          // Server responded — wrong credentials, don't retry
          setError('Invalid username or password.');
          setLoading(false);
          return;
        }
        // No response — server may be cold-starting
        if (attempt < MAX_RETRIES) {
          setStatus(`Server is waking up… retrying (${attempt}/${MAX_RETRIES})`);
          await sleep(RETRY_DELAY_MS);
        } else {
          setError('Server is unavailable after multiple attempts. Please try again in a minute.');
        }
      }
    }

    setLoading(false);
    setStatus('');
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

      {status && !error && (
        <div style={{ border: '1px solid var(--color-accent)', color: 'var(--color-accent)', padding: '12px', marginBottom: '20px', width: '100%', maxWidth: '320px', textAlign: 'center', backgroundColor: 'rgba(255,140,0,0.1)', fontFamily: 'var(--font-data)', fontSize: '13px' }}>
          ⏳ {status}
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
          disabled={loading}
        />
        <input
          type="password"
          className="iron-input"
          placeholder="PASSWORD"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          disabled={loading}
        />
        <button
          type="submit"
          className="iron-btn-primary"
          style={{ marginTop: '8px', opacity: loading ? 0.7 : 1, cursor: loading ? 'not-allowed' : 'pointer' }}
          disabled={loading}
        >
          {loading ? 'CONNECTING…' : 'LOGIN'}
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
