require("dotenv").config();
const express = require("express");
const db = require("./db")
const morgan = require("morgan");
const app = express();

//middleware
app.use(morgan("dev"));
app.use(express.json());


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



//Register a customer
app.post("/api/v1/customer/register", async (req, res) => {
    try {
        const { name, email, phone, street_address, city, state, country, postal_code } = req.body;

        await db.query('BEGIN');


        const addressResult = await db.query(
            'INSERT INTO Addresses (street_address, city, state, country, postal_code) VALUES ($1, $2, $3, $4, $5) RETURNING address_id',
            [street_address, city, state, country, postal_code]
        );


        const addressId = addressResult.rows[0].address_id;


        const customerResult = await db.query(
            'INSERT INTO Customers (name, email, phone, address_id) VALUES ($1, $2, $3, $4) RETURNING *',
            [name, email, phone, addressId]
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






port = process.env.PORT || 3000
app.listen(port, () => {
    console.log(`Server is up and listening on port ${port}`);
});

