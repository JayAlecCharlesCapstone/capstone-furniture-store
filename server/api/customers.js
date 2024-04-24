const express = require("express");
const router = express.Router();
const { client } = require("../db/client");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

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

//GET single customer
router.get("/:customerId", async (req, res) => {
    const { customerId } = req.params;

    try {
        const result = await client.query(
            "SELECT * FROM customers WHERE customer_id = $1",
            [customerId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                status: "error",
                message: "Customer not found",
            });
        }

        res.json({
            status: "success",
            data: {
                customer: result.rows[0],
            },
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            status: "error",
            message: "Internal server error",
        });
    }
});



// GET all customer addresses
router.get("/address/:addressId", async (req, res) => {
    const { addressId } = req.params;

    try {
        const result = await client.query(
            `SELECT * FROM addresses WHERE address_id = $1`,
            [addressId] 
        );

        res.json({
            status: "success",
            results: result.rows.length,
            data: {
                address: result.rows[0] 
            }
        });
    } catch (error) {
        console.error('Error fetching address:', error);
        res.status(500).json({ message: 'Error fetching address' });
    }
});

// POST customer address
router.post("/address", async (req, res) => {
    const { street_address, city, state, country, postal_code } = req.body;

    try {
        const result = await client.query(
            `INSERT INTO addresses (street_address, city, state, country, postal_code)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *`,
            [street_address, city, state, country, postal_code]
        );

        const customerAddress = result.rows[0];

        res.status(201).json({
            message: 'Customer address registered successfully',
            address: customerAddress
        });
    } catch (error) {
        console.error('Error inserting address:', error);
        res.status(500).json({ message: 'Failed to register customer address' });
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
router.put("/register/:id", verifyToken, async (req, res) => {
    try {
        const { name, email, phone, username } = req.body;

        const customerResult = await client.query(
            'UPDATE customers SET name = $1, email = $2, phone = $3, username = $4 WHERE customer_id = $5 RETURNING *',
            [name, email, phone, username, req.params.id]
        );

        res.status(200).json({
            status: "success",
            data: {
                customer: customerResult.rows[0]
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            status: "error",
            message: "An error occurred while updating the customer."
        });
    }
});


// DELETE a customer
router.delete("/:id", verifyToken, async (req, res) => {
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
