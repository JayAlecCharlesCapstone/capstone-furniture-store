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

}

//middleware
app.use(morgan("dev"));
app.use(express.json());
function verifyToken(req,res,next) {
    const token = req.headers['authorization'];
    if (!token) {
        return res.status(401).json({message: 'No token provided'})
    }
    
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err){
            return res.status(403).json({message: 'Failed to authenticate token'})
        }
        req.user = decoded;
        nect();
    })
}


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


//Routes - Orders/Cart

//Get all cart items 
app.get("/api/v1/cart", async (req, res) => {
    try {
        const result = await db.query("SELECT * FROM cart");
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
        







port = process.env.PORT || 3000
app.listen(port, () => {
    console.log(`Server is up and listening on port ${port}`);
});

