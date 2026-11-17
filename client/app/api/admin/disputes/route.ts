import { NextRequest, NextResponse } from "next/server";
import { getOrderDbPool, getUsersDbPool } from "@/lib/db";

/**
 * GET /api/admin/disputes
 * Fetches real disputed, cancelled, or contested orders from PostgreSQL database.
 * Returns empty array if no disputes exist (NO static/mock data).
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const statusFilter = searchParams.get("status") || "ALL";
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.max(1, parseInt(searchParams.get("limit") || "50", 10));

    const pool = getOrderDbPool();
    const client = await pool.connect();

    try {
      let query = `
        SELECT 
          o.id,
          o."orderNumber",
          o."customerId",
          o."sellerId",
          o.status,
          o."paymentStatus",
          o."totalAmount",
          o."deliveryAddress",
          o."cancelReason",
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
        WHERE (
          o."cancelReason" IS NOT NULL AND o."cancelReason" != ''
          OR o.status = 'CANCELLED'
          OR o.status = 'DISPUTED'
          OR o."paymentStatus" = 'REFUNDED'
        )
      `;

      const values: any[] = [];

      if (statusFilter === "OPEN") {
        query += ` AND o."paymentStatus" != 'REFUNDED' AND o.status != 'REFUNDED' AND o."paymentStatus" != 'RELEASED'`;
      } else if (statusFilter === "RESOLVED_REFUND") {
        query += ` AND (o."paymentStatus" = 'REFUNDED' OR o.status = 'REFUNDED')`;
      } else if (statusFilter === "RESOLVED_RELEASED") {
        query += ` AND o."paymentStatus" = 'RELEASED'`;
      }

      query += ` GROUP BY o.id ORDER BY o."createdAt" DESC LIMIT $1 OFFSET $2`;
      values.push(limit, (page - 1) * limit);

      const result = await client.query(query, values);
      const rows = result.rows || [];

      // Enrich merchant shop names from users DB if available
      const sellerIds = Array.from(new Set(rows.map((r: any) => r.sellerId).filter(Boolean)));
      const shopMap = new Map<string, string>();

      if (sellerIds.length > 0) {
        try {
          const usersPool = getUsersDbPool();
          const shopRes = await usersPool.query(
            `SELECT id::text, "shopName", "fullName" FROM profiles WHERE id::text = ANY($1)`,
            [sellerIds]
          );
          for (const s of shopRes.rows) {
            shopMap.set(s.id, s.shopName || s.fullName || "Merchant Store");
          }
        } catch {
          // Non-blocking enrichment
        }
      }

      const mapped = rows.map((ord: any) => {
        let deliv = ord.deliveryAddress || {};
        if (typeof deliv === "string") {
          try {
            deliv = JSON.parse(deliv);
          } catch {
            deliv = {};
          }
        }

        const customerName = deliv.recipientName || deliv.buyerName || deliv.fullName || "Customer";
        const customerPhone = deliv.phoneNumber || deliv.phone || "N/A";
        const address = [deliv.city, deliv.subCity, deliv.specificLocation].filter(Boolean).join(", ") || "Addis Ababa";
        const merchantStore = shopMap.get(String(ord.sellerId)) || ord.items?.[0]?.shopName || "Merchant Store";

        const isRefunded = ord.paymentStatus === "REFUNDED" || ord.status === "REFUNDED";
        const isReleased = ord.paymentStatus === "RELEASED";
        const currentStatus = isRefunded ? "RESOLVED_REFUND" : isReleased ? "RESOLVED_RELEASED" : "OPEN";

        return {
          id: ord.id,
          orderId: ord.id,
          orderNumber: ord.orderNumber || "MX-REF",
          customerName,
          customerPhone,
          deliveryAddress: address,
          merchantStore,
          merchantId: ord.sellerId,
          paymentId: ord.id,
          amount: Number(ord.totalAmount || 0),
          reason: ord.cancelReason || "Order cancellation requested by customer / under dispute",
          openedDate: ord.createdAt ? new Date(ord.createdAt).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10),
          paymentStatus: ord.paymentStatus || "PAID",
          escrowStatus: isRefunded ? "REFUNDED" : isReleased ? "RELEASED" : "HELD",
          status: currentStatus,
          items: ord.items || [],
        };
      });

      return NextResponse.json({
        success: true,
        data: mapped,
        total: mapped.length,
      });
    } finally {
      client.release();
    }
  } catch (err: any) {
    // Return empty array on database disconnection (NO static data!)
    return NextResponse.json({
      success: true,
      data: [],
      total: 0,
      message: err.message,
    });
  }
}
