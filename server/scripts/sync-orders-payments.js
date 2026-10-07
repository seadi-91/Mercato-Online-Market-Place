const { Client } = require('pg');

async function sync() {
  const oClient = new Client({
    host: 'localhost', port: 5432, user: 'postgres', password: 'root', database: 'mercatox_order_db'
  });
  const pClient = new Client({
    host: 'localhost', port: 5432, user: 'postgres', password: 'root', database: 'mercatox_payment_db'
  });

  await oClient.connect();
  await pClient.connect();

  const orders = await oClient.query('SELECT * FROM orders ORDER BY "createdAt" DESC');
  const payments = await pClient.query('SELECT * FROM payments ORDER BY "createdAt" DESC');

  console.log(`Found ${orders.rows.length} orders and ${payments.rows.length} payments.`);

  for (const ord of orders.rows) {
    console.log(`Order: ${ord.id} (${ord.orderNumber}), amount: ${ord.totalAmount}, txRef: ${ord.txRef}`);
    
    // Check if payment exists with orderId or matching txRef
    const match = payments.rows.find(p => p.orderId === ord.id || (ord.txRef && p.transactionReference === ord.txRef));
    if (match) {
      console.log(`  Found matching payment: ${match.id} (tx: ${match.transactionReference}), updating orderId to ${ord.id}`);
      await pClient.query('UPDATE payments SET "orderId" = $1 WHERE id = $2', [ord.id, match.id]);
    } else {
      // Create a matching payment row for this existing order so it has full payment details!
      const pId = require('crypto').randomUUID();
      const txRef = ord.txRef || `MX-CHAPA-${ord.orderNumber}`;
      console.log(`  No matching payment for order ${ord.orderNumber}. Creating payment ${pId}...`);
      await pClient.query(`
        INSERT INTO payments (
          id, "transactionReference", "orderId", "customerId", "sellerId",
          amount, currency, provider, status, "providerReference", "escrowStatus",
          metadata, "createdAt", "updatedAt"
        ) VALUES (
          $1, $2, $3, $4, $5, $6, 'ETB', 'CHAPA', 'COMPLETED', $7, 'HELD', $8, $9, $10
        )
      `, [
        pId,
        txRef,
        ord.id,
        ord.customerId,
        ord.sellerId,
        Number(ord.totalAmount),
        txRef,
        JSON.stringify({
          orderNumber: ord.orderNumber,
          deliveryAddress: ord.deliveryAddress,
          notes: ord.notes,
        }),
        ord.createdAt,
        ord.updatedAt
      ]);
    }
  }

  console.log('Sync complete.');
  await oClient.end();
  await pClient.end();
}

sync().catch(console.error);
