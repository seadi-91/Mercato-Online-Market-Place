import { NextResponse } from "next/server";
import { getCardsByUser } from "@/lib/api/card-db";

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

    return NextResponse.json({
      success: true,
      cards,
    });
  } catch (err: any) {
    console.error("[My Cards API Error]", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to fetch cards" },
      { status: 500 }
    );
  }
}
