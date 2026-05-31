const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: '../.env' });

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const authRoutes = require('./routes/auth');
const menuRoutes = require('./routes/menu');
const bookingRoutes = require('./routes/booking');
const seatingRoutes = require('./routes/seating');

app.use('/api/auth', authRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/booking', bookingRoutes);
app.use('/api/seating', seatingRoutes);

app.get('/', (req, res) => {
    res.json({
        message: '☕ Welcome to BrewTheory Cafe API!',
        status: 'Server is running!'
    });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`✅ Server is running on http://localhost:${PORT}`);
    console.log('☕ Cafe Website Backend is LIVE!');
});
