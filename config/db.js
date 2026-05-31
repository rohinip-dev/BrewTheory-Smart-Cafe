// This file connects our Node.js server to MySQL database
// Think of it as a phone line between server and database 📞

const mysql = require('mysql2');
require('dotenv').config();

// Create the connection
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

// Test if connection works
db.connect((err) => {
    if (err) {
        console.log('❌ Database connection failed!', err);
    } else {
        console.log('✅ Database connected successfully!');
    }
});

module.exports = db;
