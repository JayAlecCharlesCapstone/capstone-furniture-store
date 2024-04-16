
const {client} = require("./client")
const bcrypt = require("bcrypt")


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


module.exports = {
    createAdminUser,
    getAllAdminUsers
}