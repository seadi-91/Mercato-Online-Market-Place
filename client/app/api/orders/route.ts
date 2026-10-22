import { NextResponse } from "next/server";
import { getOrderDbPool, getUsersDbPool, getPaymentDbPool } from "@/lib/db";
import { recordPaymentInDatabase } from "@/lib/api/payment-db";
import { getAccurateProductImage } from "@/lib/utils/product-image";
import { sendOrderEmailsDirectly } from "@/lib/mailer";
import crypto from "crypto";

const DEFAULT_CUSTOMER_ID = "609563b9-3c51-4b25-80c2-a3b238ee929f";
const DEFAULT_SELLER_ID = "59972f9f-49ec-4592-9113-ba70a0aa3a52";

function isValidUuid(id?: string | null): boolean {
  if (!id) return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    id
  );
}

export async function triggerOrderEmailNotifications(payload: any) {
  try {
    let deliv = payload.deliveryAddress || {};
    if (typeof deliv === "string") {
      try {
        deliv = JSON.parse(deliv);
      } catch {
        deliv = {};
      }
    }

    let customerEmail =
      payload.customerEmail ||
      deliv.buyerEmail ||
      deliv.email ||
      payload.email;

    let customerName =
      payload.customerName ||
      deliv.buyerName ||
      deliv.recipientName ||
      deliv.fullName ||
      payload.fullName;

    let customerPhone =
      payload.customerPhone ||
      deliv.buyerPhone ||
      deliv.recipientPhone ||
      deliv.phone ||
      payload.phoneNumber;

    // If customer email is missing, synthetic placeholder, or example address, resolve from DB
    const targetUserId = payload.customerId || deliv.buyerId;
    if (
      !customerEmail ||
      customerEmail.includes(".mercatox@gmail.com") ||
      customerEmail.includes("example.com")
    ) {
      // 1. Try resolving via profiles table by targetUserId
      if (targetUserId && isValidUuid(targetUserId)) {
        try {
          const usersPool = getUsersDbPool();
          const pRes = await usersPool.query(
            `SELECT email, "fullName", "phoneNumber" FROM profiles WHERE "userId" = $1 OR id = $1 LIMIT 1`,
            [targetUserId]
          );
          if (pRes.rows.length > 0 && pRes.rows[0].email && !pRes.rows[0].email.includes("example.com")) {
            customerEmail = pRes.rows[0].email;
            if (!customerName) customerName = pRes.rows[0].fullName;
            if (!customerPhone) customerPhone = pRes.rows[0].phoneNumber;
          }
        } catch (err) {
          console.warn("[Orders API] Could not resolve customer profile by userId:", err);
        }
      }

      // 2. Try resolving via profiles table by phone number
      if ((!customerEmail || customerEmail.includes(".mercatox@gmail.com") || customerEmail.includes("example.com")) && customerPhone) {
        try {
          const rawDigits = String(customerPhone).replace(/\D/g, "");
          if (rawDigits.length >= 8) {
            const usersPool = getUsersDbPool();
            const pRes = await usersPool.query(
              `SELECT email, "fullName", "phoneNumber" FROM profiles WHERE "phoneNumber" LIKE $1 LIMIT 1`,
              [`%${rawDigits.slice(-8)}%`]
            );
            if (pRes.rows.length > 0 && pRes.rows[0].email && !pRes.rows[0].email.includes("example.com")) {
              customerEmail = pRes.rows[0].email;
              if (!customerName) customerName = pRes.rows[0].fullName;
            }
          }
        } catch { }
      }

      // 3. Try resolving via mercatox_cards table
      if (!customerEmail || customerEmail.includes(".mercatox@gmail.com") || customerEmail.includes("example.com")) {
        try {
          const payPool = getPaymentDbPool();
          const cleanPhone = String(customerPhone || "").replace(/\D/g, "");
          const cRes = await payPool.query(
            `SELECT email, "cardholderName" FROM mercatox_cards WHERE ("phoneNumber" LIKE $1 OR "customerId"::text = $2) AND email NOT LIKE '%example.com%' ORDER BY "createdAt" DESC LIMIT 1`,
            [`%${cleanPhone.slice(-8)}%`, targetUserId || ""]
          );
          if (cRes.rows.length > 0 && cRes.rows[0].email) {
            customerEmail = cRes.rows[0].email;
            if (!customerName) customerName = cRes.rows[0].cardholderName;
          }
        } catch { }
      }
    }

    // Normalize and enrich items with seller info if missing
    const rawItems = Array.isArray(payload.items) ? payload.items : [];
    const enrichedItems: any[] = [];
    const usersPool = getUsersDbPool();

    for (const it of rawItems) {
      let sEmail = it.sellerEmail;
      let sName = it.sellerName;
      const sId = it.sellerId || payload.sellerId;

      if (!sEmail && sId && isValidUuid(sId)) {
        try {
          const sRes = await usersPool.query(
            `SELECT email, "shopName", "fullName" FROM profiles WHERE "userId" = $1 OR id = $1 LIMIT 1`,
            [sId]
          );
          if (sRes.rows.length > 0) {
            sEmail = sRes.rows[0].email;
            sName = sRes.rows[0].shopName || sRes.rows[0].fullName;
          }
        } catch {
          // ignore
        }
      }

      enrichedItems.push({
        ...it,
        sellerId: sId,
        sellerEmail: sEmail || "muradsada8@gmail.com",
        sellerName: sName || "Mercato Wholesale Merchant",
      });
    }

    const orderNumber = payload.orderNumber || payload.id;

    // 1. Send all order emails directly via Nodemailer (Customer, Admin, and Each Seller)
    try {
      const emailResults = await sendOrderEmailsDirectly({
        orderNumber,
        customerEmail,
        customerName: customerName || "Valued Customer",
        customerPhone: customerPhone || "Not provided",
        deliveryAddress: deliv,
        items: enrichedItems,
        subtotal: Number(payload.subtotalAmount || payload.subtotal || 0),
        deliveryFee: Number(payload.deliveryFee || 0),
        totalAmount: Number(payload.totalAmount || 0),
        paymentMethod: payload.paymentMethod || "Chapa Escrow (Telebirr / CBE / Card)",
        paymentStatus: payload.paymentStatus || "PAID",
      });
      console.log(`[Orders API] Direct order emails dispatched:`, emailResults);
    } catch (mailErr: any) {
      console.error(`[Orders API] Error sending direct order emails:`, mailErr.message || mailErr);
    }

    // 2. Also notify API Gateway asynchronously to sync microservices and audit logs
    const apiGatewayUrl =
      process.env.INTERNAL_API_GATEWAY_URL ||
      process.env.API_GATEWAY_URL ||
      process.env.NEXT_PUBLIC_API_URL ||
      "http://localhost:3001";

    try {
      await fetch(`${apiGatewayUrl}/orders/notify-new-order`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...payload,
          customerEmail,
          customerName,
          customerPhone,
          items: enrichedItems,
        }),
        signal: AbortSignal.timeout(5000),
      }).catch((gatewayErr) => {
        console.warn(`[Orders API] API Gateway notification ping failed (non-critical):`, gatewayErr.message || gatewayErr);
      });
    } catch (e) {
      // non-critical
    }
  } catch (err: any) {
    console.warn(`[Orders API] Error in triggerOrderEmailNotifications:`, err.message || err);
  }
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
        o."carrierId",
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

    const orderId = searchParams.get("id") || searchParams.get("orderId");

    if (orderId) {
      if (isValidUuid(orderId)) {
        values.push(orderId);
        conditions.push(`o.id = $${values.length}`);
      }
    } else if (txRef) {
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
          carrierId: row.carrierId || delivAddr?.assignedDriver?.id || null,
          assignedDriver: delivAddr?.assignedDriver || null,
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

    let resolvedCustomerEmail =
      deliveryAddress?.buyerEmail ||
      deliveryAddress?.email ||
      body.customerEmail ||
      body.email;

    if (
      !resolvedCustomerEmail ||
      resolvedCustomerEmail.includes(".mercatox@gmail.com") ||
      resolvedCustomerEmail.includes("example.com")
    ) {
      if (resolvedCustomerId && isValidUuid(resolvedCustomerId) && resolvedCustomerId !== DEFAULT_CUSTOMER_ID) {
        try {
          const usersPool = getUsersDbPool();
          const pRes = await usersPool.query(
            `SELECT email FROM profiles WHERE "userId" = $1 OR id = $1 LIMIT 1`,
            [resolvedCustomerId]
          );
          if (pRes.rows.length > 0 && pRes.rows[0].email && !pRes.rows[0].email.includes("example.com")) {
            resolvedCustomerEmail = pRes.rows[0].email.trim();
          }
        } catch { }
      }

      if (
        (!resolvedCustomerEmail || resolvedCustomerEmail.includes(".mercatox@gmail.com") || resolvedCustomerEmail.includes("example.com")) &&
        (deliveryAddress?.phone || deliveryAddress?.buyerPhone)
      ) {
        try {
          const rawDigits = String(deliveryAddress.phone || deliveryAddress.buyerPhone).replace(/\D/g, "");
          if (rawDigits.length >= 8) {
            const usersPool = getUsersDbPool();
            const pRes = await usersPool.query(
              `SELECT email FROM profiles WHERE "phoneNumber" LIKE $1 LIMIT 1`,
              [`%${rawDigits.slice(-8)}%`]
            );
            if (pRes.rows.length > 0 && pRes.rows[0].email && !pRes.rows[0].email.includes("example.com")) {
              resolvedCustomerEmail = pRes.rows[0].email.trim();
            }
          }
        } catch { }
      }
    }

    const augmentedDeliveryAddress = {
      ...(typeof deliveryAddress === "object" ? deliveryAddress : {}),
      buyerId: deliveryAddress?.buyerId || (isValidUuid(customerId) ? customerId : undefined) || resolvedCustomerId,
      buyerEmail: resolvedCustomerEmail,
      email: resolvedCustomerEmail,
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

        // Trigger order email notifications (Customer, Admin, and Each Seller)
        await triggerOrderEmailNotifications({
          id: exOrder.id,
          orderNumber: exOrder.orderNumber,
          customerId: exOrder.customerId,
          sellerId: exOrder.sellerId,
          customerEmail: resolvedCustomerEmail,
          subtotalAmount: Number(exOrder.subtotalAmount || exOrder.totalAmount),
          deliveryFee: Number(exOrder.deliveryFee || 0),
          totalAmount: Number(exOrder.totalAmount),
          deliveryAddress: augmentedDeliveryAddress,
          paymentMethod: body.paymentMethod || "Chapa Escrow (Telebirr / CBE / Card)",
          paymentStatus: finalPaymentStatus,
          notes: body.notes || "",
          items: itemsSnapshot,
          createdAt: new Date().toISOString(),
        });

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

    // Trigger order email notifications (Customer, Admin, and Each Seller)
    await triggerOrderEmailNotifications({
      id: orderId,
      orderNumber: finalOrderNumber,
      customerId: resolvedCustomerId,
      sellerId: resolvedSellerId,
      customerEmail: resolvedCustomerEmail,
      subtotalAmount: calcSubtotal,
      deliveryFee: calcDeliveryFee,
      totalAmount: calcTotal,
      deliveryAddress: augmentedDeliveryAddress,
      paymentMethod: body.paymentMethod || "Chapa Escrow (Telebirr / CBE / Card)",
      paymentStatus: finalPaymentStatus,
      notes,
      items: itemsSnapshot,
      createdAt: new Date().toISOString(),
    });

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
    const { orderId, newStatus, cancelReason, notes, carrierId, assignedDriver } = body || {};

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

    if (carrierId !== undefined) {
      if (carrierId && isValidUuid(carrierId)) {
        values.push(carrierId);
        updates.push(`"carrierId" = $${values.length}`);
      } else if (carrierId === null || carrierId === "") {
        updates.push(`"carrierId" = NULL`);
      }
    }

    if (assignedDriver !== undefined) {
      values.push(JSON.stringify(assignedDriver));
      updates.push(
        `"deliveryAddress" = jsonb_set(COALESCE("deliveryAddress", '{}'::jsonb), '{assignedDriver}', $${values.length}::jsonb)`
      );
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
