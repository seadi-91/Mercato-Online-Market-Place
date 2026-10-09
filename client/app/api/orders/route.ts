import { NextResponse } from "next/server";
import { getOrderDbPool } from "@/lib/db";
import { recordPaymentInDatabase } from "@/lib/api/payment-db";
import { getAccurateProductImage } from "@/lib/utils/product-image";
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
    const sellerId = searchParams.get("sellerId");
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
              'totalPrice', oi."totalPrice",
              'unitOfMeasure', oi."unitOfMeasure"
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
    } else if (sellerId && isValidUuid(sellerId)) {
      values.push(sellerId);
      conditions.push(`(o."sellerId" = $${values.length} OR o."deliveryAddress"::text LIKE '%${sellerId}%')`);
    }

    if (conditions.length > 0) {
      query += ` WHERE ${conditions.join(" AND ")}`;
    }

    query += ` GROUP BY o.id ORDER BY o."createdAt" DESC`;

    const result = await pool.query(query, values);

    return NextResponse.json({
      success: true,
      orders: result.rows.map((row) => {
        const delivAddr = typeof row.deliveryAddress === "string"
          ? (() => { try { return JSON.parse(row.deliveryAddress); } catch { return {}; } })()
          : row.deliveryAddress || {};

        const snapshotList: any[] = Array.isArray(delivAddr.itemsSnapshot) ? delivAddr.itemsSnapshot : [];

        const mappedItems = (row.items || []).map((it: any) => {
          const snapshotMatch = snapshotList.find(
            (s: any) => s.productId === it.productId || s.id === it.id || s.productTitle === it.productTitle || s.name === it.productTitle
          );

          const rawImg = snapshotMatch?.image || it.image;
          const finalImg = rawImg || getAccurateProductImage(it.productTitle, it.unitOfMeasure);
          const resolvedSeller = snapshotMatch?.sellerId || row.sellerId;

          return {
            id: it.id,
            productId: it.productId,
            productTitle: it.productTitle,
            unitPrice: Number(it.unitPrice),
            quantity: Number(it.quantity),
            totalPrice: Number(it.totalPrice),
            unitOfMeasure: it.unitOfMeasure || "PIECE",
            sellerId: resolvedSeller,
            image: finalImg,
          };
        });

        return {
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
          deliveryAddress: delivAddr,
          notes: row.notes,
          items: mappedItems.length > 0 ? mappedItems : snapshotList.map((s: any) => ({
            id: s.id || crypto.randomUUID(),
            productId: s.productId || s.id,
            productTitle: s.productTitle || s.name || "Mercato Product",
            unitPrice: Number(s.price || s.unitPrice || 0),
            quantity: Number(s.quantity || 1),
            totalPrice: Number(s.totalPrice || Number(s.price || s.unitPrice || 0) * Number(s.quantity || 1)),
            unitOfMeasure: s.unitOfMeasure || "PIECE",
            sellerId: s.sellerId || row.sellerId,
            image: s.image || getAccurateProductImage(s.productTitle || s.name),
          })),
          createdAt: row.createdAt,
        };
      }),
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

    const itemsSnapshot = items.map((it: any) => ({
      id: it.id,
      productId: isValidUuid(it.productId || it.id) ? (it.productId || it.id) : it.id,
      productTitle: it.name || it.productTitle || "Mercato Product",
      price: Number(it.price || it.unitPrice || 0),
      unitPrice: Number(it.price || it.unitPrice || 0),
      quantity: Number(it.quantity || 1),
      totalPrice: Number(it.price || it.unitPrice || 0) * Number(it.quantity || 1),
      image: it.image || getAccurateProductImage(it.name || it.productTitle),
      sellerId: it.sellerId || resolvedSellerId,
      unitOfMeasure: it.unitOfMeasure || "PIECE",
      sku: it.sku || it.productSku,
    }));

    const augmentedDeliveryAddress = {
      ...(typeof deliveryAddress === "object" ? deliveryAddress : {}),
      itemsSnapshot,
    };

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
          `UPDATE orders SET "paymentStatus" = 'PAID', status = 'CONFIRMED', "deliveryAddress" = $2, "updatedAt" = NOW() WHERE id = $1`,
          [exOrder.id, JSON.stringify(augmentedDeliveryAddress)]
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
              deliveryAddress: augmentedDeliveryAddress,
              itemsCount: items.length,
              items: itemsSnapshot,
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
    const firstItemSeller = items.find((it: any) => isValidUuid(it.sellerId))?.sellerId;
    const resolvedSellerId = isValidUuid(sellerId)
      ? sellerId
      : (firstItemSeller || DEFAULT_SELLER_ID);

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
        JSON.stringify(augmentedDeliveryAddress),
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

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { orderId, newStatus, cancelReason, notes } = body || {};

    if (!orderId) {
      return NextResponse.json(
        { success: false, error: "Order ID is required" },
        { status: 400 }
      );
    }

    const pool = getOrderDbPool();
    const updates: string[] = ['"updatedAt" = NOW()'];
    const values: any[] = [orderId];

    if (newStatus) {
      values.push(newStatus);
      updates.push(`status = $${values.length}`);
    }

    if (cancelReason !== undefined) {
      values.push(cancelReason);
      updates.push(`"cancelReason" = $${values.length}`);
    }

    if (notes !== undefined) {
      values.push(notes);
      updates.push(`notes = $${values.length}`);
    }

    const query = `UPDATE orders SET ${updates.join(", ")} WHERE id = $1`;
    await pool.query(query, values);

    return NextResponse.json({
      success: true,
      message: "Order updated successfully in database",
    });
  } catch (err: any) {
    console.error("[Orders API PATCH Error]", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to update order in database" },
      { status: 500 }
    );
  }
}
