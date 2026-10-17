import { NextResponse } from "next/server";
import { getCardsByUser } from "@/lib/api/card-db";
import { getPaymentDbPool } from "@/lib/db";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email")?.trim() || undefined;
    const phoneNumber = searchParams.get("phoneNumber")?.trim() || undefined;
    const customerId = searchParams.get("customerId")?.trim() || undefined;

    if (!email && !phoneNumber && !customerId) {
      return NextResponse.json({
        success: true,
        cards: [],
      });
    }

    const cards = await getCardsByUser({
      email,
      phoneNumber,
      customerId,
    });

    // Ensure all existing user cards are marked ACTIVE in database and response
    if (cards.length > 0 && cards.some((c) => c.status !== "ACTIVE")) {
      try {
        const pool = getPaymentDbPool();
        const client = await pool.connect();
        try {
          const ids = cards.map((c) => c.id);
          await client.query(
            `UPDATE mercatox_cards SET status = 'ACTIVE' WHERE id = ANY($1::uuid[])`,
            [ids]
          );
        } finally {
          client.release();
        }
      } catch (dbErr) {
        console.warn("[My Cards] Could not batch update card status:", dbErr);
      }
    }

    const normalizedCards = cards.map((c) => ({
      ...c,
      status: "ACTIVE" as const,
    }));

    return NextResponse.json({
      success: true,
      cards: normalizedCards,
    });
  } catch (err: any) {
    console.error("[My Cards API Error]", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to fetch cards" },
      { status: 500 }
    );
  }
}

