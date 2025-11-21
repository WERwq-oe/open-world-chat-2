import React, { useState } from 'react';
import axios from 'axios';
import '../styles/main.css';

const Auth = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [formData, setFormData] = useState({
        name: '',
        username: '',
        password: '',
        termsAccepted: false
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3001';

        try {
            if (isLogin) {
                const res = await axios.post(`${SERVER_URL}/api/auth/login`, {
                    username: formData.username,
                    password: formData.password
                });
                localStorage.setItem('user', JSON.stringify(res.data.user));
                window.location.href = '/chat';
            } else {
                if (!formData.termsAccepted) {
                    setError('You must accept the Terms and Conditions');
                    setLoading(false);
                    return;
                }
                await axios.post(`${SERVER_URL}/api/auth/signup`, formData);
                setIsLogin(true);
                setError('');
                alert('Account created! Please log in.');
                setFormData({ name: '', username: '', password: '', termsAccepted: false });
            }
        } catch (err) {
            console.error('Auth error:', err);
            setError(err.response?.data?.message || 'An error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container animate-fade-in">
            <div className="glass-panel auth-card">
                <h2 className="auth-title">
                    {isLogin ? 'Welcome Back' : 'Join the Future'}
                </h2>

                {error && <div className="error-message">{error}</div>}

                <form onSubmit={handleSubmit}>
                    {!isLogin && (
                        <div className="form-group">
                            <label className="form-label">Full Name</label>
                            <input
                                type="text"
                                name="name"
                                className="glass-input"
                                placeholder="Enter your name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    )}

                    <div className="form-group">
                        <label className="form-label">Username</label>
                        <input
                            type="text"
                            name="username"
                            className="glass-input"
                            placeholder="Choose a username"
                            value={formData.username}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Password</label>
                        <input
                            type="password"
                            name="password"
                            className="glass-input"
                            placeholder="Enter your password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    {!isLogin && (
                        <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <input
                                type="checkbox"
                                name="termsAccepted"
                                id="terms"
                                checked={formData.termsAccepted}
                                onChange={handleChange}
                                style={{ accentColor: 'var(--primary-color)' }}
                            />
                            <label htmlFor="terms" style={{ fontSize: '0.85rem', color: 'var(--text-muted)', cursor: 'pointer' }}>
                                I accept the Terms & Conditions
                            </label>
                        </div>
                    )}

                    <button
                        type="submit"
                        className="btn-primary"
                        style={{ width: '100%', marginTop: '10px' }}
                        disabled={loading}
                    >
                        {loading ? 'Processing...' : (isLogin ? 'Log In' : 'Sign Up')}
                    </button>
                </form>

                <div className="switch-auth">
                    {isLogin ? "Don't have an account?" : "Already have an account?"}
                    <span onClick={() => {
                        setIsLogin(!isLogin);
                        setError('');
                        setFormData({ name: '', username: '', password: '', termsAccepted: false });
                    }}>
                        {isLogin ? 'Sign Up' : 'Log In'}
                    </span>
                </div>
            </div>
        </div>
    );
};

export default Auth;
