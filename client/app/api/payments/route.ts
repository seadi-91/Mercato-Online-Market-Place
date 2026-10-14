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

    // Decorate with order info or subscription info
    try {
      const orderIds = paymentRows
        .map((p) => p.orderId)
        .filter((id) => Boolean(id) && typeof id === "string" && !id.startsWith("sub_"));

      let orderMap = new Map<string, any>();
      let orderItemsMap = new Map<string, any[]>();

      if (orderIds.length > 0) {
        try {
          const orderPool = getOrderDbPool();
          const ordRes = await orderPool.query(
            `SELECT id, "orderNumber", "deliveryAddress", "customerId", status, "paymentStatus", "subtotalAmount", "deliveryFee", "totalAmount", notes, "createdAt" FROM orders WHERE id = ANY($1)`,
            [orderIds]
          );
          orderMap = new Map<string, any>(ordRes.rows.map((o) => [o.id, o]));

          const itemsRes = await orderPool.query(
            `SELECT id, "orderId", "productId", "productTitle", "unitPrice", quantity, "totalPrice" FROM order_items WHERE "orderId" = ANY($1)`,
            [orderIds]
          ).catch(() => ({ rows: [] }));

          if (itemsRes?.rows?.length > 0) {
            for (const it of itemsRes.rows) {
              const existing = orderItemsMap.get(it.orderId) || [];
              existing.push({
                id: it.id,
                productId: it.productId,
                title: it.productTitle,
                name: it.productTitle,
                quantity: Number(it.quantity || 1),
                unitPrice: Number(it.unitPrice || 0),
                totalPrice: Number(it.totalPrice || 0),
              });
              orderItemsMap.set(it.orderId, existing);
            }
          }
        } catch (dbErr) {
          console.warn("[Payments API] DB order fetch error:", dbErr);
        }
      }

      const decorated = paymentRows.map((payment) => {
        const meta = payment.metadata || {};
        const isSubscription = Boolean(
          meta.isSubscription ||
          meta.planId ||
          meta.subscriberId ||
          payment.orderId?.startsWith("sub_") ||
          payment.transactionReference?.startsWith("TXN-SUB") ||
          payment.transactionReference?.startsWith("CHAPA-SUB")
        );

        if (isSubscription) {
          const planTitle = meta.planName || meta.planId || "Merchant Privilege Plan";
          const period = meta.billingPeriod || "monthly";
          const subItems = Array.isArray(meta.items) && meta.items.length > 0
            ? meta.items
            : [
                {
                  id: meta.planId || "plan",
                  title: `Subscription: ${planTitle}`,
                  name: `Privilege Plan: ${planTitle} (${period})`,
                  quantity: 1,
                  unitPrice: Number(payment.amount || meta.price || 0),
                },
              ];

          return {
            ...payment,
            isSubscription: true,
            orderId: undefined,
            orderNumber:
              payment.orderNumber ||
              meta.orderNumber ||
              `SUB-${(meta.planId || "TIER").toUpperCase().slice(0, 10)}`,
            customerName:
              meta.userName ||
              meta.fullName ||
              meta.depositorName ||
              "Subscribed Merchant",
            customerPhone:
              meta.paymentPhone ||
              meta.phoneNumber ||
              meta.phone ||
              "—",
            customerEmail: meta.userEmail || meta.email || "",
            deliveryAddress: `Merchant Subscription • ${meta.userRole || "SELLER"} Account`,
            itemsSummary: `Tier: ${planTitle} (${period})`,
            itemsCount: 1,
            items: subItems,
            metadata: {
              ...meta,
              isSubscription: true,
              subscriberId: meta.subscriberId || payment.id,
              userId: meta.userId || payment.customerId,
              planName: planTitle,
              billingPeriod: period,
            },
          };
        }

        const ord = orderMap.get(payment.orderId);
        const delivery = ord?.deliveryAddress || meta.deliveryAddress || {};
        const rawItems = orderItemsMap.get(payment.orderId) || (Array.isArray(meta.items) ? meta.items : []);
        const itemsList = rawItems.map((i: any) => ({
          id: i.id || i.productId,
          title: i.title || i.name || i.productTitle || "Product Item",
          name: i.title || i.name || i.productTitle || "Product Item",
          quantity: Number(i.quantity || 1),
          unitPrice: Number(i.unitPrice || i.price || 0),
          totalPrice: Number(i.totalPrice || (Number(i.unitPrice || 0) * Number(i.quantity || 1))),
        }));

        return {
          ...payment,
          isSubscription: false,
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
          itemsCount: itemsList.length || meta.itemCount || meta.itemsCount || 1,
          items: itemsList,
          orderDetails: ord || null,
        };
      });

      return NextResponse.json({
        success: true,
        payments: decorated,
        total: decorated.length,
      });
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

