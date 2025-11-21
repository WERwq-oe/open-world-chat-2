import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const socket = io('http://localhost:3001');

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
                time: new Date().toLocaleTimeString()
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
            const res = await axios.post('http://localhost:3001/api/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            const { fileUrl, fileName, type } = res.data;
            const isImage = type.startsWith('image/');

            const messageData = {
                username: user.username,
                message: fileName,
                type: isImage ? 'image' : 'file',
                fileUrl: fileUrl,
                time: new Date().toLocaleTimeString()
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
        <div className="container">
            <div className="glass-panel chat-container">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 20px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                    <h2>Global Chat</h2>
                    <button onClick={handleLogout} style={{ width: 'auto', padding: '8px 16px', marginTop: 0, background: 'rgba(255,255,255,0.1)' }}>Logout</button>
                </div>

                <div className="messages">
                    {messages.map((msg, index) => (
                        <div key={index} className={`message ${msg.username === user?.username ? 'own' : ''}`} style={msg.type === 'system' ? { alignSelf: 'center', background: 'transparent', opacity: 0.6, fontSize: '0.8rem' } : {}}>
                            {msg.type !== 'system' && <div className="message-header">{msg.username} • {msg.time}</div>}

                            {msg.type === 'text' && <div>{msg.message}</div>}
                            {msg.type === 'image' && <img src={msg.fileUrl} alt="uploaded" />}
                            {msg.type === 'file' && (
                                <div>
                                    📄 <a href={msg.fileUrl} target="_blank" rel="noopener noreferrer" style={{ color: 'white', textDecoration: 'underline' }}>{msg.message}</a>
                                </div>
                            )}
                            {msg.type === 'system' && <div>{msg.message}</div>}
                        </div>
                    ))}
                    <div ref={messagesEndRef} />
                </div>

                <div className="chat-input">
                    <input
                        type="file"
                        ref={fileInputRef}
                        style={{ display: 'none' }}
                        onChange={handleFileUpload}
                    />
                    <button onClick={() => fileInputRef.current.click()} style={{ background: 'rgba(255,255,255,0.1)', fontSize: '1.2rem', padding: '0 15px' }}>📎</button>
                    <input
                        type="text"
                        placeholder="Type a message..."
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                    />
                    <button onClick={sendMessage}>Send</button>
                </div>
            </div>
        </div>
    );
};

export default Chat;
