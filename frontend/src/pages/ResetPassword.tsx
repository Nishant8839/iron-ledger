import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { Dumbbell, Lock, ArrowLeft, CheckCircle } from 'lucide-react';

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
            setError('Invalid or missing reset token. Please request a new link.');
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

        if (newPassword.length < 6) {
            setError('Password must be at least 6 characters long.');
            return;
        }

        setLoading(true);

        try {
            // Use the dynamic env variable instead of a hardcoded URL
            const apiUrl = import.meta.env.VITE_API_URL || 'https://iron-ledger-twy4.onrender.com';
            const response = await axios.post(`${apiUrl}/api/auth/reset-password`,
                { token, newPassword },
                { timeout: 60000 }
            );
            setMessage(response.data);
        } catch (err: any) {
            if (err.response?.data) {
                const data = err.response.data;
                setError(typeof data === 'string' ? data : (data.message || 'Failed to reset password.'));
            } else {
                setError('Network error. Please try again.');
            }
        } finally {
            setLoading(false);
        }
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
            {/* Logo */}
            <div style={{ marginBottom: '32px', textAlign: 'center', animation: 'fadeIn 0.4s ease both' }}>
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
            </div>

            {/* Card */}
            <div className="iron-card-static animate-fade-in" style={{
                width: '100%',
                maxWidth: '380px',
                padding: '36px',
                animationDelay: '0.1s',
            }}>
                {message ? (
                    /* Success state */
                    <div style={{ textAlign: 'center' }}>
                        <div style={{
                            width: '56px', height: '56px',
                            background: 'rgba(122, 154, 109, 0.12)',
                            borderRadius: '50%',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            margin: '0 auto 16px',
                        }}>
                            <CheckCircle size={28} color="#7A9A6D" />
                        </div>
                        <h2 style={{
                            fontFamily: 'var(--font-display)',
                            fontSize: '20px',
                            fontWeight: 700,
                            color: 'var(--color-text-primary)',
                            margin: '0 0 12px',
                        }}>
                            Password Reset!
                        </h2>
                        <p style={{
                            fontSize: '14px',
                            color: 'var(--color-text-secondary)',
                            lineHeight: 1.6,
                            margin: '0 0 24px',
                        }}>
                            {message}
                        </p>
                        <Link to="/login" className="iron-btn iron-btn-primary" style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '6px',
                            textDecoration: 'none',
                            fontWeight: 600,
                            fontSize: '14px',
                            padding: '12px',
                            width: '100%'
                        }}>
                            Go to Sign In
                        </Link>
                    </div>
                ) : (
                    /* Form state */
                    <>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                            <div style={{
                                width: '40px', height: '40px',
                                background: 'rgba(192, 133, 82, 0.1)',
                                borderRadius: '10px',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                flexShrink: 0,
                            }}>
                                <Lock size={18} color="var(--color-accent-ember)" />
                            </div>
                            <div>
                                <h2 style={{
                                    fontFamily: 'var(--font-display)',
                                    fontSize: '20px',
                                    fontWeight: 700,
                                    color: 'var(--color-text-primary)',
                                    margin: 0,
                                    letterSpacing: '-0.01em',
                                }}>
                                    Set New Password
                                </h2>
                                <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', margin: '2px 0 0' }}>
                                    Create a secure password below.
                                </p>
                            </div>
                        </div>

                        {error && (
                            <div style={{
                                border: '1px solid #B54A32',
                                color: '#B54A32',
                                padding: '11px 14px',
                                marginBottom: '20px',
                                borderRadius: '10px',
                                backgroundColor: 'rgba(181,74,50,0.06)',
                                fontSize: '13px',
                            }}>
                                {error}
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
                                    New Password
                                </label>
                                <input
                                    type="password"
                                    className="iron-input"
                                    placeholder="Enter new password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    required
                                    disabled={loading || !token}
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
                                    Confirm Password
                                </label>
                                <input
                                    type="password"
                                    className="iron-input"
                                    placeholder="Repeat new password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                    disabled={loading || !token}
                                />
                            </div>

                            <button
                                type="submit"
                                className="iron-btn iron-btn-primary"
                                disabled={loading || !token}
                                style={{
                                    width: '100%',
                                    padding: '14px',
                                    fontSize: '14px',
                                    marginTop: '4px',
                                    fontWeight: 700,
                                    opacity: (loading || !token) ? 0.7 : 1,
                                    cursor: (loading || !token) ? 'not-allowed' : 'pointer',
                                }}
                            >
                                {loading ? 'Resetting…' : 'Reset Password'}
                            </button>
                        </form>
                    </>
                )}
            </div>
            
            {/* Footer */}
            <p style={{
                marginTop: '24px',
                fontSize: '13px',
                color: 'var(--color-text-muted)',
            }}>
                <Link to="/login" style={{
                    color: 'var(--color-accent-ember)',
                    textDecoration: 'none',
                    fontWeight: 600,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                }}>
                    <ArrowLeft size={13} /> Back to Sign In
                </Link>
            </p>
        </div>
    );
};

export default ResetPassword;
