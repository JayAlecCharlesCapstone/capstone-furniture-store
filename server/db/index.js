const { Client, Pool } = require("pg");
require("dotenv").config();

const client = new Client({
    user: process.env.PGUSER,
    host: process.env.PGHOST,
    database: process.env.PGDATABASE,
    port: process.env.PGPORT
});

async function connectToDatabase() {
    try {
        await client.connect();
        console.log("Connected to PostgreSQL database");
    } catch (error) {
        console.error("Error connecting to database:", error.message);
        throw error;
    }
}

// connectionString: process.env.DATABASE_URL || 'postgres://localhost:5432/jac_furniturestore',
// ssl: process.env.NODE_ENV ==='production' ? {rejectUnauthorized: false} : undefined,


const pool = new Pool({
    user: process.env.PGUSER,
    host: process.env.PGHOST,
    database: process.env.PGDATABASE,
    port: process.env.PGPORT
});

async function createCustomers({
    name,
    email,
    phone,
    username,
    password,
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
        INSERT INTO customers(name, email, phone, username, password, address_id)
        VALUES($1, $2, $3, $4, $5, $6)
        ON CONFLICT (email) DO NOTHING
        RETURNING *;
        `;
        const { rows: [customer] } = await client.query(customerQuery, [name, email, phone, username, password, address.address_id]);

        return { customer, address };
    } catch (err) {
        throw err;
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
    } catch (err) {
        throw err;
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
    } catch (err) {
        throw err;
    }
}


module.exports = {
    query: (text, params) => pool.query(text, params),
    createCustomers,
    createProducts,
    getAllCustomers,
    updateProduct,
    getCustomersById,
    updateCustomers,
    getAllProducts,
    client,
    connectToDatabase

};