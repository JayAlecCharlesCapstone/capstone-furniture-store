const { Client, Pool } = require("pg");
require("dotenv").config();

const client = new Client({
    user: process.env.PGUSER,
    host: process.env.PGHOST,
    database: process.env.PGDATABASE,
    port: process.env.PGPORT
});

// connectionString: process.env.DATABASE_URL || 'postgres://localhost:5432/jac_furniturestore',
// ssl: process.env.NODE_ENV ==='production' ? {rejectUnauthorized: false} : undefined,


async function connectToDatabase() {
    try {
        await client.connect();
        console.log("Connected to PostgreSQL database");
    } catch (error) {
        console.error("Error connecting to database:", error.message);
        throw error;
    }
}



const pool = new Pool({
    user: process.env.PGUSER,
    host: process.env.PGHOST,
    database: process.env.PGDATABASE,
    port: process.env.PGPORT
});

async function createAdminUser({
    username,
    password_hash,
    password_salt
}) {
    try {
        const adminQuery = `
        INSERT INTO admin_users(username, password_hash, password_salt)
        VALUES ($1, $2, $3)
        RETURNING admin_id
        `
        const { rows } = await client.query(adminQuery, [username, password_hash, password_salt]);
        return rows[0].admim_id;
    } catch (err) {
        console.error(err);
    }
};

async function getAllAdminUsers() {
    try {
        const { rows } = await client.query(`
           SELECT * FROM admin_users
        `);

        return rows;
    } catch (error) {
        throw error;
    }
}

async function createCustomers({
    name,
    email,
    phone,
    username,
    password_hash,
    password_salt,
    street_address,
    city,
    state,
    country,
    postal_code
}) {
    try {
        const addressQuery = `
            INSERT INTO addresses(street_address, city, state, country, postal_code)
            VALUES($1, $2, $3, $4, $5)
            RETURNING address_id;
        `;
        const { rows: [address] } = await client.query(addressQuery, [street_address, city, state, country, postal_code]);

        const customerQuery = `
            INSERT INTO customers(name, email, phone, username, password_hash, password_salt , address_id)
            VALUES($1, $2, $3, $4, $5, $6, $7)
            ON CONFLICT (email) DO NOTHING
            RETURNING *;
        `;
        const { rows: [customer] } = await client.query(customerQuery, [name, email, phone, username, password_hash, password_salt, address.address_id]);

        return { customer, address };
    } catch (error) {
        throw error;
    }
}




async function updateCustomers(id, fields = {}) {
    const setString = Object.keys(fields).map((key, index) => `"${key}"=$${index + 1}`).join(', ');

    if (setString.length === 0) {
        return;
    }

    try {
        const { rows } = await client.query(`
            UPDATE customers
            SET ${setString}
            WHERE id = $${Object.keys(fields).length + 1}
            RETURNING *;
        `, [...Object.values(fields), id]);

        return rows[0];
    } catch (error) {
        throw error;
    }
}


async function getAllCustomers() {
    try {
        const { rows } = await client.query(`
            SELECT c.customer_id, c.name, c.email, c.phone, a.street_address, a.city, a.state, a.country, a.postal_code
            FROM customers c
            JOIN addresses a ON c.address_id = a.address_id;
        `);

        return rows;
    } catch (error) {
        throw error;
    }
}



async function getCustomersById(customerId) {
    try {
        const { rows } = await client.query(`
            SELECT id, name, email, phone, street_address, city, state, country, postal_code
            FROM customers
            WHERE id = $1;
        `, [customerId]);

        if (rows.length === 0) {
            throw {
                name: "CustomerNotFoundError",
                message: "A customer with that id does not exist"
            };
        }

        return rows[0];
    } catch (error) {
        throw error;
    }
}

