const express = require('express');
const router = express.Router();
const db = require('../config/db');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function(req, file, cb) {
        const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1000) + path.extname(file.originalname);
        cb(null, uniqueName);
    }
});

const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const isValid = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    if (isValid) {
        cb(null, true);
    } else {
        cb(new Error('Only image files allowed!'), false);
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 }
});

router.get('/', (req, res) => {
    db.query(
        'SELECT * FROM menu_items WHERE is_available = 1 ORDER BY category',
        (err, results) => {
            if (err) return res.status(500).json({ message: '❌ Server error!' });
            res.json(results);
        }
    );
});

router.get('/all', (req, res) => {
    db.query(
        'SELECT * FROM menu_items ORDER BY category, name',
        (err, results) => {
            if (err) return res.status(500).json({ message: '❌ Server error!' });
            res.json(results);
        }
    );
});

router.get('/category/:category', (req, res) => {
    const { category } = req.params;
    db.query(
        'SELECT * FROM menu_items WHERE category = ? AND is_available = 1',
        [category],
        (err, results) => {
            if (err) return res.status(500).json({ message: '❌ Server error!' });
            res.json(results);
        }
    );
});

router.post('/add', upload.single('image'), (req, res) => {
    const { name, category, price, description, is_veg } = req.body;
    if (!name || !category || !price) {
        return res.status(400).json({ message: '❌ Please fill all required fields!' });
    }
    const image_url = req.file ? `/uploads/${req.file.filename}` : null;
    db.query(
        'INSERT INTO menu_items (name, category, price, description, is_veg, image_url) VALUES (?, ?, ?, ?, ?, ?)',
        [name, category, price, description, is_veg || 1, image_url],
        (err, result) => {
            if (err) return res.status(500).json({ message: '❌ Could not add item!' });
            res.status(201).json({ message: '✅ Menu item added!', id: result.insertId, image_url });
        }
    );
});

router.put('/edit/:id', upload.single('image'), (req, res) => {
    const { id } = req.params;
    const { name, category, price, description } = req.body;
    if (!name || !price) {
        return res.status(400).json({ message: '❌ Name and price required!' });
    }
    if (req.file) {
        const image_url = `/uploads/${req.file.filename}`;
        db.query(
            'UPDATE menu_items SET name=?, category=?, price=?, description=?, image_url=? WHERE id=?',
            [name, category, price, description, image_url, id],
            (err) => {
                if (err) return res.status(500).json({ message: '❌ Update failed!' });
                res.json({ message: '✅ Item updated!' });
            }
        );
    } else {
        db.query(
            'UPDATE menu_items SET name=?, category=?, price=?, description=? WHERE id=?',
            [name, category, price, description, id],
            (err) => {
                if (err) return res.status(500).json({ message: '❌ Update failed!' });
                res.json({ message: '✅ Item updated!' });
            }
        );
    }
});

router.put('/update-image/:id', upload.single('image'), (req, res) => {
    const { id } = req.params;
    if (!req.file) {
        return res.status(400).json({ message: '❌ No image uploaded!' });
    }
    const image_url = `/uploads/${req.file.filename}`;
    db.query(
        'UPDATE menu_items SET image_url = ? WHERE id = ?',
        [image_url, id],
        (err) => {
            if (err) return res.status(500).json({ message: '❌ Could not update image!' });
            res.json({ message: '✅ Image updated!', image_url });
        }
    );
});

router.put('/toggle/:id', (req, res) => {
    const { id } = req.params;
    const { is_available } = req.body;
    db.query(
        'UPDATE menu_items SET is_available = ? WHERE id = ?',
        [is_available ? 1 : 0, id],
        (err) => {
            if (err) return res.status(500).json({ message: '❌ Update failed!' });
            res.json({ message: '✅ Availability updated!' });
        }
    );
});

router.delete('/delete/:id', (req, res) => {
    const { id } = req.params;
    db.query(
        'UPDATE menu_items SET is_available = 0 WHERE id = ?',
        [id],
        (err) => {
            if (err) return res.status(500).json({ message: '❌ Could not delete!' });
            res.json({ message: '✅ Menu item removed!' });
        }
    );
});

module.exports = router;