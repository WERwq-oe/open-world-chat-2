import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Auth = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [formData, setFormData] = useState({
        name: '',
        username: '',
        password: '',
        termsAccepted: false
    });
    const [error, setError] = useState('');
    const navigate = useNavigate();

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

        try {
            if (isLogin) {
                const res = await axios.post('http://localhost:3001/api/auth/login', {
                    username: formData.username,
                    password: formData.password
                });
                localStorage.setItem('user', JSON.stringify(res.data.user));
                window.location.href = '/chat'; // Force reload to update App state
            } else {
                if (!formData.termsAccepted) {
                    setError('You must accept the Terms and Conditions');
                    return;
                }
                await axios.post('http://localhost:3001/api/auth/signup', formData);
                setIsLogin(true);
                setError('Account created! Please log in.');
                setFormData({ name: '', username: '', password: '', termsAccepted: false });
            }
        } catch (err) {
            setError(err.response?.data?.message || 'An error occurred');
        }
    };

    return (
        <div className="container">
            <div className="glass-panel">
                <h1>{isLogin ? 'Welcome Back' : 'Join the Chat'}</h1>
                {error && <div style={{ color: '#ff6b6b', marginBottom: '10px', textAlign: 'center' }}>{error}</div>}

                <form onSubmit={handleSubmit}>
                    {!isLogin && (
                        <input
                            type="text"
                            name="name"
                            placeholder="Full Name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                        />
                    )}
                    <input
                        type="text"
                        name="username"
                        placeholder="Username"
                        value={formData.username}
                        onChange={handleChange}
                        required
                    />
                    <input
                        type="password"
                        name="password"
                        placeholder="Password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                    />

                    {!isLogin && (
                        <div style={{ margin: '10px 0', fontSize: '0.9rem' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                                <input
                                    type="checkbox"
                                    name="termsAccepted"
                                    checked={formData.termsAccepted}
                                    onChange={handleChange}
                                    style={{ width: 'auto', margin: 0 }}
                                />
                                I accept the Terms and Conditions
                            </label>
                        </div>
                    )}

                    <button type="submit">{isLogin ? 'Sign In' : 'Sign Up'}</button>
                </form>

                <div className="switch-auth">
                    {isLogin ? "Don't have an account? " : "Already have an account? "}
                    <span onClick={() => { setIsLogin(!isLogin); setError(''); }}>
                        {isLogin ? 'Sign Up' : 'Sign In'}
                    </span>
                </div>
            </div>
        </div>
    );
};

export default Auth;
