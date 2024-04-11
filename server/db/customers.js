

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