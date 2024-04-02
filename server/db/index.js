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

async function updateCustomers(id, fields = {}){
    const setString = Object.keys(fields).map(
        (key, index) => `"${key}"=$${ index +1}`
    ).join(', ');

    if (setString.length === 0){
        return;
    }
    try{
        const {rows: [customers]}= await client.query(`
        UPDATE customers
        SET ${ setString}
        WHERE id = ${id}
        RETURNING *;
        `, Object.values(fields));
        return user;
    }catch (err){
        throw err;
    }
}

module.exports = {
    query: (text, params) => pool.query(text, params)

};