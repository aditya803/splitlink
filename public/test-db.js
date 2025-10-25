/* eslint-disable @typescript-eslint/no-require-imports */
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('❌ Database connection failed:', err);
  } else {
    console.log('✅ Database connected! Current time:', res.rows[0].now);
  }
  pool.end();
});