async function createProducts({
    name,
    description,
    price,
    stock_quantity
}) {
    try {
        const { rows: [products] } = await client.query(`
        INSERT INTO products("name", description, price, stock_quantity) 
        VALUES($1, $2, $3, $4)
        RETURNING *;
      `, [name, description, price, stock_quantity]);

        return products;
    } catch (error) {
        throw error;
    }
}

async function getAllProducts() {
    try {
        const { rows } = await client.query(`
           SELECT * FROM products
        `);

        return rows;
    } catch (error) {
        throw error;
    }
}

async function updateProduct(productId, fields = {}) {
    const setString = Object.keys(fields).map(
        (key, index) => `"${key}"=$${index + 1}`
    ).join(', ');

    try {
        if (setString.length > 0) {
            const { rows } = await client.query(`
            UPDATE products
            SET ${setString}
            WHERE product_id = $${Object.keys(fields).length + 1}
            RETURNING *;
            `, [...Object.values(fields), productId]);

            return rows[0];
        }
    } catch (error) {
        throw error;
    }
};

async function getAllFinalizedOrders() {
    try {
        const { rows } = await client.query(`
            SELECT 
                o.order_id,
                o.customer_id,
                o.order_date,
                o.shipping_address_id,
                oi.order_item_id,
                oi.product_id,
                oi.quantity,
                oi.price_per_unit,
                p.name AS product_name,
                a.street_address,
                a.city,
                a.state,
                a.country,
                a.postal_code
            FROM Orders o
            JOIN Order_Items oi ON o.order_id = oi.order_id
            JOIN Products p ON oi.product_id = p.product_id
            JOIN Addresses a ON o.shipping_address_id = a.address_id
            ORDER BY o.order_date DESC;
        `);

        const orders = [];
        
        rows.forEach(row => {
            const existingOrder = orders.find(order => order.order_id === row.order_id);
            
            if (!existingOrder) {
                const newOrder = {
                    order_id: row.order_id,
                    customer_id: row.customer_id,
                    order_date: row.order_date,
                    shipping_address: {
                        street_address: row.street_address,
                        city: row.city,
                        state: row.state,
                        country: row.country,
                        postal_code: row.postal_code
                    },
                    items: []
                };
                newOrder.items.push({
                    order_item_id: row.order_item_id,
                    product_id: row.product_id,
                    product_name: row.product_name,
                    quantity: row.quantity,
                    price_per_unit: row.price_per_unit
                });
                orders.push(newOrder);
            } else {
                existingOrder.items.push({
                    order_item_id: row.order_item_id,
                    product_id: row.product_id,
                    product_name: row.product_name,
                    quantity: row.quantity,
                    price_per_unit: row.price_per_unit
                });
            }
        });

        return orders;

    } catch (error) {
        console.error("Error fetching finalized orders:", error);
        throw error;
    }
}


async function createOrder(customerId, shippingAddressId) {
    const query = `
        INSERT INTO Orders (customer_id, shipping_address_id)
        VALUES ($1, $2)
        RETURNING order_id;
    `;
    const values = [customerId, shippingAddressId];

    try {
        const result = await pool.query(query, values);
        const newOrder = result.rows[0];
        return newOrder; 
    } catch (error) {
        throw error;
    }
}


async function createOrderItem(order_id, product_id, quantity, price_per_unit){
    try {
        const {rows} = await client.query(`
        INSERT INTO Order_Items(order_id, product_id, quantity, price_per_unit)
        VALUES ($1, $2, $3, $4)
        RETURNING *;
        `, [order_id, product_id, quantity, price_per_unit]);

        return rows[0];
    } catch (error) {
        console.error(error)
    }
}


module.exports = {
    query: (text, params) => pool.query(text, params),
    createAdminUser,
    getAllAdminUsers,
    createCustomers,
    createProducts,
    getAllCustomers,
    updateProduct,
    getCustomersById,
    updateCustomers,
    getAllProducts,
    createOrder,
    createOrderItem,
    getAllFinalizedOrders,
    client,
    connectToDatabase
};