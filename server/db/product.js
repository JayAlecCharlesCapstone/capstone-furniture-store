const { client } = require("./client")
const bcrypt = require("bcrypt")

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

module.exports = {
    updateProduct,
    getAllProducts,
    createProducts
}