import { NextResponse } from "next/server";
import { getPaymentDbPool, getOrderDbPool } from "@/lib/db";
import { recordPaymentInDatabase } from "@/lib/api/payment-db";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const txRef = searchParams.get("txRef") || searchParams.get("tx_ref");
    const orderId = searchParams.get("orderId") || searchParams.get("order_id");
    const customerId = searchParams.get("customerId") || searchParams.get("customer_id");

    const pool = getPaymentDbPool();

    let query = `
      SELECT 
        id,
        "transactionReference",
        "orderId",
        "customerId",
        "sellerId",
        amount,
        currency,
        provider,
        status,
        "providerReference",
        "paymentReceiptUrl",
        "escrowStatus",
        metadata,
        "createdAt",
        "updatedAt"
      FROM payments
    `;

    const conditions: string[] = [];
    const values: any[] = [];

    if (txRef) {
      values.push(txRef);
      conditions.push(`"transactionReference" = $${values.length}`);
    } else if (orderId) {
      values.push(orderId);
      conditions.push(`"orderId" = $${values.length}`);
    } else if (customerId) {
      values.push(customerId);
      conditions.push(`"customerId" = $${values.length}`);
    }

    if (conditions.length > 0) {
      query += ` WHERE ${conditions.join(" AND ")}`;
    }

    query += ` ORDER BY "createdAt" DESC LIMIT 100`;

    const result = await pool.query(query, values);
    const paymentRows = result.rows;

    // Decorate with order info from mercatox_order_db if available
    try {
      const orderIds = paymentRows
        .map((p) => p.orderId)
        .filter((id) => Boolean(id) && typeof id === "string");

      if (orderIds.length > 0) {
        const orderPool = getOrderDbPool();
        const ordRes = await orderPool.query(
          `SELECT id, "orderNumber", "deliveryAddress", "customerId", status, "totalAmount", notes FROM orders WHERE id = ANY($1)`,
          [orderIds]
        );
        const orderMap = new Map<string, any>(ordRes.rows.map((o) => [o.id, o]));

        const decorated = paymentRows.map((payment) => {
          const ord = orderMap.get(payment.orderId);
          const meta = payment.metadata || {};
          const delivery = ord?.deliveryAddress || meta.deliveryAddress || {};

          return {
            ...payment,
            orderNumber:
              meta.orderNumber ||
              ord?.orderNumber ||
              (payment.orderId ? `MX-${payment.orderId.slice(0, 8).toUpperCase()}` : "N/A"),
            customerName:
              meta.fullName ||
              meta.depositorName ||
              meta.customerName ||
              delivery.recipientName ||
              "Customer",
            customerPhone:
              meta.phoneNumber ||
              meta.payerPhone ||
              delivery.phone ||
              delivery.recipientPhone ||
              "—",
            customerEmail: meta.email || delivery.email || "",
            deliveryAddress: [delivery.specificLocation, delivery.subCity, delivery.city]
              .filter(Boolean)
              .join(", ") || "Addis Ababa",
            itemsCount:
              meta.itemCount ||
              meta.itemsCount ||
              (Array.isArray(meta.items) ? meta.items.length : 0),
          };
        });

        return NextResponse.json({
          success: true,
          payments: decorated,
          total: decorated.length,
        });
      }
    } catch (decorateErr) {
      console.warn("[Payments API] Could not decorate with order details:", decorateErr);
    }

    return NextResponse.json({
      success: true,
      payments: paymentRows,
      total: result.rowCount,
    });
  } catch (err: any) {
    console.error("[Payments API GET Error]", err);
    return NextResponse.json(
      {
        success: false,
        error: err.message || "Failed to fetch payments from mercatox_payment_db",
      },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const result = await recordPaymentInDatabase(body);
    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (err: any) {
    console.error("[Payments API POST Error]", err);
    return NextResponse.json(
      {
        success: false,
        error: err.message || "Failed to record payment in mercatox_payment_db",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json(
        { success: false, error: "Payment ID is required" },
        { status: 400 }
      );
    }

    const pool = getPaymentDbPool();
    // Attempt deleting from payments table
    const result = await pool.query('DELETE FROM payments WHERE id = $1', [id]);

    return NextResponse.json({
      success: true,
      deletedCount: result.rowCount,
      id,
    });
  } catch (err: any) {
    console.error("[Payments API DELETE Error]", err);
    return NextResponse.json(
      {
        success: false,
        error: err.message || "Failed to delete payment from mercatox_payment_db",
      },
      { status: 500 }
    );
  }
}

