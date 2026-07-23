import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Dumbbell, LogIn } from 'lucide-react';

const MAX_RETRIES = 6;
const RETRY_DELAY_MS = 8000;

const sleep = (ms: number) => new Promise((res) => setTimeout(res, ms));

const Login: React.FC = () => {
  const [identifier, setIdentifier] = useState('');
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
        // Auto-detect: if identifier contains '@' treat as email, else as username
        const isEmail = identifier.includes('@');
        const response = await axios.post(
          'https://iron-ledger-twy4.onrender.com/api/auth/login',
          isEmail
            ? { email: identifier, password }
            : { username: identifier, password },
          { timeout: 60000 }
        );
        login(response.data.token, response.data.username);
        navigate('/');
        return;
      } catch (err: any) {
        if (err.response) {
          setError('Invalid username or password.');
          setLoading(false);
          return;
        }
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
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      padding: '24px',
    }}>
      {/* Logo mark */}
      <div style={{ marginBottom: '32px', textAlign: 'center', animation: 'fadeIn 0.4s ease both' }}>
        <div style={{
          width: '64px', height: '64px',
          background: 'linear-gradient(135deg, #C08552 0%, #DAB49D 100%)',
          borderRadius: '18px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 16px',
          boxShadow: '0 8px 24px rgba(192, 133, 82, 0.3)',
        }}>
          <Dumbbell size={30} color="#fff" strokeWidth={2.5} />
        </div>
        <h1 style={{
          fontFamily: 'var(--font-display)',
          fontSize: '36px',
          fontWeight: 900,
          letterSpacing: '-0.02em',
          margin: 0,
          color: 'var(--color-text-primary)',
        }}>
          Iron<span style={{ color: 'var(--color-accent-ember)' }}>Ledger</span>
        </h1>
        <p style={{
          fontFamily: 'var(--font-sans)',
          fontSize: '13px',
          color: 'var(--color-text-muted)',
          margin: '6px 0 0',
          letterSpacing: '0.01em',
        }}>
          Track your strength. Own your progress.
        </p>
      </div>

      {/* Card */}
      <div className="iron-card-static animate-fade-in" style={{
        width: '100%',
        maxWidth: '380px',
        padding: '36px',
        animationDelay: '0.1s',
      }}>
        <h2 style={{
          fontFamily: 'var(--font-display)',
          fontSize: '20px',
          fontWeight: 700,
          color: 'var(--color-text-primary)',
          margin: '0 0 24px',
          letterSpacing: '-0.01em',
        }}>
          Welcome back
        </h2>

        {error && (
          <div style={{
            border: '1px solid #B54A32',
            color: '#B54A32',
            padding: '11px 14px',
            marginBottom: '20px',
            borderRadius: '10px',
            backgroundColor: 'rgba(181,74,50,0.06)',
            fontSize: '13px',
            fontFamily: 'var(--font-sans)',
          }}>
            {error}
          </div>
        )}

        {status && !error && (
          <div style={{
            border: '1px solid var(--color-accent-ember)',
            color: 'var(--color-accent-ember)',
            padding: '11px 14px',
            marginBottom: '20px',
            borderRadius: '10px',
            backgroundColor: 'rgba(192,133,82,0.06)',
            fontSize: '13px',
            fontFamily: 'var(--font-sans)',
          }}>
            ⏳ {status}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={{
              display: 'block',
              fontSize: '12px',
              fontWeight: 600,
              color: 'var(--color-text-secondary)',
              marginBottom: '6px',
              letterSpacing: '0.02em',
            }}>
              Username or Email
            </label>
            <input
              type="text"
              className="iron-input"
              placeholder="Enter username or email"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <div>
            <label style={{
              display: 'block',
              fontSize: '12px',
              fontWeight: 600,
              color: 'var(--color-text-secondary)',
              marginBottom: '6px',
              letterSpacing: '0.02em',
            }}>
              Password
            </label>
            <input
              type="password"
              className="iron-input"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <div style={{ textAlign: 'right', marginTop: '-6px' }}>
            <Link to="/forgot-password" style={{
              color: 'var(--color-accent-ember)',
              textDecoration: 'none',
              fontSize: '12px',
              fontWeight: 500,
            }}>
              Forgot password?
            </Link>
          </div>

          <button
            type="submit"
            className="iron-btn iron-btn-primary"
            style={{
              width: '100%',
              padding: '14px',
              fontSize: '14px',
              marginTop: '8px',
              opacity: loading ? 0.7 : 1,
              cursor: loading ? 'not-allowed' : 'pointer',
              fontWeight: 700,
            }}
            disabled={loading}
          >
            <LogIn size={16} />
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>
      </div>

      {/* Footer link */}
      <p style={{
        marginTop: '24px',
        fontSize: '13px',
        color: 'var(--color-text-muted)',
        fontFamily: 'var(--font-sans)',
      }}>
        No account?{' '}
        <Link to="/signup" style={{
          color: 'var(--color-accent-ember)',
          textDecoration: 'none',
          fontWeight: 600,
        }}>
          Create one →
        </Link>
      </p>
    </div>
  );
};

export default Login;
