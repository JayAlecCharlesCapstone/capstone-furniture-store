const { Client, Pool } = require("pg");
require("dotenv").config();

let DATABASE_URL = 'postgres://localhost:5432/jac_furniturestore'

const client = new Client({ connectionString: DATABASE_URL, ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : undefined, })



module.exports = {
    client
}
