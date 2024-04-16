const express = require("express");
const router = express.Router();
const { client } = require("../db/client");
const jwt = require('jsonwebtoken');
const {getOrdersByCustomerId} = require('../db/orders')

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

// POST /api/v1/orders
router.post("/",verifyToken, async (req, res) => {
    try {
        const { customer_id, shipping_address_id } = req.body;

        const cartItemsQuery = `
            SELECT ci.*, p.price
            FROM cart ci
            JOIN products p ON ci.product_id = p.product_id
            WHERE ci.customer_id = $1;
        `;
        const cartItemsResult = await client.query(cartItemsQuery, [customer_id]);
        const cartItems = cartItemsResult.rows;

        if (cartItems.length === 0) {
            return res.status(400).json({ message: 'Cart is empty' });
        }

        await client.query('BEGIN');

        const orderQuery = `
            INSERT INTO orders (customer_id, shipping_address_id)
            VALUES ($1, $2)
            RETURNING order_id;
        `;
        const orderValues = [customer_id, shipping_address_id];
        const orderResult = await client.query(orderQuery, orderValues);
        const orderId = orderResult.rows[0].order_id;

        const orderItemQueries = cartItems.map(item => {
            return client.query(`
                INSERT INTO order_items (order_id, product_id, quantity, price_per_unit)
                VALUES ($1, $2, $3, $4);
            `, [orderId, item.product_id, item.quantity, item.price]);
        });

        await Promise.all(orderItemQueries);

        const clearCartQuery = `
            DELETE FROM cart
            WHERE customer_id = $1;
        `;
        await client.query(clearCartQuery, [customer_id]);

        await client.query('COMMIT');

        res.status(201).json({
            status: "success",
            message: "Order placed successfully",
            orderId: orderId
        });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error(error);
        res.status(500).json({
            status: "error",
            message: "An error occurred while placing the order."
        });
    }
});

//Get all orders for specific customer
router.get("/:customerId",verifyToken, async (req,res) => {
    const {customerId} = req.params;

    try {
        const orders = await getOrdersByCustomerId(customerId);

        res.json({
            status: 'success',
            data: {
                orders
            }
        });
    } catch (error) {
        console.error(error)
    }
})

// DELETE /api/v1/orders/:orderId
router.delete('/:orderId', verifyToken, async (req, res) => {
    try {
        const orderId = req.params.orderId;

        await client.query('DELETE FROM order_items WHERE order_id = $1', [orderId]);

        await client.query('DELETE FROM orders WHERE order_id = $1', [orderId]);

        res.status(204).json({
            status: 'success'
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            status: 'error',
            message: 'An error occurred while deleting the order'
        });
    }
});

module.exports = router;
