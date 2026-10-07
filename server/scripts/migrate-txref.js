const { Client } = require('pg');

async function run() {
  const c = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 5432,
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'root',
    database: process.env.ORDERS_DB_NAME || 'mercatox_order_db',
  });

  try {
    await c.connect();
    await c.query(`ALTER TABLE orders ADD COLUMN IF NOT EXISTS "txRef" VARCHAR(100);`);
    console.log('Successfully added txRef column to orders table in mercatox_order_db');
    
    // Check columns
    const cols = await c.query(
      `SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'orders'`
    );
    console.log('Current orders columns:', cols.rows.map(r => r.column_name));
  } catch (err) {
    console.error('Error altering table:', err);
  } finally {
    await c.end();
  }
}

run();
