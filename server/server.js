require("dotenv").config();
const express = require("express");
const db = require("./db")
const morgan = require("morgan");
const app = express();
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')


// Generate token function
function generateToken(user) {
    return jwt.sign({ id: user.customer_id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '1h' });

};
function generateAdminToken(adminUser) {
    return jwt.sign(
        { id: adminUser.admin_id, username: adminUser.username, role: 'admin' },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
    );
}


//middleware
app.use(morgan("dev"));
app.use(express.json());

function verifyToken(req, res, next) {
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
        req.user = decoded; 
        console.log('Decoded User:', req.user); 
        next(); 
    });
};


function isAdmin(req, res, next) {
    if (req.user && req.user.role === 'admin') {
        next(); 
    } else {
        res.status(403).json({ message: 'Access forbidden: Admin role required' });
    }
}


app.use('/api/v1/cart', verifyToken); 
app.use('/api/v1/admin/users', verifyToken)
app.use('/api/v1/admin/orders', verifyToken)



async function startServer() {
    try {
        await db.connectToDatabase();
        app.listen(process.env.port, () => {
            console.log(`Server is up and listening on port ${process.env.port}`);
        });
    } catch (error) {
        console.error("Error starting server:", error.message);
        process.exit(1); 
    }
}



//ROUTES - ADMIN//

//Create Admin User
app.post('/api/v1/admin/register', async(req,res) => {
    try {
        const {username, password} = req.body;

        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        const result = await db.query(
            'INSERT INTO admin_users (username, password) VALUES ($1, $2) RETURNING *',
            [username, hashedPassword]
        );

        res.status(201).json({
            status: 'success',
            data: {
                adminUser: result.rows[0]
            }
        });
    } catch (error) {
        console.error(error)
    }
});

//Login as Admin User
app.post('/api/v1/admin/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        const adminUser = await db.query('SELECT * FROM admin_users WHERE username = $1', [username]);

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
        return res.status(500).json({ message: 'Error logging in as admin' });
    }
});
app.get("/api/v1/protected/admintoken", verifyToken, isAdmin, async (req, res) => {
    res.status(200).json({ message: 'Access granted: Admin token endpoint' });
});



