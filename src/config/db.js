require('dotenv').config();
const { Pool } = require('pg');

// const pool = new Pool({
//   user: process.env.DB_USER,
//   host: process.env.DB_HOST,
//   port: process.env.DB_PORT,
//   database: process.env.DB_NAME,
//   ssl: process.env.DB_SSL === 'true',
//   password: process.env.DB_PASSWORD,
// });

const connectionString = process.env.DATABASE_URL || '';
// Render Postgres exige SSL aunque DB_SSL venga en 'false' local.
// Auto-activa SSL si la URL es de Render o trae sslmode=require.
const needsSsl =
    process.env.DB_SSL === 'true' ||
    connectionString.includes('render.com') ||
    connectionString.includes('sslmode=require');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: needsSsl ? { rejectUnauthorized: false } : false,
});

module.exports = pool;