// ================================
// BOOKING ROUTES
// Handles all table bookings
// Think of it as the reservation
// desk of our cafe! 📅
// ================================

const express = require('express');
const router = express.Router();
const db = require('../config/db');

// ================================
// GET ALL BOOKINGS (Admin)
// GET /api/booking
// ================================
router.get('/', (req, res) => {
    db.query(
        `SELECT bookings.*, users.name, users.email, 
        tables.table_number, tables.location 
        FROM bookings 
        JOIN users ON bookings.user_id = users.id 
        JOIN tables ON bookings.table_id = tables.id
        ORDER BY bookings.created_at DESC`,
        (err, results) => {
            if (err) return res.status(500).json({ message: '❌ Server error!' });
            res.json(results);
        }
    );
});

// ================================
// GET MY BOOKINGS (Student)
// GET /api/booking/my/:user_id
// ================================
router.get('/my/:user_id', (req, res) => {
    const { user_id } = req.params;
    db.query(
        `SELECT bookings.*, tables.table_number, tables.location 
        FROM bookings 
        JOIN tables ON bookings.table_id = tables.id 
        WHERE bookings.user_id = ?
        ORDER BY bookings.created_at DESC`,
        [user_id],
        (err, results) => {
            if (err) return res.status(500).json({ message: '❌ Server error!' });
            res.json(results);
        }
    );
});

// ================================
// CREATE NEW BOOKING
// POST /api/booking/create
// ================================
router.post('/create', (req, res) => {
    const { user_id, table_id, booking_date, time_slot, num_people } = req.body;

    if (!user_id || !table_id || !booking_date || !time_slot || !num_people) {
        return res.status(400).json({ 
            message: '❌ Please fill all fields!' 
        });
    }

    // Check if table is already booked for that date and time
    db.query(
        `SELECT * FROM bookings 
        WHERE table_id = ? AND booking_date = ? 
        AND time_slot = ? AND status != 'cancelled'`,
        [table_id, booking_date, time_slot],
        (err, results) => {
            if (err) return res.status(500).json({ message: '❌ Server error!' });

            if (results.length > 0) {
                return res.status(400).json({ 
                    message: '❌ Table already booked for this time!' 
                });
            }

            // Create the booking
            db.query(
                `INSERT INTO bookings 
                (user_id, table_id, booking_date, time_slot, num_people, status) 
                VALUES (?, ?, ?, ?, ?, 'confirmed')`,
                [user_id, table_id, booking_date, time_slot, num_people],
                (err, result) => {
                    if (err) return res.status(500).json({ message: '❌ Could not book!' });
                    res.status(201).json({ 
                        message: '✅ Table booked successfully!',
                        booking_id: result.insertId
                    });
                }
            );
        }
    );
});

// ================================
// CANCEL BOOKING
// PUT /api/booking/cancel/:id
// ================================
router.put('/cancel/:id', (req, res) => {
    const { id } = req.params;
    db.query(
        "UPDATE bookings SET status = 'cancelled' WHERE id = ?",
        [id],
        (err, result) => {
            if (err) return res.status(500).json({ message: '❌ Could not cancel!' });
            res.json({ message: '✅ Booking cancelled!' });
        }
    );
});

// ================================
// GET ALL BOOKINGS FOR ADMIN
// GET /api/booking
// ================================
router.get('/all', (req, res) => {
    db.query(
        `SELECT bookings.*, users.name as guest_name, 
        users.email as guest_email,
        tables.table_number, tables.location as section
        FROM bookings
        JOIN users ON bookings.user_id = users.id
        JOIN tables ON bookings.table_id = tables.id
        ORDER BY bookings.created_at DESC`,
        (err, results) => {
            if (err) return res.status(500).json({ message: '❌ Server error!' });
            res.json({ bookings: results });
        }
    );
});


// ================================
// UPDATE BOOKING STATUS (Admin)
// PUT /api/booking/status/:id
// ================================
router.put('/status/:id', (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
        return res.status(400).json({ message: '❌ Status is required!' });
    }

    db.query(
        'UPDATE bookings SET status = ? WHERE id = ?',
        [status, id],
        (err) => {
            if (err) return res.status(500).json({ message: '❌ Update failed!' });
            res.json({ message: `✅ Booking ${status}!` });
        }
    );
});

module.exports = router;
