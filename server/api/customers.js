const express = require("express");
const router = express.Router();
const { client } = require("../db/client");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

//Generate Token
function generateToken(user) {
    return jwt.sign({ id: user.customer_id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '1h' });
}

// Middleware to verify token
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


// GET all customers
router.get("/", async (req, res) => {
    try {
        const result = await client.query("SELECT * FROM customers");
        res.json({
            status: "success",
            results: result.rows.length,
            data: {
                customers: result.rows
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            status: "error",
            message: "Internal server error"
        });
    }
});


// GET all customer addresses
router.get("/address", async (req, res) => {
    try {
        const result = await client.query("SELECT * FROM addresses");
        res.json({
            status: "success",
            results: result.rows.length,
            data: {
                addresses: result.rows
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching addresses' });
    }
});

// POST register a new customer
router.post("/register", async (req, res) => {
    try {
        const { name, email, phone, username, password } = req.body;
        
        if (!name || !email || !username || !password) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        const saltRounds = 10;
        const passwordSalt = await bcrypt.genSalt(saltRounds);
        const hashedPassword = await bcrypt.hash(password, passwordSalt);

        const result = await client.query(`
            INSERT INTO customers (name, email, phone, username, password_hash, password_salt)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING customer_id, name, email, phone, username;
        `, [name, email, phone, username, hashedPassword, passwordSalt]);

        const newCustomer = result.rows[0];

        res.status(201).json({
            message: 'Customer registered successfully',
            customer: newCustomer
        });
    } catch (error) {
        console.error('Error registering customer:', error.message);
        res.status(500).json({ message: 'Failed to register customer' });
    }
});

// PUT update customer details
router.put("/register/:id",verifyToken, async (req, res) => {
    try {
        const { name, email, phone, street_address, city, state, country, postal_code } = req.body;
        
        await client.query('BEGIN');
        
        const customerResult = await client.query(
            'UPDATE customers SET name = $1, email = $2, phone = $3 WHERE customer_id = $4 RETURNING *',
            [name, email, phone, req.params.id]
        );
        
        const addressResult = await client.query(
            'UPDATE addresses SET street_address = $1, city = $2, state = $3, country = $4, postal_code = $5 WHERE address_id = $6',
            [street_address, city, state, country, postal_code, customerResult.rows[0].address_id]
        );
        
        await client.query('COMMIT');
        
        res.status(200).json({
            status: "success",
            data: {
                customer: customerResult.rows[0]
            }
        });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error(error);
        res.status(500).json({
            status: "error",
            message: "An error occurred while updating the customer."
        });
    }
});

// POST login as a customer
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        
        const user = await client.query('SELECT * FROM customers WHERE email = $1', [email]);
        
        if (user.rows.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        const isPasswordValid = await bcrypt.compare(password, user.rows[0].password_hash);
        
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }
        
        const token = generateToken(user.rows[0]);
        
        res.status(200).json({ token });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error logging in, please try again' });
    }
});
router.get("/token?", verifyToken, async (req,res) => {
    res.status(200).json({message: 'Access granted'});
})

// DELETE a customer
router.delete("/:id",verifyToken, async (req, res) => {
    try {
        const result = await client.query("DELETE FROM customers WHERE customer_id = $1", [req.params.id]);
        res.status(204).json({
            status: "success"
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error deleting customer' });
    }
});

module.exports = router;
