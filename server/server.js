require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const app = express();
const cors = require('cors');

const { client } = require("./db/client");
client.connect();

// Middleware
app.use(morgan("dev"));
app.use(express.json());
app.use(cors());


const adminRoutes = require("./api/admin");
const productRoutes = require("./api/products");
const customerRoutes = require("./api/customers");
const cartRoutes = require("./api/cart")
const orderRoutes = require("./api/orders")


app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/products', productRoutes);
app.use('/api/v1/customer', customerRoutes);
app.use('/api/v1/protected', customerRoutes);
app.use('/api/v1/cart', cartRoutes);
app.use('/api/v1/orders', orderRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is up and running on port ${PORT}`);
});
