const express = require("express");
const router = express.Router();
const { client } = require("../db/client");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Middleware to verify admin token
function verifyAdminToken(req, res, next) {
    const authHeader = req.headers['authorization'];

    if (!authHeader) {
        return res.status(401).json({ message: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'No token provided' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            console.error('Token Verification Error:', err);
            return res.status(403).json({ message: 'Failed to authenticate token' });
        }
        if (decoded.role !== 'admin') {
            return res.status(403).json({ message: 'Access forbidden: Admin role required' });
        }
        req.user = decoded;
        console.log('Decoded User:', req.user);
        next();
    });
};

// POST /api/v1/admin/register
router.post('/register', async (req, res) => {
    try {
        const { username, password } = req.body;
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        
        const result = await client.query(
            'INSERT INTO admin_users (username, password_hash) VALUES ($1, $2) RETURNING *',
            [username, hashedPassword]
        );

        res.status(201).json({
            status: 'success',
            data: {
                adminUser: result.rows[0]
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error registering admin user' });
    }
});




// GET /api/v1/admin
router.get('/users', verifyAdminToken, async (req, res) => {
    try {
        const adminId = req.user.id;
        const adminProfile = await client.query('SELECT * FROM admin_users WHERE admin_id = $1', [adminId]);

        res.status(200).json({
            status: 'success',
            data: {
                adminProfile: adminProfile.rows[0]
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching admin profile' });
    }
});

module.exports = router;
