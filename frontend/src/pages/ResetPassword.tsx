import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import axios from 'axios';
//import '../styles/auth.css';

const ResetPassword = () => {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');

    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!token) {
            setError('Invalid or missing reset token.');
        }
    }, [token]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setMessage('');

        if (newPassword !== confirmPassword) {
            setError('Passwords do not match!');
            return;
        }

        setLoading(true);

        try {
            const response = await axios.post('https://iron-ledger-backend.onrender.com/api/auth/reset-password',
                { token, newPassword },
                { timeout: 60000 }
            );
            setMessage(response.data);
        } catch (err: any) {
            setError(err.response?.data || 'Failed to reset password.');
        } finally {
            setLoading(false);
        }
    };

    if (!token) {
        return (
            <div className="auth-container">
                <div className="auth-box glassmorphism">
                    <h2>Error</h2>
                    <p style={{ color: '#ef4444', textAlign: 'center' }}>{error}</p>
                    <p className="auth-footer"><Link to="/login">Go to Login</Link></p>
                </div>
            </div>
        );
    }

    return (
        <div className="auth-container">
            <div className="auth-box glassmorphism">
                <h2>Set New Password</h2>

                {message ? (
                    <div style={{ textAlign: 'center' }}>
                        <p style={{ color: '#4ade80', marginBottom: '20px' }}>{message}</p>
                        <Link to="/login" className="auth-button" style={{ display: 'block', textDecoration: 'none', textAlign: 'center' }}>Log in now</Link>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit}>
                        <div className="input-group">
                            <input
                                type="password"
                                placeholder="New Password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                required
                                minLength={6}
                            />
                        </div>

                        <div className="input-group">
                            <input
                                type="password"
                                placeholder="Confirm New Password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                                minLength={6}
                            />
                        </div>

                        {error && <p style={{ color: '#d28d3fff', marginBottom: '15px', fontSize: '14px', textAlign: 'center' }}>{error}</p>}

                        <button type="submit" className="auth-button" disabled={loading}>
                            {loading ? 'Resetting...' : 'Reset Password'}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
};

export default ResetPassword;
