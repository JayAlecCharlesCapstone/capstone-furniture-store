const express = require("express");
const router = express.Router();
const { client } = require("../db/client");
const {customer} = require('../api/customers')
const jwt = require('jsonwebtoken')
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

// Get all cart items with product details
router.get("/", verifyToken, async (req, res) => {
    try {
        const customerId = req.user.id; 
        const cartItems = await client.query(`
            SELECT c.*, p.name AS product_name, p.description AS product_description, p.price
            FROM cart c
            JOIN products p ON c.product_id = p.product_id
            WHERE c.customer_id = $1
        `, [customerId]);

        res.json({
            status: "success",
            results: cartItems.rows.length,
            data: {
                cartItems: cartItems.rows
            }
        });
    } catch (error) {
        console.error('Error fetching cart items:', error);
        res.status(500).json({
            status: "error",
            message: "An error occurred while fetching cart items."
        });
    }
});



// Add item to cart for a specific customer
router.post("/", verifyToken, async (req, res) => {
    try {
        const { product_id, quantity } = req.body;
        const customerId = req.user.id; 

        if (!product_id || !quantity) {
            return res.status(400).json({
                status: "error",
                message: "Please provide product_id and quantity."
            });
        }

        
        const product = await client.query('SELECT * FROM products WHERE product_id = $1', [product_id]);
        if (product.rows.length === 0) {
            return res.status(404).json({
                status: "error",
                message: "Product not found."
            });
        }

        await client.query(
            'INSERT INTO cart (customer_id, product_id, quantity) VALUES ($1, $2, $3)',
            [customerId, product_id, quantity]
        );

        res.status(201).json({
            status: "success",
            message: "Product added to cart successfully."
        });
    } catch (error) {
        console.error('Error adding product to cart:', error);
        res.status(500).json({
            status: "error",
            message: "An error occurred while adding the product to the cart."
        });
    }
});

// Remove item from cart for a specific customer
router.delete("/:cartId", verifyToken, async (req, res) => {
    const customerId = req.user.id;
    const cartId = req.params.cartId;
  
    try {
      await client.query(
        `DELETE FROM cart WHERE customer_id = $1 AND cart_id = $2`,
        [customerId, cartId]
      );
  
      res.status(204).json({
        status: "success",
        message: "Item removed from cart."
      });
    } catch (error) {
      console.error('Error removing item from cart:', error);
      res.status(500).json({
        status: "error",
        message: "An error occurred while removing the item from the cart."
      });
    }
  });
  



module.exports = router;
