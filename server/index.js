const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const path = require('path');
const authRoutes = require('./auth');
const uploadRoutes = require('./upload');

const app = express();
const server = http.createServer(app);

app.use(cors());
app.use(express.json());

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api', uploadRoutes);

const io = new Server(server, {
  cors: {
    origin: "*", // Allow all origins for simplicity in this demo
    methods: ["GET", "POST"]
  }
});

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join_chat', (data) => {
    socket.join('global_chat');
    console.log(`User ${data.username} joined global chat`);
    // Broadcast to others that a user joined
    socket.to('global_chat').emit('user_joined', { username: data.username });
  });

  socket.on('send_message', (data) => {
    // data: { username, message, type (text/image/file), fileUrl, fileName }
    io.to('global_chat').emit('receive_message', data);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

const PORT = 3001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
