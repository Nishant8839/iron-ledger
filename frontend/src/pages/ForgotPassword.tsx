import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');
        setError('');

        try {
            const response = await axios.post('https://iron-ledger-twy4.onrender.com/api/auth/forgot-password', { email }, {
                timeout: 60000
            });
            setMessage(response.data);
        } catch (err: any) {
            setError(err.response?.data || 'Failed to send reset link. Try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '48px', margin: '0 0 8px 0', textTransform: 'uppercase' }}>
                FORGOT PASSWORD
            </h1>
            <p style={{ fontFamily: 'var(--font-data)', fontSize: '12px', color: 'var(--color-text-muted)', letterSpacing: '1px', margin: '0 0 40px 0', textAlign: 'center' }}>
                ENTER YOUR EMAIL TO RESET
            </p>

            {error && (
                <div style={{ border: '1px solid #ff3b3b', color: '#ff3b3b', padding: '12px', marginBottom: '20px', width: '100%', maxWidth: '320px', textAlign: 'center', backgroundColor: 'rgba(255,59,59,0.1)' }}>
                    {error}
                </div>
            )}

            {message && (
                <div style={{ border: '1px solid var(--color-accent)', color: 'var(--color-accent)', padding: '12px', marginBottom: '20px', width: '100%', maxWidth: '320px', textAlign: 'center', backgroundColor: 'rgba(255,140,0,0.1)', fontFamily: 'var(--font-data)', fontSize: '13px' }}>
                    {message}
                </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', width: '100%', maxWidth: '320px', gap: '16px' }}>
                <input
                    type="email"
                    className="iron-input"
                    placeholder="EMAIL ADDRESS"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loading}
                />

                <button
                    type="submit"
                    className="iron-btn-primary"
                    style={{ marginTop: '8px', opacity: loading ? 0.7 : 1, cursor: loading ? 'not-allowed' : 'pointer' }}
                    disabled={loading}
                >
                    {loading ? 'SENDING...' : 'SEND RESET LINK'}
                </button>
            </form>

            <div style={{ marginTop: '32px' }}>
                <Link to="/login" style={{ color: 'var(--color-text-muted)', textDecoration: 'none', fontFamily: 'var(--font-data)', fontSize: '14px' }}>
                    Remember password? Log in &rarr;
                </Link>
            </div>
        </div>
    );
};

export default ForgotPassword;
