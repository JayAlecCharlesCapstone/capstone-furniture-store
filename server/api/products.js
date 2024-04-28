const express = require("express");
const router = express.Router();
const { client } = require("../db/client");
const jwt = require('jsonwebtoken')

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
        console.log(decoded.role)
        if (decoded.role !== 'admin') {
            return res.status(403).json({ message: 'Access forbidden: Admin role required' });
        }
        req.user = decoded;
        console.log('Decoded User:', req.user);
        next();
    });
};

// GET /api/v1/products
router.get('/', async (req, res) => {
    try {
        const result = await client.query('SELECT * FROM products');
        res.json({
            status: 'success',
            results: result.rows.length,
            data: {
                products: result.rows
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching products' });
    }
});

// GET /api/v1/products/:productId
router.get('/:productId', async (req, res) => {
    try {
        const productId = req.params.productId;
        const result = await client.query('SELECT * FROM products WHERE product_id = $1', [productId]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Product not found' });
        }

        res.status(200).json({
            status: 'success',
            data: {
                product: result.rows[0]
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching product' });
    }
});

// POST /api/v1/products
router.post('/', verifyAdminToken, async (req, res) => {
    try {
        const { name, description, price, stock_quantity, image_url } = req.body;
        const result = await client.query(
            'INSERT INTO products (name, description, price, stock_quantity, image_url) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [name, description, price, stock_quantity, image_url]
        );

        res.status(201).json({
            status: 'success',
            data: {
                product: result.rows[0]
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error creating product' });
    }
});

// PUT /api/v1/products/:productId
router.put('/:productId', verifyAdminToken, async (req, res) => {
    try {
        const productId = req.params.productId;
        const { name, description, price, stock_quantity } = req.body;
        const result = await client.query(
            'UPDATE products SET name = $1, description = $2, price = $3, stock_quantity = $4 WHERE product_id = $5 RETURNING *',
            [name, description, price, stock_quantity, productId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Product not found' });
        }

        res.status(200).json({
            status: 'success',
            data: {
                product: result.rows[0]
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error updating product' });
    }
});

// DELETE /api/v1/products/:productId
router.delete('/:productId', verifyAdminToken, async (req, res) => {
    try {
        const productId = req.params.productId;
        await client.query('DELETE FROM products WHERE product_id = $1', [productId]);

        res.status(204).json({
            status: 'success'
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error deleting product' });
    }
});

module.exports = router;
