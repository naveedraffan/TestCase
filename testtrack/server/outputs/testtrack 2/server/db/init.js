// Creates the database schema. Run with: npm run db:init
const fs = require('fs');
const path = require('path');
const pool = require('./pool');

async function init() {
  const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
  try {
    await pool.query(schema);
    console.log('✅ Schema applied successfully.');
  } catch (err) {
    console.error('❌ Failed to apply schema:', err.message);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

init();
