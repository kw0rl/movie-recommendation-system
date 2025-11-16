const { Pool } = require('pg');

// Create connection pool for PostgreSQL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? {
    rejectUnauthorized: false
  } : false
});

// Test connection
pool.on('connect', () => {
  console.log('Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

// Helper function to convert MySQL-style queries to PostgreSQL
const query = async (text, params) => {
  const start = Date.now();
  const res = await pool.query(text, params);
  const duration = Date.now() - start;
  console.log('Executed query', { text, duration, rows: res.rowCount });
  return res;
};

// Wrapper to match mysql2 API (returns [rows, fields] format)
const execute = async (text, params) => {
  const result = await pool.query(text, params);
  return [result.rows, result.fields];
};

module.exports = {
  query,
  execute,
  pool
};