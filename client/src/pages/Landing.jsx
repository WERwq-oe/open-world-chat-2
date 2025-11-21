import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/main.css';

const Landing = () => {
    const navigate = useNavigate();

    return (
        <div className="hero-section animate-fade-in">
            <div className="glass-panel" style={{ padding: '60px', maxWidth: '800px' }}>
                <h1 className="hero-title">Open World Chat</h1>
                <p className="hero-subtitle">
                    Experience the future of communication.
                    Seamless, secure, and beautifully designed for the modern web.
                </p>
                <button
                    className="btn-primary"
                    style={{ fontSize: '1.2rem', padding: '15px 40px' }}
                    onClick={() => navigate('/auth')}
                >
                    Get Started
                </button>
            </div>

            <div style={{ marginTop: '40px', display: 'flex', gap: '20px' }}>
                <div className="glass-panel" style={{ padding: '20px', width: '200px' }}>
                    <h3 style={{ color: 'var(--primary-color)', marginBottom: '10px' }}>Real-time</h3>
                    <p style={{ color: 'var(--text-muted)' }}>Instant messaging with zero latency.</p>
                </div>
                <div className="glass-panel" style={{ padding: '20px', width: '200px' }}>
                    <h3 style={{ color: 'var(--secondary-color)', marginBottom: '10px' }}>Secure</h3>
                    <p style={{ color: 'var(--text-muted)' }}>Your conversations are private and safe.</p>
                </div>
                <div className="glass-panel" style={{ padding: '20px', width: '200px' }}>
                    <h3 style={{ color: '#fff', marginBottom: '10px' }}>Global</h3>
                    <p style={{ color: 'var(--text-muted)' }}>Connect with anyone, anywhere in the world.</p>
                </div>
            </div>
        </div>
    );
};

export default Landing;
