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

async function getOrdersByCustomerId(customerId) {
    try {
        const { rows } = await pool.query(`
            SELECT o.order_id, o.order_date, oi.order_item_id, oi.product_id, p.name AS product_name, oi.quantity, oi.price_per_unit
            FROM orders o
            JOIN order_items oi ON o.order_id = oi.order_id
            JOIN products p ON oi.product_id = p.product_id
            WHERE o.customer_id = $1;
        `, [customerId]);

        const orders = rows.reduce((acc, row) => {
            const { order_id, order_date, ...item } = row;
            const existingOrder = acc.find(order => order.order_id === order_id);
            if (existingOrder) {
                existingOrder.items.push(item);
            } else {
                acc.push({ order_id, order_date, items: [item] });
            }
            return acc;
        }, []);

        return orders;
    } catch (error) {
        throw error;
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
    getOrdersByCustomerId,
    client,
    connectToDatabase
};