const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static('public'));

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const USER_EMAIL = 'edshmanov@gmail.com';

function authenticateToken(req, res, next) {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ error: 'Unauthorized' });
    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ error: 'Invalid token' });
        req.user = user;
        next();
    });
}

app.get('/', (req, res) => {
    const token = req.cookies.token;
    if (token) {
        jwt.verify(token, JWT_SECRET, (err) => {
            if (err) {
                res.redirect('/login');
            } else {
                res.sendFile(path.join(__dirname, 'public', 'app.html'));
            }
        });
    } else {
        res.redirect('/login');
    }
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
    
    if (email !== USER_EMAIL) {
        return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    if (password !== 'Boxing1986Boxing') {
        return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // JWT токен на 90 дней
    const token = jwt.sign({ email: email }, JWT_SECRET, { expiresIn: '90d' });
    
    res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 90 * 24 * 60 * 60 * 1000, // 90 дней
        sameSite: 'lax'
    });
    
    res.json({ success: true });
});

app.post('/api/logout', (req, res) => {
    res.clearCookie('token');
    res.json({ success: true });
});

app.get('/api/check-auth', authenticateToken, (req, res) => {
    res.json({ authenticated: true, user: req.user });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
