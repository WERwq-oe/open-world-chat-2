const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();

const USERS_FILE = path.join(__dirname, 'users.json');

// Helper to read users
const getUsers = () => {
    try {
        const data = fs.readFileSync(USERS_FILE, 'utf8');
        return JSON.parse(data);
    } catch (err) {
        return [];
    }
};

// Helper to save users
const saveUsers = (users) => {
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
};

router.post('/signup', (req, res) => {
    const { name, username, password, termsAccepted } = req.body;

    if (!name || !username || !password) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    if (!termsAccepted) {
        return res.status(400).json({ message: 'You must accept the Terms and Conditions' });
    }

    const users = getUsers();
    if (users.find(u => u.username === username)) {
        return res.status(400).json({ message: 'Username already exists' });
    }

    const newUser = { name, username, password }; // In a real app, hash the password!
    users.push(newUser);
    saveUsers(users);

    res.status(201).json({ message: 'User created successfully' });
});

router.post('/login', (req, res) => {
    const { username, password } = req.body;
    const users = getUsers();
    const user = users.find(u => u.username === username && u.password === password);

    if (user) {
        res.json({ message: 'Login successful', user: { name: user.name, username: user.username } });
    } else {
        res.status(401).json({ message: 'Invalid credentials' });
    }
});

module.exports = router;
