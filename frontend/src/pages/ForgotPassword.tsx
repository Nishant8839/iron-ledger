import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Dumbbell, Mail, ArrowLeft, CheckCircle } from 'lucide-react';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [sent, setSent] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            await axios.post('https://iron-ledger-twy4.onrender.com/api/auth/forgot-password', { email }, {
                timeout: 60000
            });
            setSent(true);
        } catch (err: any) {
            if (err.response?.data) {
                const data = err.response.data;
                setError(typeof data === 'string' ? data : (data.message || 'Something went wrong.'));
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
                {sent ? (
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
                            Check your email
                        </h2>
                        <p style={{
                            fontSize: '14px',
                            color: 'var(--color-text-secondary)',
                            lineHeight: 1.6,
                            margin: '0 0 24px',
                        }}>
                            If <strong>{email}</strong> is registered, we've sent a password reset link. Check your inbox (and spam folder).
                        </p>
                        <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', margin: '0 0 24px' }}>
                            The link expires in <strong>15 minutes</strong>.
                        </p>
                        <Link to="/login" style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            color: 'var(--color-accent-ember)',
                            textDecoration: 'none',
                            fontWeight: 600,
                            fontSize: '14px',
                        }}>
                            <ArrowLeft size={14} /> Back to Sign In
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
                                <Mail size={18} color="var(--color-accent-ember)" />
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
                                    Forgot password?
                                </h2>
                                <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', margin: '2px 0 0' }}>
                                    We'll send a reset link to your email.
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
                                    Email Address
                                </label>
                                <input
                                    type="email"
                                    className="iron-input"
                                    placeholder="Enter your registered email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    disabled={loading}
                                />
                            </div>

                            <button
                                type="submit"
                                className="iron-btn iron-btn-primary"
                                disabled={loading}
                                style={{
                                    width: '100%',
                                    padding: '14px',
                                    fontSize: '14px',
                                    marginTop: '4px',
                                    fontWeight: 700,
                                    opacity: loading ? 0.7 : 1,
                                    cursor: loading ? 'not-allowed' : 'pointer',
                                }}
                            >
                                <Mail size={16} />
                                {loading ? 'Sending…' : 'Send Reset Link'}
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

export default ForgotPassword;
