const { Pool } = require('pg');
require('dotenv').config();

// Hosts like Cloudways Velocity, Heroku, Render, etc. usually inject a single
// DATABASE_URL connection string rather than separate PGHOST/PGUSER/... vars.
// Prefer DATABASE_URL when present; fall back to individual PG* vars for local dev.
const useConnectionString = Boolean(process.env.DATABASE_URL);

const sslEnabled = process.env.PGSSL === 'true' || process.env.DATABASE_URL?.includes('sslmode=require');

const pool = useConnectionString
  ? new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: sslEnabled ? { rejectUnauthorized: false } : undefined,
    })
  : new Pool({
      host: process.env.PGHOST || 'localhost',
      port: process.env.PGPORT || 5432,
      user: process.env.PGUSER || 'postgres',
      password: process.env.PGPASSWORD || 'postgres',
      database: process.env.PGDATABASE || 'testtrack',
      ssl: sslEnabled ? { rejectUnauthorized: false } : undefined,
    });

pool.on('error', (err) => {
  console.error('Unexpected PG pool error', err);
});

module.exports = pool;