//Get all admin users
app.get('/api/v1/admin/users', isAdmin, async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM admin_users');
        res.json({
            status: 'success',
            results: result.rows.length,
            data: {
                adminUsers: result.rows
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching admin users' });
    }
});




//ROUTES - Products//

// Get all products
app.get("/api/v1/products", async (req, res) => {
    try {
        const result = await db.query("SELECT * FROM products");
        res.json({
            status: "success",
            results: result.rows.length,
            data: {
                products: result.rows
            }
        })

    } catch (error) {
        console.error(error);
    }

});

//Get single product
app.get("/api/v1/products/:id", async (req, res) => {
    try {
        const paramsId = req.params.id;
        const result = await db.query('SELECT * FROM products WHERE product_id = $1',
            [
                paramsId
            ]);
        res.status(200).json({
            status: "success",
            data: {
                product: result.rows[0]
            }
        });
    } catch (error) {
        console.error(error);
    }
});

//Create a product
app.post("/api/v1/products", async (req, res) => {
    try {
        const result = await db.query("INSERT INTO products (name,description,price,stock_quantity) VALUES ($1, $2, $3, $4) RETURNING *",
            [
                req.body.name,
                req.body.description,
                req.body.price,
                req.body.stock_quantity
            ]);
        res.status(201).json({
            status: "success",
            data: {
                product: result.rows[0]
            }
        });
    } catch (error) {
        console.error(error)
    }
});

//Update a product
app.put("/api/v1/products/:id", async (req, res) => {
    try {
        const result = await db.query("UPDATE products SET name = $1, description = $2, price = $3, stock_quantity = $4 WHERE product_id = $5 RETURNING *",
            [
                req.body.name,
                req.body.description,
                req.body.price,
                req.body.stock_quantity,
                req.params.id
            ]);

        res.status(200).json({
            status: "success",
            data: {
                product: result.rows[0]
            }
        });
    } catch (error) {
        console.error(error);
    }
});

//Delete a product
app.delete("/api/v1/products/:id", async (req, res) => {
    try {
        const result = await db.query("DELETE FROM products WHERE product_id = $1",
            [
                req.params.id
            ]);
        res.status(204).json({
            status: "success",
        });
    } catch (error) {
        console.error(error);
    }

});



//Routes - Login/Register//


//Get all customers
app.get("/api/v1/customer", async (req, res) => {
    try {
        const result = await db.query("SELECT * FROM customers");
        res.json({
            status: "success",
            results: result.rows.length,
            data: {
                customers: result.rows
            }
        })

    } catch (error) {
        console.error(error);
    }

});

//Get all customers address
app.get("/api/v1/customer/address", async (req, res) => {
    try {
        const result = await db.query("SELECT * FROM addresses");
        res.json({
            status: "success",
            results: result.rows.length,
            data: {
                address: result.rows
            }
        })

    } catch (error) {
        console.error(error);
    }

});



// Register a customer
app.post("/api/v1/customer/register", async (req, res) => {
    try {
        const { name, email, phone, username, password, street_address, city, state, country, postal_code } = req.body;

        const saltRounds = 10;
        const salt = await bcrypt.genSalt(saltRounds);
        const hashedPassword = await bcrypt.hash(password, salt);

        await db.query('BEGIN');

        
        const addressResult = await db.query(
            'INSERT INTO Addresses (street_address, city, state, country, postal_code) VALUES ($1, $2, $3, $4, $5) RETURNING address_id',
            [street_address, city, state, country, postal_code]
        );
        const addressId = addressResult.rows[0].address_id;

       
        const customerResult = await db.query(
            'INSERT INTO Customers (name, email, phone, username, password_hash, password_salt, address_id) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
            [name, email, phone, username, hashedPassword, salt, addressId]
        );

        await db.query('COMMIT');

        res.status(201).json({
            status: "success",
            data: {
                customer: customerResult.rows[0]
            }
        });
    } catch (error) {
        await db.query('ROLLBACK');
        console.error(error);
        res.status(500).json({
            status: "error",
            message: "An error occurred while registering the customer."
        });
    }
});






//Update a customer
app.put("/api/v1/customer/register/:id", async (req, res) => {
    try {
        const { name, email, phone, street_address, city, state, country, postal_code } = req.body;

        await db.query('BEGIN');

        const customerResult = await db.query(
            'UPDATE Customers SET name = $1, email = $2, phone = $3 WHERE customer_id = $4 RETURNING *',
            [name, email, phone, req.params.id]
        );

        const addressResult = await db.query(
            'UPDATE Addresses SET street_address = $1, city = $2, state = $3, country = $4, postal_code = $5 WHERE address_id = $6',
            [street_address, city, state, country, postal_code, customerResult.rows[0].address_id]
        );


        await db.query('COMMIT');

        res.status(200).json({
            status: "success",
            data: {
                customer: customerResult.rows[0]
            }
        });
    } catch (error) {
        await db.query('ROLLBACK');
        console.error(error);
        res.status(500).json({
            status: "error",
            message: "An error occurred while updating the customer."
        });
    }
});


//Login as customer
app.post("/api/v1/customer/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        
        const user = await db.query('SELECT * FROM Customers WHERE email = $1', [email]);
        
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

app.get("/api/v1/protected/token", verifyToken, async (req,res) => {
    res.status(200).json({message: 'Access granted'});
})

//Delete a customer

app.delete("/api/v1/customer/:id", async (req, res) => {
    try {
        const result = await db.query("DELETE FROM customers WHERE customer_id = $1",
            [
                req.params.id
            ]);
        res.status(204).json({
            status: "success",
        });
    } catch (error) {
        console.error(error);
    }

});


//Routes - Cart

// Get all cart items with product details
app.get("/api/v1/cart", async (req, res) => {
    try {
        if (!req.user || !req.user.id) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const customerId = req.user.id; 
        const cartItems = await db.query(`
            SELECT 
                c.cart_id,
                c.customer_id,
                c.product_id,
                c.quantity,
                p.name AS product_name,
                p.price AS product_price
            FROM 
                cart c
            INNER JOIN 
                products p ON c.product_id = p.product_id
            WHERE 
                c.customer_id = $1
        `, [customerId]); 

        res.json({
            status: "success",
            results: cartItems.rows.length,
            data: {
                cart: cartItems.rows.map(item => ({
                    cart_id: item.cart_id,
                    customer_id: item.customer_id,
                    product_id: item.product_id,
                    product_name: item.product_name,
                    product_price: item.product_price,
                    quantity: item.quantity
                }))
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





//Add item to cart
app.post("/api/v1/cart", async (req, res) => {
    try {
        const { customer_id, product_id, quantity } = req.body;

        if (!customer_id || !product_id || !quantity) {
            return res.status(400).json({
                status: "error",
                message: "Error. Please provide customer_id, product_id, and quantity."
            });
        }
        
        const customer = await db.query('SELECT * FROM Customers WHERE customer_id = $1', [customer_id]);
        if (customer.rows.length === 0) {
            return res.status(404).json({
                status: "error",
                message: "Customer not found."
            });
        }

        
        const product = await db.query('SELECT * FROM Products WHERE product_id = $1', [product_id]);
        if (product.rows.length === 0) {
            return res.status(404).json({
                status: "error",
                message: "Product not found."
            });
        }

        
        await db.query(
            'INSERT INTO Cart (customer_id, product_id, quantity) VALUES ($1, $2, $3)',
            [customer_id, product_id, quantity]
        );

        res.status(201).json({
            status: "success",
            message: "Product added to cart successfully."
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            status: "error",
            message: "An error occurred while adding the product to the cart."
        });
    }
});

app.delete("/api/v1/cart/:id", async (req, res) => {
    try {
        const result = await db.query("DELETE FROM cart WHERE cart_id = $1",
            [
                req.params.id
            ]);
        res.status(204).json({
            status: "success",
        });
    } catch (error) {
        console.error(error);
    }

});
        
// ROUTES - Orders

// Create a order
app.post("/api/v1/orders",verifyToken, async (req, res) => {
    try {
        const { customer_id, shipping_address_id } = req.body;

        const cartItemsQuery = `
            SELECT ci.*, p.price
            FROM cart ci
            JOIN products p ON ci.product_id = p.product_id
            WHERE ci.customer_id = $1;
        `;
        const cartItemsResult = await db.query(cartItemsQuery, [customer_id]);
        const cartItems = cartItemsResult.rows;

        if (cartItems.length === 0) {
            return res.status(400).json({ message: 'Cart is empty' });
        }

        await db.query('BEGIN');

        const orderQuery = `
            INSERT INTO orders (customer_id, shipping_address_id)
            VALUES ($1, $2)
            RETURNING order_id;
        `;
        const orderValues = [customer_id, shipping_address_id];
        const orderResult = await db.query(orderQuery, orderValues);
        const orderId = orderResult.rows[0].order_id;

        const orderItemQueries = cartItems.map(item => {
            return db.query(`
                INSERT INTO order_items (order_id, product_id, quantity, price_per_unit)
                VALUES ($1, $2, $3, $4);
            `, [orderId, item.product_id, item.quantity, item.price]);
        });

        await Promise.all(orderItemQueries);

        const clearCartQuery = `
            DELETE FROM cart
            WHERE customer_id = $1;
        `;
        await db.query(clearCartQuery, [customer_id]);

        await db.query('COMMIT');

        res.status(201).json({
            status: "success",
            message: "Order placed successfully",
            orderId: orderId
        });
    } catch (error) {
        await db.query('ROLLBACK');
        console.error(error);
        res.status(500).json({
            status: "error",
            message: "An error occurred while placing the order."
        });
    }
});


//Get specific order
app.get("/api/v1/orders/items/:orderId",verifyToken, async (req, res) => {
    try {
        const orderId = req.params.orderId;

        const orderItemsQuery = `
            SELECT oi.order_item_id, oi.product_id, p.name AS product_name, oi.quantity, oi.price_per_unit
            FROM order_items oi
            INNER JOIN products p ON oi.product_id = p.product_id
            WHERE oi.order_id = $1;
        `;
        const orderItemsResult = await db.query(orderItemsQuery, [orderId]);
        const orderedItems = orderItemsResult.rows;

        res.status(200).json({
            status: "success",
            data: {
                orderedItems: orderedItems
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            status: "error",
            message: "An error occurred while fetching ordered items."
        });
    }
});







startServer();