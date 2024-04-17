const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { client } = require('../db/client');

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
function generateToken(user) {
    return jwt.sign({ id: user.customer_id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '1h' });
}

function verifyToken(req, res, next) {
    const authHeader = req.headers['authorization'];

    if (!authHeader) {
        return res.status(401).json({ message: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'No token provided' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; 
        next();
    } catch (error) {
        console.error('Token verification failed:', error.message);
        res.status(401).json({ message: 'Invalid token' });
    }
}

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



// Admin Login
router.post('/admin', async (req, res) => {
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
router.get("/protected/admintoken", verifyAdminToken, isAdmin, async (req, res) => {
    res.status(200).json({ message: 'Access granted: Admin token endpoint' });
});

//Customer Login
router.post("/customer", async (req, res) => {
    try {
        const { username, password } = req.body;
        
        const user = await client.query('SELECT * FROM customers WHERE username = $1', [username]);
        
        if (user.rows.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        const isPasswordValid = await bcrypt.compare(password, user.rows[0].password_hash);
        
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid username or password' });
        }
        
        const token = generateToken(user.rows[0]);
        
        res.status(200).json({ token });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error logging in, please try again' });
    }
});
router.get("/token", verifyToken, async (req,res) => {
    res.status(200).json({message: 'Access granted'});
})


module.exports = router