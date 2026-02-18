const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static('public'));

// JWT Secret (в production будет из переменной окружения)
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Хэшированный пароль (Boxing1986Boxing)
const HASHED_PASSWORD = '$2a$10$Zx4qJ5YvM7gKj3VN8F9uQe7XH6dM5E8K2pR4fL9sT6wY3cB1aD0eO';
const USER_EMAIL = 'edshmanov@gmail.com';

// Middleware для проверки авторизации
function authenticateToken(req, res, next) {
    const token = req.cookies.token;
    
    if (!token) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    
    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Invalid token' });
        }
        req.user = user;
        next();
    });
}

// Routes

// Главная страница (редирект на логин или приложение)
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

// Страница логина
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// API для логина
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
    
    if (email !== USER_EMAIL) {
        return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Временно принимаем пароль напрямую (потом добавим bcrypt)
    if (password !== 'Boxing1986Boxing') {
        return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Создаём JWT токен
    const token = jwt.sign(
        { email: email },
        JWT_SECRET,
        { expiresIn: '30d' }
    );
    
    // Устанавливаем cookie
    res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 30 * 24 * 60 * 60 * 1000 // 30 дней
    });
    
    res.json({ success: true });
});

// API для выхода
app.post('/api/logout', (req, res) => {
    res.clearCookie('token');
    res.json({ success: true });
});

// API для проверки авторизации
app.get('/api/check-auth', authenticateToken, (req, res) => {
    res.json({ authenticated: true, user: req.user });
});

// API для сохранения данных (используем локальное хранилище в браузере пока)
// В будущем добавим Firebase
app.get('/api/data', authenticateToken, (req, res) => {
    // Пока данные хранятся в браузере
    res.json({ message: 'Use localStorage for now' });
});

// Запуск сервера
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
