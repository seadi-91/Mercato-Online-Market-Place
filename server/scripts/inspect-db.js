const { Client } = require('pg');
const client = new Client({
  host: 'localhost',
  port: 5432,
  user: 'postgres',
  password: 'root',
  database: 'mercatox_catalog_db'
});

async function run() {
  await client.connect();
  const prods = await client.query('SELECT p.id, p.title, p.sku, p."retailPrice", p."stockQuantity", p.images, c.name as category_name, c.slug as category_slug FROM products p LEFT JOIN categories c ON p."categoryId" = c.id WHERE p."deletedAt" IS NULL');
  console.log('PRODUCTS IN DB (' + prods.rows.length + '):');
  prods.rows.forEach(r => console.log('  -', r.id, '|', r.title, '|', r.sku, '| Price:', r.retailPrice, '| Category:', r.category_name, '(', r.category_slug, ')'));

  const cats = await client.query('SELECT id, name, slug, "nameAmharic" FROM categories');
  console.log('\nCATEGORIES IN DB (' + cats.rows.length + '):');
  cats.rows.forEach(c => console.log('  -', c.id, '|', c.name, '|', c.slug, '|', c.nameAmharic));

  await client.end();
}
run().catch(console.error);
