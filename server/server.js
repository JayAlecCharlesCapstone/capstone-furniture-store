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
   const result = await db.query("SELECT * FROM products");
   console.log(result)
    // console.log(req.body)
    res.json({
        status: "success",
        data: {
            product: ["Chair", "Mattress", "Bed Frame", "Couch"]
        }
    })
});

//get single product
app.get("/api/v1/products/:id", (req, res) => {
    // console.log(req.params);
    // console.log(req.body)
    res.status(200).json({
        status: "success",
        data: {
            product: "Chair"
        }
    })
});

//create a product
app.post("/api/v1/products", (req, res) => {
    // console.log(req.body);
    res.status(201).json({
        status: "success",
        data: {
            product: "Chair"
        }
    })
});

//update a product
app.put("/api/v1/products/:id", (req, res) => {
    // console.log(req.params.id)
    // console.log(req.body)
    res.status(200).json({
        status: "success",
        data: {
            product: "Chair"
        }
    })
});

//delete a product
app.delete("/api/v1/products/:id", (req,res) => {
    res.status(204).json({
        status: "success"
    });
});

port = process.env.PORT || 3000
app.listen(port, () => {
    console.log(`Server is up and listening on port ${port}`);
});

