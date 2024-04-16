const express = require("express");
const router = express.Router();
const { client } = require("../db/client");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Generate admin token function
function generateAdminToken(adminUser) {
    return jwt.sign(
        { id: adminUser.admin_id, username: adminUser.username, role: 'admin' },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
    );
};

function isAdmin(req, res, next) {
    if (req.user && req.user.role === 'admin') {
        next(); 
    } else {
        res.status(403).json({ message: 'Access forbidden: Admin role required' });
    }
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

// POST /api/v1/admin/login
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        const adminUser = await client.query('SELECT * FROM admin_users WHERE username = $1', [username]);

        if (adminUser.rows.length === 0) {
            return res.status(401).json({ message: 'Invalid username or password' });
        }

        const hashedPassword = adminUser.rows[0].password_hash;

        const isPasswordValid = await bcrypt.compare(password, hashedPassword);

        if (isPasswordValid) {
            const token = generateAdminToken(adminUser.rows[0]);
            return res.status(200).json({ token });
        } else {
            return res.status(401).json({ message: 'Invalid username or password' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error logging in as admin' });
    }
});

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

router.get("/protected/admintoken", verifyAdminToken, isAdmin, async (req, res) => {
    res.status(200).json({ message: 'Access granted: Admin token endpoint' });
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
