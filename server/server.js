require("dotenv").config();
const express = require("express");
const app = express();


//ROUTES

// get all products
app.get("/api/v1/products", (req, res) =>{
    res.json({
        status: "success",
        data: {
            product: ["Chair","Mattress","Bed Frame","Couch"]
        }
    })
});

//get single product
app.get("/api/v1/products/:id", (req,res) => {
    console.log(req.params);
})

//create a product
app.post("/api/v1/products", (req,res) => {
    console.log(req);
})


port = process.env.PORT || 3000
app.listen(port, () => {
    console.log(`Server is up and listening on port ${port}`);
});

