import { NextResponse } from "next/server";
import { getCatalogDbPool } from "@/lib/db";
import crypto from "crypto";

export interface ReviewItem {
  id: string;
  productId: string;
  productTitle?: string;
  orderId?: string;
  txRef?: string;
  customerId?: string;
  customerName: string;
  rating: number;
  comment: string;
  tags?: string[];
  createdAt: string;
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get("productId");
    const productTitle = searchParams.get("title");
    const customerId = searchParams.get("customerId");
    const txRef = searchParams.get("txRef");

    const pool = getCatalogDbPool();

    let query = `
      SELECT 
        id,
        "productId",
        "productTitle",
        "orderId",
        "txRef",
        "customerId",
        "customerName",
        rating,
        comment,
        tags,
        "createdAt"
      FROM reviews
    `;

    const conditions: string[] = [];
    const values: any[] = [];

    if (productId && productTitle) {
      values.push(productId);
      values.push(`%${productTitle.toLowerCase()}%`);
      conditions.push(`("productId" = $1 OR LOWER("productTitle") LIKE $2)`);
    } else if (productId) {
      values.push(productId);
      conditions.push(`"productId" = $${values.length}`);
    } else if (productTitle) {
      values.push(`%${productTitle.toLowerCase()}%`);
      conditions.push(`LOWER("productTitle") LIKE $${values.length}`);
    } else if (txRef) {
      values.push(txRef);
      conditions.push(`"txRef" = $${values.length}`);
    } else if (customerId) {
      values.push(customerId);
      conditions.push(`"customerId" = $${values.length}`);
    }

    if (conditions.length > 0) {
      query += ` WHERE ${conditions.join(" AND ")}`;
    }

    query += ` ORDER BY "createdAt" DESC`;

    const result = await pool.query(query, values);
    const reviews: ReviewItem[] = result.rows.map((row) => ({
      id: row.id,
      productId: row.productId,
      productTitle: row.productTitle,
      orderId: row.orderId,
      txRef: row.txRef,
      customerId: row.customerId,
      customerName: row.customerName || "Verified Customer",
      rating: Number(row.rating),
      comment: row.comment || "",
      tags: Array.isArray(row.tags) ? row.tags : [],
      createdAt: row.createdAt,
    }));

    const totalCount = reviews.length;
    const averageRating =
      totalCount > 0
        ? Number(
            (
              reviews.reduce((sum, r) => sum + r.rating, 0) / totalCount
            ).toFixed(1)
          )
        : 5.0;

    return NextResponse.json({
      success: true,
      reviews,
      averageRating,
      totalCount,
    });
  } catch (err: any) {
    console.error("[Reviews API GET Error]", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to fetch reviews" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      rating,
      comment = "",
      tags = [],
      customerName = "Verified Customer",
      customerId,
      orderId,
      txRef,
      productId,
      productTitle = "MercatoX Verified Purchase",
    } = body;

    const numRating = Number(rating);
    if (!numRating || numRating < 1 || numRating > 5) {
      return NextResponse.json(
        { success: false, error: "Rating must be an integer between 1 and 5 stars" },
        { status: 400 }
      );
    }

    const reviewId = `rev-${Date.now()}-${crypto.randomBytes(3).toString("hex")}`;
    const pool = getCatalogDbPool();

    const insertQuery = `
      INSERT INTO reviews (
        id,
        "productId",
        "productTitle",
        "orderId",
        "txRef",
        "customerId",
        "customerName",
        rating,
        comment,
        tags,
        "createdAt"
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW())
      RETURNING *
    `;

    const values = [
      reviewId,
      productId || "general",
      productTitle,
      orderId || null,
      txRef || null,
      customerId || null,
      customerName.trim() || "Verified Buyer",
      numRating,
      comment.trim(),
      JSON.stringify(tags),
    ];

    const result = await pool.query(insertQuery, values);
    const row = result.rows[0];

    console.log("[Reviews API POST] Saved review in PostgreSQL:", reviewId, {
      productTitle,
      rating: numRating,
      customerName,
      txRef,
    });

    return NextResponse.json({
      success: true,
      review: {
        id: row.id,
        productId: row.productId,
        productTitle: row.productTitle,
        orderId: row.orderId,
        txRef: row.txRef,
        customerId: row.customerId,
        customerName: row.customerName,
        rating: Number(row.rating),
        comment: row.comment,
        tags: row.tags,
        createdAt: row.createdAt,
      },
    });
  } catch (err: any) {
    console.error("[Reviews API POST Error]", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to save review in database" },
      { status: 500 }
    );
  }
}
