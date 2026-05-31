// ================================
// AUTH ROUTES
// Handles Login & Register
// Think of it as the reception
// desk of our cafe! 🛎️
// ================================

const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

// ================================
// REGISTER — Create new account
// POST /api/auth/register
// ================================
router.post('/register', (req, res) => {
    const { name, email, password } = req.body;

    // Check if all fields are filled
    if (!name || !email || !password) {
        return res.status(400).json({ 
            message: '❌ Please fill all fields!' 
        });
    }

    // Check if email already exists
    db.query('SELECT * FROM users WHERE email = ?', [email], (err, results) => {
        if (err) return res.status(500).json({ message: '❌ Server error!' });

        if (results.length > 0) {
            return res.status(400).json({ 
                message: '❌ Email already registered!' 
            });
        }

        // Hash the password (scramble it for safety!)
        const hashedPassword = bcrypt.hashSync(password, 10);

        // Save user to database
        db.query(
            'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
            [name, email, hashedPassword],
            (err, result) => {
                if (err) return res.status(500).json({ message: '❌ Could not register!' });
                res.status(201).json({ 
                    message: '✅ Registered successfully!' 
                });
            }
        );
    });
});

// ================================
// LOGIN — Sign into account
// POST /api/auth/login
// ================================
router.post('/login', (req, res) => {
    const { email, password } = req.body;

    // Check if fields are filled
    if (!email || !password) {
        return res.status(400).json({ 
            message: '❌ Please fill all fields!' 
        });
    }

    // Find user in database
    db.query('SELECT * FROM users WHERE email = ?', [email], (err, results) => {
        if (err) return res.status(500).json({ message: '❌ Server error!' });

        if (results.length === 0) {
            return res.status(400).json({ 
                message: '❌ Email not found!' 
            });
        }

        const user = results[0];

        // Check if password matches
        const isMatch = bcrypt.compareSync(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ 
                message: '❌ Wrong password!' 
            });
        }

        // Create a login token (like a wristband at an event!)
        const token = jwt.sign(
            { id: user.id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            message: '✅ Login successful!',
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    });
});

module.exports = router;