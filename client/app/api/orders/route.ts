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

    const email = searchParams.get("email");
    const phone = searchParams.get("phone");
    const orderNumber = searchParams.get("orderNumber");

    if (txRef) {
      values.push(txRef);
      conditions.push(`o."txRef" = $${values.length}`);
    } else if (orderNumber) {
      values.push(orderNumber);
      conditions.push(`o."orderNumber" = $${values.length}`);
    } else if (customerId) {
      if (isValidUuid(customerId)) {
        values.push(customerId);
        conditions.push(`(o."customerId" = $${values.length} OR o."deliveryAddress"::text LIKE '%${customerId}%')`);
      } else {
        conditions.push(`o."deliveryAddress"::text LIKE '%${customerId}%'`);
      }
    } else if (sellerId) {
      if (isValidUuid(sellerId)) {
        values.push(sellerId);
        conditions.push(`(o."sellerId" = $${values.length} OR o."deliveryAddress"::text LIKE '%${sellerId}%')`);
      } else {
        conditions.push(`o."deliveryAddress"::text LIKE '%${sellerId}%'`);
      }
    }

    if (email) {
      conditions.push(`o."deliveryAddress"::text ILIKE '%${email}%'`);
    }
    if (phone) {
      conditions.push(`o."deliveryAddress"::text LIKE '%${phone}%'`);
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

function sanitizeOrderStatus(status?: string): string {
  const s = String(status || "").toUpperCase();
  if (["PENDING", "CONFIRMED", "PROCESSING", "READY_FOR_PICKUP", "IN_TRANSIT", "DELIVERED", "CANCELLED"].includes(s)) {
    return s;
  }
  return "CONFIRMED";
}

function sanitizePaymentStatus(status?: string): string {
  const s = String(status || "").toUpperCase();
  if (s === "PENDING" || s === "UNPAID") return "UNPAID";
  if (s === "PAID" || s === "SUCCESS" || s === "COMPLETED") return "PAID";
  if (s === "REFUNDED") return "REFUNDED";
  return "PAID";
}

export async function POST(req: Request) {
  const pool = getOrderDbPool();
  const client = await pool.connect();

  try {
    const body = await req.json();
    const {
      customerId,
      sellerId,
      orderNumber: requestedOrderNumber,
      txRef,
      items = [],
      deliveryAddress = {},
      deliveryFee = 0,
      subtotalAmount,
      totalAmount,
      notes = "",
      status = "CONFIRMED",
      paymentStatus = "PAID",
    } = body;

    const firstItemSeller = items.find((it: any) => isValidUuid(it.sellerId))?.sellerId;
    const resolvedSellerId = isValidUuid(sellerId)
      ? sellerId
      : (firstItemSeller || DEFAULT_SELLER_ID);

    const resolvedCustomerId = isValidUuid(customerId)
      ? customerId
      : (deliveryAddress && isValidUuid(deliveryAddress.buyerId)
          ? deliveryAddress.buyerId
          : (deliveryAddress && isValidUuid(deliveryAddress.customerId)
              ? deliveryAddress.customerId
              : DEFAULT_CUSTOMER_ID));

    const finalStatus = sanitizeOrderStatus(status);
    const finalPaymentStatus = sanitizePaymentStatus(paymentStatus);

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
      buyerId: deliveryAddress?.buyerId || (isValidUuid(customerId) ? customerId : undefined) || resolvedCustomerId,
      buyerEmail: deliveryAddress?.buyerEmail || deliveryAddress?.email,
      buyerPhone: deliveryAddress?.buyerPhone || deliveryAddress?.phone,
      buyerName: deliveryAddress?.buyerName || deliveryAddress?.recipientName || deliveryAddress?.fullName,
      itemsSnapshot,
    };

    // Check if order with this txRef or orderNumber was already recorded
    if (txRef || requestedOrderNumber) {
      let existingQuery = 'SELECT id, "orderNumber", "totalAmount", "customerId", "sellerId" FROM orders WHERE ';
      const exVals: any[] = [];
      const exConds: string[] = [];
      if (txRef) {
        exVals.push(txRef);
        exConds.push(`"txRef" = $${exVals.length}`);
      }
      if (requestedOrderNumber) {
        exVals.push(requestedOrderNumber);
        exConds.push(`"orderNumber" = $${exVals.length}`);
      }
      existingQuery += exConds.join(' OR ') + ' LIMIT 1';

      const existing = await client.query(existingQuery, exVals);
      if (existing.rows.length > 0) {
        const exOrder = existing.rows[0];

        // Update existing order status and paymentStatus
        await client.query(
          `UPDATE orders SET "paymentStatus" = $2, status = $3, "deliveryAddress" = $4, "updatedAt" = NOW() WHERE id = $1`,
          [exOrder.id, finalPaymentStatus, finalStatus, JSON.stringify(augmentedDeliveryAddress)]
        );

        // Ensure payment is also recorded in mercatox_payment_db
        if (finalPaymentStatus === "PAID") {
          try {
            await recordPaymentInDatabase({
              transactionReference: txRef || `MX-CHAPA-${exOrder.orderNumber}`,
              orderId: exOrder.id,
              customerId: exOrder.customerId,
              sellerId: exOrder.sellerId,
              amount: Number(exOrder.totalAmount),
              currency: "ETB",
              provider: body.paymentMethod || "CHAPA",
              status: "COMPLETED",
              providerReference: txRef || `MX-CHAPA-${exOrder.orderNumber}`,
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
        }

        return NextResponse.json({
          success: true,
          message: "Order updated in database",
          orderId: exOrder.id,
          orderNumber: exOrder.orderNumber,
          status: finalStatus,
          paymentStatus: finalPaymentStatus,
        });
      }
    }

    const orderId = (body.id && isValidUuid(body.id)) ? body.id : crypto.randomUUID();
    const finalOrderNumber = requestedOrderNumber || `MX-${new Date().getFullYear()}-${Math.floor(
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
    const effectiveTxRef = txRef || `MX-CHAPA-${finalOrderNumber}`;

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
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW(), NOW())
    `,
      [
        orderId,
        finalOrderNumber,
        resolvedCustomerId,
        resolvedSellerId,
        finalStatus,
        finalPaymentStatus,
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

      let unitOfMeasure = 'PIECE';
      const rawUnit = String(it.unitOfMeasure || it.unit || '').toUpperCase();
      if (['PIECE', 'CARTON', 'DOZEN', 'KUNTAL', 'ROLL', 'KG', 'METRIC_TON', 'BAG', 'QUINTAL'].includes(rawUnit)) {
        unitOfMeasure = rawUnit;
      } else if (rawUnit.includes('KG')) {
        unitOfMeasure = 'KG';
      } else if (rawUnit.includes('TON')) {
        unitOfMeasure = 'METRIC_TON';
      } else if (rawUnit.includes('BAG')) {
        unitOfMeasure = 'BAG';
      } else if (rawUnit.includes('QUINTAL') || rawUnit.includes('KUNTAL')) {
        unitOfMeasure = 'QUINTAL';
      } else if (rawUnit.includes('CARTON')) {
        unitOfMeasure = 'CARTON';
      } else if (rawUnit.includes('DOZEN')) {
        unitOfMeasure = 'DOZEN';
      } else if (rawUnit.includes('ROLL')) {
        unitOfMeasure = 'ROLL';
      }

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
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
      `,
        [
          itemId,
          orderId,
          itemProductId,
          itemTitle,
          unitOfMeasure,
          itemUnitPrice,
          itemQty,
          itemTotalPrice,
        ]
      );
    }

    await client.query("COMMIT");

    console.log("[Orders API POST] Persisted order in PostgreSQL database:", orderId, {
      orderNumber: finalOrderNumber,
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
          orderNumber: finalOrderNumber,
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
        orderNumber: finalOrderNumber,
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
