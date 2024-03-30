require("dotenv").config();
const express = require("express");
const db = require("./db")
const morgan = require("morgan");
const app = express();

//middleware
app.use(morgan("dev"));
app.use(express.json());


//ROUTES
// get all products
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

//get single product
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

//create a product
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

//update a product
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

//delete a product
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

port = process.env.PORT || 3000
app.listen(port, () => {
    console.log(`Server is up and listening on port ${port}`);
});

