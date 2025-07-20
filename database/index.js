// === File: database/index.js ===
const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false, // For use with services like Render.com
  },
});

module.exports = pool;
