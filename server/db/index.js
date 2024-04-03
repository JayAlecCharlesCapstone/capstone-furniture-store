const { Pool, Client } = require("pg");

const pool = new Pool();

async function createCustomers({
    name,
    email,
    phone,
    street_address,
    city,
    state,
    country,
    postal_code

}){
    try{
        const{rows: [customers]} = await client.query(`
        INSERT INTO customers(name, email, phone, street_address, city, state, country, postal_code)
        VALUES($1, $2, $3, $4, $5, $6, $7, $8)
        ON CONFLICT (customers) DO NOTHING
        RETURNING *;
        `, [name, email, phone, street_address, city, state, country, postal_code]);
        return customers;
    }catch(err){
        throw err;
    }
}

async function updateCustomers(id, fields = {}) {
    const setString = Object.keys(fields).map(
        (key, index) => `"${key}"=$${index + 1}`
    ).join(', ');

    if (setString.length === 0) {
        return;
    }
    try {
        const { rows: [customers] } = await client.query(`
        UPDATE customers
        SET ${setString}
        WHERE id = ${id}
        RETURNING *;
        `, Object.values(fields));
        return user;
    }catch (err){
        throw err;
    }
}

async function getAllCustomers() {
    try {
        const { rows } = await client.query(`
        SELECT id, name, email, phone, street_address, city, state, country, postal_code
        FROM customers;
      `);

        return rows;
    } catch (error) {
        throw error;
    }
}

async function getCustomersById(userId) {
    try {
        const { rows: [customer] } = await client.query(`
        SELECT id, name, email, phone, street_address, city, state, country, postal_code
        FROM customers
        WHERE id=${customersId}
      `);

        if (!customers) {
            throw {
                name: "CustomerNotFoundError",
                message: "A customer with that id does not exist"
            }
        }


        return customer;
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
        INSERT INTO products("name, description, price, stock_quantity) 
        VALUES($1, $2, $3, $4)
        RETURNING *;
      `, [name, description, price, stock_quantity]);


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
            await client.query(`
            UPDATE products
            SET ${setString}
            WHERE id= ${productId}
            RETURNING *;
            `, Object.values(fields));
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

};