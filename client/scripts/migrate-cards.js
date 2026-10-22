const { Pool } = require('pg');

async function run() {
  const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 5432,
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'root',
    database: process.env.PAYMENTS_DB_NAME || 'mercatox_payment_db',
  });

  try {
    console.log('Connecting to mercatox_payment_db...');
    const client = await pool.connect();
    
    console.log('Altering mercatox_cards table to ensure cardPassword and passwordEmailSent columns...');
    await client.query(`
      ALTER TABLE mercatox_cards ADD COLUMN IF NOT EXISTS "cardPassword" VARCHAR(50);
      ALTER TABLE mercatox_cards ADD COLUMN IF NOT EXISTS "passwordEmailSent" BOOLEAN DEFAULT FALSE;
    `);

    // For any existing cards that don't have cardPassword, assign an 8-digit password
    const res = await client.query(`SELECT id, "cardNumber", "cardPassword" FROM mercatox_cards WHERE "cardPassword" IS NULL`);
    for (const row of res.rows) {
      const pin = Math.floor(10000000 + Math.random() * 90000000).toString();
      await client.query(`UPDATE mercatox_cards SET "cardPassword" = $1 WHERE id = $2`, [pin, row.id]);
      console.log(`Updated card ${row.cardNumber} with generated PIN: ${pin}`);
    }

    const check = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'mercatox_cards'
      ORDER BY ordinal_position
    `);
    console.log('Current columns:', check.rows.map(r => r.column_name));

    client.release();
    await pool.end();
    console.log('Done!');
  } catch (err) {
    console.error('Migration error:', err);
    process.exit(1);
  }
}

run();
