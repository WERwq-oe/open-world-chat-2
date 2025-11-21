import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../styles/main.css';

const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3001';
const socket = io(SERVER_URL);

const Chat = () => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [user, setUser] = useState(null);
    const messagesEndRef = useRef(null);
    const fileInputRef = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (!storedUser) {
            navigate('/auth');
            return;
        }
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);

        socket.emit('join_chat', { username: parsedUser.username });

        socket.on('receive_message', (data) => {
            setMessages((prev) => [...prev, data]);
        });

        socket.on('user_joined', (data) => {
            setMessages((prev) => [...prev, { type: 'system', message: `${data.username} joined the chat` }]);
        });

        return () => {
            socket.off('receive_message');
            socket.off('user_joined');
        };
    }, [navigate]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const sendMessage = () => {
        if (input.trim() && user) {
            const messageData = {
                username: user.username,
                message: input,
                type: 'text',
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            };
            socket.emit('send_message', messageData);
            setInput('');
        }
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await axios.post(`${SERVER_URL}/api/upload`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            const { fileUrl, fileName, type } = res.data;
            const isImage = type.startsWith('image/');

            const messageData = {
                username: user.username,
                message: fileName,
                type: isImage ? 'image' : 'file',
                fileUrl: fileUrl,
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            };
            socket.emit('send_message', messageData);
        } catch (err) {
            console.error('Upload failed', err);
            alert('File upload failed');
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('user');
        window.location.href = '/auth';
    };

    return (
        <div className="chat-layout animate-fade-in">
            <div className="glass-panel chat-window">
                <div className="chat-header">
                    <div>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: '700' }}>Global Chat</h2>
                        <span style={{ color: 'var(--primary-color)', fontSize: '0.8rem' }}>● Online</span>
                    </div>
                    <button onClick={handleLogout} className="btn-primary" style={{ padding: '8px 16px', fontSize: '0.9rem', background: 'rgba(255,255,255,0.1)' }}>
                        Logout
                    </button>
                </div>

                <div className="messages-area">
                    {messages.map((msg, index) => {
                        const isOwn = msg.username === user?.username;
                        const isSystem = msg.type === 'system';

                        if (isSystem) {
                            return (
                                <div key={index} className="system-message">
                                    {msg.message}
                                </div>
                            );
                        }

                        return (
                            <div key={index} className={`message-bubble ${isOwn ? 'message-own' : 'message-other'}`}>
                                {!isOwn && <span className="message-info">{msg.username} • {msg.time}</span>}

                                {msg.type === 'text' && <div>{msg.message}</div>}

                                {msg.type === 'image' && (
                                    <img
                                        src={msg.fileUrl}
                                        alt="uploaded"
                                        style={{ maxWidth: '100%', borderRadius: '8px', marginTop: '5px' }}
                                    />
                                )}

                                {msg.type === 'file' && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <span style={{ fontSize: '1.5rem' }}>📄</span>
                                        <a href={msg.fileUrl} target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', textDecoration: 'underline' }}>
                                            {msg.message}
                                        </a>
                                    </div>
                                )}

                                {isOwn && <span className="message-info" style={{ textAlign: 'right', marginTop: '4px', color: 'rgba(255,255,255,0.7)' }}>{msg.time}</span>}
                            </div>
                        );
                    })}
                    <div ref={messagesEndRef} />
                </div>

                <div className="input-area">
                    <input
                        type="file"
                        ref={fileInputRef}
                        style={{ display: 'none' }}
                        onChange={handleFileUpload}
                    />
                    <button className="icon-btn" onClick={() => fileInputRef.current.click()} title="Attach File">
                        📎
                    </button>
                    <input
                        type="text"
                        className="glass-input"
                        placeholder="Type a message..."
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                        style={{ borderRadius: '25px' }}
                    />
                    <button className="icon-btn" onClick={sendMessage} style={{ background: 'var(--primary-color)' }}>
                        ➤
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Chat;
