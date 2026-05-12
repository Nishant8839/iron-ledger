import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 5000;

const sleep = (ms: number) => new Promise((res) => setTimeout(res, ms));

const Signup: React.FC = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [errors, setErrors] = useState<{ username?: string, email?: string, password?: string, confirm?: string, api?: string }>({});
  const [isValid, setIsValid] = useState(false);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    const newErrors: typeof errors = {};

    if (username && (username.length < 3 || username.length > 20)) {
      newErrors.username = 'Username must be 3-20 characters';
    }

    if (password && (password.length < 8 || !/\d/.test(password))) {
      newErrors.password = 'Password must be min 8 chars and contain 1 number';
    }

    if (confirmPassword && password !== confirmPassword) {
      newErrors.confirm = 'Passwords do not match';
    }

    setErrors(newErrors);

    if (username && email && password && confirmPassword && Object.keys(newErrors).length === 0) {
      setIsValid(true);
    } else {
      setIsValid(false);
    }
  }, [username, email, password, confirmPassword]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;

    setErrors({});
    setStatus('');
    setLoading(true);

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        const response = await axios.post(
          'https://iron-ledger-twy4.onrender.com/api/auth/signup',
          { username, email, password },
          { timeout: 15000 }
        );
        login(response.data.token, response.data.username);
        navigate('/');
        return;
      } catch (err: any) {
        if (err.response) {
          // Server responded with an error (e.g. username taken) — don't retry
          const errorMsg = typeof err.response.data === 'string'
            ? err.response.data
            : err.response.data?.message || 'An error occurred during signup';
          setErrors({ api: errorMsg });
          setLoading(false);
          return;
        }
        // No response — server may be cold-starting
        if (attempt < MAX_RETRIES) {
          setStatus(`Server is waking up… retrying (${attempt}/${MAX_RETRIES})`);
          await sleep(RETRY_DELAY_MS);
        } else {
          setErrors({ api: 'Server is unavailable after multiple attempts. Please try again in a minute.' });
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
        CREATE AN ACCOUNT
      </p>

      {errors.api && (
        <div style={{ border: '1px solid #ff3b3b', color: '#ff3b3b', padding: '12px', marginBottom: '20px', width: '100%', maxWidth: '320px', textAlign: 'center', backgroundColor: 'rgba(255,59,59,0.1)' }}>
          {errors.api}
        </div>
      )}

      {status && !errors.api && (
        <div style={{ border: '1px solid var(--color-accent)', color: 'var(--color-accent)', padding: '12px', marginBottom: '20px', width: '100%', maxWidth: '320px', textAlign: 'center', backgroundColor: 'rgba(255,140,0,0.1)', fontFamily: 'var(--font-data)', fontSize: '13px' }}>
          ⏳ {status}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', width: '100%', maxWidth: '320px', gap: '16px' }}>
        <div>
          <input
            type="text"
            className="iron-input"
            placeholder="USERNAME"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            disabled={loading}
            style={{ width: '100%' }}
          />
          {errors.username && <div style={{ color: '#ff3b3b', fontSize: '12px', marginTop: '4px', fontFamily: 'var(--font-data)' }}>{errors.username}</div>}
        </div>

        <div>
          <input
            type="email"
            className="iron-input"
            placeholder="EMAIL"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
            style={{ width: '100%' }}
          />
        </div>

        <div>
          <input
            type="password"
            className="iron-input"
            placeholder="PASSWORD"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={loading}
            style={{ width: '100%' }}
          />
          {errors.password && <div style={{ color: '#ff3b3b', fontSize: '12px', marginTop: '4px', fontFamily: 'var(--font-data)' }}>{errors.password}</div>}
        </div>

        <div>
          <input
            type="password"
            className="iron-input"
            placeholder="CONFIRM PASSWORD"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            disabled={loading}
            style={{ width: '100%' }}
          />
          {errors.confirm && <div style={{ color: '#ff3b3b', fontSize: '12px', marginTop: '4px', fontFamily: 'var(--font-data)' }}>{errors.confirm}</div>}
        </div>

        <button
          type="submit"
          className="iron-btn-primary"
          disabled={!isValid || loading}
          style={{ marginTop: '8px', opacity: (isValid && !loading) ? 1 : 0.5, cursor: (isValid && !loading) ? 'pointer' : 'not-allowed' }}
        >
          {loading ? 'CONNECTING…' : 'SIGN UP'}
        </button>
      </form>

      <div style={{ marginTop: '32px' }}>
        <Link to="/login" style={{ color: 'var(--color-text-muted)', textDecoration: 'none', fontFamily: 'var(--font-data)', fontSize: '14px' }}>
          Have an account? Log in &rarr;
        </Link>
      </div>
    </div>
  );
};

export default Signup;
