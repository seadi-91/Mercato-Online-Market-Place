import { NextResponse } from "next/server";
import { getPaymentDbPool, getOrderDbPool, getUsersDbPool } from "@/lib/db";
import { recordPaymentInDatabase } from "@/lib/api/payment-db";

function isValidUuid(id?: string | null): boolean {
  if (!id) return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    id
  );
}

function maskCardNumber(cardNumber?: string | null): string | null {
  if (!cardNumber) return null;
  const digits = String(cardNumber).replace(/\D/g, "");
  if (digits.length < 8) return String(cardNumber);
  return `${digits.slice(0, 4)} •••• •••• ${digits.slice(-4)}`;
}

function isSubscriptionPayment(payment: any): boolean {
  const meta = payment?.metadata || {};
  return Boolean(
    meta.isSubscription ||
      meta.planId ||
      meta.subscriberId ||
      payment?.orderId?.startsWith?.("sub_") ||
      payment?.transactionReference?.startsWith?.("TXN-SUB") ||
      payment?.transactionReference?.startsWith?.("CHAPA-SUB")
  );
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const txRef = searchParams.get("txRef") || searchParams.get("tx_ref");
    const orderId = searchParams.get("orderId") || searchParams.get("order_id");
    const customerId = searchParams.get("customerId") || searchParams.get("customer_id");
    const sellerId = searchParams.get("sellerId") || searchParams.get("seller_id");
    const isAdmin = searchParams.get("admin") === "true";

    const pool = getPaymentDbPool();

    let sellerOrders: any[] = [];
    let sellerOrderIds: string[] = [];

    if (sellerId) {
      try {
        const orderPool = getOrderDbPool();
        const sellerOrdersRes = await orderPool.query(
          `
          SELECT id, "orderNumber", "deliveryAddress", "customerId", "sellerId", status, "paymentStatus", "subtotalAmount", "deliveryFee", "totalAmount", notes, "txRef", "createdAt", "updatedAt"
          FROM orders
          WHERE "sellerId"::text = $1
             OR "deliveryAddress"::jsonb->>'sellerId' = $1
             OR "deliveryAddress"::text LIKE $2
          ORDER BY "createdAt" DESC
          LIMIT 250
          `,
          [sellerId, `%${sellerId}%`]
        );

        sellerOrders = sellerOrdersRes.rows.filter((row) => {
          const deliv =
            typeof row.deliveryAddress === "string"
              ? (() => {
                  try {
                    return JSON.parse(row.deliveryAddress);
                  } catch {
                    return {};
                  }
                })()
              : row.deliveryAddress || {};
          const itemsSnap = Array.isArray(deliv.itemsSnapshot) ? deliv.itemsSnapshot : [];
          return (
            row.sellerId === sellerId ||
            deliv.sellerId === sellerId ||
            itemsSnap.some((it: any) => it?.sellerId === sellerId)
          );
        });
        sellerOrderIds = sellerOrders.map((o) => o.id).filter(Boolean);
      } catch (ordErr) {
        console.warn("[Payments API] Seller orders lookup warning:", ordErr);
      }
    }

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
    } else if (sellerId) {
      values.push(sellerId);
      const sellerParamIdx = values.length;
      values.push(`%${sellerId}%`);
      const sellerLikeIdx = values.length;

      if (sellerOrderIds.length > 0) {
        values.push(sellerOrderIds);
        const orderIdsIdx = values.length;
        conditions.push(
          `("sellerId"::text = $${sellerParamIdx} OR "orderId"::text = ANY($${orderIdsIdx}) OR metadata::text LIKE $${sellerLikeIdx})`
        );
      } else {
        conditions.push(
          `("sellerId"::text = $${sellerParamIdx} OR metadata::text LIKE $${sellerLikeIdx})`
        );
      }
    }

    if (conditions.length === 0 && !isAdmin) {
      return NextResponse.json({ success: true, payments: [], payouts: [] });
    }

    if (conditions.length > 0) {
      query += ` WHERE ${conditions.join(" AND ")}`;
    }

    query += ` ORDER BY "createdAt" DESC LIMIT 200`;

    const result = await pool.query(query, values);
    let paymentRows = result.rows;

    // For seller queries, keep only order/product payments belonging to this seller (never another seller's subscription)
    if (sellerId) {
      const sellerOrderIdSet = new Set(sellerOrderIds);
      paymentRows = paymentRows.filter((payment) => {
        if (isSubscriptionPayment(payment)) return false;
        const meta = payment.metadata || {};
        const metaItems = Array.isArray(meta.items)
          ? meta.items
          : Array.isArray(meta.pendingOrder?.itemsSnapshot)
          ? meta.pendingOrder.itemsSnapshot
          : [];
        return (
          payment.sellerId === sellerId ||
          sellerOrderIdSet.has(payment.orderId) ||
          meta.sellerId === sellerId ||
          meta.pendingOrder?.sellerId === sellerId ||
          metaItems.some((it: any) => it?.sellerId === sellerId)
        );
      });

      // Synthesize entries for any PAID order belonging to this seller that does not have a payment row yet
      const coveredOrderIds = new Set(paymentRows.map((p) => p.orderId).filter(Boolean));
      const coveredTxRefs = new Set(
        paymentRows.map((p) => p.transactionReference).filter(Boolean)
      );

      for (const ord of sellerOrders) {
        if (ord.paymentStatus !== "PAID") continue;
        if (coveredOrderIds.has(ord.id)) continue;
        if (ord.txRef && coveredTxRefs.has(ord.txRef)) continue;

        const deliv =
          typeof ord.deliveryAddress === "string"
            ? (() => {
                try {
                  return JSON.parse(ord.deliveryAddress);
                } catch {
                  return {};
                }
              })()
            : ord.deliveryAddress || {};

        paymentRows.push({
          id: ord.txRef || `ORDPAY-${ord.id}`,
          transactionReference: ord.txRef || ord.orderNumber || `MX-ORD-${ord.id.slice(0, 8)}`,
          orderId: ord.id,
          customerId: ord.customerId,
          sellerId: ord.sellerId || sellerId,
          amount: Number(ord.totalAmount || 0),
          currency: "ETB",
          provider: deliv.paymentMethod || "CHAPA",
          status: "COMPLETED",
          providerReference: ord.txRef || ord.orderNumber,
          paymentReceiptUrl: null,
          escrowStatus: ord.status === "DELIVERED" ? "RELEASED" : "HELD",
          metadata: {
            orderNumber: ord.orderNumber,
            deliveryAddress: deliv,
            items: Array.isArray(deliv.itemsSnapshot) ? deliv.itemsSnapshot : [],
            isOrderDerived: true,
          },
          createdAt: ord.createdAt,
          updatedAt: ord.updatedAt || ord.createdAt,
        });
      }

      paymentRows.sort(
        (a, b) =>
          new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
      );
    }

    // Fetch seller payouts table rows if sellerId is specified
    let payoutRows: any[] = [];
    const payoutByPaymentId = new Map<string, any>();
    const payoutByOrderId = new Map<string, any>();
    if (sellerId) {
      try {
        const payOutRes = await pool.query(
          `
          SELECT id, "sellerId", "orderId", "paymentId", amount, "platformFee", "netPayoutAmount",
                 "bankName", "bankAccountNumber", "bankAccountHolderName", status, "processedAt",
                 "createdAt", "updatedAt"
          FROM payouts
          WHERE "sellerId"::text = $1
          ORDER BY "createdAt" DESC
          LIMIT 100
          `,
          [sellerId]
        );
        payoutRows = payOutRes.rows || [];
        for (const pr of payoutRows) {
          if (pr.paymentId) payoutByPaymentId.set(pr.paymentId, pr);
          if (pr.orderId) payoutByOrderId.set(pr.orderId, pr);
        }
      } catch (payoutErr) {
        console.warn("[Payments API] Payouts query warning:", payoutErr);
      }
    }

    // Decorate with order info, customer profile info, and subscription info
    try {
      const orderIds = Array.from(
        new Set(
          paymentRows
            .map((p) => p.orderId)
            .filter((id) => Boolean(id) && typeof id === "string" && !id.startsWith("sub_") && isValidUuid(id))
        )
      );

      let orderMap = new Map<string, any>(sellerOrders.map((o) => [o.id, o]));
      let orderItemsMap = new Map<string, any[]>();

      if (orderIds.length > 0) {
        try {
          const orderPool = getOrderDbPool();
          const missingOrderIds = orderIds.filter((id) => !orderMap.has(id));
          if (missingOrderIds.length > 0) {
            const ordRes = await orderPool.query(
              `SELECT id, "orderNumber", "deliveryAddress", "customerId", "sellerId", status, "paymentStatus", "subtotalAmount", "deliveryFee", "totalAmount", notes, "txRef", "createdAt" FROM orders WHERE id = ANY($1)`,
              [missingOrderIds]
            );
            for (const o of ordRes.rows) {
              orderMap.set(o.id, o);
            }
          }

          const itemsRes = await orderPool.query(
            `SELECT id, "orderId", "productId", "productTitle", "unitPrice", quantity, "totalPrice", "unitOfMeasure" FROM order_items WHERE "orderId" = ANY($1)`,
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
                unitOfMeasure: it.unitOfMeasure || "PIECE",
              });
              orderItemsMap.set(it.orderId, existing);
            }
          }
        } catch (dbErr) {
          console.warn("[Payments API] DB order fetch error:", dbErr);
        }
      }

      // Enrich customer details from profiles table in mercatox_users_db
      const profileMap = new Map<string, any>();
      try {
        const customerIds = Array.from(
          new Set(
            [
              ...paymentRows.map((p) => p.customerId),
              ...Array.from(orderMap.values()).map((o: any) => o.customerId),
            ].filter((id) => isValidUuid(id))
          )
        );
        if (customerIds.length > 0) {
          const usersPool = getUsersDbPool();
          const profRes = await usersPool.query(
            `SELECT id, "userId", email, "fullName", "phoneNumber" FROM profiles WHERE id::text = ANY($1) OR "userId"::text = ANY($1)`,
            [customerIds]
          );
          for (const pr of profRes.rows) {
            if (pr.id) profileMap.set(pr.id, pr);
            if (pr.userId) profileMap.set(pr.userId, pr);
          }
        }
      } catch (profErr) {
        console.warn("[Payments API] Customer profile lookup warning:", profErr);
      }

      const decorated = paymentRows.map((payment) => {
        const meta = payment.metadata || {};
        const isSubscription = isSubscriptionPayment(payment);

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
        const rawDelivery = ord?.deliveryAddress || meta.deliveryAddress || meta.pendingOrder?.deliveryAddress || {};
        const delivery =
          typeof rawDelivery === "string"
            ? (() => {
                try {
                  return JSON.parse(rawDelivery);
                } catch {
                  return {};
                }
              })()
            : rawDelivery || {};

        const customerProfile =
          profileMap.get(payment.customerId) || profileMap.get(ord?.customerId) || null;

        const rawItems =
          orderItemsMap.get(payment.orderId) ||
          (Array.isArray(delivery.itemsSnapshot) && delivery.itemsSnapshot.length > 0
            ? delivery.itemsSnapshot
            : null) ||
          (Array.isArray(meta.pendingOrder?.itemsSnapshot) && meta.pendingOrder.itemsSnapshot.length > 0
            ? meta.pendingOrder.itemsSnapshot
            : null) ||
          (Array.isArray(meta.items) && meta.items.length > 0 ? meta.items : []);

        const itemsList = rawItems.map((i: any) => ({
          id: i.id || i.productId,
          productId: i.productId || i.id,
          title: i.title || i.name || i.productTitle || "Product Item",
          name: i.title || i.name || i.productTitle || "Product Item",
          quantity: Number(i.quantity || 1),
          unitPrice: Number(i.unitPrice || i.price || 0),
          totalPrice: Number(i.totalPrice || Number(i.unitPrice || i.price || 0) * Number(i.quantity || 1)),
          unitOfMeasure: i.unitOfMeasure || "PIECE",
        }));

        const resolvedCustomerName =
          meta.fullName ||
          meta.depositorName ||
          meta.customerName ||
          meta.pendingOrder?.customerName ||
          delivery.buyerName ||
          delivery.recipientName ||
          customerProfile?.fullName ||
          "Customer";

        const resolvedCustomerPhone =
          meta.phoneNumber ||
          meta.payerPhone ||
          meta.pendingOrder?.customerPhone ||
          delivery.buyerPhone ||
          delivery.phone ||
          delivery.recipientPhone ||
          customerProfile?.phoneNumber ||
          "—";

        const rawEmail =
          meta.pendingOrder?.customerEmail ||
          delivery.buyerEmail ||
          delivery.email ||
          customerProfile?.email ||
          meta.email ||
          "";
        const resolvedCustomerEmail =
          rawEmail && !String(rawEmail).includes(".mercatox@gmail.com")
            ? rawEmail
            : customerProfile?.email || rawEmail || "";

        const resolvedAddress =
          [
            delivery.specificLocation || meta.specificAddress,
            delivery.subCity || meta.subcity,
            delivery.city,
          ]
            .filter(Boolean)
            .join(", ") || "Addis Ababa";

        const linkedPayout =
          payoutByPaymentId.get(payment.id) || payoutByOrderId.get(payment.orderId) || null;

        const sanitizedMetadata = { ...meta };
        if (sanitizedMetadata.cardNumber) {
          sanitizedMetadata.cardNumber = maskCardNumber(sanitizedMetadata.cardNumber);
        }

        return {
          ...payment,
          metadata: sanitizedMetadata,
          isSubscription: false,
          orderNumber:
            meta.orderNumber ||
            meta.pendingOrder?.orderNumber ||
            ord?.orderNumber ||
            (payment.orderId ? `MX-${payment.orderId.slice(0, 8).toUpperCase()}` : "N/A"),
          orderStatus: ord?.status || null,
          orderPaymentStatus: ord?.paymentStatus || null,
          subtotalAmount:
            ord?.subtotalAmount != null
              ? Number(ord.subtotalAmount)
              : meta.pendingOrder?.subtotalAmount != null
              ? Number(meta.pendingOrder.subtotalAmount)
              : null,
          deliveryFee:
            ord?.deliveryFee != null
              ? Number(ord.deliveryFee)
              : meta.pendingOrder?.deliveryFee != null
              ? Number(meta.pendingOrder.deliveryFee)
              : null,
          orderNotes: ord?.notes || meta.deliveryNotes || meta.pendingOrder?.notes || "",
          customerName: resolvedCustomerName,
          customerPhone: resolvedCustomerPhone,
          customerEmail: resolvedCustomerEmail,
          deliveryAddress: resolvedAddress,
          itemsCount: itemsList.length || meta.itemCount || meta.itemsCount || 1,
          items: itemsList,
          itemsSummary:
            itemsList.length > 0
              ? itemsList.map((i: any) => `${i.title} (x${i.quantity})`).join(", ")
              : `${meta.itemCount || meta.itemsCount || 1} item(s)`,
          verifiedAt: meta.verifiedAt || null,
          bankName: meta.bankName || null,
          depositorName: meta.depositorName || null,
          bankTransactionRef: meta.bankTransactionRef || null,
          maskedCardNumber: maskCardNumber(meta.cardNumber),
          chapaReward: meta.chapaReward || null,
          payoutInfo: linkedPayout,
          orderDetails: ord || null,
        };
      });

      return NextResponse.json({
        success: true,
        payments: decorated,
        payouts: payoutRows,
        total: decorated.length,
      });
    } catch (decorateErr) {
      console.warn("[Payments API] Could not decorate with order details:", decorateErr);
    }

    return NextResponse.json({
      success: true,
      payments: paymentRows,
      payouts: payoutRows,
      total: paymentRows.length,
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

