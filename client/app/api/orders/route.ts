import { NextResponse } from "next/server";
import { getOrderDbPool } from "@/lib/db";
import { recordPaymentInDatabase } from "@/lib/api/payment-db";
import crypto from "crypto";

const DEFAULT_CUSTOMER_ID = "609563b9-3c51-4b25-80c2-a3b238ee929f";
const DEFAULT_SELLER_ID = "59972f9f-49ec-4592-9113-ba70a0aa3a52";

function isValidUuid(id?: string | null): boolean {
  if (!id) return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    id
  );
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const customerId = searchParams.get("customerId");
    const txRef = searchParams.get("txRef");

    const pool = getOrderDbPool();

    let query = `
      SELECT 
        o.id,
        o."orderNumber",
        o."customerId",
        o."sellerId",
        o.status,
        o."paymentStatus",
        o."subtotalAmount",
        o."deliveryFee",
        o."totalAmount",
        o."deliveryAddress",
        o.notes,
        o."txRef",
        o."createdAt",
        COALESCE(
          json_agg(
            json_build_object(
              'id', oi.id,
              'productId', oi."productId",
              'productTitle', oi."productTitle",
              'unitPrice', oi."unitPrice",
              'quantity', oi.quantity,
              'totalPrice', oi."totalPrice"
            )
          ) FILTER (WHERE oi.id IS NOT NULL), '[]'::json
        ) AS items
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi."orderId"
    `;

    const conditions: string[] = [];
    const values: any[] = [];

    if (txRef) {
      values.push(txRef);
      conditions.push(`o."txRef" = $${values.length}`);
    } else if (customerId && isValidUuid(customerId)) {
      values.push(customerId);
      conditions.push(`o."customerId" = $${values.length}`);
    }

    if (conditions.length > 0) {
      query += ` WHERE ${conditions.join(" AND ")}`;
    }

    query += ` GROUP BY o.id ORDER BY o."createdAt" DESC`;

    const result = await pool.query(query, values);

    return NextResponse.json({
      success: true,
      orders: result.rows.map((row) => ({
        id: row.id,
        orderNumber: row.orderNumber,
        customerId: row.customerId,
        sellerId: row.sellerId,
        status: row.status,
        paymentStatus: row.paymentStatus,
        paymentMethod: "Chapa Hosted Gateway (Telebirr / CBE / Card)",
        txRef: row.txRef || `MX-CHAPA-${row.orderNumber}`,
        subtotalAmount: Number(row.subtotalAmount),
        deliveryFee: Number(row.deliveryFee),
        totalAmount: Number(row.totalAmount),
        deliveryAddress: row.deliveryAddress || {},
        notes: row.notes,
        items: (row.items || []).map((it: any) => ({
          id: it.id,
          productId: it.productId,
          productTitle: it.productTitle,
          unitPrice: Number(it.unitPrice),
          quantity: Number(it.quantity),
          totalPrice: Number(it.totalPrice),
          image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80",
        })),
        createdAt: row.createdAt,
      })),
      total: result.rowCount,
    });
  } catch (err: any) {
    console.error("[Orders API GET Error]", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to fetch orders from database" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  const pool = getOrderDbPool();
  const client = await pool.connect();

  try {
    const body = await req.json();
    const {
      customerId,
      sellerId,
      txRef,
      items = [],
      deliveryAddress = {},
      deliveryFee = 0,
      subtotalAmount,
      totalAmount,
      notes = "",
    } = body;

    // Check if order with this txRef was already recorded
    if (txRef) {
      const existing = await client.query(
        'SELECT id, "orderNumber", "totalAmount", "customerId", "sellerId" FROM orders WHERE "txRef" = $1 LIMIT 1',
        [txRef]
      );
      if (existing.rows.length > 0) {
        const exOrder = existing.rows[0];

        // Update existing order status to CONFIRMED and paymentStatus to PAID
        await client.query(
          `UPDATE orders SET "paymentStatus" = 'PAID', status = 'CONFIRMED', "updatedAt" = NOW() WHERE id = $1`,
          [exOrder.id]
        );

        // Ensure payment is also recorded in mercatox_payment_db
        try {
          await recordPaymentInDatabase({
            transactionReference: txRef,
            orderId: exOrder.id,
            customerId: exOrder.customerId,
            sellerId: exOrder.sellerId,
            amount: Number(exOrder.totalAmount),
            currency: "ETB",
            provider: body.paymentMethod || "CHAPA",
            status: "COMPLETED",
            providerReference: txRef,
            escrowStatus: "HELD",
            metadata: {
              orderNumber: exOrder.orderNumber,
              deliveryAddress,
              itemsCount: items.length,
              status: "COMPLETED",
              syncedAt: new Date().toISOString(),
            },
          });
        } catch (paySyncErr) {
          console.warn("[Orders API] Failed to sync payment to mercatox_payment_db for existing order:", paySyncErr);
        }

        return NextResponse.json({
          success: true,
          message: "Order payment confirmed in database",
          orderId: exOrder.id,
          orderNumber: exOrder.orderNumber,
        });
      }
    }

    const orderId = crypto.randomUUID();
    const resolvedCustomerId = isValidUuid(customerId)
      ? customerId
      : DEFAULT_CUSTOMER_ID;
    const resolvedSellerId = isValidUuid(sellerId)
      ? sellerId
      : DEFAULT_SELLER_ID;

    const orderNumber = `MX-${new Date().getFullYear()}-${Math.floor(
      100000 + Math.random() * 900000
    )}`;

    const calcSubtotal =
      subtotalAmount ||
      items.reduce(
        (sum: number, it: any) => sum + Number(it.price || it.unitPrice || 0) * (it.quantity || 1),
        0
      );
    const calcDeliveryFee = Number(deliveryFee) || 0;
    const calcTotal = totalAmount || calcSubtotal + calcDeliveryFee;
    const effectiveTxRef = txRef || `MX-CHAPA-${orderNumber}`;

    await client.query("BEGIN");

    // Insert order
    await client.query(
      `
      INSERT INTO orders (
        id,
        "orderNumber",
        "customerId",
        "sellerId",
        status,
        "paymentStatus",
        "subtotalAmount",
        "deliveryFee",
        "totalAmount",
        "deliveryAddress",
        notes,
        "txRef",
        "createdAt",
        "updatedAt"
      ) VALUES ($1, $2, $3, $4, 'CONFIRMED', 'PAID', $5, $6, $7, $8, $9, $10, NOW(), NOW())
    `,
      [
        orderId,
        orderNumber,
        resolvedCustomerId,
        resolvedSellerId,
        calcSubtotal,
        calcDeliveryFee,
        calcTotal,
        JSON.stringify(deliveryAddress),
        notes,
        effectiveTxRef,
      ]
    );

    // Insert order items
    for (const it of items) {
      const itemId = crypto.randomUUID();
      const itemProductId = isValidUuid(it.productId || it.id)
        ? (it.productId || it.id)
        : crypto.randomUUID();
      const itemTitle = it.name || it.productTitle || "Mercato Product";
      const itemUnitPrice = Number(it.price || it.unitPrice || 0);
      const itemQty = Number(it.quantity || 1);
      const itemTotalPrice = itemUnitPrice * itemQty;

      await client.query(
        `
        INSERT INTO order_items (
          id,
          "orderId",
          "productId",
          "productTitle",
          "unitOfMeasure",
          "unitPrice",
          quantity,
          "totalPrice",
          "createdAt",
          "updatedAt"
        ) VALUES ($1, $2, $3, $4, 'PIECE', $5, $6, $7, NOW(), NOW())
      `,
        [
          itemId,
          orderId,
          itemProductId,
          itemTitle,
          itemUnitPrice,
          itemQty,
          itemTotalPrice,
        ]
      );
    }

    await client.query("COMMIT");

    console.log("[Orders API POST] Persisted order in PostgreSQL database:", orderId, {
      orderNumber,
      customerId: resolvedCustomerId,
      txRef: effectiveTxRef,
      totalAmount: calcTotal,
      itemsCount: items.length,
    });

    // Save payment details into mercatox_payment_db database!
    let paymentRecord: any = null;
    try {
      paymentRecord = await recordPaymentInDatabase({
        transactionReference: effectiveTxRef,
        orderId,
        customerId: resolvedCustomerId,
        sellerId: resolvedSellerId,
        amount: calcTotal,
        currency: "ETB",
        provider: body.paymentMethod || "CHAPA",
        status: "COMPLETED",
        providerReference: effectiveTxRef,
        escrowStatus: "HELD",
        metadata: {
          orderNumber,
          deliveryAddress,
          notes,
          itemCount: items.length,
          items: items.map((it: any) => ({
            id: it.id,
            title: it.name || it.productTitle,
            unitPrice: it.price || it.unitPrice,
            quantity: it.quantity,
          })),
          paymentCompletedAt: new Date().toISOString(),
        },
      });
      console.log(
        "[Orders API POST] Successfully saved payment in mercatox_payment_db:",
        effectiveTxRef,
        paymentRecord?.paymentId
      );
    } catch (payDbErr) {
      console.error(
        "[Orders API POST] Failed to save payment in mercatox_payment_db:",
        payDbErr
      );
    }

    return NextResponse.json({
      success: true,
      order: {
        id: orderId,
        orderNumber,
        customerId: resolvedCustomerId,
        txRef: effectiveTxRef,
        totalAmount: calcTotal,
      },
      payment: paymentRecord,
    });
  } catch (err: any) {
    await client.query("ROLLBACK");
    console.error("[Orders API POST Error]", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to save order to database" },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}
