// ================================
// SEATING ROUTES
// Handles all table/seat stuff
// Think of it as the floor map
// of our cafe! 🗺️
// ================================

const express = require('express');
const router = express.Router();
const db = require('../config/db');

// ================================
// GET ALL TABLES
// GET /api/seating
// ================================
router.get('/', (req, res) => {
    db.query('SELECT * FROM tables', (err, results) => {
        if (err) return res.status(500).json({ message: '❌ Server error!' });
        res.json(results);
    });
});

// ================================
// UPDATE TABLE STATUS (Admin)
// PUT /api/seating/update/:id
// ================================
router.put('/update/:id', (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    db.query(
        'UPDATE tables SET status = ? WHERE id = ?',
        [status, id],
        (err, result) => {
            if (err) return res.status(500).json({ message: '❌ Could not update!' });
            res.json({ message: '✅ Table status updated!' });
        }
    );
});

// ================================
// GET ALL TABLES FOR ADMIN
// GET /api/seating/all
// ================================
router.get('/all', (req, res) => {
    db.query('SELECT * FROM tables ORDER BY table_number', (err, results) => {
        if (err) return res.status(500).json({ message: '❌ Server error!' });
        res.json({ tables: results });
    });
});

module.exports = router;