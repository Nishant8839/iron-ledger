import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Dumbbell, UserPlus } from 'lucide-react';

const MAX_RETRIES = 6;
const RETRY_DELAY_MS = 8000;

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
      newErrors.username = 'Username must be 3–20 characters';
    }

    if (password && (password.length < 8 || !/\d/.test(password))) {
      newErrors.password = 'Min 8 characters, include at least 1 number';
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
          { timeout: 60000 }
        );
        login(response.data.token, response.data.username);
        navigate('/');
        return;
      } catch (err: any) {
        if (err.response) {
          const errorMsg = typeof err.response.data === 'string'
            ? err.response.data
            : err.response.data?.message || 'An error occurred during signup';
          setErrors({ api: errorMsg });
          setLoading(false);
          return;
        }
        if (attempt < MAX_RETRIES) {
          setStatus(`Server is waking up… retrying (${attempt}/${MAX_RETRIES})`);
          await sleep(RETRY_DELAY_MS);
        } else {
          setErrors({ api: 'Server is unavailable. Please try again in a minute.' });
        }
      }
    }

    setLoading(false);
    setStatus('');
  };

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: '12px',
    fontWeight: 600,
    color: 'var(--color-text-secondary)',
    marginBottom: '6px',
    letterSpacing: '0.02em',
  };

  const errorStyle: React.CSSProperties = {
    color: '#B54A32',
    fontSize: '11px',
    marginTop: '5px',
    fontFamily: 'var(--font-sans)',
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
      <div style={{ marginBottom: '28px', textAlign: 'center', animation: 'fadeIn 0.4s ease both' }}>
        <div style={{
          width: '56px', height: '56px',
          background: 'linear-gradient(135deg, #C08552 0%, #DAB49D 100%)',
          borderRadius: '16px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 12px',
          boxShadow: '0 8px 24px rgba(192, 133, 82, 0.3)',
        }}>
          <Dumbbell size={26} color="#fff" strokeWidth={2.5} />
        </div>
        <h1 style={{
          fontFamily: 'var(--font-display)',
          fontSize: '32px',
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
        }}>
          Start building your strength record.
        </p>
      </div>

      {/* Card */}
      <div className="iron-card-static animate-fade-in" style={{
        width: '100%',
        maxWidth: '400px',
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
          Create your account
        </h2>

        {errors.api && (
          <div style={{
            border: '1px solid #B54A32',
            color: '#B54A32',
            padding: '11px 14px',
            marginBottom: '20px',
            borderRadius: '10px',
            backgroundColor: 'rgba(181,74,50,0.06)',
            fontSize: '13px',
          }}>
            {errors.api}
          </div>
        )}

        {status && !errors.api && (
          <div style={{
            border: '1px solid var(--color-accent-ember)',
            color: 'var(--color-accent-ember)',
            padding: '11px 14px',
            marginBottom: '20px',
            borderRadius: '10px',
            backgroundColor: 'rgba(192,133,82,0.06)',
            fontSize: '13px',
          }}>
            ⏳ {status}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={labelStyle}>Username</label>
            <input
              type="text"
              className="iron-input"
              placeholder="Choose a username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              disabled={loading}
            />
            {errors.username && <div style={errorStyle}>{errors.username}</div>}
          </div>

          <div>
            <label style={labelStyle}>Email</label>
            <input
              type="email"
              className="iron-input"
              placeholder="Your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <div>
            <label style={labelStyle}>Password</label>
            <input
              type="password"
              className="iron-input"
              placeholder="Min 8 chars, include a number"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
            />
            {errors.password && <div style={errorStyle}>{errors.password}</div>}
          </div>

          <div>
            <label style={labelStyle}>Confirm Password</label>
            <input
              type="password"
              className="iron-input"
              placeholder="Repeat your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              disabled={loading}
            />
            {errors.confirm && <div style={errorStyle}>{errors.confirm}</div>}
          </div>

          <button
            type="submit"
            className="iron-btn iron-btn-primary"
            disabled={!isValid || loading}
            style={{
              width: '100%',
              padding: '14px',
              fontSize: '14px',
              marginTop: '8px',
              opacity: (isValid && !loading) ? 1 : 0.5,
              cursor: (isValid && !loading) ? 'pointer' : 'not-allowed',
              fontWeight: 700,
            }}
          >
            <UserPlus size={16} />
            {loading ? 'Creating account…' : 'Create Account'}
          </button>
        </form>
      </div>

      {/* Footer */}
      <p style={{
        marginTop: '24px',
        fontSize: '13px',
        color: 'var(--color-text-muted)',
        fontFamily: 'var(--font-sans)',
      }}>
        Already have an account?{' '}
        <Link to="/login" style={{
          color: 'var(--color-accent-ember)',
          textDecoration: 'none',
          fontWeight: 600,
        }}>
          Sign in →
        </Link>
      </p>
    </div>
  );
};

export default Signup;
