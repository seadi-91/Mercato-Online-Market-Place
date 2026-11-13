import { NextResponse } from "next/server";
import { recordPaymentInDatabase } from "@/lib/api/payment-db";
import { getOrderDbPool, getPaymentDbPool } from "@/lib/db";
import { triggerOrderEmailNotifications } from "@/app/api/orders/route";
import crypto from "crypto";

function isValidUuid(id?: string | null): boolean {
  if (!id) return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    id
  );
}

/**
 * Persists a verified & paid order into mercatox_order_db idempotently from Chapa payment metadata.
 */
async function confirmOrderFromVerifiedPayment(
  txRef: string,
  paymentRow: any
): Promise<{ persisted: boolean; orderId?: string; orderNumber?: string }> {
  const pending = paymentRow?.metadata?.pendingOrder;
  const orderPool = getOrderDbPool();
  const client = await orderPool.connect();

  try {
    // 1. Check if order already exists for this txRef
    const existing = await client.query(
      `SELECT id, "orderNumber", "paymentStatus", status FROM orders WHERE "txRef" = $1 LIMIT 1`,
      [txRef]
    );

    if (existing.rows.length > 0) {
      const ex = existing.rows[0];
      if (ex.paymentStatus !== "PAID") {
        await client.query(
          `UPDATE orders SET "paymentStatus" = 'PAID', status = 'CONFIRMED', "updatedAt" = NOW() WHERE id = $1`,
          [ex.id]
        );
      }
      return { persisted: true, orderId: ex.id, orderNumber: ex.orderNumber };
    }

    if (!pending) {
      return { persisted: false };
    }

    const orderId = isValidUuid(pending.orderId) ? pending.orderId : crypto.randomUUID();
    const orderNumber =
      pending.orderNumber || `MX-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;
    const customerId = isValidUuid(pending.customerId)
      ? pending.customerId
      : isValidUuid(paymentRow?.customerId)
      ? paymentRow.customerId
      : crypto.randomUUID();
    const sellerId = isValidUuid(pending.sellerId)
      ? pending.sellerId
      : isValidUuid(paymentRow?.sellerId)
      ? paymentRow.sellerId
      : "59972f9f-49ec-4592-9113-ba70a0aa3a52";

    await client.query("BEGIN");

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
        customerId,
        sellerId,
        Number(pending.subtotalAmount || pending.totalAmount || 0),
        Number(pending.deliveryFee || 0),
        Number(pending.totalAmount || 0),
        JSON.stringify(pending.deliveryAddress || {}),
        pending.notes || "",
        txRef,
      ]
    );

    const items = Array.isArray(pending.itemsSnapshot) && pending.itemsSnapshot.length > 0
      ? pending.itemsSnapshot
      : Array.isArray(pending.items)
      ? pending.items
      : [];

    for (const it of items) {
      const itemId = crypto.randomUUID();
      const itemProductId = isValidUuid(it.productId || it.id)
        ? it.productId || it.id
        : crypto.randomUUID();
      const itemTitle = it.productTitle || it.name || "Mercato Product";
      const itemUnitPrice = Number(it.unitPrice || it.price || 0);
      const itemQty = Number(it.quantity || 1);
      const itemTotalPrice = Number(it.totalPrice || itemUnitPrice * itemQty);

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
        [itemId, orderId, itemProductId, itemTitle, itemUnitPrice, itemQty, itemTotalPrice]
      );
    }

    await client.query("COMMIT");

    // Dispatch order email notifications
    try {
      await triggerOrderEmailNotifications({
        id: orderId,
        orderNumber,
        customerId,
        sellerId,
        customerEmail: pending.customerEmail,
        customerName: pending.customerName,
        customerPhone: pending.customerPhone,
        subtotalAmount: Number(pending.subtotalAmount || pending.totalAmount || 0),
        deliveryFee: Number(pending.deliveryFee || 0),
        totalAmount: Number(pending.totalAmount || 0),
        deliveryAddress: pending.deliveryAddress || {},
        paymentMethod: "Chapa Hosted Gateway",
        paymentStatus: "PAID",
        notes: pending.notes || "",
        items: pending.itemsSnapshot || items,
        createdAt: new Date().toISOString(),
      });
    } catch (mailErr) {
      console.warn("[Chapa Verify] Order notification email warning:", mailErr);
    }

    return { persisted: true, orderId, orderNumber };
  } catch (err) {
    await client.query("ROLLBACK").catch(() => {});
    console.error("[Chapa Verify] Failed persisting confirmed order:", err);
    return { persisted: false };
  } finally {
    client.release();
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const txRef = (searchParams.get("tx_ref") || searchParams.get("trx_ref"))?.trim();

    if (!txRef) {
      return NextResponse.json(
        { verified: false, status: "error", error: "Missing tx_ref parameter" },
        { status: 400 }
      );
    }

    // 1. Check existing payment record in mercatox_payment_db
    let existingPayment: any = null;
    try {
      const payPool = getPaymentDbPool();
      const payRes = await payPool.query(
        `SELECT * FROM payments WHERE "transactionReference" = $1 OR "providerReference" = $1 LIMIT 1`,
        [txRef]
      );
      if (payRes.rows.length > 0) {
        existingPayment = payRes.rows[0];
      }
    } catch (dbErr) {
      console.warn("[Chapa Verify API] Could not query payments DB:", dbErr);
    }

    // Case A: Verified MercatoX Card payment (already validated & deducted balance on backend)
    if (
      existingPayment &&
      existingPayment.status === "COMPLETED" &&
      existingPayment.metadata?.cardNumber
    ) {
      return NextResponse.json({
        status: "success",
        verified: true,
        paymentMethod: "MERCATOX_CARD",
        orderPersisted: true,
        orderId: existingPayment.orderId || existingPayment.metadata?.orderId,
        orderNumber: existingPayment.metadata?.orderNumber,
        data: {
          status: "success",
          tx_ref: txRef,
          amount: Number(existingPayment.amount),
        },
        reward: {
          rewardApplied: false,
          rewardPercent: 0,
          rewardAmount: 0,
        },
      });
    }

    // Case B: Chapa Hosted Gateway Verification against live Chapa API
    const chapaSecretKey = process.env.CHAPA_SECRET_KEY || "";
    const chapaBaseUrl =
      process.env.CHAPA_BASE_URL || "https://api.chapa.co/v1";

    if (!chapaSecretKey) {
      return NextResponse.json(
        {
          verified: false,
          status: "error",
          error: "Chapa secret key is not configured for payment verification.",
        },
        { status: 500 }
      );
    }

    const res = await fetch(
      `${chapaBaseUrl}/transaction/verify/${encodeURIComponent(txRef)}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${chapaSecretKey}`,
        },
      }
    );

    const data = await res.json().catch(() => ({}));

    const isChapaPaid =
      res.ok &&
      data?.status === "success" &&
      data?.data?.status === "success";

    if (!isChapaPaid) {
      return NextResponse.json(
        {
          ...data,
          verified: false,
          status: data?.data?.status || data?.status || "failed",
          error:
            typeof data?.message === "string"
              ? data.message
              : "Chapa has not confirmed a completed payment for this transaction.",
        },
        { status: 400 }
      );
    }

    const verifiedAmount = Number(data.data?.amount || existingPayment?.amount || 0);
    let rewardResult: any = null;

    try {
      await recordPaymentInDatabase({
        transactionReference: txRef,
        orderId: existingPayment?.orderId,
        customerId: existingPayment?.customerId,
        sellerId: existingPayment?.sellerId,
        amount: verifiedAmount,
        provider: "CHAPA",
        status: "COMPLETED",
        providerReference: data.data?.reference || txRef,
        escrowStatus: "HELD",
        metadata: {
          ...(existingPayment?.metadata || {}),
          chapaVerifyData: data.data,
          verifiedAt: new Date().toISOString(),
        },
      });
    } catch (dbErr) {
      console.warn("[Chapa Verify API] Failed to update mercatox_payment_db:", dbErr);
    }

    // Persist/confirm the order in PostgreSQL NOW that Chapa confirmed PAID
    const confirmResult = await confirmOrderFromVerifiedPayment(txRef, existingPayment);
    const orderPersisted = confirmResult.persisted;

    // Credit 2% cashback reward ONLY if customer ALREADY owns a purchased MercatoX Card
    try {
      const { creditChapaOrderRewardToCard } = await import("@/lib/api/card-db");
      const meta = existingPayment?.metadata || {};
      const pending = meta.pendingOrder || {};
      rewardResult = await creditChapaOrderRewardToCard({
        orderId: existingPayment?.orderId || pending.orderId,
        orderNumber: meta.orderNumber || pending.orderNumber,
        txRef,
        amount: verifiedAmount,
        customerId: existingPayment?.customerId || pending.customerId,
        email: pending.customerEmail || meta.email || data.data?.email,
        phoneNumber: pending.customerPhone || meta.phoneNumber || data.data?.phone_number,
        cardholderName:
          meta.fullName ||
          `${data.data?.first_name || ""} ${data.data?.last_name || ""}`.trim(),
        paymentMethod: "CHAPA",
      });
    } catch (rewardErr) {
      console.error("[Chapa Verify API] Error checking/crediting 2% card reward:", rewardErr);
    }

    return NextResponse.json({
      ...data,
      verified: true,
      paymentMethod: "CHAPA",
      orderPersisted,
      orderId: confirmResult.orderId || existingPayment?.orderId || existingPayment?.metadata?.pendingOrder?.orderId,
      orderNumber: confirmResult.orderNumber || existingPayment?.metadata?.orderNumber || existingPayment?.metadata?.pendingOrder?.orderNumber,
      reward: rewardResult,
    });
  } catch (err: any) {
    console.error("[Chapa Verify API] Error:", err);
    return NextResponse.json(
      {
        verified: false,
        status: "error",
        error: err.message || "Failed to verify transaction with Chapa",
      },
      { status: 500 }
    );
  }
}
